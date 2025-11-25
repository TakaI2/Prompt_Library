-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#4CD1E0',
  icon TEXT DEFAULT 'folder',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories with modern icons
INSERT OR IGNORE INTO categories (name, icon, color) VALUES 
  ('ライティング', 'pen-fancy', '#4CD1E0'),
  ('YouTube', 'camera', '#FF0000'),
  ('情報発信', 'bolt', '#10B981'),
  ('物販', 'gift', '#F59E0B'),
  ('マーケティング', 'chart-line', '#8B5CF6');

-- Create index for categories
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
