import { FollowList } from "@/components/follow-list";

export const dynamic = "force-dynamic";

export default async function FollowersPage({ params }: { params: Promise<{ id: string }> }) {
  return <FollowList userId={Number((await params).id)} kind="followers" />;
}

