/**
 * Response body extraction
 */
export type ResponseBody<E> = E extends { output: infer O } ? O : never;

/**
 * Extracts only success responses (2xx)
 * Supports both standard Hono schema and OpenAPI-style mapped schema
 */
export type SuccessResponse<E> = E extends { output: infer O }
  ? O extends Record<string, unknown>
  ? { [K in keyof O]: K extends `2${string}` ? O[K] : never }[keyof O] extends infer V
  ? [V] extends [never]
  ? O // Fallback to O itself (standard Hono case: output is the data)
  : V
  : O
  : O
  : E extends { status: infer S; output: infer O } // Fallback for some other Hono schema variants
  ? `${S & number}` extends `2${string}`
  ? O
  : never
  : never;
