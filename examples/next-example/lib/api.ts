import { createRestClient } from 'hono-typed-rest';
import type { AppType } from '@/app/api/[[...route]]/route';

// For Next.js, we can use an absolute URL or relative if on client-side
// Here we use a helper to get the base URL
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR on Vercel
  return 'http://localhost:3000'; // dev SSR
};

export const api = createRestClient<AppType>({
  baseUrl: getBaseUrl(),
});

