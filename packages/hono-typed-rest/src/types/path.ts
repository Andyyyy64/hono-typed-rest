/**
 * Normalizes path strings, removing trailing slashes or handling base paths
 */
export type NormalizePath<P extends string> = P extends `${infer Head}/`
  ? Head extends ""
    ? "/"
    : Head
  : P extends ""
  ? "/"
  : P;

/**
 * Gets all available paths from the schema
 */
export type ApiPaths<S> = keyof S & string;

