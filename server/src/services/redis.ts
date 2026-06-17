import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
let client: ReturnType<typeof createClient> | null = null;
let isConnected = false;

if (!redisUrl.includes("mock")) {
  client = createClient({ url: redisUrl });
  client.on("error", (err: any) => {
    console.warn("Redis client warning, caching disabled:", err.message);
    isConnected = false;
  });
  client
    .connect()
    .then(() => {
      console.log("Connected to Redis cache");
      isConnected = true;
    })
    .catch((err: any) => {
      console.warn("Failed to connect to Redis cache. Fallback to direct DB queries:", err.message);
      isConnected = false;
    });
}

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    if (!isConnected || !client) return null;
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    if (!isConnected || !client) return;
    try {
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  static async del(key: string): Promise<void> {
    if (!isConnected || !client) return;
    try {
      await client.del(key);
    } catch {
      // ignore
    }
  }

  static async clearPattern(pattern: string): Promise<void> {
    if (!isConnected || !client) return;
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch {
      // ignore
    }
  }
}
