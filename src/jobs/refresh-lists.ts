import type { KVStore } from "../platform/kv.ts";
import { fetchListIdsOnly } from "../hn/lists.ts";

const LIST_TYPES = ["top", "newest", "best", "ask", "show", "jobs"];

export async function refreshLists(kv?: KVStore): Promise<void> {
  for (const type of LIST_TYPES) {
    try {
      await fetchListIdsOnly(type, kv);
    } catch {}
  }
}
