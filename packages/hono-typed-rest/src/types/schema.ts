import type { Schema } from 'hono';
import type { HonoBase } from 'hono/hono-base';
import type { UnionToIntersection } from './utils';

/**
 * Extracts routing schema from Hono's app type (`typeof app`) or Schema type.
 * - If the extraction fails, it defaults to `never` instead of `any` to ensure type safety and catch issues at compile time.
 */
type SchemaFromHonoBase<T> = T extends HonoBase<any, infer S, any, any> ? S : never;
type SchemaFromSchemaProp<T> = T extends { schema: infer S } ? S : never;

type CandidateSchema<T> = SchemaFromHonoBase<T> | SchemaFromSchemaProp<T>;

export type ExtractSchema<T> = T extends Schema
  ? T
  : UnionToIntersection<CandidateSchema<T> extends Schema ? CandidateSchema<T> : never>;
