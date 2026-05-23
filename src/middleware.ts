import { auth } from '@/lib/auth';

export default auth.middleware({
  loginUrl: '/auth/sign-in',
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and auth-related paths
    '/((?!_next|auth|api/auth|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for miscellaneous API routes, but exclude api/auth
    '/(api(?!/auth)|trpc)(.*)',
  ],
};
