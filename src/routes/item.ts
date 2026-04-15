import { Hono } from "hono";
import { TTL } from "../cache/keys.ts";
import { matchEdgeHtml, respondHtmlCached } from "../cache/edge-html.ts";
import type { EnvBindings } from "../utils/response.ts";

export const itemRoute = new Hono<{ Bindings: EnvBindings }>();

itemRoute.get("/item/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (!id || isNaN(id)) {
    return c.text("Invalid item ID", 400);
  }

  const hit = await matchEdgeHtml(new URL(c.req.url).toString(), c.env.DISABLE_HTML_CACHE ?? false);
  if (hit) return hit;

  const { fetchStoryPage } = await import("../hn/items.ts");
  const { renderItemPage } = await import("../render/item-page.ts");
  const kv = c.env.HN_CACHE;

  try {
    const data = await fetchStoryPage(id, 20, kv);
    if (!data) {
      return c.text("Item not found", 404);
    }

    const html = renderItemPage(data, id);
    return respondHtmlCached(c, html, TTL.HTML_STORY);
  } catch {
    return c.text("Error fetching item", 500);
  }
});
