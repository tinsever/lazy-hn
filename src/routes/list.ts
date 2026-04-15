import { Hono } from "hono";
import { TTL } from "../cache/keys.ts";
import { matchEdgeHtml, respondHtmlCached } from "../cache/edge-html.ts";
import type { EnvBindings } from "../utils/response.ts";

export const listRoute = new Hono<{ Bindings: EnvBindings }>();

listRoute.get("/newest", async (c) => {
  return handleList(c, "newest");
});

listRoute.get("/best", async (c) => {
  return handleList(c, "best");
});

listRoute.get("/ask", async (c) => {
  return handleList(c, "ask");
});

listRoute.get("/show", async (c) => {
  return handleList(c, "show");
});

listRoute.get("/jobs", async (c) => {
  return handleList(c, "jobs");
});

listRoute.get("/news", async (c) => {
  const page = parseInt(c.req.query("p") ?? "1", 10) || 1;
  return handleList(c, "top", page);
});

async function handleList(c: import("hono").Context<{ Bindings: EnvBindings }>, type: string, page = 1) {
  const hit = await matchEdgeHtml(new URL(c.req.url).toString(), c.env.DISABLE_HTML_CACHE ?? false);
  if (hit) return hit;

  const { fetchStories } = await import("../hn/lists.ts");
  const { renderListPage } = await import("../render/list-page.ts");
  const kv = c.env.HN_CACHE;

  try {
    const result = await fetchStories(type, page, 30, kv);
    const html = renderListPage(result.stories, type, page, result.total);
    return respondHtmlCached(c, html, TTL.HTML_LIST);
  } catch {
    return c.text("Error fetching stories", 500);
  }
}
