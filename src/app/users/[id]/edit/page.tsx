import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditProfileForm } from "@/components/edit-profile-form";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const uid = Number((await params).id);
  if (!Number.isInteger(uid)) notFound();
  const [user, me] = await Promise.all([prisma.user.findUnique({ where: { id: uid } }), getCurrentUser()]);
  if (!user) notFound();
  if (me?.id !== user.id)
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="space-y-3">
          <p>You can only edit your own profile.</p>
          <Link href={`/users/${uid}`} className={buttonVariants({ variant: "outline" })}>Back</Link>
        </CardContent>
      </Card>
    );
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader><CardTitle>Edit profile</CardTitle></CardHeader>
      <CardContent>
        <EditProfileForm userId={user.id} name={user.name} email={user.email} website={user.website ?? ""} />
      </CardContent>
    </Card>
  );
}
