import { Hono } from "hono";
import { TTL } from "../cache/keys.ts";
import { matchEdgeHtml, respondHtmlCached } from "../cache/edge-html.ts";
import type { EnvBindings } from "../utils/response.ts";

export const userRoute = new Hono<{ Bindings: EnvBindings }>();

userRoute.get("/user/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.text("Invalid user ID", 400);
  }

  const hit = await matchEdgeHtml(new URL(c.req.url).toString());
  if (hit) return hit;

  const { fetchUserProfile } = await import("../hn/users.ts");
  const { renderUserPage } = await import("../render/user-page.ts");
  const kv = c.env.HN_CACHE;

  try {
    const user = await fetchUserProfile(id, kv);
    if (!user) {
      return c.text("User not found", 404);
    }

    const html = renderUserPage(user);
    return respondHtmlCached(c, html, TTL.HTML_USER);
  } catch {
    return c.text("Error fetching user", 500);
  }
});