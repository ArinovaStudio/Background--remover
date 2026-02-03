import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePlanSchema = z.object({
  name: z.string().optional(),
  price: z.number().min(0).optional(),
  creditsPerMonth: z.number().min(0).optional(),
  features: z.array(z.string()).optional(),
});


export async function PUT( req: NextRequest,  { params }: { params: Promise<{ id: string }> } ) {
  try {
    const user = await checkAuth();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id: planId } = await params;

    const plan = await prisma.plan.findUnique({ where: { id: planId }});

    if (!plan) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });
    }

    const body = await req.json();
    const validation = updatePlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Validation Error", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    if (validation.data.name) {
      const existingPlan = await prisma.plan.findFirst({
        where: {
          name: validation.data.name,
          id: { not: planId } 
        }
      });

      if (existingPlan) {
        return NextResponse.json({ success: false, message: `A plan with the name '${validation.data.name}' already exists.` }, { status: 409 });
      }
    }

    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: validation.data,
    });

    return NextResponse.json({ success: true, plan: updatedPlan }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE( req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAuth();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id: planId } = await params;

    const plan = await prisma.plan.findUnique({ where: { id: planId }});

    if (!plan) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });
    }

    const activeSubs = await prisma.subscription.count({ where: { planId }});

    if (activeSubs > 0) {
      return NextResponse.json({ success: false, message: "Cannot delete this plan. Users are currently subscribed to it. Try editing it instead." }, { status: 409 });
    }

    await prisma.plan.delete({ where: { id: planId }});

    return NextResponse.json({ success: true, message: "Plan deleted successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}