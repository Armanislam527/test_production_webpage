/*
  # Electronics Product Platform - Core Schema

  ## Overview
  This migration creates the foundation for an electronics product information platform
  where users can browse products, leave reviews, and shops can register to sell products.

  ## New Tables

  ### 1. `profiles`
  User profile information linked to Supabase auth.users
  - `id` (uuid, primary key) - links to auth.users
  - `email` (text) - user email
  - `full_name` (text) - user's full name
  - `avatar_url` (text, nullable) - profile picture URL
  - `role` (text) - user role: 'user', 'shop_owner', 'admin'
  - `created_at` (timestamptz) - account creation timestamp
  - `updated_at` (timestamptz) - last update timestamp

  ### 2. `categories`
  Product categories (smartphones, bikes, vehicles, accessories, etc.)
  - `id` (uuid, primary key)
  - `name` (text, unique) - category name
  - `slug` (text, unique) - URL-friendly name
  - `description` (text, nullable) - category description
  - `icon` (text, nullable) - icon name for UI
  - `created_at` (timestamptz)

  ### 3. `products`
  Main product information table
  - `id` (uuid, primary key)
  - `category_id` (uuid, foreign key) - links to categories
  - `name` (text) - product name
  - `slug` (text, unique) - URL-friendly name
  - `brand` (text) - manufacturer/brand name
  - `model` (text) - model number/name
  - `description` (text) - product description
  - `specifications` (jsonb) - flexible spec storage
  - `images` (jsonb) - array of image URLs
  - `release_date` (date, nullable) - product release date
  - `price` (decimal, nullable) - base price
  - `status` (text) - 'active', 'discontinued', 'upcoming'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `shops`
  Registered shops that can sell products
  - `id` (uuid, primary key)
  - `owner_id` (uuid, foreign key) - links to profiles
  - `name` (text) - shop name
  - `slug` (text, unique) - URL-friendly name
  - `description` (text, nullable)
  - `logo_url` (text, nullable)
  - `address` (text, nullable)
  - `phone` (text, nullable)
  - `email` (text, nullable)
  - `website` (text, nullable)
  - `status` (text) - 'pending', 'approved', 'rejected', 'suspended'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `shop_products`
  Product availability at specific shops
  - `id` (uuid, primary key)
  - `shop_id` (uuid, foreign key) - links to shops
  - `product_id` (uuid, foreign key) - links to products
  - `price` (decimal) - shop-specific price
  - `stock_status` (text) - 'in_stock', 'out_of_stock', 'pre_order'
  - `stock_quantity` (integer, nullable)
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### 6. `reviews`
  Product reviews and ratings
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key) - links to products
  - `user_id` (uuid, foreign key) - links to profiles
  - `rating` (integer) - 1-5 star rating
  - `title` (text) - review title
  - `content` (text) - review text
  - `helpful_count` (integer) - how many found it helpful
  - `status` (text) - 'pending', 'approved', 'rejected'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `review_votes`
  Track helpful votes on reviews
  - `id` (uuid, primary key)
  - `review_id` (uuid, foreign key) - links to reviews
  - `user_id` (uuid, foreign key) - links to profiles
  - `is_helpful` (boolean) - true if helpful vote
  - `created_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can read approved content
  - Users can create/edit their own content
  - Shop owners can manage their shops
  - Admins have full access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'shop_owner', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  description text,
  specifications jsonb DEFAULT '{}'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  release_date date,
  price decimal(10,2),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'upcoming')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shops table
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  address text,
  phone text,
  email text,
  website text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shop_products table
CREATE TABLE IF NOT EXISTS shop_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  price decimal(10,2) NOT NULL,
  stock_status text NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'pre_order')),
  stock_quantity integer,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, product_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  helpful_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Create review_votes table
CREATE TABLE IF NOT EXISTS review_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_shops_owner ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);
CREATE INDEX IF NOT EXISTS idx_shop_products_shop ON shop_products(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_product ON shop_products(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Products policies
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Shops policies
CREATE POLICY "Approved shops are viewable by everyone"
  ON shops FOR SELECT
  TO authenticated, anon
  USING (status = 'approved' OR owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create shops"
  ON shops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Shop owners can update their shops"
  ON shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Shop products policies
CREATE POLICY "Shop products are viewable by everyone"
  ON shop_products FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_products.shop_id AND shops.status = 'approved'
    )
  );

CREATE POLICY "Shop owners can insert their products"
  ON shop_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_products.shop_id 
      AND shops.owner_id = auth.uid()
      AND shops.status = 'approved'
    )
  );

CREATE POLICY "Shop owners can update their products"
  ON shop_products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_products.shop_id AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_products.shop_id AND shops.owner_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can delete their products"
  ON shop_products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_products.shop_id AND shops.owner_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (status = 'approved' OR user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Review votes policies
CREATE POLICY "Review votes are viewable by everyone"
  ON review_votes FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can vote on reviews"
  ON review_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON review_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON review_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, slug, description, icon) VALUES
  ('Smartphones', 'smartphones', 'Mobile phones and smartphones', 'Smartphone'),
  ('Bikes', 'bikes', 'Motorcycles and bikes', 'Bike'),
  ('Vehicles', 'vehicles', 'Cars and other vehicles', 'Car'),
  ('Electric Accessories', 'electric-accessories', 'Electronic accessories and gadgets', 'Zap')
ON CONFLICT (slug) DO NOTHING;