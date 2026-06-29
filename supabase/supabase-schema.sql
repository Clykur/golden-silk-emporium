-- ============================================================
-- MAAYA COUTURE — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- PROFILES (extends Supabase Auth users)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure existing profiles table has nullable email
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COLLECTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  image TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price DECIMAL(12,2) NOT NULL,
  sale_price DECIMAL(12,2),
  compare_at DECIMAL(12,2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  fabric TEXT,
  color TEXT,
  occasion TEXT,
  tags TEXT[] DEFAULT '{}',
  details TEXT[] DEFAULT '{}',
  stock_quantity INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  video_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  status product_status DEFAULT 'draft',
  weave TEXT,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HOMEPAGE BANNERS
-- ============================================================

CREATE TABLE IF NOT EXISTS homepage_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image TEXT,
  mobile_image TEXT,
  cta_text TEXT,
  cta_link TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPONS
-- ============================================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type discount_type DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(12,2) DEFAULT 0,
  max_discount_value DECIMAL(12,2),
  usage_limit INT,
  usage_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code TEXT,
  shipping_address JSONB,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  payment_status TEXT DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT,
  reviewer_email TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WISHLIST
-- ============================================================

CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- CART ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  size TEXT DEFAULT 'Standard',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, size)
);

-- ============================================================
-- SITE SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      COALESCE(split_part(NEW.email, '@', 1), NEW.phone)
    ),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (is_admin());

-- PRODUCTS
DROP POLICY IF EXISTS "Anyone can view published products" ON products;
CREATE POLICY "Anyone can view published products" ON products FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins can view all products" ON products;
CREATE POLICY "Admins can view all products" ON products FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (is_admin());

-- PRODUCT IMAGES
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
CREATE POLICY "Admins can manage product images" ON product_images FOR ALL USING (is_admin());

-- CATEGORIES
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can view all categories" ON categories;
CREATE POLICY "Admins can view all categories" ON categories FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin());

-- COLLECTIONS
DROP POLICY IF EXISTS "Anyone can view active collections" ON collections;
CREATE POLICY "Anyone can view active collections" ON collections FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can view all collections" ON collections;
CREATE POLICY "Admins can view all collections" ON collections FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage collections" ON collections;
CREATE POLICY "Admins can manage collections" ON collections FOR ALL USING (is_admin());

-- ORDERS
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (is_admin());

-- REVIEWS
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = TRUE);

DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
CREATE POLICY "Admins can view all reviews" ON reviews FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Users can insert reviews" ON reviews;
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (is_admin());

-- WISHLIST
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist;
CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- CART ITEMS
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- COUPONS
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL USING (is_admin());

-- HOMEPAGE BANNERS
DROP POLICY IF EXISTS "Anyone can view active banners" ON homepage_banners;
CREATE POLICY "Anyone can view active banners" ON homepage_banners FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage banners" ON homepage_banners;
CREATE POLICY "Admins can manage banners" ON homepage_banners FOR ALL USING (is_admin());

-- SITE SETTINGS
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
CREATE POLICY "Anyone can view site settings" ON site_settings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL USING (is_admin());

-- NEWSLETTER
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins can manage newsletter" ON newsletter_subscribers;
CREATE POLICY "Admins can manage newsletter" ON newsletter_subscribers FOR ALL USING (is_admin());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_bestseller) WHERE is_bestseller = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = TRUE;
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);

-- ============================================================
-- SEED: DEFAULT CATEGORIES
-- ============================================================

INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Kanjivaram Sarees', 'kanjivaram-sarees', 'Authentic Kanchipuram silk sarees with real gold zari', 1),
  ('Banarasi Sarees', 'banarasi-sarees', 'Handwoven Banaras silk sarees with intricate brocade', 2),
  ('Silk Sarees', 'silk-sarees', 'Premium pure silk sarees from master weavers', 3),
  ('Organza Sarees', 'organza-sarees', 'Lightweight organza sarees for festive occasions', 4),
  ('Chiffon Sarees', 'chiffon-sarees', 'Flowing chiffon sarees for modern elegance', 5),
  ('Linen Sarees', 'linen-sarees', 'Breathable handblock linen sarees for everyday luxury', 6),
  ('Cotton Sarees', 'cotton-sarees', 'Premium mulmul and handloom cotton sarees', 7),
  ('Designer Sarees', 'designer-sarees', 'Contemporary designer creations for the modern woman', 8),
  ('Handloom Sarees', 'handloom-sarees', 'Hand-woven artisanal sarees from master craftsmen', 9),
  ('Bridal Sarees', 'bridal-sarees', 'Exquisite bridal trousseau sarees for your special day', 10),
  ('Festive Sarees', 'festive-sarees', 'Vibrant sarees for celebrations and festivals', 11),
  ('Contemporary Sarees', 'contemporary-sarees', 'Modern interpretations of traditional weaves', 12),
  ('Heritage Sarees', 'heritage-sarees', 'Rare heritage weaves from ancient Indian traditions', 13),
  ('Limited Edition Sarees', 'limited-edition-sarees', 'One-of-a-kind limited edition masterpieces', 14)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: DEFAULT COLLECTIONS
-- ============================================================

INSERT INTO collections (name, slug, tagline, description, is_featured, sort_order) VALUES
  ('Heritage Weaves', 'heritage-weaves', 'Handloom masterworks from Banaras & Kanchipuram', 'A celebration of India''s most treasured weaving traditions, each piece a testament to centuries of artisanal excellence.', TRUE, 1),
  ('Vivah Couture', 'vivah-couture', 'Bridal masterpieces adorned in gold and real pearls', 'Extraordinary bridal sarees that transform the most important day of your life into an heirloom memory.', TRUE, 2),
  ('Soirée', 'soiree', 'Flowing chiffons and designer organzas for celebrations', 'Ethereal evening sarees that move like poetry — perfect for receptions, galas, and festive celebrations.', TRUE, 3),
  ('Modern Minimalist', 'modern-minimalist', 'Contemporary hand-block linens and everyday cottons', 'Clean lines, subtle beauty. Our modern collection for the woman who finds luxury in simplicity.', TRUE, 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: SITE SETTINGS
-- ============================================================

INSERT INTO site_settings (key, value) VALUES
  ('store_name', '"Drapeva"'),
  ('store_tagline', '"Heirloom Indian Silk Sarees"'),
  ('whatsapp_number', '"+918123045318"'),
  ('free_shipping_threshold', '5000'),
  ('tax_rate', '0.05'),
  ('shipping_cost', '299')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- STORAGE BUCKETS (automatically created via database insert)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('collection-images', 'collection-images', true),
  ('banner-images', 'banner-images', true)
ON CONFLICT (id) DO NOTHING;
