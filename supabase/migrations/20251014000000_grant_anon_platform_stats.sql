-- Grant anonymous users permission to execute the get_platform_stats RPC
-- This allows the public homepage to fetch platform statistics without requiring auth.

GRANT EXECUTE ON FUNCTION get_platform_stats() TO anon;

-- Ensure record_visit is available to anon as well (no-op if already granted)
GRANT EXECUTE ON FUNCTION record_visit(text, text, text, uuid) TO anon;

-- Note: if your Supabase project uses a different function signature for record_visit
-- adjust the above accordingly. This migration is additive and safe to run multiple times.
