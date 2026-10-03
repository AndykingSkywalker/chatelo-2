import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { isOnline } from "@/lib/session";
import { initials } from "./post-card";

export type Status = "all" | "online" | "offline";

export async function OtherProfiles({
  excludeId,
  status,
  basePath,
}: {
  excludeId?: number;
  status: Status;
  basePath: string;
}) {
  const users = await prisma.user.findMany({
    where: { id: { not: excludeId } },
    orderBy: { lastSignedInAt: "desc" },
  });
  const shown = users
    .filter((u) => status === "all" || isOnline(u.lastSignedInAt) === (status === "online"))
    .slice(0, 5);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Other profiles</CardTitle>
        <div className="flex gap-1">
          {(["all", "online", "offline"] as const).map((s) => (
            <Link key={s} href={s === "all" ? basePath : `${basePath}?status=${s}`} className={buttonVariants({ size: "sm", variant: s === status ? "default" : "outline" })}>{s}</Link>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {shown.length === 0 && <p className="text-sm text-muted-foreground">No users.</p>}
        {shown.map((u) => (
          <Link key={u.id} href={`/users/${u.id}`} className="flex items-center gap-3 hover:underline">
            <Avatar><AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white">{initials(u.name)}</AvatarFallback></Avatar>
            <span className="flex-1 truncate">{u.name}</span>
            <Badge variant={isOnline(u.lastSignedInAt) ? "default" : "secondary"}>
              {isOnline(u.lastSignedInAt) ? "online" : "offline"}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

