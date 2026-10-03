"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { getCurrentUser } from "./session";
import { extractHashtags } from "./hashtags";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};
const MAX_BYTES = 5 * 1024 * 1024;

export type FormState = { error?: string; ok?: boolean };

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter your email." };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "No account found with that email." };
  await prisma.user.update({ where: { id: user.id }, data: { lastSignedInAt: new Date() } });
  (await cookies()).set("userId", String(user.id), { httpOnly: true, sameSite: "lax", path: "/" });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete("userId");
  revalidatePath("/", "layout");
  redirect("/posts");
}

export async function createProfile(_: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  let website = String(formData.get("website") ?? "").trim();
  if (!name) return { error: "Name is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." };
  if (website) {
    if (!/^https?:\/\//i.test(website)) website = `https://${website}`;
    try {
      new URL(website);
    } catch {
      return { error: "Enter a valid website URL." };
    }
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: "That email is already in use." };
  }

  let user;
  try {
    user = await prisma.user.create({ data: { name, email, website: website || null } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That email is already in use." };
    }
    throw error;
  }

  (await cookies()).set("userId", String(user.id), { httpOnly: true, sameSite: "lax", path: "/" });
  revalidatePath("/", "layout");
  redirect(`/users/${user.id}`);
}

export async function createPost(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "No user" };
  const content = String(formData.get("content") ?? "").trim();
  const file = formData.get("image");
  const hasFile = file instanceof File && file.size > 0;
  if (!content && !hasFile) return { error: "Write something or attach an image." };
  if (content.length > 500) return { error: "Posts are limited to 500 characters." };

  let imageUrl: string | null = null;
  if (hasFile) {
    const ext = TYPES[file.type];
    if (!ext) return { error: "Image must be PNG, JPEG, GIF or WebP." };
    if (file.size > MAX_BYTES) return { error: "Image must be under 5MB." };
    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
    imageUrl = `/api/uploads/${name}`;
  }
  const hashtags = extractHashtags(content).map((tag) => ({ where: { tag }, create: { tag } }));
  await prisma.post.create({
    data: { content, imageUrl, authorId: user.id, hashtags: { connectOrCreate: hashtags } },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleFire(postId: number) {
  const user = await getCurrentUser();
  if (!user) return;
  const key = { userId_postId: { userId: user.id, postId } };
  const existing = await prisma.fire.findUnique({ where: key });
  if (existing) await prisma.fire.delete({ where: key });
  else await prisma.fire.create({ data: { userId: user.id, postId } });
  revalidatePath("/", "layout");
}

export async function toggleFollow(targetId: number) {
  const me = await getCurrentUser();
  if (!me || me.id === targetId) return;
  if (!(await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } }))) return;
  const key = { followerId_followingId: { followerId: me.id, followingId: targetId } };
  const existing = await prisma.follow.findUnique({ where: key });
  if (existing) await prisma.follow.delete({ where: key });
  else await prisma.follow.create({ data: { followerId: me.id, followingId: targetId } });
  revalidatePath("/", "layout");
}

export async function updateProfile(userId: number, _: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();
  if (!me || me.id !== userId) return { error: "You can only edit your own profile." };
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  let website = String(formData.get("website") ?? "").trim();
  if (!name) return { error: "Name is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." };
  if (website) {
    if (!/^https?:\/\//i.test(website)) website = `https://${website}`;
    try {
      new URL(website);
    } catch {
      return { error: "Enter a valid website URL." };
    }
  }
  const clash = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
  if (clash) return { error: "That email is already in use." };
  await prisma.user.update({ where: { id: userId }, data: { name, email, website: website || null } });
  revalidatePath("/", "layout");
  redirect(`/users/${userId}`);
}
