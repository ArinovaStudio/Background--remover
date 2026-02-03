import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { checkAuth } from "@/lib/session";

function blobToFile(theBlob: Blob, fileName: string): File {
    return new File([theBlob], fileName, { lastModified: Date.now(), type: theBlob.type });
}

function isUsedToday(date: Date | null | undefined): boolean {
    if (!date) return false;
    const last = new Date(date).toDateString();
    const today = new Date().toDateString();
    return last === today;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const deviceHash = formData.get("deviceHash") as string;  // use useFingerprint() hook in the frontend

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }
    
    if (!deviceHash) {
       return NextResponse.json({ success: false, message: "Device validation failed" }, { status: 400 });
    }

    const userAuth = await checkAuth();
    let user = null;
    let isPaidUser = false;

    if (userAuth) {
      // For login users
      user = await prisma.user.findUnique({
        where: { id: userAuth.id },
        include: { subscription: true }
      });

      if (user) {
        isPaidUser = user.subscription?.status === "ACTIVE";

        if (isPaidUser) {
           if (user.subscription!.creditsRemaining <= 0) {
             return NextResponse.json({ success: false, message: "Plan credits exhausted" }, { status: 403 });
           }
        } 
        else {
           if (isUsedToday(user.lastFreeUseAt)) {
             return NextResponse.json({ success: false, message: "Daily limit reached" }, { status: 403 });
           }

           const anonUsage = await prisma.anonymousUsage.findUnique({ where: { deviceHash } });
           if (isUsedToday(anonUsage?.lastUsedAt)) {
              return NextResponse.json({ success: false, message: "This device has already used the free credit today" }, { status: 403 });
           }
          
           // For multiple accounts per device
           const deviceAbuse = await prisma.user.findFirst({
             where: {
               deviceHash: deviceHash,
               id: { not: user.id },
               lastFreeUseAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
             }
           });
           
           if (deviceAbuse) {
             return NextResponse.json({ success: false, message: "Device limit reached on another account" }, { status: 403 });
           }
        }
      }
    } 
    
    else {
      // For non login users
      const anonUsage = await prisma.anonymousUsage.findUnique({
        where: { deviceHash }
      });

      if (isUsedToday(anonUsage?.lastUsedAt)) {
         return NextResponse.json({ success: false, message: "Daily limit reached" }, { status: 403 });
      }
    }

    const pythonFormData = new FormData();
    pythonFormData.append("file", file);

    const pythonUrl = process.env.PYTHON_API || "http://127.0.0.1:8000";
    const pythonResponse = await fetch(`${pythonUrl}/api/remove-bg`, {
      method: "POST",
      body: pythonFormData,
    });

    if (!pythonResponse.ok) {
        return NextResponse.json({ success: false, message: "Image Engine Failed" }, { status: 500 });
    }

    const processedBlob = await pythonResponse.blob();
    const processedFile = blobToFile(processedBlob, `removed_${file.name}`);
    const { url } = await uploadFile(processedFile, "gallery");

    await prisma.$transaction(async (tx) => {
      
      await tx.processedImage.create({
        data: {
          userId: user ? user.id : null, 
          url: url,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isSaved: false 
        }
      });

      if (user) {
        await tx.usageLog.create({
           data: { userId: user.id, action: "REMOVE_BG", success: true }
        });

        if (isPaidUser) {
           await tx.subscription.update({
             where: { id: user.subscription!.id },
             data: { creditsRemaining: { decrement: 1 } }
           });
        } else {
           await tx.user.update({
             where: { id: user.id },
             data: { 
                 lastFreeUseAt: new Date(),
                 deviceHash: deviceHash 
             }
           });
        }
      } else {
        await tx.anonymousUsage.upsert({
          where: { deviceHash },
          update: { lastUsedAt: new Date() },
          create: { deviceHash, lastUsedAt: new Date() }
        });
      }
    });

    return NextResponse.json({ 
      success: true, 
      imageUrl: url, 
      remainingCredits: isPaidUser ? (user!.subscription!.creditsRemaining - 1) : 0 
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}