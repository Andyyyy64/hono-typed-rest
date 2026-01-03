import type { ExtractSchema } from '../types/schema';
import type { ApiPaths } from '../types/path';
import type { MethodsForPath, EndpointFor, PathsForMethod } from '../types/endpoint';
import type { SuccessResponse } from '../types/output';
import type { JsonInput, QueryInput, ParamInput } from '../types/input';
import type { Default, LiteralUnion } from '../types/utils';
import { request, RequestOptions } from './request';

/**
 * Defines the options for each HTTP method
 */
export type MethodOptions<S, P extends string, M extends string> = 
  P extends ApiPaths<S>
    ? Omit<RequestOptions, 'json' | 'query' | 'params'> & 
      (JsonInput<EndpointFor<S, P, M>> extends never ? {} : { json: JsonInput<EndpointFor<S, P, M>> }) &
      (QueryInput<EndpointFor<S, P, M>> extends never ? {} : { query: QueryInput<EndpointFor<S, P, M>> }) &
      (ParamInput<EndpointFor<S, P, M>> extends never ? {} : { params: ParamInput<EndpointFor<S, P, M>> })
    : RequestOptions;

/**
 * Client type definition
 * For each method, it only accepts paths that support that method
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

/**
 * Creates a type-safe REST client
 */
export function createRestClient<T>(options: { baseUrl?: string } = {}): TypedClient<ExtractSchema<T>> {
  const { baseUrl } = options;

  const handler = (method: string) => {
    return (path: string, requestOptions: RequestOptions = {}) => {
      return request(path, method.toUpperCase(), {
        ...requestOptions,
        baseUrl,
      });
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
