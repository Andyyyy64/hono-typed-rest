import { api } from '@/lib/api';

export default async function Home() {
  // SSR with typed client!
  // 'data' is automatically inferred as { message: string }
  const data = await api.get('/api/hello');
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Next.js Example</h1>
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Message from API: <code className="font-bold">{data.message}</code>
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Server-Side Fetching</h2>
        <PostItem id="1" />
        <PostItem id="2" />
      </div>
    </main>
  );
}

async function PostItem({ id }: { id: string }) {
  // Another server-side fetch with path params
  const post = await api.get('/api/post/:id', {
    params: { id }
  });

  return (
    <div className="p-4 border rounded shadow mb-2 bg-white dark:bg-gray-800">
      <h3 className="font-bold">{post.title}</h3>
      <p>{post.content}</p>
    </div>
  );
}

