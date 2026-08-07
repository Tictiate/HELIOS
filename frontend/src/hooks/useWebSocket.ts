import { useEffect, useRef, useState } from 'react';
import { HeliosSocket, type WsStatus } from '../services/websocket/websocket';

export interface UseWebSocketResult {
  status: WsStatus;
  lastMessage: unknown;
}

/** Thin React wrapper around HeliosSocket — connects on mount, cleans up on unmount. */
export function useWebSocket(url: string): UseWebSocketResult {
  const [status, setStatus] = useState<WsStatus>('connecting');
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  const socketRef = useRef<HeliosSocket | null>(null);

  useEffect(() => {
    const socket = new HeliosSocket({
      url,
      onStatusChange: setStatus,
      onMessage: setLastMessage,
    });
    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [url]);

  return { status, lastMessage };
}
