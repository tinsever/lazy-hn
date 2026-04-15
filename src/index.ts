import app from "./app.ts";
import type { EnvBindings } from "./utils/response.ts";

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: EnvBindings, _ctx: ExecutionContext) {
    const { prewarm } = await import("./jobs/prewarm.ts");
    const { syncUpdates } = await import("./jobs/sync-updates.ts");
    await Promise.all([prewarm(env.HN_CACHE), syncUpdates(env.HN_CACHE)]);
  },
};