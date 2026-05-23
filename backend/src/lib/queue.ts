import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Upstash uses rediss:// (TLS) in production, plain redis:// locally
const isTLS = REDIS_URL.startsWith('rediss://');

function makeRedis() {
  return new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    tls: isTLS ? { rejectUnauthorized: false } : undefined,
  });
}

export const redis = makeRedis();

export const generationQueue = new Queue('question-generation', {
  connection: makeRedis(),
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