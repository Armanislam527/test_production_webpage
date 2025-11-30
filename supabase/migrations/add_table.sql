-- 1. Visitor tracking table
CREATE TABLE IF NOT EXISTS public.visitor_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    page_url TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Function to record visits
CREATE OR REPLACE FUNCTION public.record_visit(
    p_session_id TEXT,
    p_user_id UUID DEFAULT NULL,
    p_page_url TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.visitor_analytics (
        session_id,
        user_id,
        page_url,
        referrer,
        user_agent,
        ip_address
    ) VALUES (
        p_session_id,
        p_user_id,
        COALESCE(p_page_url, current_setting('app.current_page', true)),
        p_referrer,
        p_user_agent,
        p_ip_address
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RLS Policies
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for admin users"
    ON public.visitor_analytics
    FOR SELECT
    TO authenticated
    USING (auth.role() = 'authenticated' AND auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));