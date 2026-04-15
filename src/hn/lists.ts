import type { KVStore } from "../platform/kv.ts";
import { fetchListIds, fetchItem } from "./client.ts";
import { getOrFetchItem, getOrFetchListIds } from "./kv-fetch.ts";
import { normalizeStory } from "./normalize.ts";
import { withConcurrency } from "../utils/concurrency.ts";
import type { StoryCard } from "./normalize.ts";

const LIST_MAP: Record<string, string> = {
  top: "topstories",
  newest: "newstories",
  best: "beststories",
  ask: "askstories",
  show: "showstories",
  jobs: "jobstories",
};

export function getListEndpoint(type: string): string | null {
  return LIST_MAP[type] ?? null;
}

export function getAllListTypes(): string[] {
  return Object.keys(LIST_MAP);
}

const ITEM_CONCURRENCY = 32;

export async function fetchStories(
  type: string,
  page = 1,
  perPage = 30,
  kv?: KVStore,
): Promise<{ stories: StoryCard[]; total: number }> {
  const endpoint = getListEndpoint(type);
  if (!endpoint) return { stories: [], total: 0 };

  const ids = kv
    ? await getOrFetchListIds(kv, endpoint)
    : await fetchListIds(endpoint);
  const total = ids.length;
  const start = (page - 1) * perPage;
  const pageIds = ids.slice(start, start + perPage);

  const stories = await withConcurrency(pageIds, ITEM_CONCURRENCY, async (id) => {
    const item = kv ? await getOrFetchItem(kv, id) : await fetchItem(id);
    if (!item || item.deleted || item.dead) return null;
    return normalizeStory(item);
  });

  return {
    stories: stories.filter((s): s is StoryCard => s !== null),
    total,
  };
}

export async function fetchListIdsOnly(
  type: string,
  kv?: KVStore,
): Promise<number[]> {
  const endpoint = getListEndpoint(type);
  if (!endpoint) return [];
  if (kv) return getOrFetchListIds(kv, endpoint);
  return fetchListIds(endpoint);
}
