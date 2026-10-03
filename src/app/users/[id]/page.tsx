import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostCard, initials, postInclude } from "@/components/post-card";
import { OtherProfiles } from "@/components/other-profiles";
import { prisma } from "@/lib/db";
import { getCurrentUser, isOnline } from "@/lib/session";
import { getFollowingIds } from "@/lib/follows";
import { FollowBadge } from "@/components/follow-badge";

export const dynamic = "force-dynamic";

export default async function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;
  const uid = Number(id);
  if (!Number.isInteger(uid)) notFound();
  const [user, me] = await Promise.all([prisma.user.findUnique({ where: { id: uid } }), getCurrentUser()]);
  if (!user) notFound();
  const [posts, followingIds, followerCount, followingCount] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: uid },
      orderBy: { createdAt: "desc" },
      include: postInclude,
    }),
    getFollowingIds(me?.id),
    prisma.follow.count({ where: { followingId: uid } }),
    prisma.follow.count({ where: { followerId: uid } }),
  ]);
  const online = isOnline(user.lastSignedInAt);
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_300px]">
      <section className="space-y-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <Avatar className="size-16"><AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-xl font-semibold text-white">{initials(user.name)}</AvatarFallback></Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer nofollow" className="text-sm underline">
                  {user.website}
                </a>
              )}
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={online ? "default" : "secondary"}>{online ? "online" : "offline"}</Badge>
                {me && me.id !== user.id && <FollowBadge targetId={user.id} following={followingIds.has(user.id)} />}
              </div>
              <div className="mt-2 flex gap-4 text-sm">
                <Link href={`/users/${user.id}/followers`} className="hover:underline">
                  <span className="font-semibold">{followerCount}</span> <span className="text-muted-foreground">{followerCount === 1 ? "follower" : "followers"}</span>
                </Link>
                <Link href={`/users/${user.id}/following`} className="hover:underline">
                  <span className="font-semibold">{followingCount}</span> <span className="text-muted-foreground">following</span>
                </Link>
              </div>
            </div>
            {me?.id === user.id && (
              <Link href={`/users/${user.id}/edit`} className={buttonVariants({ variant: "outline" })}>Edit profile</Link>
            )}
          </CardContent>
        </Card>
        {posts.map((p) => <PostCard key={p.id} post={p} meId={me?.id} followingIds={followingIds} />)}
        {posts.length === 0 && <p className="text-muted-foreground">No posts yet.</p>}
      </section>
      <aside>
        <OtherProfiles
          excludeId={uid}
          status={status === "online" || status === "offline" ? status : "all"}
          basePath={`/users/${uid}`}
        />
      </aside>
    </div>
  );
}
