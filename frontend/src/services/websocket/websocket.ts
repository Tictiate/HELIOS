/**
 * Framework-agnostic WebSocket client for `ws://localhost:8000/ws/network` — automatic
 * connect, automatic reconnect with capped exponential backoff, and a connection-status
 * callback. Relies on the browser's own WebSocket ping/pong keep-alive; no app-level
 * heartbeat frames are sent, per spec.
 */

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface HeliosSocketOptions {
  url: string;
  onMessage: (data: unknown) => void;
  onStatusChange: (status: WsStatus) => void;
  /** Starting reconnect delay in ms (doubles each attempt). Default 1000. */
  baseBackoffMs?: number;
  /** Reconnect delay ceiling in ms. Default 30000. */
  maxBackoffMs?: number;
}

export class HeliosSocket {
  private readonly url: string;
  private readonly onMessage: (data: unknown) => void;
  private readonly onStatusChange: (status: WsStatus) => void;
  private readonly baseBackoffMs: number;
  private readonly maxBackoffMs: number;

  private ws: WebSocket | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private manuallyClosed = false;

  constructor(options: HeliosSocketOptions) {
    this.url = options.url;
    this.onMessage = options.onMessage;
    this.onStatusChange = options.onStatusChange;
    this.baseBackoffMs = options.baseBackoffMs ?? 1000;
    this.maxBackoffMs = options.maxBackoffMs ?? 30000;
  }

  connect(): void {
    this.manuallyClosed = false;
    this.reconnectAttempt = 0;
    this.open();
  }

  close(): void {
    this.manuallyClosed = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  private open(): void {
    this.onStatusChange(this.reconnectAttempt === 0 ? 'connecting' : 'reconnecting');

    let socket: WebSocket;
    try {
      socket = new WebSocket(this.url);
    } catch {
      this.onStatusChange('error');
      this.scheduleReconnect();
      return;
    }
    this.ws = socket;

    socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.onStatusChange('connected');
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        this.onMessage(JSON.parse(event.data as string));
      } catch {
        // Malformed frame — ignore rather than crash the dashboard.
      }
    };

    socket.onerror = () => {
      this.onStatusChange('error');
    };

    socket.onclose = () => {
      this.ws = null;
      if (this.manuallyClosed) return;
      this.onStatusChange('disconnected');
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.manuallyClosed) return;
    const delay = Math.min(this.baseBackoffMs * 2 ** this.reconnectAttempt, this.maxBackoffMs);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      if (!this.manuallyClosed) this.open();
    }, delay);
  }
}
