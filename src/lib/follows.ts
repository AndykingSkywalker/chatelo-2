import { prisma } from "./db";

export async function getFollowingIds(userId?: number) {
  if (!userId) return new Set<number>();
  const rows = await prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } });
  return new Set(rows.map((r) => r.followingId));
}
