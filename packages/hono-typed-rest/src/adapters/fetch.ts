/**
 * Fetch API type definition.
 * It accepts both `Promise<Response>` (standard fetch) and `Response` (Hono's app.request).
 */
export type FetchApi = (
  input: string | URL | Request,
  init?: RequestInit
) => Response | Promise<Response>;

export interface ClientOptions {
  baseUrl?: string;
  fetch?: FetchApi;
  headers?: Record<string, string> | Headers;
}

