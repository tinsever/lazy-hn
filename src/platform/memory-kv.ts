import type { KVStore } from "./kv.ts";

type Entry = {
  value: string;
  expiresAt: number | null;
};

export class MemoryKVStore implements KVStore {
  #entries = new Map<string, Entry>();

  async get(key: string, type: "text"): Promise<string | null> {
    if (type !== "text") {
      throw new Error(`Unsupported value type: ${type}`);
    }

    const entry = this.#entries.get(key);
    if (!entry) return null;

    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.#entries.delete(key);
      return null;
    }

    return entry.value;
  }

  async put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void> {
    const ttl = options?.expirationTtl;
    this.#entries.set(key, {
      value,
      expiresAt: typeof ttl === "number" ? Date.now() + ttl * 1000 : null,
    });
  }
}
