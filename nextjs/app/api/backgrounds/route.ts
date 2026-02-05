import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "ALL";

    const where: any = {};

    if (user.role === "ADMIN") {
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { user: { name: { contains: search, mode: "insensitive" } } },
        ];
      }

      if (filter === "PUBLIC") {
        where.isPublic = true;
      } else if (filter === "PRIVATE") {
        where.isPublic = false;
      }
    } 
    
    else {
      if (search) {
        where.name = { contains: search, mode: "insensitive" };
      }

      if (filter === "PUBLIC") {
        where.isPublic = true;
      } 
      else if (filter === "PRIVATE") {
        where.isPublic = false;
        where.userId = user.id;
      } 
      else {
        where.OR = [
          { isPublic: true },
          { userId: user.id }
        ];
      }
    }

    const backgrounds = await prisma.userBackground.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, backgrounds }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}