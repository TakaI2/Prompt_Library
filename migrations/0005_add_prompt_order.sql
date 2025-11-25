-- Add order_index column to prompts table for drag & drop reordering
ALTER TABLE prompts ADD COLUMN order_index INTEGER DEFAULT 0;

-- Initialize order_index with current id values
UPDATE prompts SET order_index = id * 10;

-- Create index for better sorting performance
CREATE INDEX IF NOT EXISTS idx_prompts_order ON prompts(order_index);
