-- Add bio field to profiles table if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bio text;
    END IF;
END $$;

-- Create analytics_visits table if it doesn't exist with improved structure
CREATE TABLE IF NOT EXISTS analytics_visits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    user_agent text,
    ip_address text,
    user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    visit_count integer DEFAULT 1,
    first_seen timestamptz DEFAULT now(),
    last_seen timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_visits_session ON analytics_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_user_id ON analytics_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_last_seen ON analytics_visits(last_seen);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_created_at ON analytics_visits(created_at);

-- Enable RLS on analytics_visits
ALTER TABLE analytics_visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create improved policies
DROP POLICY IF EXISTS "Allow visit recording" ON analytics_visits;

-- Policy for inserting visits (allow anonymous users)
CREATE POLICY "Anyone can record visits" ON analytics_visits
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Policy for viewing visits (admin only)
CREATE POLICY "Admins can view analytics" ON analytics_visits
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Improved function to update review helpful count with error handling
CREATE OR REPLACE FUNCTION update_review_helpful_count(review_id uuid)
RETURNS void AS $$
BEGIN
    -- Validate review exists
    IF NOT EXISTS (SELECT 1 FROM reviews WHERE id = review_id) THEN
        RAISE EXCEPTION 'Review with id % does not exist', review_id;
    END IF;

    UPDATE reviews 
    SET helpful_count = (
        SELECT COUNT(*) 
        FROM review_votes 
        WHERE review_votes.review_id = update_review_helpful_count.review_id 
        AND is_helpful = true
    ),
    updated_at = now()
    WHERE reviews.id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improved function to get platform stats with better performance
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS json AS $$
DECLARE
    stats json;
BEGIN
    SELECT json_build_object(
        'total_visitors', (
            SELECT COUNT(DISTINCT session_id) 
            FROM analytics_visits
            WHERE last_seen >= (NOW() - INTERVAL '30 days')
        ),
        'total_products', (
            SELECT COUNT(*) 
            FROM products 
            WHERE status = 'active'
        ),
        'total_shops', (
            SELECT COUNT(*) 
            FROM shops 
            WHERE status = 'approved'
        ),
        'total_reviews', (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE status = 'approved'
        ),
        'total_users', (
            SELECT COUNT(*) 
            FROM profiles
        ),
        'active_today', (
            SELECT COUNT(DISTINCT session_id)
            FROM analytics_visits
            WHERE last_seen >= (NOW() - INTERVAL '1 day')
        )
    ) INTO stats;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improved function to record visits with IP tracking and better conflict handling
CREATE OR REPLACE FUNCTION record_visit(
    p_session_id text,
    p_user_agent text DEFAULT NULL,
    p_ip_address text DEFAULT NULL,
    p_user_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO analytics_visits (session_id, user_agent, ip_address, user_id)
    VALUES (p_session_id, p_user_agent, p_ip_address, p_user_id)
    ON CONFLICT (session_id) 
    DO UPDATE SET
        last_seen = now(),
        visit_count = analytics_visits.visit_count + 1,
        user_id = COALESCE(EXCLUDED.user_id, analytics_visits.user_id),
        ip_address = COALESCE(EXCLUDED.ip_address, analytics_visits.ip_address);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Additional function: Get daily visitor statistics
CREATE OR REPLACE FUNCTION get_daily_visitor_stats(days integer DEFAULT 7)
RETURNS TABLE(
    visit_date date,
    unique_visitors bigint,
    total_visits bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as visit_date,
        COUNT(DISTINCT session_id) as unique_visitors,
        COUNT(*) as total_visits
    FROM analytics_visits
    WHERE created_at >= (CURRENT_DATE - (days || ' days')::interval)
    GROUP BY DATE(created_at)
    ORDER BY visit_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old analytics data (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_analytics(retention_days integer DEFAULT 90)
RETURNS bigint AS $$
DECLARE
    deleted_count bigint;
BEGIN
    DELETE FROM analytics_visits
    WHERE created_at < (NOW() - (retention_days || ' days')::interval);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION update_review_helpful_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION record_visit(text, text, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_daily_visitor_stats(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_analytics(integer) TO authenticated;

-- Insert default categories if they don't exist (FIXED - removed is_active column)
INSERT INTO categories (name, slug, description, icon) VALUES
    ('Smartphones', 'smartphones', 'Mobile phones and smartphones', 'Smartphone'),
    ('Laptops', 'laptops', 'Laptops and notebooks', 'Laptop'),
    ('Tablets', 'tablets', 'Tablets and iPads', 'Tablet'),
    ('PC Accessories', 'pc-accessories', 'PC peripherals and accessories', 'Cable'),
    ('Audio', 'audio', 'Headphones, speakers, and audio equipment', 'Headphones'),
    ('Wearables', 'wearables', 'Smartwatches and fitness trackers', 'Watch')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;