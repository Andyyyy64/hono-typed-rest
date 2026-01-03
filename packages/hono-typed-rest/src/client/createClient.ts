import type { ExtractSchema } from '../types/schema';
import type { ApiPaths } from '../types/path';
import type { MethodsForPath, EndpointFor, PathsForMethod } from '../types/endpoint';
import type { SuccessResponse } from '../types/output';
import type { JsonInput, QueryInput, ParamInput } from '../types/input';
import { request, RequestOptions } from './request';

/**
 * Client type definition
 * For each method, only paths that support that method are accepted
 */
export type TypedClient<S> = {
  [M in 'get' | 'post' | 'put' | 'delete' | 'patch']: <P extends PathsForMethod<S, M>>(
    path: P,
    options?: Omit<RequestOptions, 'json' | 'query' | 'params'> & 
      (JsonInput<EndpointFor<S, P, M>> extends never ? {} : { json: JsonInput<EndpointFor<S, P, M>> }) &
      (QueryInput<EndpointFor<S, P, M>> extends never ? {} : { query: QueryInput<EndpointFor<S, P, M>> }) &
      (ParamInput<EndpointFor<S, P, M>> extends never ? {} : { params: ParamInput<EndpointFor<S, P, M>> })
  ) => Promise<SuccessResponse<EndpointFor<S, P, M>>>;
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
