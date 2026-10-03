import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FollowBadge } from "@/components/follow-badge";
import { toggleFire } from "@/lib/actions";

export type PostView = {
  id: number;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  author: { id: number; name: string };
  _count: { fires: number };
  fires: { userId: number }[];
};

function PostText({ text }: { text: string }) {
  const parts = text.split(/(#[\p{L}\p{N}_]{1,50})/gu);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <Link
        key={i}
        href={`/search?q=${encodeURIComponent(part)}`}
        className="font-medium text-orange-600 hover:underline dark:text-orange-400"
      >
        {part}
      </Link>
    ) : (
      part
    ),
  );
}

export const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function PostCard({
  post,
  meId,
  followingIds,
}: {
  post: PostView;
  meId?: number;
  followingIds?: Set<number>;
}) {
  const fired = post.fires.some((f) => f.userId === meId);
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex gap-4">
        <Link href={`/users/${post.author.id}`} className="shrink-0">
          <Avatar className="size-11">
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 font-semibold text-white">
              {initials(post.author.name)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={`/users/${post.author.id}`} className="font-semibold hover:underline">
              {post.author.name}
            </Link>
            {meId && post.author.id !== meId && (
              <FollowBadge
                targetId={post.author.id}
                following={followingIds?.has(post.author.id) ?? false}
              />
            )}
            <span className="text-xs text-muted-foreground">
              · {post.createdAt.toLocaleString("en-GB")}
            </span>
          </div>
          {post.content && (
            <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
              <PostText text={post.content} />
            </p>
          )}
          {post.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt=""
              className="max-h-[28rem] w-full rounded-xl border object-cover"
            />
          )}
          <form action={toggleFire.bind(null, post.id)}>
            <Button type="submit" size="sm" variant={fired ? "default" : "outline"}>
              🔥 {fired ? "Fired" : "Fire"} · {post._count.fires}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export const postInclude = {
  author: { select: { id: true, name: true } },
  _count: { select: { fires: true } },
  fires: { select: { userId: true } },
} as const;
