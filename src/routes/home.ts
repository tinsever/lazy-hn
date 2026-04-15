import { Hono } from "hono";
import { TTL } from "../cache/keys.ts";
import { matchEdgeHtml, respondHtmlCached } from "../cache/edge-html.ts";
import type { EnvBindings } from "../utils/response.ts";

export const homeRoute = new Hono<{ Bindings: EnvBindings }>();

homeRoute.get("/", async (c) => {
  const hit = await matchEdgeHtml(new URL(c.req.url).toString(), c.env.DISABLE_HTML_CACHE ?? false);
  if (hit) return hit;

  const { fetchStories } = await import("../hn/lists.ts");
  const { renderListPage } = await import("../render/list-page.ts");
  const kv = c.env.HN_CACHE;
  let stories: import("../hn/normalize.ts").StoryCard[] = [];
  let total = 0;

  try {
    const result = await fetchStories("top", 1, 30, kv);
    stories = result.stories;
    total = result.total;
  } catch {
    return c.text("Error fetching stories", 500);
  }

  if (stories.length === 0) {
    return c.text("No stories found", 404);
  }

  const html = renderListPage(stories, "top", 1, total);
  return respondHtmlCached(c, html, TTL.HTML_LIST);
});
