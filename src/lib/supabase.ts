import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Do not throw during module initialization on missing env in prod builds.
// Instead, log a clear error and create a no-op client that will cause RPCs/queries
// to fail gracefully and be handled by the caller's error handling/UI states.
let client;
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting environment.'
  );
  // Create a client with obvious invalid values; network calls will fail but the app will render.
  client = createClient('https://invalid.supabase.co', 'invalid-anon-key');
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'user' | 'shop_owner' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  description: string | null;
  specifications: Record<string, any>;
  images: string[];
  release_date: string | null;
  price: number | null;
  status: 'active' | 'discontinued' | 'upcoming';
  created_at: string;
  updated_at: string;
};

export type Shop = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  helpful_count: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type ShopProduct = {
  id: string;
  shop_id: string;
  product_id: string;
  price: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order';
  stock_quantity: number | null;
  last_updated: string;
  created_at: string;
};

export type PlatformStats = {
  total_visitors: number;
  total_products: number;
  total_shops: number;
  total_reviews: number;
  total_users: number;
};

// Simple in-memory cache for platform stats to avoid frequent RPCs and flashes
let cachedStats: { value: PlatformStats; at: number } | null = null;
const CACHE_TTL_MS = 15_000; // 15s

export async function getPlatformStats(): Promise<PlatformStats> {
  const now = Date.now();
  if (cachedStats && now - cachedStats.at < CACHE_TTL_MS) {
    return cachedStats.value;
  }

  const { data, error } = await supabase.rpc('get_platform_stats');

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error('Error fetching platform stats:', error);
    const fallback = {
      total_visitors: 0,
      total_products: 0,
      total_shops: 0,
      total_reviews: 0,
      total_users: 0,
    };
    cachedStats = { value: fallback, at: now };
    return fallback;
  }

  cachedStats = { value: data as PlatformStats, at: now };
  return data as PlatformStats;
}

export async function recordVisit(sessionId: string, userId?: string) {
  try {
    await supabase.rpc('record_visit', {
      p_session_id: sessionId,
      p_user_agent: navigator.userAgent,
      p_user_id: userId || null,
    });
  } catch (error) {
    console.error('Error recording visit:', error);
  }
}

export async function voteReview(reviewId: string, isHelpful: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to vote');

  const { error } = await supabase
    .from('review_votes')
    .upsert({
      review_id: reviewId,
      user_id: user.id,
      is_helpful: isHelpful,
    });

  if (error) throw error;

  // Update the helpful count
  const { error: updateError } = await supabase.rpc('update_review_helpful_count', {
    review_id: reviewId,
  });

  if (updateError) throw updateError;
}

export async function getUserVote(reviewId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('review_votes')
    .select('is_helpful')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data?.is_helpful || null;
}
