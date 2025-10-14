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
DO $$
BEGIN
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

CREATE INDEX IF NOT EXISTS idx_site_visitors_session ON site_visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_site_visitors_date ON site_visitors(visited_at);

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
CREATE POLICY IF NOT EXISTS "Anyone can record visits"
  ON site_visitors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admins can view all visitor data"
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
CREATE POLICY IF NOT EXISTS "Admins can view statistics"
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

CREATE POLICY IF NOT EXISTS "Admins can manage statistics"
  ON site_statistics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
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
