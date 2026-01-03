/**
 * Type for both string literals and their completion
 */
export type LiteralUnion<T extends string> = T | (string & {});

/**
 * Utility to check if a type definition exists
 */
export type IsEmpty<T> = keyof T extends never ? true : false;

