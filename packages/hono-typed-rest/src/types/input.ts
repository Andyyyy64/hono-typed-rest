/**
 * Extracts request inputs (JSON, Query, Param, etc.)
 */
export type InputFor<E> = E extends { input: infer I } ? I : never;

/**
 * Extracts the type of the JSON request body
 */
export type JsonInput<E> = InputFor<E> extends { json: infer J } ? J : never;

/**
 * Extracts the type of query parameters
 */
export type QueryInput<E> = InputFor<E> extends { query: infer Q } ? Q : never;

/**
 * Extracts the type of path parameters
 */
export type ParamInput<E> = InputFor<E> extends { param: infer P } ? P : never;

