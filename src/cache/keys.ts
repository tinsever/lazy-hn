export const TTL = {
  LIST: 90,
  HOT_ITEM: 600,
  COLD_ITEM: 3600,
  COMMENT: 120,
  USER: 3600,
  HTML_LIST: 90,
  HTML_STORY: 120,
  HTML_USER: 600,
  HTML_FRAGMENT: 120,
} as const;

export function listKey(type: string): string {
  return `list:${type}`;
}

export function itemKey(id: number): string {
  return `item:${id}`;
}

export function userKey(id: string): string {
  return `user:${id}`;
}

export function commentsKey(id: number): string {
  return `comments:${id}:top`;
}

export function htmlListKey(type: string, page: number): string {
  return `html:list:${type}:${page}`;
}

export function htmlStoryKey(id: number): string {
  return `html:story:${id}`;
}

export function htmlUserKey(id: string): string {
  return `html:user:${id}`;
}