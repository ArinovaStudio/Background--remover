import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/session";
import { deleteFile } from "@/lib/storage";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await checkAuth();
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { credits, removePlan } = body;

    if (removePlan) {
      await prisma.subscription.deleteMany({
        where: { userId: id }
      });
      return NextResponse.json({ success: true, message: "Plan removed" });
    }

    if (typeof credits === 'number') {
      const sub = await prisma.subscription.findFirst({ where: { userId: id } });
      
      if (!sub) {
        return NextResponse.json({ success: false, message: "User has no active subscription to add credits to." }, { status: 400 });
      }

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { creditsRemaining: credits }
      });
      
      return NextResponse.json({ success: true, message: "Credits updated" });
    }

    return NextResponse.json({ success: false, message: "No valid action provided" }, { status: 400 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await checkAuth();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { gallery: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (user.gallery.length > 0) {
      await Promise.all(
        user.gallery.map(async (image) => {
          if (image.url) {
            await deleteFile(image.url);
          }
        })
      );
    }

    await prisma.$transaction(async (tx) => {

      await tx.usageLog.deleteMany({ where: { userId: id } });

      await tx.processedImage.deleteMany({ where: { userId: id } });

      await tx.subscription.deleteMany({ where: { userId: id } });

      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: "User and all associated data deleted successfully" });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}