import { extractDomain } from "../utils/url.ts";
import type { HNItem, HNUser } from "./client.ts";

export interface StoryCard {
  id: number;
  title: string;
  by: string;
  score: number;
  time: number;
  descendants: number;
  url: string;
  domain: string;
  type: string;
}

export interface CommentNode {
  id: number;
  by: string;
  time: number;
  text: string;
  kids: number[];
  childCount: number;
  deleted: boolean;
  dead: boolean;
  parent: number;
}

export interface UserProfile {
  id: string;
  created: number;
  karma: number;
  about: string;
  submitted: number[];
}

export function normalizeStory(item: HNItem): StoryCard {
  return {
    id: item.id,
    title: item.title ?? "",
    by: item.by ?? "",
    score: item.score ?? 0,
    time: item.time ?? 0,
    descendants: item.descendants ?? 0,
    url: item.url ?? "",
    domain: extractDomain(item.url),
    type: item.type ?? "story",
  };
}

export function normalizeComment(item: HNItem): CommentNode {
  return {
    id: item.id,
    by: item.by ?? "[deleted]",
    time: item.time ?? 0,
    text: item.text ?? "",
    kids: item.kids ?? [],
    childCount: item.kids?.length ?? 0,
    deleted: item.deleted ?? false,
    dead: item.dead ?? false,
    parent: item.parent ?? 0,
  };
}

export function normalizeUser(user: HNUser): UserProfile {
  return {
    id: user.id,
    created: user.created ?? 0,
    karma: user.karma ?? 0,
    about: user.about ?? "",
    submitted: user.submitted ?? [],
  };
}