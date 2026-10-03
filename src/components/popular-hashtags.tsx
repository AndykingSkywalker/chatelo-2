import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export async function PopularHashtags() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const tags = await prisma.hashtag.findMany({
    where: { posts: { some: { createdAt: { gte: since } } } },
    select: { tag: true, _count: { select: { posts: { where: { createdAt: { gte: since } } } } } },
  });
  const top = tags
    .map((t) => ({ tag: t.tag, count: t._count.posts }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 5);
  return (
    <Card>
      <CardHeader><CardTitle className="text-base"># Popular today</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {top.length === 0 && <p className="text-sm text-muted-foreground">No hashtags in the last 24 hours.</p>}
        {top.map((t) => (
          <Link key={t.tag} href={`/search?q=${encodeURIComponent("#" + t.tag)}`} className="flex items-center justify-between text-sm hover:underline">
            <span className="font-medium">#{t.tag}</span>
            <span className="text-xs text-muted-foreground">{t.count} {t.count === 1 ? "post" : "posts"}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
