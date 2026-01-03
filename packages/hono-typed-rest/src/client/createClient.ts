import type { ExtractSchema } from '../types/schema';
import type { ApiPaths } from '../types/path';
import type { EndpointFor, PathsForMethod } from '../types/endpoint';
import type { SuccessResponse } from '../types/output';
import type { JsonInput, QueryInput, ParamInput } from '../types/input';
import type { Default, LiteralUnion } from '../types/utils';
import { request, RequestOptions } from './request';
import type { ClientOptions } from '../adapters/fetch';

/**
 * Defines the options for each HTTP method
 */
export type MethodOptions<S, P extends string, M extends string> = 
  P extends ApiPaths<S>
    ? Omit<RequestOptions, 'json' | 'query' | 'params'> & 
      ([JsonInput<EndpointFor<S, P, M>>] extends [never] ? { json?: any } : { json: JsonInput<EndpointFor<S, P, M>> }) &
      ([QueryInput<EndpointFor<S, P, M>>] extends [never] ? { query?: any } : { query: QueryInput<EndpointFor<S, P, M>> }) &
      ([ParamInput<EndpointFor<S, P, M>>] extends [never] ? { params?: any } : { params: ParamInput<EndpointFor<S, P, M>> })
    : RequestOptions;

/**
 * Client type definition
 */
export type TypedClient<S> = {
  [M in 'get' | 'post' | 'put' | 'delete' | 'patch']: <
    T = Default,
    P extends LiteralUnion<PathsForMethod<S, M>> = LiteralUnion<PathsForMethod<S, M>>
  >(
    path: P,
    options?: MethodOptions<S, P extends ApiPaths<S> ? P : never, M>
  ) => Promise<
    T extends Default 
      ? P extends ApiPaths<S> 
        ? SuccessResponse<EndpointFor<S, P, M>> 
        : any
      : T
  >;
};

const mergeHeaders = (
  base: ClientOptions['headers'] | undefined,
  override: RequestOptions['headers'] | undefined
): Headers | undefined => {
  if (!base && !override) return undefined;
  const headers = new Headers(base);
  new Headers(override).forEach((value, key) => headers.set(key, value));
  return headers;
};

/**
 * Creates a type-safe REST client
 */
export function createRestClient<T>(options: ClientOptions = {}): TypedClient<ExtractSchema<T>> {
  type S = ExtractSchema<T>;
  const { baseUrl, fetch: fetchApi, headers: defaultHeaders } = options;

  const handler = <M extends keyof TypedClient<S> & string>(method: M) => {
    return async <
      TOverride = Default,
      P extends LiteralUnion<PathsForMethod<S, M>> = LiteralUnion<PathsForMethod<S, M>>
    >(
      path: P,
      requestOptions?: MethodOptions<S, P extends ApiPaths<S> ? P : never, M>
    ): Promise<
      TOverride extends Default
        ? P extends ApiPaths<S>
          ? SuccessResponse<EndpointFor<S, P, M>>
          : any
        : TOverride
    > => {
      const resolvedOptions: RequestOptions = requestOptions ?? ({} as any);
      const { headers: requestHeaders, baseUrl: requestBaseUrl, fetch: requestFetch, ...rest } = resolvedOptions;

      const result = await request<any>(path, method.toUpperCase(), {
        ...rest,
        baseUrl: requestBaseUrl ?? baseUrl,
        fetch: requestFetch ?? fetchApi,
        headers: mergeHeaders(defaultHeaders, requestHeaders),
      });

      return result;
    };
  };

  return {
    get: handler('get'),
    post: handler('post'),
    put: handler('put'),
    delete: handler('delete'),
    patch: handler('patch'),
  } as any;
}
