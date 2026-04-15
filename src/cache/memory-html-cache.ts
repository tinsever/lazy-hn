type CachedHtmlEntry = {
  body: string;
  expiresAt: number;
  headers: [string, string][];
  status: number;
};

const htmlCache = new Map<string, CachedHtmlEntry>();

function cloneEntry(entry: CachedHtmlEntry): Response {
  return new Response(entry.body, {
    status: entry.status,
    headers: new Headers(entry.headers),
  });
}

export function getMemoryHtml(url: string): Response | null {
  const entry = htmlCache.get(url);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    htmlCache.delete(url);
    return null;
  }

  return cloneEntry(entry);
}

export async function setMemoryHtml(
  url: string,
  response: Response,
  ttlSeconds: number,
): Promise<void> {
  const body = await response.text();
  htmlCache.set(url, {
    body,
    expiresAt: Date.now() + ttlSeconds * 1000,
    headers: [...response.headers.entries()],
    status: response.status,
  });
}
