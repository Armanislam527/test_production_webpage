import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface VisitorData {
    session_id: string;
    user_id?: string | null;
    page_url: string;
    referrer: string;
    user_agent: string;
    ip_address?: string;
}

export function useVisitorTracking() {
    const location = useLocation();

    useEffect(() => {
        const trackVisit = async () => {
            try {
                const sessionId = sessionStorage.getItem('session_id') || uuidv4();
                sessionStorage.setItem('session_id', sessionId);

                const { data: { user } } = await supabase.auth.getUser();

                const visitorData: VisitorData = {
                    session_id: sessionId,
                    user_id: user?.id || null,
                    page_url: window.location.href,
                    referrer: document.referrer,
                    user_agent: navigator.userAgent,
                    // Note: Getting IP requires a server-side endpoint
                };

                const { error } = await supabase
                    .from('visitor_analytics')
                    .insert([visitorData]);

                if (error) {
                    console.error('Error tracking visit:', error);
                }
            } catch (error) {
                console.error('Failed to track visit:', error);
            }
        };

        trackVisit();
    }, [location.pathname]);
}