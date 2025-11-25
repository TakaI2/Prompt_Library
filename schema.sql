-- PostgreSQL Schema for Vercel Postgres
-- Run this in Vercel Postgres console or via psql

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  image_url TEXT,
  user_id TEXT DEFAULT 'default',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#4CD1E0',
  icon TEXT DEFAULT 'folder',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_order ON prompts(order_index);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);

-- Insert default categories
INSERT INTO categories (name, icon, color, order_index) VALUES
  ('ライティング', 'pen-fancy', '#4CD1E0', 10),
  ('YouTube', 'camera', '#FF0000', 20),
  ('情報発信', 'bolt', '#10B981', 30),
  ('物販', 'gift', '#F59E0B', 40),
  ('マーケティング', 'chart-line', '#8B5CF6', 50)
ON CONFLICT (name) DO NOTHING;
