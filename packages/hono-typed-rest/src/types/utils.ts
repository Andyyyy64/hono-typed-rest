/**
 * Utility type to allow string literals with completion
 */
export type LiteralUnion<T extends string> = T | (string & {});

/**
 * Utility type to check if a type is empty
 */
export type IsEmpty<T> = keyof T extends never ? true : false;

/**
 * Marker type representing a default value
 */
export type Default = '__DEFAULT__';
