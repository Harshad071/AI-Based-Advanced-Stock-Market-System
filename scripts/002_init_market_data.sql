-- Initialize default indices in Supabase
INSERT INTO public.indices (symbol, name, price, open, high, low, timestamp)
VALUES 
  ('NIFTY50', 'Nifty 50', 20000, 20000, 20000, 20000, NOW()),
  ('BANKNIFTY', 'Bank Nifty', 45000, 45000, 45000, 45000, NOW()),
  ('SENSEX', 'Sensex', 70000, 70000, 70000, 70000, NOW())
ON CONFLICT (symbol) DO NOTHING;

-- Initialize stock prices table with zero records (will be populated by Angel One API)
-- This is just to ensure the table exists and is ready for real-time data
