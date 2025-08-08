/*
  # E-commerce Database Schema for Tima's Collection

  1. New Tables
    - `profiles` - User profiles extending Supabase auth
    - `categories` - Product categories (shoes, bags, clothing)
    - `products` - Product catalog with pricing and inventory
    - `product_images` - Product image storage
    - `orders` - Customer orders
    - `order_items` - Individual items in orders
    - `reviews` - Product reviews and ratings
    - `cart_items` - Shopping cart functionality

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Admin role-based access for management

  3. Indexes
    - Performance indexes on frequently queried columns
*/

-- Create profiles table extending auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('men', 'women', 'unisex')),
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  gender text NOT NULL CHECK (gender IN ('men', 'women', 'unisex')),
  stock integer NOT NULL DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  is_primary boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) NOT NULL,
  shipping_address jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  size text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  size text,
  color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories policies
CREATE POLICY "Anyone can read active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products policies
CREATE POLICY "Anyone can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Product images policies
CREATE POLICY "Anyone can read product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON product_images FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders policies
CREATE POLICY "Users can read own orders" ON orders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own orders" ON orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can read all orders" ON orders FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order items policies
CREATE POLICY "Users can read own order items" ON order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create order items" ON order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can read all order items" ON order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews policies
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Cart items policies
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL TO authenticated USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Insert sample categories
INSERT INTO categories (name, gender, description, image_url) VALUES
  ('Shoes', 'men', 'Stylish footwear for men', 'https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg'),
  ('Bags', 'men', 'Quality bags and accessories for men', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'),
  ('Clothing', 'men', 'Trendy clothing for men', 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'),
  ('Shoes', 'women', 'Elegant footwear for women', 'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg'),
  ('Bags', 'women', 'Stylish bags and accessories for women', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'),
  ('Clothing', 'women', 'Fashion-forward clothing for women', 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg');

-- Insert sample products
INSERT INTO products (name, description, price, category_id, gender, stock, is_featured, sizes, colors) VALUES
  ('Classic Leather Boots', 'Premium leather boots perfect for any occasion', 199.99, 
   (SELECT id FROM categories WHERE name = 'Shoes' AND gender = 'men' LIMIT 1), 
   'men', 50, true, '{"7","8","9","10","11","12"}', '{"Black","Brown","Tan"}'),
  ('Business Laptop Bag', 'Professional laptop bag with multiple compartments', 129.99, 
   (SELECT id FROM categories WHERE name = 'Bags' AND gender = 'men' LIMIT 1), 
   'men', 30, true, '{"One Size"}', '{"Black","Navy","Brown"}'),
  ('Casual Cotton Shirt', 'Comfortable cotton shirt for everyday wear', 49.99, 
   (SELECT id FROM categories WHERE name = 'Clothing' AND gender = 'men' LIMIT 1), 
   'men', 75, false, '{"S","M","L","XL","XXL"}', '{"White","Blue","Gray","Black"}'),
  ('Elegant Heels', 'Sophisticated heels for special occasions', 159.99, 
   (SELECT id FROM categories WHERE name = 'Shoes' AND gender = 'women' LIMIT 1), 
   'women', 40, true, '{"5","6","7","8","9","10"}', '{"Black","Red","Nude","Silver"}'),
  ('Designer Handbag', 'Luxury handbag with premium materials', 299.99, 
   (SELECT id FROM categories WHERE name = 'Bags' AND gender = 'women' LIMIT 1), 
   'women', 25, true, '{"One Size"}', '{"Black","Brown","Red","Pink"}'),
  ('Floral Summer Dress', 'Light and breezy dress perfect for summer', 89.99, 
   (SELECT id FROM categories WHERE name = 'Clothing' AND gender = 'women' LIMIT 1), 
   'women', 60, false, '{"XS","S","M","L","XL"}', '{"Floral Blue","Floral Pink","Floral Yellow"}');

-- Insert sample product images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
  ((SELECT id FROM products WHERE name = 'Classic Leather Boots' LIMIT 1), 'https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg', 'Classic Leather Boots', true, 1),
  ((SELECT id FROM products WHERE name = 'Business Laptop Bag' LIMIT 1), 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', 'Business Laptop Bag', true, 1),
  ((SELECT id FROM products WHERE name = 'Casual Cotton Shirt' LIMIT 1), 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg', 'Casual Cotton Shirt', true, 1),
  ((SELECT id FROM products WHERE name = 'Elegant Heels' LIMIT 1), 'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg', 'Elegant Heels', true, 1),
  ((SELECT id FROM products WHERE name = 'Designer Handbag' LIMIT 1), 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', 'Designer Handbag', true, 1),
  ((SELECT id FROM products WHERE name = 'Floral Summer Dress' LIMIT 1), 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg', 'Floral Summer Dress', true, 1);