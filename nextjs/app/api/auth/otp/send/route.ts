import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { otpTemplate } from "@/lib/templates";
import crypto from "crypto";
import sendEmail from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min 

    await prisma.otp.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt }
    });

    const emailHtml = otpTemplate(otp);
    const isSent = await sendEmail(email, "Your Verification Code", emailHtml);

    if (!isSent) {
      return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" }, { status: 200 });

  } catch  {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}