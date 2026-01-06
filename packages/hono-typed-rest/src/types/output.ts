/**
 * Response body extraction
 */
export type ResponseBody<E> = E extends { output: infer O } ? O : never;

/**
 * Extracts only success responses (2xx)
 * Supports both standard Hono schema and OpenAPI-style mapped schema
 */
type SuccessByStatus<E> = E extends { status: infer S; output: infer O }
  ? `${S & number}` extends `2${string}`
    ? O
    : never
  : never;

type SuccessByOutputMap<E> = E extends { output: infer O }
  ? O extends Record<string, unknown>
    ? { [K in keyof O]: K extends `2${string}` ? O[K] : never }[keyof O] extends infer V
      ? [V] extends [never]
        ? O // Standard Hono case: output is the body type itself
        : V
      : O
    : O
  : never;

export type SuccessResponse<E> =
  // Prefer explicit status-based filtering when available (common in OpenAPIHono schemas).
  [SuccessByStatus<E>] extends [never] ? SuccessByOutputMap<E> : SuccessByStatus<E>;
