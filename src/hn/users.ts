import type { KVStore } from "../platform/kv.ts";
import { fetchUser } from "./client.ts";
import { getOrFetchUser } from "./kv-fetch.ts";
import { normalizeUser } from "./normalize.ts";
import type { UserProfile } from "./normalize.ts";

export async function fetchUserProfile(
  id: string,
  kv?: KVStore,
): Promise<UserProfile | null> {
  const user = kv ? await getOrFetchUser(kv, id) : await fetchUser(id);
  if (!user) return null;
  return normalizeUser(user);
}
