export function extractDomain(url: string | undefined | null): string {
  if (!url) return "";
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function isExternalUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname !== "news.ycombinator.com";
  } catch {
    return false;
  }
}