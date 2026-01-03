import type { Schema } from 'hono';
import type { HonoBase } from 'hono/hono-base';

/**
 * Extracts the routing schema from a Hono application type (typeof app) or Schema type.
 * Supports HonoBase and objects with a schema property.
 */
export type ExtractSchema<T> = 
  T extends { schema: infer S }
    ? S extends Schema ? S : any
    : T extends HonoBase<any, infer S, any, any>
      ? S
      : T extends Schema
        ? T
        : any;
