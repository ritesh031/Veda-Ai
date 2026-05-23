'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store';
import { WSMessage } from '@/types';

export function useWebSocket(assignmentId?: string) {
  const ws = useRef<WebSocket | null>(null);
  const { handleWS } = useStore();

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      if (assignmentId) socket.send(JSON.stringify({ type: 'subscribe', assignmentId }));
    };

    socket.onmessage = (e) => {
      try {
        const msg: WSMessage = JSON.parse(e.data);
        if (msg.type !== 'connected') handleWS(msg);
      } catch {}
    };

    socket.onclose = () => setTimeout(connect, 3000);
    socket.onerror = () => socket.close();
  }, [assignmentId, handleWS]);

  useEffect(() => {
    connect();
    return () => ws.current?.close();
  }, [connect]);
}
