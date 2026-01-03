/**
 * Utility type to allow string literals with completion
 */
export type LiteralUnion<T extends string> = T | (string & {});

/**
 * Utility type to check if a type is empty
 */
export type IsEmpty<T> = keyof T extends never ? true : false;

/**
 * Utility to convert a Union type to an Intersection type
 * Used to stabilize type inference when Hono's Schema composition results in a union.
 */
export type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (
  arg: infer I
) => void
  ? I
  : never;

/**
 * Marker type representing a default value
 */
export type Default = '__DEFAULT__';
