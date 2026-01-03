import type { Hono, Schema } from 'hono';

/**
 * Extracts schema definitions from Hono application types
 */
export type ExtractSchema<T> = T extends Hono<any, infer S, any> ? S : T extends Schema ? T : never;

