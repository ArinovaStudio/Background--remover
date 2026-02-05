import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/session";
import { deleteFile } from "@/lib/storage";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    const currentBg = await prisma.userBackground.findUnique({ where: { id } });

    if (!currentBg) {
      return NextResponse.json({ success: false, message: "Background not found" }, { status: 404 });
    }

    const isOwner = currentBg.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const category = formData.get("category") as string | null;
    
    const hasIsPublic = formData.has("isPublic");
    const isPublic = hasIsPublic ? (formData.get("isPublic") === "true") : undefined;

    const updatedBg = await prisma.userBackground.update({
      where: { id },
      data: {
        name: name || undefined,
        category: category || undefined,
        isPublic: isPublic,
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ success: true, background: updatedBg }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const bg = await prisma.userBackground.findUnique({ where: { id } });

    if (!bg) {
      return NextResponse.json({ success: false, message: "Background not found" }, { status: 404 });
    }

    const isOwner = bg.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    try {
        await deleteFile(bg.url);
    } catch {
        return NextResponse.json({ success: false, message: "Failed to delete file from storage" }, { status: 500 });
    }

    await prisma.userBackground.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Background deleted successfully" });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}