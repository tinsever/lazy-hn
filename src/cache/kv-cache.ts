import type { KVStore } from "../platform/kv.ts";
import { TTL, listKey, itemKey, userKey, commentsKey } from "./keys.ts";

export async function kvGet<T>(kv: KVStore, key: string): Promise<T | null> {
  const raw = await kv.get(key, "text");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function kvPut(
  kv: KVStore,
  key: string,
  value: unknown,
  ttl: number,
): Promise<void> {
  await kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
}

export async function getCachedList(
  kv: KVStore,
  type: string,
): Promise<number[] | null> {
  return kvGet<number[]>(kv, listKey(type));
}

export async function setCachedList(
  kv: KVStore,
  type: string,
  ids: number[],
): Promise<void> {
  await kvPut(kv, listKey(type), ids, TTL.LIST);
}

export function listEndpointStorageKey(endpoint: string): string {
  return `le:${endpoint}`;
}

export async function getCachedListEndpoint(
  kv: KVStore,
  endpoint: string,
): Promise<number[] | null> {
  return kvGet<number[]>(kv, listEndpointStorageKey(endpoint));
}

export async function setCachedListEndpoint(
  kv: KVStore,
  endpoint: string,
  ids: number[],
): Promise<void> {
  await kvPut(kv, listEndpointStorageKey(endpoint), ids, TTL.LIST);
}

export async function getCachedItem<T>(
  kv: KVStore,
  id: number,
): Promise<T | null> {
  return kvGet<T>(kv, itemKey(id));
}

export async function setCachedItem(
  kv: KVStore,
  id: number,
  data: unknown,
  isHot = true,
): Promise<void> {
  await kvPut(kv, itemKey(id), data, isHot ? TTL.HOT_ITEM : TTL.COLD_ITEM);
}

export async function getCachedUser<T>(
  kv: KVStore,
  id: string,
): Promise<T | null> {
  return kvGet<T>(kv, userKey(id));
}

export async function setCachedUser(
  kv: KVStore,
  id: string,
  data: unknown,
): Promise<void> {
  await kvPut(kv, userKey(id), data, TTL.USER);
}

export async function getCachedComments<T>(
  kv: KVStore,
  storyId: number,
): Promise<T | null> {
  return kvGet<T>(kv, commentsKey(storyId));
}

export async function setCachedComments(
  kv: KVStore,
  storyId: number,
  data: unknown,
): Promise<void> {
  await kvPut(kv, commentsKey(storyId), data, TTL.COMMENT);
}
