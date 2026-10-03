import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostCard, initials, postInclude } from "@/components/post-card";
import { prisma } from "@/lib/db";
import { getFollowingIds } from "@/lib/follows";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const raw = ((await searchParams).q ?? "").trim().slice(0, 100);
  const isTag = raw.startsWith("#");
  const term = raw.replace(/^#+/, "").trim();
  const me = await getCurrentUser();

  if (!term) {
    return <p className="text-muted-foreground">Search for people or #hashtags using the box above.</p>;
  }

  const tagTerm = term.toLowerCase();
  const [users, tags, posts, followingIds] = await Promise.all([
    isTag ? [] : prisma.user.findMany({ where: { name: { contains: term } }, orderBy: { name: "asc" }, take: 10 }),
    prisma.hashtag.findMany({
      where: { tag: { contains: tagTerm } },
      select: { tag: true, _count: { select: { posts: true } } },
      take: 10,
    }),
    prisma.post.findMany({
      where: isTag
        ? { hashtags: { some: { tag: { contains: tagTerm } } } }
        : {
            OR: [
              { author: { name: { contains: term } } },
              { hashtags: { some: { tag: { contains: tagTerm } } } },
              { content: { contains: term } },
            ],
          },
      orderBy: { createdAt: "desc" },
      include: postInclude,
    }),
    getFollowingIds(me?.id),
  ]);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_300px]">
      <section className="space-y-6">
        <h1 className="text-xl font-bold">Results for “{raw}”</h1>
        {posts.map((p) => <PostCard key={p.id} post={p} meId={me?.id} followingIds={followingIds} />)}
        {posts.length === 0 && <p className="text-muted-foreground">No matching posts.</p>}
      </section>
      <aside className="space-y-6">
        {!isTag && (
          <Card>
            <CardHeader><CardTitle className="text-base">People</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {users.length === 0 && <p className="text-sm text-muted-foreground">No users found.</p>}
              {users.map((u) => (
                <Link key={u.id} href={`/users/${u.id}`} className="flex items-center gap-3 hover:underline">
                  <Avatar><AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white">{initials(u.name)}</AvatarFallback></Avatar>
                  <span className="truncate">{u.name}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader><CardTitle className="text-base">Hashtags</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {tags.length === 0 && <p className="text-sm text-muted-foreground">No hashtags found.</p>}
            {tags.map((t) => (
              <Link key={t.tag} href={`/search?q=${encodeURIComponent("#" + t.tag)}`}>
                <Badge variant="secondary">#{t.tag} · {t._count.posts}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
