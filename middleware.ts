import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Protect document pages at the edge (middleware) instead of in the server layout,
// so navigating between documents no longer needs a server render round-trip.
const isProtectedRoute = createRouteMatcher(['/doc(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
