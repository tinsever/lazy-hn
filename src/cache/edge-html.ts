import type { Context } from "hono";
import type { EnvBindings } from "../utils/response.ts";
import { getMemoryHtml, setMemoryHtml } from "./memory-html-cache.ts";

function hasEdgeCache(): boolean {
  return typeof caches !== "undefined" && typeof caches.default !== "undefined";
}

export async function matchEdgeHtml(url: string): Promise<Response | null> {
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

  if (hasEdgeCache()) {
    const cacheRequest = new Request(url, { method: "GET" });
    c.executionCtx.waitUntil(caches.default.put(cacheRequest, response.clone()));
  } else {
    c.executionCtx.waitUntil(setMemoryHtml(url, response.clone(), edgeTtlSeconds));
  }

  return response;
}
