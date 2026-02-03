import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile, uploadFile } from "@/lib/storage";
import { checkAuth } from "@/lib/session";

export async function PUT( req: NextRequest,  { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAuth();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id: assetId } = await params;
    const formData = await req.formData();
    
    const file = formData.get("file") as File | null; 
    const name = formData.get("name") as string | null;
    const type = formData.get("type") as string | null;
    const category = formData.get("category") as string | null;
    
    const hasIsPremium = formData.has("isPremium");
    const isPremium = hasIsPremium ? (formData.get("isPremium") === "true") : undefined;

    const currentAsset = await prisma.asset.findUnique({ where: { id: assetId }});

    if (type && type !== "MOCKUP" && type !== "DEMO") {
       return NextResponse.json({ success: false, message: "Invalid Asset Type" }, { status: 400 });
    }

    if (!currentAsset) {
      return NextResponse.json({ success: false, message: "Asset not found" }, { status: 404 });
    }

    if (name && name !== currentAsset.name) {
      const duplicate = await prisma.asset.findFirst({
        where: { 
          name: name,
          id: { not: assetId } 
        }
      });

      if (duplicate) {
        return NextResponse.json({ success: false, message: `Asset name '${name}' is already taken.` }, { status: 409 });
      }
    }

    let newUrl = currentAsset.url;

    if (file) {
      await deleteFile(currentAsset.url);

      const uploadResult = await uploadFile(file, "assets");
      newUrl = uploadResult.url;
    }

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        name: name || undefined,
        type: (type as "MOCKUP" | "DEMO") || undefined,
        category: category || undefined,
        isPremium: isPremium, 
        url: newUrl
      }
    });

    return NextResponse.json({ success: true, asset: updatedAsset }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE( req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAuth();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id: assetId } = await params;

    const asset = await prisma.asset.findUnique({ where: { id: assetId }});

    if (!asset) {
      return NextResponse.json({ success: false, message: "Asset not found" }, { status: 404 });
    }

    await deleteFile(asset.url);

    await prisma.asset.delete({ where: { id: assetId }});

    return NextResponse.json({ success: true, message: "Asset deleted successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}