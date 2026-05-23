import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import mongoose from 'mongoose';
import { Assignment } from './models/Assignment';
import { generateQuestionPaper } from './lib/ai';
import { setCache } from './lib/queue';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MONGO_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/vedaai';

const isTLS = REDIS_URL.startsWith('rediss://');
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: isTLS ? { rejectUnauthorized: false } : undefined,
});

mongoose.connect(MONGO_URL).then(() => console.log('[Worker] MongoDB connected'));

async function publish(assignmentId: string, payload: object) {
  await connection.publish('ws-notify', JSON.stringify({ assignmentId, ...payload }));
}

const worker = new Worker(
  'question-generation',
  async (job: Job) => {
    const { assignmentId, input } = job.data;
    console.log(`[Worker] Processing job ${job.id} → assignment ${assignmentId}`);

    await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
    await publish(assignmentId, { type: 'progress', status: 'processing', progress: 10, message: 'Starting generation...' });

    await publish(assignmentId, { type: 'progress', status: 'processing', progress: 35, message: 'Building prompt...' });

    await publish(assignmentId, { type: 'progress', status: 'processing', progress: 50, message: 'AI is generating questions...' });

    const paper = await generateQuestionPaper(input);

    await publish(assignmentId, { type: 'progress', status: 'processing', progress: 85, message: 'Saving results...' });

    await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed', generatedPaper: paper });
    await setCache(`paper:${assignmentId}`, paper);

    await publish(assignmentId, { type: 'completed', status: 'completed', progress: 100, paper });
    console.log(`[Worker] Job ${job.id} done`);
    return paper;
  },
  {
  connection: new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    tls: isTLS ? { rejectUnauthorized: false } : undefined,
  }),
  concurrency: 3,
}
);

worker.on('failed', async (job, err) => {
  if (!job) return;
  console.error(`[Worker] Job ${job.id} failed:`, err.message);
  await Assignment.findByIdAndUpdate(job.data.assignmentId, {
    status: 'failed',
    errorMessage: err.message,
  });
  await connection.publish('ws-notify', JSON.stringify({
    assignmentId: job.data.assignmentId,
    type: 'failed',
    status: 'failed',
    error: err.message,
  }));
});

console.log('[Worker] Ready — waiting for jobs...');
