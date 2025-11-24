-- Add executed_price column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS executed_price DECIMAL(18, 2);