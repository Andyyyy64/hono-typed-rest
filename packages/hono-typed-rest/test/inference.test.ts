import { describe, it, expectTypeOf, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createRestClient } from '../src';

describe('Type Inference', () => {
  beforeEach(() => {
    // Mock global fetch to prevent tests from failing due to network errors
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
  });

  it('should infer basic routes and response types', async () => {
    const app = new Hono()
      .get('/hello', (c) => c.json({ message: 'hello' as const }))
      .post('/echo', (c) => c.json({ ok: true as const }));

    type AppType = typeof app;
    const client = createRestClient<AppType>({ baseUrl: 'http://localhost' });

    // Inference for GET /hello
    const getRes = await client.get('/hello');
    expectTypeOf(getRes).toEqualTypeOf<{ message: 'hello' }>();
    
    // Inference for POST /echo
    const postRes = await client.post('/echo');
    expectTypeOf(postRes).toEqualTypeOf<{ ok: true }>();
  });

  it('should infer path parameters', async () => {
    const app = new Hono()
      .get('/post/:id', (c) => {
        const id = c.req.param('id');
        return c.json({ id, title: 'test' as const });
      });

    type AppType = typeof app;
    const client = createRestClient<AppType>({ baseUrl: 'http://localhost' });

    // Verify inference for routes requiring path parameters
    const res = await client.get('/post/:id', {
      params: { id: '123' }
    });
    expectTypeOf(res).toEqualTypeOf<{ id: string; title: 'test' }>();
  });
});

