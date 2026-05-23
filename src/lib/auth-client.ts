import { createAuthClient } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Try to use the public app URL if defined
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Fallback for local development if nothing else is available
  return 'http://localhost:9002';
};

export const authClient = createAuthClient(
  `${getBaseUrl()}/api/auth`,
  {
    adapter: BetterAuthReactAdapter(),
  }
);

