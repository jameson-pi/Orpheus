import { createNeonAuth } from '@neondatabase/neon-js/auth/next/server';

// Normalize the URL for testing
const neonAuthUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL!;
console.log(`[Auth Init] Normalized Base URL: ${neonAuthUrl}`);

export const auth = createNeonAuth({
  baseUrl: neonAuthUrl,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
