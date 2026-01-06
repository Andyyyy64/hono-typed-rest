# hono-typed-rest

“I love Hono’s type inference, but I don’t want RPC-style client notation.”

This library gives you `api.get('/path')` with path completion and inferred input/output types from Hono's `AppType`. It’s not a replacement for `hc`; it’s a REST-style wrapper that consumes the same `AppType` contract.

![Completion Example](./examples/images/example.png)
![Type Inference Example](./examples/images/example2.png)

## Features

- **No RPC Notation**: Use `client.get("/api/user")` instead of `client.api.user.$get()`.
- **No Code Generation**: Directly references server-side type definitions, so no build step or generated files are required.
- **Auto Inference**: Response types and request parameters (JSON, Query, Params) are automatically inferred based on the path.
- **Path Completion**: Available server-side paths are automatically completed in your editor.

### What it cannot do
- **Shared Types Required**: You must be able to import `AppType` in your frontend. This works best in monorepos or with shared contract packages.
- **JSON Only**: Currently optimized for JSON APIs. Non-JSON responses may require manual type casting.
- **Success-Focused**: Automatically extracts 2xx success responses. Non-2xx errors throw `HttpError` with parsed JSON (or raw text) attached.
- **Runtime Validation**: This is a type-level wrapper for `fetch`. It does not perform runtime validation of the data received from the server.

## Production Notes

- **Assumption**: Success responses are expected to be JSON. If JSON parsing fails (or the body is unexpectedly empty), the client throws `ResponseParseError` to make the mismatch explicit.
- **204 / Empty Body**: By default, empty-body responses are rejected to keep the JSON-only assumption strict. If you intentionally use `204 No Content`, set `allowEmptyBody: true` per request.

## Installation

```bash
npm install hono-typed-rest
```

## Usage

### 1. Export the AppType on the Server

```typescript
// server.ts
import { Hono } from 'hono'

const app = new Hono()
  .get('/hello', (c) => {
    return c.json({ message: 'Hello' })
  })
  .get('/post/:id', (c) => {
    const id = c.req.param('id')
    return c.json({ id, title: `Post ${id}` })
  })
  .post('/echo', async (c) => {
    const body = await c.req.json()
    return c.json({ echoed: body })
  })

export type AppType = typeof app
```

### 2. Use the Client in your Frontend

```typescript
import { createRestClient, HttpError } from 'hono-typed-rest'
import type { AppType } from './server'

const client = createRestClient<AppType>({ baseUrl: 'https://api.example.com' })

async function demo() {
  try {
    // 1. Basic GET
    // 'res' is automatically inferred as { message: string }
    const res = await client.get('/hello')

    // 2. Path Parameters
    // Path is auto-completed, and 'post' is inferred as { id: string, title: string }
    const post = await client.get('/post/:id', {
      params: { id: '123' }
    })

    // 3. POST Request
    const reply = await client.post('/echo', {
      json: { text: 'hello' }
    })
  } catch (error) {
    if (error instanceof HttpError) {
      // Handle non-2xx errors
      console.log(error.status) // e.g. 401
      console.log(error.body)   // Parsed JSON error or raw text
    }
  }
}
```

### 3. Advanced Usage (OpenAPI & 204)

`hono-typed-rest` works perfectly with `@hono/zod-openapi`. It automatically extracts the `200` (or 2xx) response schema even if your route defines multiple response types (e.g., 401, 404).

If your API intentionally returns an empty body (like `204 No Content`), use the `allowEmptyBody` option:

```typescript
const res = await client.delete('/post/:id', {
  params: { id: '123' },
  allowEmptyBody: true // Required for 204/205 responses
})
```

## TODO

- [x] Reduce `any` fallbacks in type extraction (`ExtractSchema`) so breaking changes don’t silently erase type safety.
- [x] Make missing routes/methods fail with `never` (not `any`) to avoid “it compiles but is wrong”.
- [x] Clarify and harden `SuccessResponse` inference for both Hono-style schema and OpenAPI-style `{ '200': T }` output maps.
- [ ] Improve non-JSON handling (e.g. `text`, `blob`, streaming) or document a safe escape hatch.
- [x] Improve error body parsing when the server returns non-JSON (text/html, plain text, empty body).
- [ ] Cover more path-param patterns (optional params, patterns like `:id{\\d+}`) in runtime substitution.
- [ ] Support additional methods (e.g. `head`, `options`) for parity with common Hono usage.
- [ ] Improve adapter story (custom fetch, default headers, dynamic headers) with clear precedence rules.
- [x] Add tests (especially type-level tests) and CI to catch regressions when Hono types change.
- [ ] Add/expand documentation for compatibility, limitations, and real-world usage patterns (monorepo, contract package, SSR/CSR).
