import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostComposer } from "@/components/post-composer";
import { PostCard, postInclude } from "@/components/post-card";
import { OtherProfiles } from "@/components/other-profiles";
import { PopularHashtags } from "@/components/popular-hashtags";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getFollowingIds } from "@/lib/follows";

export const dynamic = "force-dynamic";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const me = await getCurrentUser();
  const followingIds = await getFollowingIds(me?.id);
  const [posts, top] = await Promise.all([
    prisma.post.findMany({ orderBy: { createdAt: "desc" }, include: postInclude }),
    prisma.post.findMany({
      where: { fires: { some: {} } },
      orderBy: [{ fires: { _count: "desc" } }, { createdAt: "desc" }],
      take: 2,
      include: postInclude,
    }),
  ]);
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_300px]">
      <section className="space-y-6">
        <PostComposer />
        {posts.map((p) => <PostCard key={p.id} post={p} meId={me?.id} followingIds={followingIds} />)}
        {posts.length === 0 && <p className="text-muted-foreground">No posts yet.</p>}
      </section>
      <aside className="space-y-6">
        <PopularHashtags />
        <Card>
          <CardHeader><CardTitle className="text-base">🔥 Most fired</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {top.length === 0 && <p className="text-sm text-muted-foreground">No fires yet.</p>}
            {top.map((p) => (
              <div key={p.id} className="text-sm">
                <Link href={`/users/${p.author.id}`} className="font-semibold hover:underline">{p.author.name}</Link>
                <p className="line-clamp-2">{p.content || "📷 Image"}</p>
                <p className="text-xs text-muted-foreground">🔥 {p._count.fires}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <OtherProfiles
          excludeId={me?.id}
          status={status === "online" || status === "offline" ? status : "all"}
          basePath="/posts"
        />
      </aside>
    </div>
  );
}

