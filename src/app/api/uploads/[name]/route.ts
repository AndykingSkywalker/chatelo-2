import { readFile } from "node:fs/promises";
import path from "node:path";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[\w-]+\.(png|jpg|gif|webp)$/.test(name)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(process.cwd(), "uploads", name));
    return new Response(data, {
      headers: {
        "Content-Type": MIME[path.extname(name)],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
