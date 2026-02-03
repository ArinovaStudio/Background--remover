import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AuthUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

export async function checkAuth(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token) as AuthUser | null;

  if (!decoded) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, role: true }
  });

  if (!user) {
    return null;
  }

  return { id: user.id, email: user.email, role: user.role };
}