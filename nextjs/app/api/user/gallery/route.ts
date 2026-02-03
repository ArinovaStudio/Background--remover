import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/session";

export async function GET() {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const images = await prisma.processedImage.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: "desc" 
      },
      select: {
        id: true,
        url: true,
        isSaved: true,
        createdAt: true,
        expiresAt: true
      }
    });

    return NextResponse.json({ success: true, images }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}