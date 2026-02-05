import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { checkAuth } from "@/lib/session";
import fs from "fs/promises";
import path from "path";

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
    const deviceHash = formData.get("deviceHash") as string;
    
    // Backgrounds
    const bgColor = formData.get("color") as string;
    const bgImage = formData.get("bgImage") as File;
    const bgId = formData.get("bgId") as string;
    
    // optional config
    const width = formData.get("width") as string;
    const height = formData.get("height") as string;

    if (!file) {
      return NextResponse.json({ success: false, message: "No foreground file uploaded" }, { status: 400 });
    }
    
    if (!deviceHash) {
       return NextResponse.json({ success: false, message: "Device validation failed" }, { status: 400 });
    }

    if (!bgColor && !bgImage && !bgId) {
       return NextResponse.json({ success: false, message: "Missing background configuration" }, { status: 400 });
    }

    const userAuth = await checkAuth();
    let user = null;
    let isPaidUser = false;

    // For loggedin user
    if (userAuth) {
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
        } else {
           if (isUsedToday(user.lastFreeUseAt)) {
             return NextResponse.json({ success: false, message: "Daily limit reached" }, { status: 403 });
           }
           
           const anonUsage = await prisma.anonymousUsage.findUnique({ where: { deviceHash } });
           if (isUsedToday(anonUsage?.lastUsedAt)) {
              return NextResponse.json({ success: false, message: "This device has already used the free credit today" }, { status: 403 });
           }

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
    // For non-logged in user 
    else {
      const anonUsage = await prisma.anonymousUsage.findUnique({ where: { deviceHash } });
      if (isUsedToday(anonUsage?.lastUsedAt)) {
          return NextResponse.json({ success: false, message: "Daily limit reached" }, { status: 403 });
      }
    }

    const pythonFormData = new FormData();
    pythonFormData.append("file", file);

    if (width) pythonFormData.append("width", width);
    if (height) pythonFormData.append("height", height);
    

    // if background image is provided
    if (bgImage) {
      pythonFormData.append("bg_file", bgImage);

      if (user) {
        try {
           // save user background image
           const savedBg = await uploadFile(bgImage, "user-backgrounds");
           await prisma.userBackground.create({
             data: {
               userId: user.id,
               url: savedBg.url,
               name: bgImage.name,
               category: "General"
             }
           });
        } catch {
          return NextResponse.json({ success: false, message: "Failed to save user background" }, { status: 400 });
        }
      }

    } 
    // If bgId is provided
    else if (bgId) {      
      const systemAsset = await prisma.asset.findUnique({ where: { id: bgId } });
      let backgroundUrl = "";
      
      if (systemAsset) { // check if it is a system assets
        if (systemAsset.isPremium && !isPaidUser) {
          return NextResponse.json({ success: false, message: "Premium asset requires subscription" }, { status: 403 });
        }
        
        backgroundUrl = systemAsset.url;
      } 
      else { // check if it is a user backgrounds
        const userBg = await prisma.userBackground.findUnique({ where: { id: bgId } });
        
        if (!userBg) {
           return NextResponse.json({ success: false, message: "Background not found" }, { status: 404 });
        }

        const isOwner = user && userBg.userId === user.id;
        if (!userBg.isPublic && !isOwner) {
           return NextResponse.json({ success: false, message: "This background is private" }, { status: 403 });
        }

        backgroundUrl = userBg.url;
      }

      try {
        const relativePath = backgroundUrl.startsWith('/') ? backgroundUrl.slice(1) : backgroundUrl;
        const fullPath = path.join(process.cwd(), "public", relativePath);
        const assetBuffer = await fs.readFile(fullPath);
        const assetBlob = new Blob([assetBuffer]);
        pythonFormData.append("bg_file", assetBlob, "mockup.png");
      } catch {
        return NextResponse.json({ success: false, message: "Failed to load system asset" }, { status: 500 });
      }

    } 
    // if background color is provided
    else if (bgColor) {
      pythonFormData.append("bg_color", bgColor);
    }

    // call python api
    const pythonUrl = process.env.PYTHON_API || "http://127.0.0.1:8000";
    const pythonResponse = await fetch(`${pythonUrl}/api/process`, {
      method: "POST",
      body: pythonFormData,
    });

    if (!pythonResponse.ok) {
        const errText = await pythonResponse.text();
        return NextResponse.json({ success: false, message: "Processing Failed", error: errText }, { status: 500 });
    }

    const processedBlob = await pythonResponse.blob();
    const processedFile = blobToFile(processedBlob, `composite_${file.name}`);
    const { url } = await uploadFile(processedFile, "gallery");
    
    await prisma.$transaction(async (tx) => {
      // save processed image
      await tx.processedImage.create({
        data: {
          userId: user ? user.id : null,
          url: url,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isSaved: false 
        }
      });

      // Update Credits/Limits
      if (user) {
         await tx.usageLog.create({ data: { userId: user.id, action: "COMPOSITE", success: true } });

         if (isPaidUser) {
            await tx.subscription.update({
              where: { id: user.subscription!.id },
              data: { creditsRemaining: { decrement: 1 } }
            });
         } else {
            await tx.user.update({
              where: { id: user.id },
              data: { lastFreeUseAt: new Date(), deviceHash }
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