"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createPost, type FormState } from "@/lib/actions";

export function PostComposer() {
  const [state, action, pending] = useActionState<FormState, FormData>(createPost, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <Card>
      <CardContent className="pt-6">
        <form ref={ref} action={action} className="space-y-3">
          <Textarea name="content" placeholder="What's happening?" maxLength={500} />
          <Input name="image" type="file" accept="image/png,image/jpeg,image/gif,image/webp" />
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>{pending ? "Posting…" : "Post"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
