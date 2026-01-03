/**
 * Common definition for request options
 */
export interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  baseUrl?: string;
  params?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | (string | number | boolean)[]>;
  json?: any;
}

/**
 * Internal function for type-safe request execution
 */
export async function request<T>(
  path: string,
  method: string,
  options: RequestOptions = {}
): Promise<T> {
  const { baseUrl = '', params, query, json, headers: customHeaders, ...fetchOptions } = options;

  // Path parameter substitution
  let urlPath = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      urlPath = urlPath.replace(`:${key}`, String(value));
    });
  }

  // Query parameter construction
  const url = new URL(urlPath, baseUrl || 'http://localhost');
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers = new Headers(customHeaders);
  let body: string | undefined;

  if (json) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(json);
  }

  const response = await fetch(baseUrl ? `${baseUrl.replace(/\/$/, '')}${url.pathname}${url.search}` : url.toString(), {
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

  return response.json() as Promise<T>;
}

