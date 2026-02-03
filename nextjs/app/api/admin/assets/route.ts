import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { checkAuth } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await checkAuth();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string; 
    const category = formData.get("category") as string || "General";
    const isPremium = formData.get("isPremium") === "true";

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    if (!name || !type) {
      return NextResponse.json({ success: false, message: "Name and Type are required" }, { status: 400 });
    }
    
    if (type !== "MOCKUP" && type !== "DEMO") {
       return NextResponse.json({ success: false, message: "Invalid Asset Type" }, { status: 400 });
    }

    const existingAsset = await prisma.asset.findFirst({ where: { name: name } });

    if (existingAsset) {
      return NextResponse.json( { success: false, message: `An asset with the name '${name}' already exists.` }, { status: 409 });
    }

    const { url } = await uploadFile(file, "assets");

    const newAsset = await prisma.asset.create({
      data: {
        name,
        type: type as "MOCKUP" | "DEMO",
        category,
        url,
        isPremium
      }
    });

    return NextResponse.json({ success: true, asset: newAsset }, { status: 201 });

  } catch  {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}