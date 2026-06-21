-- ============================================================
-- DRAPEVA - BRANDED BUSINESS IDs MIGRATION
-- ============================================================

-- 1. Create Sequences
CREATE SEQUENCE IF NOT EXISTS order_seq START 1;
CREATE SEQUENCE IF NOT EXISTS customer_seq START 1;
CREATE SEQUENCE IF NOT EXISTS return_seq START 1;

CREATE SEQUENCE IF NOT EXISTS product_kan_seq START 1;
CREATE SEQUENCE IF NOT EXISTS product_pat_seq START 1;
CREATE SEQUENCE IF NOT EXISTS product_mug_seq START 1;
CREATE SEQUENCE IF NOT EXISTS product_ban_seq START 1;
CREATE SEQUENCE IF NOT EXISTS product_org_seq START 1;
CREATE SEQUENCE IF NOT EXISTS product_cot_seq START 1;
CREATE SEQUENCE IF NOT EXISTS product_sil_seq START 1;
CREATE SEQUENCE IF NOT EXISTS product_gen_seq START 1;

-- 2. Add Columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS customer_id TEXT UNIQUE;
ALTER TABLE return_requests ADD COLUMN IF NOT EXISTS return_id TEXT UNIQUE;

-- Create Indices
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_profiles_customer_id ON profiles(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_id ON return_requests(return_id);

-- 3. Create Generator Functions

-- ORDERS
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'DRV-ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(nextval('order_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_generate_order_number
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- CUSTOMERS
CREATE OR REPLACE FUNCTION generate_customer_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NULL THEN
    NEW.customer_id := 'DRV-CUS-' || lpad(nextval('customer_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_generate_customer_id
BEFORE INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION generate_customer_id();

-- RETURNS
CREATE OR REPLACE FUNCTION generate_return_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.return_id IS NULL THEN
    NEW.return_id := 'DRV-RET-' || lpad(nextval('return_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_generate_return_id
BEFORE INSERT ON return_requests
FOR EACH ROW EXECUTE FUNCTION generate_return_id();

-- PRODUCTS
CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS TRIGGER AS $$
DECLARE
  cat_name TEXT;
  prefix TEXT;
  seq_val INT;
BEGIN
  IF NEW.product_code IS NULL THEN
    -- Get Category Name
    IF NEW.category_id IS NOT NULL THEN
      SELECT name INTO cat_name FROM categories WHERE id = NEW.category_id;
    END IF;

    -- Determine Prefix and Sequence
    IF cat_name ILIKE '%Kanjivaram%' THEN
      prefix := 'KAN';
      seq_val := nextval('product_kan_seq');
    ELSIF cat_name ILIKE '%Patola%' THEN
      prefix := 'PAT';
      seq_val := nextval('product_pat_seq');
    ELSIF cat_name ILIKE '%Muga%' THEN
      prefix := 'MUG';
      seq_val := nextval('product_mug_seq');
    ELSIF cat_name ILIKE '%Banarasi%' THEN
      prefix := 'BAN';
      seq_val := nextval('product_ban_seq');
    ELSIF cat_name ILIKE '%Organza%' THEN
      prefix := 'ORG';
      seq_val := nextval('product_org_seq');
    ELSIF cat_name ILIKE '%Cotton%' THEN
      prefix := 'COT';
      seq_val := nextval('product_cot_seq');
    ELSIF cat_name ILIKE '%Silk%' THEN
      prefix := 'SIL';
      seq_val := nextval('product_sil_seq');
    ELSE
      prefix := 'GEN';
      seq_val := nextval('product_gen_seq');
    END IF;

    NEW.product_code := 'DRV-' || prefix || '-' || lpad(seq_val::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_generate_product_code
BEFORE INSERT ON products
FOR EACH ROW EXECUTE FUNCTION generate_product_code();

-- 4. Backfill Existing Records
DO $$
DECLARE
  row_record RECORD;
BEGIN
  -- Backfill Orders
  FOR row_record IN SELECT id FROM orders WHERE order_number IS NULL LOOP
    UPDATE orders SET order_number = 'DRV-ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(nextval('order_seq')::text, 4, '0') WHERE id = row_record.id;
  END LOOP;

  -- Backfill Customers
  FOR row_record IN SELECT id FROM profiles WHERE customer_id IS NULL LOOP
    UPDATE profiles SET customer_id = 'DRV-CUS-' || lpad(nextval('customer_seq')::text, 4, '0') WHERE id = row_record.id;
  END LOOP;

  -- Backfill Returns
  FOR row_record IN SELECT id FROM return_requests WHERE return_id IS NULL LOOP
    UPDATE return_requests SET return_id = 'DRV-RET-' || lpad(nextval('return_seq')::text, 4, '0') WHERE id = row_record.id;
  END LOOP;

  -- Backfill Products
  FOR row_record IN SELECT p.id, c.name as cat_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.product_code IS NULL LOOP
    DECLARE
      prefix TEXT;
      seq_val INT;
    BEGIN
      IF row_record.cat_name ILIKE '%Kanjivaram%' THEN
        prefix := 'KAN';
        seq_val := nextval('product_kan_seq');
      ELSIF row_record.cat_name ILIKE '%Patola%' THEN
        prefix := 'PAT';
        seq_val := nextval('product_pat_seq');
      ELSIF row_record.cat_name ILIKE '%Muga%' THEN
        prefix := 'MUG';
        seq_val := nextval('product_mug_seq');
      ELSIF row_record.cat_name ILIKE '%Banarasi%' THEN
        prefix := 'BAN';
        seq_val := nextval('product_ban_seq');
      ELSIF row_record.cat_name ILIKE '%Organza%' THEN
        prefix := 'ORG';
        seq_val := nextval('product_org_seq');
      ELSIF row_record.cat_name ILIKE '%Cotton%' THEN
        prefix := 'COT';
        seq_val := nextval('product_cot_seq');
      ELSIF row_record.cat_name ILIKE '%Silk%' THEN
        prefix := 'SIL';
        seq_val := nextval('product_sil_seq');
      ELSE
        prefix := 'GEN';
        seq_val := nextval('product_gen_seq');
      END IF;

      UPDATE products SET product_code = 'DRV-' || prefix || '-' || lpad(seq_val::text, 4, '0') WHERE id = row_record.id;
    END;
  END LOOP;
END;
$$;
