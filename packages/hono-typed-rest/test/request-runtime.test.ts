import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request } from '../src/client/request';
import { HttpError, ResponseParseError } from '../src/client/errors';

describe('request (runtime)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should include parsed JSON error body when server returns application/json', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response(JSON.stringify({ error: 'bad' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
      });
    });

    await expect(
      request('/x', 'GET', { baseUrl: 'http://example.com' })
    ).rejects.toMatchObject({
      name: 'HttpError',
      status: 400,
      statusText: 'Bad Request',
      body: { error: 'bad' },
    } satisfies Partial<HttpError>);
  });

  it('should include text error body when server returns non-JSON', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response('<html>ng</html>', {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    });

    await expect(
      request('/x', 'GET', { baseUrl: 'http://example.com' })
    ).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
      body: '<html>ng</html>',
    } satisfies Partial<HttpError>);
  });

  it('should throw ResponseParseError when JSON parsing fails on success response', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response('not-json', {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      });
    });

    await expect(
      request('/x', 'GET', { baseUrl: 'http://example.com' })
    ).rejects.toMatchObject({
      name: 'ResponseParseError',
      status: 200,
      bodyText: 'not-json',
    } satisfies Partial<ResponseParseError>);
  });

  it('should reject 204 by default to keep JSON-only assumption explicit', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response(null, {
        status: 204,
        statusText: 'No Content',
      });
    });

    await expect(
      request('/x', 'GET', { baseUrl: 'http://example.com' })
    ).rejects.toMatchObject({
      name: 'ResponseParseError',
      status: 204,
    } satisfies Partial<ResponseParseError>);
  });

  it('should allow 204 when allowEmptyBody is true', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response(null, {
        status: 204,
        statusText: 'No Content',
      });
    });

    const res = await request<undefined>('/x', 'GET', {
      baseUrl: 'http://example.com',
      allowEmptyBody: true,
    });
    expect(res).toBeUndefined();
  });

  it('should handle synchronous Response (like Hono app.request)', async () => {
    // Mock fetch to return Response directly, not wrapped in Promise
    const syncFetch = vi.fn().mockReturnValue(
      new Response(JSON.stringify({ sync: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const res = await request<{ sync: boolean }>('/x', 'GET', {
      baseUrl: 'http://example.com',
      fetch: syncFetch as any,
    });

    expect(res).toEqual({ sync: true });
    expect(syncFetch).toHaveBeenCalled();
  });
});


