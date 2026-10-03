import { cookies } from "next/headers";
import { prisma } from "./db";

export const ONLINE_WINDOW_MS = 15 * 60 * 1000;

export async function getCurrentUser() {
  const id = Number((await cookies()).get("userId")?.value);
  const user = id ? await prisma.user.findUnique({ where: { id } }) : null;
  return user;
}

export const isOnline = (d: Date) => Date.now() - d.getTime() < ONLINE_WINDOW_MS;
