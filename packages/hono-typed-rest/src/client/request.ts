/**
 * Common definition for request options
 */
import type { FetchApi } from '../adapters/fetch';

/**
 * Common definition for request options
 */
export interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  baseUrl?: string;
  fetch?: FetchApi;
  params?: Record<string, string | number | undefined>;
  query?: Record<string, string | number | boolean | (string | number | boolean)[] | undefined>;
  json?: unknown;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Internal function for type-safe request execution
 */
export async function request<T>(
  path: string,
  method: string,
  options: RequestOptions = {}
): Promise<T> {
  const { baseUrl, fetch: fetchApi, params, query, json, headers: customHeaders, ...fetchOptions } = options;

  // Path parameter substitution
  let urlPath = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) {
        const before = urlPath;
        const optionalToken = new RegExp(`/:${escapeRegExp(key)}(\\{[^}]+\\})?\\?(?=/|$)`, 'g');
        urlPath = urlPath.replace(optionalToken, '');
        if (urlPath === before) {
          throw new Error(`Missing required path param: ${key}`);
        }
        if (!urlPath.includes('://')) {
          urlPath = urlPath.replace(/\/{2,}/g, '/');
        }
        return;
      }

      const token = new RegExp(`:${escapeRegExp(key)}(\\{[^}]+\\})?\\??(?=/|$)`, 'g');
      urlPath = urlPath.replace(token, encodeURIComponent(String(value)));
    });
  }

  // Query parameter construction
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined) return;
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    });
  }
  const queryString = searchParams.toString();
  if (queryString) {
    urlPath = urlPath.includes('?') ? `${urlPath}&${queryString}` : `${urlPath}?${queryString}`;
  }

  const headers = new Headers(customHeaders);
  let body: string | undefined;

  if (json !== undefined) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    body = JSON.stringify(json);
  }

  const url =
    baseUrl && baseUrl.length > 0
      ? urlPath.includes('://')
        ? urlPath
        : `${baseUrl.replace(/\/$/, '')}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`
      : urlPath;

  const fetchFn = fetchApi ?? globalThis.fetch;

  const response = await fetchFn(url, {
    ...fetchOptions,
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      `Request failed with status ${response.status}: ${JSON.stringify(errorBody || response.statusText)}`
    );
  }

  const data = await response.json();
  return data as T;
}

