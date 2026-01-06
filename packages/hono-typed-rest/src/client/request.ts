/**
 * Common definition for request options
 */
import type { FetchApi } from '../adapters/fetch';
import { HttpError, ResponseParseError } from './errors';

/**
 * Common definition for request options
 */
export interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  baseUrl?: string;
  fetch?: FetchApi;
  params?: Record<string, string | number | undefined>;
  query?: Record<string, string | number | boolean | (string | number | boolean)[] | undefined>;
  json?: unknown;
  /**
   * Explicitly allow empty-body responses only when your API intentionally returns them (e.g. 204).
   * By default, empty bodies are rejected to keep the "JSON-only on success" assumption strict.
   */
  allowEmptyBody?: boolean;
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
  const { baseUrl, fetch: fetchApi, params, query, json, allowEmptyBody, headers: customHeaders, ...fetchOptions } = options;

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

  let response: Response;
  try {
    response = await fetchFn(url, {
      ...fetchOptions,
      method,
      headers,
      body,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`Request failed before receiving a response: ${message}`);
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    const isJson = !!contentType && (contentType.includes('application/json') || contentType.includes('+json'));
    const bodyText = await response.clone().text().catch(() => '');

    const parsedBody: unknown | string | null = (() => {
      if (!bodyText) return null;
      if (isJson) {
        try {
          return JSON.parse(bodyText);
        } catch {
          return bodyText;
        }
      }
      return bodyText;
    })();

    const message = `Request failed with status ${response.status}: ${response.statusText}`;
    throw new HttpError({
      message,
      status: response.status,
      statusText: response.statusText,
      url,
      method,
      body: parsedBody,
      headers: response.headers,
    });
  }

  // 204/205 and HEAD are allowed to have no body by spec.
  // We only permit returning `undefined` when explicitly enabled to keep JSON-only behavior strict.
  if (method.toUpperCase() === 'HEAD' || response.status === 204 || response.status === 205) {
    if (allowEmptyBody) {
      return undefined as T;
    }
    throw new ResponseParseError({
      message: `Empty response body is not allowed by default (status ${response.status}).`,
      url,
      method,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      bodyText: null,
    });
  }

  try {
    const data = await response.clone().json();
    return data as T;
  } catch {
    const contentType = response.headers.get('content-type');
    const bodyText = await response.text().catch(() => '');
    const hasBody = bodyText.trim().length > 0;

    throw new ResponseParseError({
      message: hasBody
        ? `Failed to parse response as JSON (content-type: ${contentType ?? 'unknown'}).`
        : 'Failed to parse response as JSON (empty body).',
      url,
      method,
      status: response.status,
      statusText: response.statusText,
      contentType,
      bodyText: hasBody ? bodyText : null,
    });
  }
}

