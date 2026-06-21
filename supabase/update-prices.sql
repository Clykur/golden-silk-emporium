-- Set all product prices between ₹1,000 and ₹6,000

UPDATE products
SET price =
(
  FLOOR(
    1000 +
    (
      (('x' || SUBSTR(MD5(slug), 1, 8))::bit(32)::int & 2147483647)::numeric
      / 2147483647
    ) * 5000
  ) / 100
) * 100;

-- Sale price = 20% discount
UPDATE products
SET sale_price = FLOOR((price * 0.80) / 100) * 100
WHERE sale_price IS NOT NULL;

-- Ensure sale price is below regular price
UPDATE products
SET sale_price = price - 100
WHERE sale_price IS NOT NULL
  AND sale_price >= price;

-- Compare-at price = 15% above regular price
UPDATE products
SET compare_at = FLOOR((price * 1.15) / 100) * 100
WHERE compare_at IS NOT NULL;

UPDATE products
SET compare_at = price + 200
WHERE compare_at IS NOT NULL
  AND compare_at <= price;