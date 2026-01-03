/**
 * Fetch API type definition. Used when using alternative libraries such as cross-fetch.
 */
export type FetchApi = typeof fetch;

export interface ClientOptions {
  baseUrl?: string;
  fetch?: FetchApi;
  headers?: Record<string, string> | Headers;
}

