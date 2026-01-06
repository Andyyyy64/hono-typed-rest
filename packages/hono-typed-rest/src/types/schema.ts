import type { Env, Schema } from 'hono';
import type { HonoBase } from 'hono/hono-base';
import type { UnionToIntersection } from './utils';

/**
 * Extracts the routing schema from Hono's app type (`typeof app`) or a Schema type.
 * - If extraction fails, it defaults to `never` (not `any`) so type safety doesn't silently disappear.
 */
type SchemaFromHonoBase<T> = T extends HonoBase<Env, infer S, string, string> ? S : never;
type SchemaFromSchemaProp<T> = T extends { schema: infer S } ? S : never;

type CandidateSchema<T> = SchemaFromHonoBase<T> | SchemaFromSchemaProp<T>;

export type ExtractSchema<T> = T extends Schema
  ? T
  : UnionToIntersection<CandidateSchema<T> extends Schema ? CandidateSchema<T> : never>;
