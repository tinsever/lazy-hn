import type { KVStore } from "../platform/kv.ts";
import { fetchItem, fetchListIds, fetchUser, type HNItem, type HNUser } from "./client.ts";
import {
  getCachedItem,
  setCachedItem,
  getCachedListEndpoint,
  setCachedListEndpoint,
  getCachedUser,
  setCachedUser,
} from "../cache/kv-cache.ts";

export async function getOrFetchListIds(
  kv: KVStore,
  endpoint: string,
): Promise<number[]> {
  const cached = await getCachedListEndpoint(kv, endpoint);
  if (cached && cached.length > 0) return cached;
  const fresh = await fetchListIds(endpoint);
  if (fresh.length > 0) {
    await setCachedListEndpoint(kv, endpoint, fresh);
  }
  return fresh;
}

export async function getOrFetchItem(
  kv: KVStore,
  id: number,
): Promise<HNItem | null> {
  const cached = await getCachedItem<HNItem>(kv, id);
  if (cached) return cached;
  const fresh = await fetchItem(id);
  if (fresh) {
    await setCachedItem(kv, id, fresh, true);
  }
  return fresh;
}

export async function getOrFetchUser(
  kv: KVStore,
  id: string,
): Promise<HNUser | null> {
  const cached = await getCachedUser<HNUser>(kv, id);
  if (cached) return cached;
  const fresh = await fetchUser(id);
  if (fresh) {
    await setCachedUser(kv, id, fresh);
  }
  return fresh;
}
