import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";

const CRON_SECRET = process.env.CRON_SECRET || "My_Cron_Secret";

// Api to delete expired images
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const expiredImages = await prisma.processedImage.findMany({
      where: {
        isSaved: false,
        expiresAt: { lt: new Date() },
      },
      select: { id: true, url: true }
    });

    if (expiredImages.length === 0) {
      return NextResponse.json({ success: true, message: "No images to clean up" }, { status: 200 });
    }

    let deletedCount = 0;

    for (const image of expiredImages) {
      await deleteFile(image.url);

      await prisma.processedImage.delete({ where: { id: image.id } });

      deletedCount++;
    }

    return NextResponse.json({ success: true, message: `Deleted ${deletedCount} images` }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}