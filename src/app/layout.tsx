import Link from "next/link";
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { Input } from "@/components/ui/input";
import { logout } from "@/lib/actions";
import { Providers } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/session";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Chatelo",
  description: "Share posts and fire your favourites",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser();
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-gradient-to-b from-orange-50 to-background antialiased dark:from-orange-950/20">
        <Providers>
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 p-3">
              <Link
                href="/posts"
                className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent"
              >
                🔥 Chatelo
              </Link>
              <nav className="flex flex-wrap items-center gap-2">
                {me && (
                  <form action="/search" method="get" role="search">
                    <Input
                      name="q"
                      type="search"
                      placeholder="Search people or #tags"
                      aria-label="Search"
                      className="w-48 sm:w-64"
                    />
                  </form>
                )}
                <Link href="/posts" className={buttonVariants({ variant: "ghost" })}>
                  Feed
                </Link>
                {me && (
                  <>
                    <Link href={`/users/${me.id}`} className={buttonVariants({ variant: "ghost" })}>
                      My profile
                    </Link>
                    <form action={logout}>
                      <Button type="submit" variant="outline">
                        Log out
                      </Button>
                    </form>
                  </>
                )}
                <ThemeToggle />
              </nav>
            </div>
          </header>
          {me ? (
            <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">{children}</main>
          ) : (
            <AuthModal />
          )}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
