import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/session";
import os from "os";

async function getSystemStats() {
    const start = Date.now();
    let dbStatus = "unknown";
    let dbLatency = 0;

    try {
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        dbLatency = Date.now() - dbStart;
        dbStatus = "healthy";
    } catch {
        dbStatus = "disconnected";
    }

    const memoryUsage = process.memoryUsage();
    const osMemFree = os.freemem();
    const osMemTotal = os.totalmem();
    const usedMemPercentage = ((osMemTotal - osMemFree) / osMemTotal) * 100;
    const isHealthy = dbStatus === "healthy" && usedMemPercentage < 95;

    return {
        status: isHealthy ? "operational" : "degraded",
        uptime: os.uptime(),
        timestamp: new Date().toISOString(),
        database: { status: dbStatus, latency: dbLatency },
        memory: {
            used: Math.round((osMemTotal - osMemFree) / 1024 / 1024),
            total: Math.round(osMemTotal / 1024 / 1024),
            percentage: Math.round(usedMemPercentage)
        },
        server: {
            platform: os.platform(),
            cpus: os.cpus().length,
            load: os.loadavg()[0]
        },
        responseTime: Date.now() - start
    };
}

export async function GET(req: NextRequest) {
    const admin = await checkAuth();
    if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const encoder = new TextEncoder();

    const customStream = new ReadableStream({
        async start(controller) {
            
            const sendEvent = async () => {
                try {
                    const data = await getSystemStats();
                    const message = `data: ${JSON.stringify(data)}\n\n`;
                    controller.enqueue(encoder.encode(message));
                } catch {
                    controller.close();
                }
            };

            await sendEvent();

            const intervalId = setInterval(sendEvent, 2000); // 2 seconds

            // Cleanup when connection closes
            req.signal.addEventListener("abort", () => {
                clearInterval(intervalId);
                controller.close();
            });
        }
    });

    return new NextResponse(customStream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}