import type { KVStore } from "../platform/kv.ts";
import { getOrFetchListIds } from "../hn/kv-fetch.ts";
import { fetchStories } from "../hn/lists.ts";
import { fetchStoryPage } from "../hn/items.ts";

const HOT_LIST_TYPES = ["topstories", "newstories", "beststories"];
const WARM_PAGES = [1, 2, 3];
const HOT_STORIES_COUNT = 20;

export async function prewarm(kv: KVStore): Promise<void> {
  for (const listType of HOT_LIST_TYPES) {
    try {
      const ids = await getOrFetchListIds(kv, listType);
      const shortMap: Record<string, string> = {
        topstories: "top",
        newstories: "newest",
        beststories: "best",
      };
      const type = shortMap[listType] ?? listType;

      for (const page of WARM_PAGES) {
        try {
          await fetchStories(type, page, 30, kv);
        } catch {}
      }

      const topIds = ids.slice(0, HOT_STORIES_COUNT);
      for (const id of topIds) {
        try {
          await fetchStoryPage(id, 20, kv);
        } catch {}
      }
    } catch {}
  }
}
