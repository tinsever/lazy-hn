import { Hono } from "hono";
import { TTL } from "../cache/keys.ts";
import { matchEdgeHtml, respondHtmlCached } from "../cache/edge-html.ts";
import type { EnvBindings } from "../utils/response.ts";

export const fragmentRoute = new Hono<{ Bindings: EnvBindings }>();

fragmentRoute.get("/fragment/replies/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (!id || isNaN(id)) {
    return c.text("Invalid comment ID", 400);
  }

  const hit = await matchEdgeHtml(new URL(c.req.url).toString(), c.env.DISABLE_HTML_CACHE ?? false);
  if (hit) return hit;

  const { fetchChildComments } = await import("../hn/comments.ts");
  const { renderRepliesFragment } = await import("../render/fragments.ts");
  const kv = c.env.HN_CACHE;

  try {
    const comments = await fetchChildComments(id, 20, kv);
    const html = renderRepliesFragment(comments);
    return respondHtmlCached(c, html, TTL.HTML_FRAGMENT);
  } catch {
    return c.text("Error fetching replies", 500);
  }
});

fragmentRoute.get("/fragment/comments/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (!id || isNaN(id)) {
    return c.text("Invalid item ID", 400);
  }

  const hit = await matchEdgeHtml(new URL(c.req.url).toString(), c.env.DISABLE_HTML_CACHE ?? false);
  if (hit) return hit;

  const { fetchChildComments } = await import("../hn/comments.ts");
  const { renderCommentFragment } = await import("../render/fragments.ts");
  const kv = c.env.HN_CACHE;

  try {
    const comments = await fetchChildComments(id, 20, kv);
    const fragments = comments.map((comment) => renderCommentFragment(comment));
    return respondHtmlCached(c, fragments.join("\n"), TTL.HTML_FRAGMENT);
  } catch {
    return c.text("Error fetching comments", 500);
  }
});
