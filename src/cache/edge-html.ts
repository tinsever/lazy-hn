import type { Context } from "hono";
import type { EnvBindings } from "../utils/response.ts";
import { getMemoryHtml, setMemoryHtml } from "./memory-html-cache.ts";

function hasEdgeCache(): boolean {
  return typeof caches !== "undefined" && typeof caches.default !== "undefined";
}

function isLocalDevUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "::1"
    );
  } catch {
    return false;
  }
}

export async function matchEdgeHtml(
  url: string,
  disableCache = false,
): Promise<Response | null> {
  if (disableCache || isLocalDevUrl(url)) {
    return null;
  }
  if (hasEdgeCache()) {
    const hit = await caches.default.match(new Request(url, { method: "GET" }));
    return hit ?? null;
  }

  return getMemoryHtml(url);
}

export async function respondHtmlCached(
  c: Context<{ Bindings: EnvBindings }>,
  html: string,
  edgeTtlSeconds: number,
): Promise<Response> {
  const url = new URL(c.req.url).toString();
  const maxAge = Math.min(edgeTtlSeconds, 180);
  const response = new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${edgeTtlSeconds}`,
    },
  });

  if (c.env.DISABLE_HTML_CACHE || isLocalDevUrl(url)) {
    return response;
  }

  if (hasEdgeCache()) {
    const cacheRequest = new Request(url, { method: "GET" });
    c.executionCtx.waitUntil(caches.default.put(cacheRequest, response.clone()));
  } else {
    c.executionCtx.waitUntil(setMemoryHtml(url, response.clone(), edgeTtlSeconds));
  }

  return response;
}
