/**
 * CORS configuration for edge functions
 * Restricts origins to approved domains for security
 */

const ALLOWED_ORIGINS = [
  "https://postr-genius.lovable.app",
  "https://id-preview--4a84c60f-1875-4a85-aaf4-0085811561d6.lovable.app",
  "https://postr-one.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

/**
 * Get CORS headers with origin validation
 * Returns headers with the requesting origin if it's allowed,
 * or the primary production origin as fallback
 */
export const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Credentials": "true",
  };
};

/**
 * Handle CORS preflight request
 */
export const handleCorsOptions = (origin: string | null): Response => {
  return new Response("ok", { headers: getCorsHeaders(origin) });
};
