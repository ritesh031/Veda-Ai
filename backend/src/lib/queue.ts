import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export const generationQueue = new Queue('question-generation', {
  connection: new IORedis(REDIS_URL, { maxRetriesPerRequest: null }),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export async function getCached(key: string): Promise<any | null> {
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export async function setCache(key: string, value: any, ttl = 3600): Promise<void> {
  try { await redis.set(key, JSON.stringify(value), 'EX', ttl); } catch {}
}

export async function deleteCache(key: string): Promise<void> {
  try { await redis.del(key); } catch {}
}
