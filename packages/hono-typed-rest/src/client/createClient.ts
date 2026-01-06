import type { ExtractSchema } from '../types/schema';
import type { ApiPaths } from '../types/path';
import type { EndpointFor, PathsForMethod } from '../types/endpoint';
import type { SuccessResponse } from '../types/output';
import type { JsonInput, QueryInput, ParamInput } from '../types/input';
import type { Default } from '../types/utils';
import { request, RequestOptions } from './request';
import type { ClientOptions } from '../adapters/fetch';

/**
 * Defines the options for each HTTP method
 */
type QueryShape = NonNullable<RequestOptions['query']>;
type ParamsShape = NonNullable<RequestOptions['params']>;

export type MethodOptions<S, P extends ApiPaths<S>, M extends string> =
  Omit<RequestOptions, 'json' | 'query' | 'params'> &
  ([JsonInput<EndpointFor<S, P, M>>] extends [never] ? {} : { json: JsonInput<EndpointFor<S, P, M>> }) &
  ([QueryInput<EndpointFor<S, P, M>>] extends [never] ? {} : { query: QueryInput<EndpointFor<S, P, M>> & QueryShape }) &
  ([ParamInput<EndpointFor<S, P, M>>] extends [never] ? {} : { params: ParamInput<EndpointFor<S, P, M>> & ParamsShape });

/**
 * Client type definition
 */
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

type MethodCaller<S, M extends HttpMethod> = <
  P extends PathsForMethod<S, M>,
  T = Default
>(
  path: P,
  options?: MethodOptions<S, P, M>
) => Promise<T extends Default ? SuccessResponse<EndpointFor<S, P, M>> : T>;

export type TypedClient<S> = {
  get: MethodCaller<S, 'get'>;
  post: MethodCaller<S, 'post'>;
  put: MethodCaller<S, 'put'>;
  delete: MethodCaller<S, 'delete'>;
  patch: MethodCaller<S, 'patch'>;
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

  type ReturnFor<TOverride, P extends ApiPaths<S>, M extends HttpMethod> = TOverride extends Default
    ? SuccessResponse<EndpointFor<S, P, M>>
    : TOverride;

  const handler = <M extends HttpMethod>(method: M): MethodCaller<S, M> =>
    async <
      P extends PathsForMethod<S, M>,
      TOverride = Default
    >(
      path: P,
      requestOptions?: MethodOptions<S, P, M>
    ): Promise<ReturnFor<TOverride, P, M>> => {
      const resolvedOptions: RequestOptions = requestOptions ?? {};
      const { headers: requestHeaders, baseUrl: requestBaseUrl, fetch: requestFetch, ...rest } = resolvedOptions;

      const result = await request<ReturnFor<TOverride, P, M>>(path, method.toUpperCase(), {
        ...rest,
        baseUrl: requestBaseUrl ?? baseUrl,
        fetch: requestFetch ?? fetchApi,
        headers: mergeHeaders(defaultHeaders, requestHeaders),
      });

      return result;
    };

  return {
    get: handler('get'),
    post: handler('post'),
    put: handler('put'),
    delete: handler('delete'),
    patch: handler('patch'),
  };
}
