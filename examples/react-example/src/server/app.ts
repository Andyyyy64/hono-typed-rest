import { Hono } from 'hono';

// This is our server definition
// In a real app, this would be in your backend project
const app = new Hono()
  .get('/api/hello', (c) => c.json({ message: 'Hello from Hono!' }))
  .post('/api/echo', async (c) => {
    const body = await c.req.json<{ text: string }>();
    return c.json({ echoed: body.text });
  })
  .get('/api/user/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ id, name: `User ${id}`, email: `user${id}@example.com` });
  });

export { app };
export type AppType = typeof app;
