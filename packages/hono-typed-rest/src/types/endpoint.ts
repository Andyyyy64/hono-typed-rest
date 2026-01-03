import type { ApiPaths, NormalizePath } from './path';

/**
 * Gets the HTTP methods available for a specific path
 */
export type MethodsForPath<S, P extends ApiPaths<S>> = keyof S[P] & string;

/**
 * Gets the endpoint definition for a specific path and method
 */
export type EndpointFor<S, P extends ApiPaths<S>, M extends string> = M extends MethodsForPath<S, P> 
  ? S[P][M] 
  : never;

/**
 * Extracts paths that support a specific method
 */
export type PathsForMethod<S, M extends string> = {
  [P in ApiPaths<S>]: M extends MethodsForPath<S, P> ? P : never;
}[ApiPaths<S>];
