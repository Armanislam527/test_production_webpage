import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export async function getPlatformStats(): Promise<PlatformStats> {
  const { data, error } = await supabase.rpc('get_platform_stats');

  if (error) {
    console.error('Error fetching platform stats:', error);
    return {
      total_visitors: 0,
      total_products: 0,
      total_shops: 0,
      total_reviews: 0,
      total_users: 0,
    };
  }

  return data;
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
