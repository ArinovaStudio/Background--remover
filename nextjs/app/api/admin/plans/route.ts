import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkAuth } from "@/lib/session";

const createPlanSchema = z.object({
  name: z.string(),
  price: z.number().min(0),
  creditsPerMonth: z.number().min(0),
  features: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const user = await checkAuth();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = createPlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Validation Error", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, price, creditsPerMonth, features } = validation.data;

    const existingPlan = await prisma.plan.findFirst({ where: { name } });

    if (existingPlan) {
      return NextResponse.json( { success: false, message: `A plan with the name '${name}' already exists.` }, { status: 409 });
    }

    const newPlan = await prisma.plan.create({
      data: {
        name,
        price,
        creditsPerMonth,
        features
      }
    });

    return NextResponse.json({ success: true, plan: newPlan }, { status: 201 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}