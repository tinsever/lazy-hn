import { htmlListKey, htmlStoryKey, htmlUserKey } from "./keys.ts";

export async function getCachedHtml(
  request: Request,
  url: string,
): Promise<Response | null> {
  const cache = caches.default;
  const cacheKey = new Request(url, request);
  return (await cache.match(cacheKey)) ?? null;
}

export async function setCachedHtml(
  request: Request,
  url: string,
  response: Response,
  ttlSeconds: number,
): Promise<void> {
  const cache = caches.default;
  const cacheKey = new Request(url, request);

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", `public, s-maxage=${ttlSeconds}`);

  const cachedResponse = new Response(response.body, {
    status: response.status,
    headers,
  });

  await cache.put(cacheKey, cachedResponse);
}

export function buildListCacheUrl(
  baseUrl: string,
  type: string,
  page: number,
): string {
  return `${baseUrl}/${htmlListKey(type, page)}`;
}

export function buildStoryCacheUrl(
  baseUrl: string,
  id: number,
): string {
  return `${baseUrl}/${htmlStoryKey(id)}`;
}

export function buildUserCacheUrl(
  baseUrl: string,
  id: string,
): string {
  return `${baseUrl}/${htmlUserKey(id)}`;
}