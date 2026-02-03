import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage"; 
import { checkAuth } from "@/lib/session";

// api to save image permanently (pro users only)
export async function PATCH( req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await checkAuth();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { subscription: true }
    });

    const isPaidUser = user?.subscription && user.subscription.status === "ACTIVE";

    if (!isPaidUser) {
      return NextResponse.json({ success: false, message: "Only Pro users can save images permanently" }, { status: 403 });
    }

    const { id: imageId } = await params;
    const body = await req.json();
    const { isSaved } = body;

    if (typeof isSaved !== "boolean") {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }

    const image = await prisma.processedImage.findFirst({
      where: { id: imageId, userId: authUser.id }
    });

    if (!image) {
      return NextResponse.json({ success: false, message: "Image not found" }, { status: 404 });
    }

    const updatedImage = await prisma.processedImage.update({
      where: { id: imageId },
      data: { isSaved: isSaved }
    });

    return NextResponse.json({ success: true, image: updatedImage }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

// api to delete image
export async function DELETE( req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id: imageId } = await params;

    const image = await prisma.processedImage.findFirst({
      where: { id: imageId, userId: user.id }
    });

    if (!image) {
      return NextResponse.json({ success: false, message: "Image not found" }, { status: 404 });
    }

    await deleteFile(image.url);

    await prisma.processedImage.delete({ where: { id: imageId } });

    return NextResponse.json({ success: true, message: "Image deleted" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}