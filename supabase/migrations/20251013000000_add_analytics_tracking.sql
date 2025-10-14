/*
  # Add Analytics and Tracking System

  1. New Tables
    - `site_visitors`
      - `id` (uuid, primary key)
      - `session_id` (text, unique identifier for each visit)
      - `visited_at` (timestamptz, when they visited)
      - `user_agent` (text, browser info)
      - `ip_address` (text, visitor IP)

    - `site_statistics`
      - `id` (uuid, primary key)
      - `stat_date` (date, the date of the stats)
      - `total_visitors` (integer, count of unique visitors)
      - `page_views` (integer, total page views)
      - `updated_at` (timestamptz)

  2. Changes to Existing Tables
    - Add `avatar_url` to `profiles` table for user profile photos
    - Add `bio` to `profiles` table for user bio

  3. Security
    - Enable RLS on new tables
    - Public can insert visitor records
    - Only admins can view analytics

  4. Functions
    - Function to update daily statistics
    - Function to get real-time counts
*/

-- Add new columns to profiles table for user profile editing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
END $$;

-- Create site_visitors table for tracking visits
CREATE TABLE IF NOT EXISTS site_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  visited_at timestamptz DEFAULT now(),
  user_agent text,
  ip_address text,
  user_id uuid REFERENCES profiles(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_visitors_session ON site_visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_site_visitors_date ON site_visitors(visited_at);
CREATE INDEX IF NOT EXISTS idx_site_visitors_user_id ON site_visitors(user_id);

-- Create site_statistics table for aggregated stats
CREATE TABLE IF NOT EXISTS site_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  total_visitors integer DEFAULT 0,
  page_views integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_statistics ENABLE ROW LEVEL SECURITY;

-- Policies for site_visitors
DROP POLICY IF EXISTS "Anyone can record visits" ON site_visitors;
CREATE POLICY "Anyone can record visits"
  ON site_visitors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all visitor data" ON site_visitors;
CREATE POLICY "Admins can view all visitor data"
  ON site_visitors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for site_statistics
DROP POLICY IF EXISTS "Admins can view statistics" ON site_statistics;
CREATE POLICY "Admins can view statistics"
  ON site_statistics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage statistics" ON site_statistics;
CREATE POLICY "Admins can manage statistics"
  ON site_statistics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to get real-time platform statistics
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS json AS $$
DECLARE
  stats json;
BEGIN
  SELECT json_build_object(
    'total_visitors', (
      SELECT COUNT(DISTINCT session_id)
      FROM site_visitors
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
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a page visit
CREATE OR REPLACE FUNCTION record_visit(
  p_session_id text,
  p_user_agent text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO site_visitors (session_id, user_agent, ip_address, user_id)
  VALUES (p_session_id, p_user_agent, p_ip_address, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily statistics (run this via cron job)
CREATE OR REPLACE FUNCTION update_daily_statistics()
RETURNS void AS $$
BEGIN
  INSERT INTO site_statistics (stat_date, total_visitors, page_views)
  SELECT 
    CURRENT_DATE,
    COUNT(DISTINCT session_id),
    COUNT(*)
  FROM site_visitors
  WHERE visited_at::date = CURRENT_DATE
  ON CONFLICT (stat_date)
  DO UPDATE SET
    total_visitors = EXCLUDED.total_visitors,
    page_views = EXCLUDED.page_views,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get visitor statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_visitor_statistics(days integer DEFAULT 30)
RETURNS TABLE(
  visit_date date,
  unique_visitors bigint,
  total_page_views bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sv.visited_at::date as visit_date,
    COUNT(DISTINCT sv.session_id) as unique_visitors,
    COUNT(*) as total_page_views
  FROM site_visitors sv
  WHERE sv.visited_at >= (CURRENT_DATE - (days || ' days')::interval)
  GROUP BY sv.visited_at::date
  ORDER BY sv.visited_at::date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_platform_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION record_visit(text, text, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_daily_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_visitor_statistics(integer) TO authenticated;