import type { KVStore } from "../platform/kv.ts";
import { fetchItem } from "./client.ts";
import { getOrFetchItem } from "./kv-fetch.ts";
import { normalizeComment } from "./normalize.ts";
import { withConcurrency } from "../utils/concurrency.ts";
import type { CommentNode } from "./normalize.ts";

const REPLY_CONCURRENCY = 16;

export async function fetchChildComments(
  parentId: number,
  limit = 20,
  kv?: KVStore,
): Promise<CommentNode[]> {
  const parent = kv
    ? await getOrFetchItem(kv, parentId)
    : await fetchItem(parentId);
  if (!parent || !parent.kids || parent.kids.length === 0) return [];

  const childIds = parent.kids.slice(0, limit);
  const comments = await withConcurrency(childIds, REPLY_CONCURRENCY, async (id) => {
    const item = kv ? await getOrFetchItem(kv, id) : await fetchItem(id);
    if (!item || item.dead || item.deleted) return null;
    return normalizeComment(item);
  });

  return comments.filter((c): c is CommentNode => c !== null);
}

export async function fetchReplies(
  commentIds: number[],
  kv?: KVStore,
): Promise<CommentNode[]> {
  const comments = await withConcurrency(commentIds, REPLY_CONCURRENCY, async (id) => {
    const item = kv ? await getOrFetchItem(kv, id) : await fetchItem(id);
    if (!item || item.dead || item.deleted) return null;
    return normalizeComment(item);
  });

  return comments.filter((c): c is CommentNode => c !== null);
}
