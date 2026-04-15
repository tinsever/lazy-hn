import type { KVStore } from "../platform/kv.ts";
import { fetchUpdates } from "../hn/client.ts";

export async function refreshLists(kv?: KVStore): Promise<void> {
  const { fetchListIdsOnly } = await import("../hn/lists.ts");
  const types = ["top", "newest", "best", "ask", "show", "jobs"];
  for (const type of types) {
    try {
      await fetchListIdsOnly(type, kv);
    } catch {}
  }
}

export async function syncUpdates(kv: KVStore): Promise<void> {
  try {
    const updates = await fetchUpdates();
    if (!updates) return;

    if (updates.items && updates.items.length > 0) {
      const { getOrFetchItem } = await import("../hn/kv-fetch.ts");
      const { withConcurrency } = await import("../utils/concurrency.ts");
      await withConcurrency(updates.items.slice(0, 50), 10, async (id) => {
        try {
          await getOrFetchItem(kv, id);
        } catch {}
      });
    }
  } catch {}
}
