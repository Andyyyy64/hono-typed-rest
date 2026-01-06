import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api');

const routes = app
  .get('/hello', (c) => c.json({ message: 'Hello from Next.js + Hono!' }))
  .get('/post/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ id, title: `Post ${id}`, content: 'This is a typed post.' });
  });

export type AppType = typeof routes;

export const GET = handle(routes);
export const POST = handle(routes);
export const PUT = handle(routes);
export const DELETE = handle(routes);

