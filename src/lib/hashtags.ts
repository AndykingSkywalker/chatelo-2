export const HASHTAG_RE = /#([\p{L}\p{N}_]{1,50})/gu;

export function extractHashtags(text: string): string[] {
  return [...new Set([...text.matchAll(HASHTAG_RE)].map((m) => m[1].toLowerCase()))];
}
