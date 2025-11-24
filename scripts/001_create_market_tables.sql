-- Create table for real-time stock prices
CREATE TABLE IF NOT EXISTS public.stock_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(18, 2) NOT NULL,
  open DECIMAL(18, 2),
  high DECIMAL(18, 2),
  low DECIMAL(18, 2),
  close DECIMAL(18, 2),
  volume BIGINT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bid DECIMAL(18, 2),
  ask DECIMAL(18, 2),
  bid_qty BIGINT,
  ask_qty BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for OHLC history
CREATE TABLE IF NOT EXISTS public.ohlc_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  period TEXT NOT NULL DEFAULT '1minute', -- 1minute, 5minute, 15minute, hourly, daily
  open DECIMAL(18, 2) NOT NULL,
  high DECIMAL(18, 2) NOT NULL,
  low DECIMAL(18, 2) NOT NULL,
  close DECIMAL(18, 2) NOT NULL,
  volume BIGINT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(symbol, exchange, period, timestamp)
);

-- Create table for user portfolios
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  initial_capital DECIMAL(18, 2) NOT NULL DEFAULT 1000000,
  current_value DECIMAL(18, 2) NOT NULL DEFAULT 1000000,
  total_invested DECIMAL(18, 2) NOT NULL DEFAULT 0,
  total_returns DECIMAL(18, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for holdings
CREATE TABLE IF NOT EXISTS public.holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  quantity INT NOT NULL,
  avg_buy_price DECIMAL(18, 2) NOT NULL,
  current_price DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portfolio_id, symbol, exchange)
);

-- Create table for orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('BUY', 'SELL')),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'EXECUTED', 'CANCELLED')) DEFAULT 'PENDING',
  quantity INT NOT NULL,
  price DECIMAL(18, 2) NOT NULL,
  total_value DECIMAL(18, 2) GENERATED ALWAYS AS (quantity * price) STORED,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for trades (executed orders)
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
  quantity INT NOT NULL,
  price DECIMAL(18, 2) NOT NULL,
  total_value DECIMAL(18, 2) NOT NULL,
  profit_loss DECIMAL(18, 2),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for community posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  symbol TEXT,
  exchange TEXT,
  likes INT NOT NULL DEFAULT 0,
  views INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for indices
CREATE TABLE IF NOT EXISTS public.indices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price DECIMAL(18, 2) NOT NULL,
  change DECIMAL(18, 2),
  change_percent DECIMAL(10, 2),
  open DECIMAL(18, 2),
  high DECIMAL(18, 2),
  low DECIMAL(18, 2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol ON public.stock_prices(symbol, exchange);
CREATE INDEX IF NOT EXISTS idx_stock_prices_timestamp ON public.stock_prices(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ohlc_symbol_timestamp ON public.ohlc_data(symbol, exchange, period, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio ON public.holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_orders_portfolio ON public.orders(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_trades_portfolio ON public.trades(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON public.community_posts(user_id);

-- Create real-time subscriptions
ALTER TABLE public.stock_prices REPLICA IDENTITY FULL;
ALTER TABLE public.indices REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
