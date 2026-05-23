import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

interface Client { ws: WebSocket; assignmentId?: string }
const clients = new Map<string, Client>();
let wss: WebSocketServer;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    const id = Math.random().toString(36).slice(2, 10);
    clients.set(id, { ws });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'subscribe' && msg.assignmentId) {
          clients.set(id, { ws, assignmentId: msg.assignmentId });
        }
      } catch {}
    });

    ws.on('close', () => clients.delete(id));
    ws.send(JSON.stringify({ type: 'connected' }));
  });
}

export function notifyAssignment(assignmentId: string, payload: object) {
  const msg = JSON.stringify({ assignmentId, ...payload });
  clients.forEach(({ ws, assignmentId: sub }) => {
    if (sub === assignmentId && ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}
