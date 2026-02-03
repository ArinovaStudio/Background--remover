import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const record = await prisma.otp.findUnique({ where: { email } });

    if (!record) {
      return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      await prisma.otp.delete({ where: { email } });
      return NextResponse.json({ success: false, message: "OTP Expired" }, { status: 400 });
    }

    if (record.otp !== otp) {
      return NextResponse.json({ success: false, message: "Incorrect OTP" }, { status: 400 });
    }

    await prisma.otp.delete({ where: { email } });

    return NextResponse.json({ success: true, message: "Verified" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Verification failed" }, { status: 500 });
  }
}