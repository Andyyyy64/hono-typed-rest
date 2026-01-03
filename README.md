# hono-typed-rest

A library for building type-safe REST clients from Hono's application types (`AppType`).
It provides tRPC-like type safety and completion while maintaining the familiar `api.get("/path")` REST style, rather than RPC-style calls.

## Features

- **No RPC Notation**: Use `client.get("/api/user")` instead of `client.api.user.$get()`.
- **No Code Generation**: Directly references server-side type definitions, so no build step or generated files are required.
- **Auto Inference**: Response types and request parameters (JSON, Query, Params) are automatically inferred based on the path.
- **Path Completion**: Available server-side paths are automatically completed in your editor.

### What it cannot do
- **Shared Types Required**: You must be able to import `AppType` in your frontend. This works best in monorepos or with shared contract packages.
- **JSON Only**: Currently optimized for JSON APIs. Non-JSON responses may require manual type casting.
- **Success-Focused**: Automatically extracts 2xx success responses. Error response structures (4xx, 5xx) are currently handled via generic error objects.
- **Runtime Validation**: This is a type-level wrapper for `fetch`. It does not perform runtime validation of the data received from the server.

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
  .get('/hello', (c) => c.json({ message: 'Hello' }))
  .post('/user', (c) => c.json({ id: 1 }))

export type AppType = typeof app
```

### 2. Use the Client in your Frontend

```typescript
import { createRestClient } from 'hono-typed-rest'
import type { AppType } from './server'

const client = createRestClient<AppType>({ baseUrl: 'https://api.example.com' })

// Path is auto-completed, and 'res' is automatically typed as { message: string }
const res = await client.get('/hello')

// POST requests are also type-safe
const user = await client.post('/user', {
  json: { name: 'hono' } // Type-safe if schema is defined
})
```

## TODO

- [ ] Reduce `any` fallbacks in type extraction (`ExtractSchema`) so breaking changes don’t silently erase type safety.
- [ ] Make missing routes/methods fail with `never` (not `any`) to avoid “it compiles but is wrong”.
- [ ] Clarify and harden `SuccessResponse` inference for both Hono-style schema and OpenAPI-style `{ '200': T }` output maps.
- [ ] Improve non-JSON handling (e.g. `204 No Content`, `text`, `blob`, streaming) or document a safe escape hatch.
- [ ] Improve error body parsing when the server returns non-JSON (text/html, plain text, empty body).
- [ ] Cover more path-param patterns (optional params, patterns like `:id{\\d+}`) in runtime substitution.
- [ ] Support additional methods (e.g. `head`, `options`) for parity with common Hono usage.
- [ ] Improve adapter story (custom fetch, default headers, dynamic headers) with clear precedence rules.
- [ ] Add tests (especially type-level tests) and CI to catch regressions when Hono types change.
- [ ] Add/expand documentation for compatibility, limitations, and real-world usage patterns (monorepo, contract package, SSR/CSR).
