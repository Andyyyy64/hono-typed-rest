import { createRestClient } from 'hono-typed-rest';
import type { AppType } from './server/app';

// Create a typed client by passing AppType
// This client will have full auto-completion and type inference
export const api = createRestClient<AppType>({
  baseUrl: 'http://localhost:3000', // Change to your actual API URL
});

