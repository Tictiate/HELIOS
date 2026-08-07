/**
 * Single shared HTTP client for every services/api/*.ts module — the only place a base URL or
 * fetch call is constructed, so there is no duplicated networking logic across the app.
 */
import { showToast } from '../../components/common/Toast';

const env = import.meta.env as Record<string, string | undefined>;

export const API_BASE_URL = env.VITE_API_BASE_URL ?? 'http://localhost:8000';
export const WS_BASE_URL = env.VITE_WS_BASE_URL ?? 'ws://localhost:8000';

export class ApiError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network request failed';
    showToast(`Could not reach backend: ${message}`, 'error');
    throw new ApiError(message, 0, url);
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      if (body && typeof body.detail === 'string') detail = body.detail;
    } catch {
      // response had no JSON body — keep statusText
    }
    showToast(`Request failed: ${detail}`, 'error');
    throw new ApiError(detail, response.status, url);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
}
