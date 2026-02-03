import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const isPremiumParam = searchParams.get("isPremium");

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (category && category !== "All") {
      where.category = category;
    }

    if (type) {
      where.type = type as "MOCKUP" | "DEMO";
    }

    if (isPremiumParam !== null) {
      where.isPremium = isPremiumParam === "true";
    }

    const assets = await prisma.asset.findMany({
      where: where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        category: true,
        isPremium: true
      }
    });

    return NextResponse.json({ success: true, count: assets.length, assets }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}