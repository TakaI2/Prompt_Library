-- Add order_index column to categories table
ALTER TABLE categories ADD COLUMN order_index INTEGER DEFAULT 0;

-- Update existing categories with order_index based on id
UPDATE categories SET order_index = id * 10;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);
