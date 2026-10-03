import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowBadge } from "@/components/follow-badge";
import { initials } from "@/components/post-card";
import { prisma } from "@/lib/db";
import { getFollowingIds } from "@/lib/follows";
import { getCurrentUser } from "@/lib/session";

export async function FollowList({ userId, kind }: { userId: number; kind: "followers" | "following" }) {
  if (!Number.isInteger(userId)) notFound();
  const [user, me] = await Promise.all([prisma.user.findUnique({ where: { id: userId } }), getCurrentUser()]);
  if (!user) notFound();
  const rows = await prisma.follow.findMany({
    where: kind === "followers" ? { followingId: userId } : { followerId: userId },
    orderBy: { createdAt: "desc" },
    include: { follower: true, following: true },
  });
  const people = rows.map((r) => (kind === "followers" ? r.follower : r.following));
  const myFollowing = await getFollowingIds(me?.id);
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>{kind === "followers" ? `Followers of ${user.name}` : `${user.name} is following`}</CardTitle>
        <div className="flex gap-1">
          <Link href={`/users/${userId}/followers`} className={buttonVariants({ size: "sm", variant: kind === "followers" ? "default" : "outline" })}>Followers</Link>
          <Link href={`/users/${userId}/following`} className={buttonVariants({ size: "sm", variant: kind === "following" ? "default" : "outline" })}>Following</Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {people.length === 0 && (
          <p className="text-sm text-muted-foreground">{kind === "followers" ? "No followers yet." : "Not following anyone yet."}</p>
        )}
        {people.map((p) => (
          <div key={p.id} className="flex items-center gap-3">
            <Link href={`/users/${p.id}`} className="flex flex-1 items-center gap-3 hover:underline">
              <Avatar><AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white">{initials(p.name)}</AvatarFallback></Avatar>
              <span className="truncate">{p.name}</span>
            </Link>
            {me && me.id !== p.id && <FollowBadge targetId={p.id} following={myFollowing.has(p.id)} />}
          </div>
        ))}
        <Link href={`/users/${userId}`} className={buttonVariants({ variant: "ghost" })}>Back to profile</Link>
      </CardContent>
    </Card>
  );
}
