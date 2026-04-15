import type { KVStore } from "../platform/kv.ts";
import { fetchItem } from "./client.ts";
import { getOrFetchItem } from "./kv-fetch.ts";
import { normalizeStory, normalizeComment } from "./normalize.ts";
import { withConcurrency } from "../utils/concurrency.ts";
import { setCachedItem } from "../cache/kv-cache.ts";
import type { StoryCard, CommentNode } from "./normalize.ts";

export interface StoryPage {
  story: StoryCard;
  commentIds: number[];
  comments: CommentNode[];
  totalComments: number;
}

const COMMENT_FETCH_CONCURRENCY = 16;

export async function fetchStoryPage(
  id: number,
  commentLimit = 20,
  kv?: KVStore,
): Promise<StoryPage | null> {
  let item = kv ? await getOrFetchItem(kv, id) : await fetchItem(id);
  if (!item) return null;

  if (kv && item.type === "story" && !item.text) {
    const fresh = await fetchItem(id);
    if (fresh?.text) {
      item = fresh;
      await setCachedItem(kv, id, fresh, true);
    }
  }

  const story = normalizeStory(item);
  const commentIds = item.kids ?? [];
  const totalComments = item.descendants ?? 0;

  const topIds = commentIds.slice(0, commentLimit);
  const comments = await withConcurrency(topIds, COMMENT_FETCH_CONCURRENCY, async (cid) => {
    const c = kv ? await getOrFetchItem(kv, cid) : await fetchItem(cid);
    if (!c) return null;
    return normalizeComment(c);
  });

  return {
    story,
    commentIds,
    comments: comments.filter((c): c is CommentNode => c !== null),
    totalComments,
  };
}
