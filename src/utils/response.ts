import type { Context } from "hono";
import type { KVStore } from "../platform/kv.ts";

export function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=15, s-maxage=30",
    },
  });
}

export function fragmentResponse(html: string): Response {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=30",
    },
  });
}

export function notFoundResponse(): Response {
  return new Response("Not Found", { status: 404 });
}

export function jsonResponse(data: unknown, maxAge = 30): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${maxAge}`,
    },
  });
}

export type EnvBindings = {
  HN_CACHE: KVStore;
  DISABLE_HTML_CACHE?: boolean;
};

export type AppContext = Context<{ Bindings: EnvBindings }>;
