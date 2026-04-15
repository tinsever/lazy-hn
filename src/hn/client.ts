const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

const FETCH_TIMEOUT = 5000;

async function hnFetch<T>(path: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const res = await fetch(`${HN_API_BASE}${path}`, {
      signal: controller.signal,
      headers: { "User-Agent": "lazy-hn/1.0" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchListIds(type: string): Promise<number[]> {
  const data = await hnFetch<number[]>(`/${type}.json`);
  return data ?? [];
}

export async function fetchItem(id: number): Promise<HNItem | null> {
  return hnFetch<HNItem>(`/item/${id}.json`);
}

export async function fetchUser(id: string): Promise<HNUser | null> {
  return hnFetch<HNUser>(`/user/${id}.json`);
}

export async function fetchUpdates(): Promise<HNUpdates | null> {
  return hnFetch<HNUpdates>("/updates.json");
}

export interface HNItem {
  id: number;
  deleted?: boolean;
  type?: string;
  by?: string;
  time?: number;
  text?: string;
  dead?: boolean;
  parent?: number;
  kids?: number[];
  url?: string;
  score?: number;
  title?: string;
  descendants?: number;
}

export interface HNUser {
  id: string;
  created?: number;
  karma?: number;
  about?: string;
  submitted?: number[];
}

export interface HNUpdates {
  items?: number[];
  profiles?: string[];
}