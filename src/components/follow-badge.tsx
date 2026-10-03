import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleFollow } from "@/lib/actions";

export function FollowBadge({ targetId, following }: { targetId: number; following: boolean }) {
  return (
    <form action={toggleFollow.bind(null, targetId)} className="inline">
      <button
        type="submit"
        className={cn(badgeVariants({ variant: following ? "secondary" : "default" }), "cursor-pointer")}
      >
        {following ? "Following" : "Follow"}
      </button>
    </form>
  );
}
