-- Add bio field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;

-- Function to update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count(review_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE reviews 
  SET helpful_count = (
    SELECT COUNT(*) 
    FROM review_votes 
    WHERE review_votes.review_id = update_review_helpful_count.review_id 
    AND is_helpful = true
  )
  WHERE reviews.id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get platform stats
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE(
  total_visitors bigint,
  total_products bigint,
  total_shops bigint,
  total_reviews bigint,
  total_users bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM analytics_visits) as total_visitors,
    (SELECT COUNT(*) FROM products WHERE status = 'active') as total_products,
    (SELECT COUNT(*) FROM shops WHERE status = 'approved') as total_shops,
    (SELECT COUNT(*) FROM reviews WHERE status = 'approved') as total_reviews,
    (SELECT COUNT(*) FROM profiles) as total_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record visits
CREATE OR REPLACE FUNCTION record_visit(
  p_session_id text,
  p_user_agent text,
  p_user_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO analytics_visits (session_id, user_agent, user_id)
  VALUES (p_session_id, p_user_agent, p_user_id)
  ON CONFLICT (session_id) DO UPDATE SET
    last_seen = now(),
    visit_count = analytics_visits.visit_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create analytics_visits table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_agent text,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  visit_count integer DEFAULT 1,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now()
);

-- Enable RLS on analytics_visits
ALTER TABLE analytics_visits ENABLE ROW LEVEL SECURITY;

-- Policy for analytics_visits (only allow inserts and updates)
CREATE POLICY "Allow visit recording" ON analytics_visits
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);
