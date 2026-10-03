"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProfile, login, type FormState } from "@/lib/actions";

export function AuthModal() {
  const [mode, setMode] = useState<"login" | "create">("login");
  const [loginState, loginAction, loginPending] = useActionState<FormState, FormData>(login, {});
  const [createState, createAction, createPending] = useActionState<FormState, FormData>(createProfile, {});

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle id="auth-title" className="text-xl">
            {mode === "login" ? "Log in to Chatelo" : "Create your profile"}
          </CardTitle>
          <CardDescription>
            {mode === "login" ? "Enter your email to continue." : "Join Chatelo and start sharing."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "login" ? (
            <form action={loginAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" name="email" type="email" autoComplete="email" required autoFocus />
              </div>
              {loginState.error && <p className="text-sm text-destructive">{loginState.error}</p>}
              <Button type="submit" className="w-full" disabled={loginPending}>{loginPending ? "Logging in…" : "Log in"}</Button>
            </form>
          ) : (
            <form action={createAction} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" autoComplete="name" required autoFocus /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
              <div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" name="website" placeholder="https://example.com" /></div>
              {createState.error && <p className="text-sm text-destructive">{createState.error}</p>}
              <Button type="submit" className="w-full" disabled={createPending}>{createPending ? "Creating…" : "Create profile"}</Button>
            </form>
          )}
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button type="button" className="underline" onClick={() => setMode(mode === "login" ? "create" : "login")}>
              {mode === "login" ? "Create a profile" : "Log in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
