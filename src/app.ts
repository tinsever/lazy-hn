import { Hono } from "hono";
import type { EnvBindings } from "./utils/response.ts";
import { homeRoute } from "./routes/home.ts";
import { listRoute } from "./routes/list.ts";
import { itemRoute } from "./routes/item.ts";
import { userRoute } from "./routes/user.ts";
import { fragmentRoute } from "./routes/fragment.ts";

const app = new Hono<{ Bindings: EnvBindings }>();

app.route("/", homeRoute);
app.route("/", listRoute);
app.route("/", itemRoute);
app.route("/", userRoute);
app.route("/", fragmentRoute);

app.get("/health", (c) => c.text("ok"));

app.get("/robots.txt", (c) => {
  return c.text("User-agent: *\nAllow: /\n");
});

export default app;