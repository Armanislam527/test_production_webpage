INSERT INTO categories (name, slug, description, icon) VALUES
  ('Laptops', 'laptops', 'Laptops and notebooks', 'Laptop'),
  ('PC Accessories', 'pc-accessories', 'PC peripherals and accessories', 'Cable')
ON CONFLICT (slug) DO NOTHING;