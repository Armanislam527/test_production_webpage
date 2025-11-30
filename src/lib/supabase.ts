import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Realtime subscriptions
export const subscribeToVisitors = (callback: (count: number) => void) => {
  return supabase
    .channel('visitor_count')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'visitor_analytics' },
      (payload) => {
        supabase
          .from('visitor_analytics')
          .select('*', { count: 'exact', head: true })
          .then(({ count }) => {
            if (count !== null) callback(count);
          });
      }
    )
    .subscribe();
};

// Database Types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'user' | 'shop_owner' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  brand: string;
  category_id: string;
  model: string | null;
  rating: number | null;
  specifications: Record<string, any> | null;
  release_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  is_verified: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ShopProduct {
  id: string;
  shop_id: string;
  product_id: string;
  price: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order';
  stock_quantity: number | null;
  sku: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  shop?: Shop;
}

// Helper functions
export const uploadImage = async (file: File, path: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase
    .storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const deleteImage = async (url: string) => {
  const path = url.split('/').pop();
  if (!path) return;

  const { error } = await supabase
    .storage
    .from('product-images')
    .remove([path]);

  if (error) throw error;
};

// Auth functions
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string, userData: Partial<Profile>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userData.full_name,
        role: 'user',
      },
    },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const updateUserProfile = async (updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', updates.id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Product functions
export const fetchProducts = async (filters = {}) => {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      query = query.eq(key, value);
    }
  });

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
};

export const fetchProductBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
};

// Review functions
export const fetchProductReviews = async (productId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createReview = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'user'>) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Shop functions
export const fetchShops = async () => {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
};

export const fetchShopProducts = async (productId: string) => {
  const { data, error } = await supabase
    .from('shop_products')
    .select('*, shops(*)')
    .eq('product_id', productId);
  if (error) throw error;
  return data;
};

// Search function
export const searchProducts = async (query: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .textSearch('name_description', query, {
      type: 'websearch',
      config: 'english',
    });
  if (error) throw error;
  return data;
};