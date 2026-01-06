import type { ApiPaths } from './path';

/**
 * Gets the schema method keys available for a specific path (e.g. `$get` or `get`)
 */
export type SchemaMethodKeysForPath<S, P extends ApiPaths<S>> =
  S[P] extends Record<string, unknown> ? keyof S[P] & string : never;

/**
 * Gets the HTTP methods available for a specific path (e.g. `get`)
 * Supports both prefixed ($get) and non-prefixed (get) schema keys.
 * Hono's Schema uses keys with '$', so we strip it for the client side.
 */
export type MethodsForPath<S, P extends ApiPaths<S>> =
  SchemaMethodKeysForPath<S, P> extends infer K
  ? K extends string
  ? K extends `$${infer M}` ? Lowercase<M> : Lowercase<K>
  : never
  : never;

/**
 * Helper to generate the internal method key for a given HTTP method
 */
type MethodKey<M extends string> = `$${Lowercase<M>}`;

/**
 * Gets the endpoint definition for a specific path and method
 */
export type EndpointFor<S, P extends ApiPaths<S>, M extends string> =
  S[P] extends Record<string, unknown>
  ? MethodKey<M> extends keyof S[P]
  ? S[P][MethodKey<M>]
  : Lowercase<M> extends keyof S[P]
  ? S[P][Lowercase<M>]
  : never
  : never;

/**
 * Extracts paths that support a specific method
 */
export type PathsForMethod<S, M extends string> = ApiPaths<S> extends infer P
  ? P extends ApiPaths<S>
  ? M extends MethodsForPath<S, P>
  ? P
  : never
  : never
  : never;
