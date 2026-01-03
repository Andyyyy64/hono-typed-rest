/**
 * Extracts response type definitions
 */
export type ResponseBody<E> = E extends { output: infer O } ? O : never;

/**
 * Extracts only successful response (2xx) types
 */
export type SuccessResponse<E> = E extends { output: infer O }
  ? O extends { [K in `2${string}`]: infer V }
    ? V
    : never
  : never;

