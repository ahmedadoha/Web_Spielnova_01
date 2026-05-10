import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase admin client.
 *
 * Uses the SERVICE ROLE key which bypasses Row Level Security entirely.
 * This is intentional — these server-side API routes are the authoritative
 * source of truth and must not be blocked by RLS.
 *
 * ⚠️  NEVER import this file in:
 *   - Client components ("use client")
 *   - Pages that render on the client
 *   - Any file that could be bundled into the browser
 *
 * Only import from: app/api/** route handlers and lib/availability.ts
 */
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)
