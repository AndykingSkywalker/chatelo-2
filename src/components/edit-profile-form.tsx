"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, type FormState } from "@/lib/actions";

type Props = { userId: number; name: string; email: string; website: string };

export function EditProfileForm({ userId, name, email, website }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateProfile.bind(null, userId),
    {},
  );
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={email} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          defaultValue={website}
          placeholder="https://example.com"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
