import app from "./app.ts";
import { prewarm, syncUpdates } from "./jobs/index.ts";
import { MemoryKVStore } from "./platform/memory-kv.ts";
import type { EnvBindings } from "./utils/response.ts";

const DEFAULT_JOB_INTERVAL_MS = 2 * 60 * 1000;

const port = Number(Bun.env.PORT ?? "3000");
const hostname = Bun.env.HOST ?? "0.0.0.0";
const jobIntervalMs = Number(Bun.env.JOB_INTERVAL_MS ?? DEFAULT_JOB_INTERVAL_MS);
const env: EnvBindings = {
  HN_CACHE: new MemoryKVStore(),
  DISABLE_HTML_CACHE: true,
};

const backgroundTasks = new Set<Promise<unknown>>();

function waitUntil(task: Promise<unknown>): void {
  backgroundTasks.add(task);
  task.finally(() => {
    backgroundTasks.delete(task);
  });
}

function createExecutionContext(): ExecutionContext {
  return {
    props: {},
    waitUntil,
    passThroughOnException() {
    },
  };
}

async function runScheduledJobs(): Promise<void> {
  await Promise.all([prewarm(env.HN_CACHE), syncUpdates(env.HN_CACHE)]);
}

void runScheduledJobs().catch((error) => {
  console.error("Initial warmup failed", error);
});

const jobTimer = setInterval(() => {
  void runScheduledJobs().catch((error) => {
    console.error("Scheduled refresh failed", error);
  });
}, jobIntervalMs);

const server = Bun.serve({
  hostname,
  port,
  fetch(request) {
    return app.fetch(request, env, createExecutionContext());
  },
});

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`Received ${signal}, shutting down`);
  clearInterval(jobTimer);
  server.stop();
  await Promise.allSettled(backgroundTasks);
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

console.log(`lazy-hn listening on ${server.url}`);
