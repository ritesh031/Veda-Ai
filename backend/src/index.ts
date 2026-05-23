import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import IORedis from 'ioredis';
import assignmentRoutes from './routes/assignments';
import { initWebSocket, notifyAssignment } from './lib/websocket';

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/assignments', assignmentRoutes);
app.get('/api/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

initWebSocket(server);

// Redis pub/sub → WebSocket bridge
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const isTLS = REDIS_URL.startsWith('rediss://');
const sub = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: isTLS ? { rejectUnauthorized: false } : undefined,
});

sub.subscribe('ws-notify', (err) => {
  if (err) console.error('[Server] Redis subscribe error:', err);
  else console.log('[Server] Subscribed to ws-notify');
});
sub.on('message', (_, message) => {
  try {
    const { assignmentId, ...payload } = JSON.parse(message);
    if (assignmentId) notifyAssignment(assignmentId, payload);
  } catch {}
});

async function start() {
  await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/vedaai');
  console.log('[Server] MongoDB connected');
  server.listen(process.env.PORT || 4000, () => {
    console.log(`[Server] Running on http://localhost:${process.env.PORT || 4000}`);
  });
}

start().catch((e) => { console.error(e); process.exit(1); });
