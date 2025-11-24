export const MARKET_HOURS = {
  open: { hours: 9, minutes: 15 },
  close: { hours: 15, minutes: 30 },
};

export const INDICES = [
  { symbol: 'NIFTY50', name: 'Nifty 50', basePrice: 20000, description: 'India\'s largest 50 companies' },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty', basePrice: 45000, description: 'Top 12 banking companies' },
  { symbol: 'SENSEX', name: 'Sensex', basePrice: 70000, description: 'BSE\'s premier index' },
];

export const TOP_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', basePrice: 3200, sector: 'Energy', description: 'Energy & Petrochemicals' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', basePrice: 3800, sector: 'IT', description: 'IT Services & Consulting' },
  { symbol: 'INFY', name: 'Infosys', basePrice: 1850, sector: 'IT', description: 'IT Services' },
  { symbol: 'WIPRO', name: 'Wipro', basePrice: 650, sector: 'IT', description: 'IT Services & BPO' },
  { symbol: 'HCLTECH', name: 'HCL Tech', basePrice: 1650, sector: 'IT', description: 'IT Infrastructure Services' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', basePrice: 1200, sector: 'Banking', description: 'Private Banking' },
  { symbol: 'HDFC', name: 'HDFC Bank', basePrice: 1750, sector: 'Banking', description: 'Premium Banking' },
  { symbol: 'AXISBANK', name: 'Axis Bank', basePrice: 1100, sector: 'Banking', description: 'Private Banking' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finance', basePrice: 1650, sector: 'Finance', description: 'Non-Banking Finance' },
  { symbol: 'SBIN', name: 'State Bank of India', basePrice: 800, sector: 'Banking', description: 'Public Sector Banking' },
  { symbol: 'LT', name: 'Larsen & Toubro', basePrice: 3100, sector: 'Infrastructure', description: 'Engineering & Construction' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', basePrice: 10500, sector: 'Automotive', description: 'Automobile Manufacturing' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto', basePrice: 7200, sector: 'Automotive', description: 'Two & Three Wheelers' },
  { symbol: 'TATASTEEL', name: 'Tata Steel', basePrice: 2800, sector: 'Steel', description: 'Steel Manufacturing' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel', basePrice: 920, sector: 'Steel', description: 'Steel Production' },
  { symbol: 'BRITANNIA', name: 'Britannia', basePrice: 4600, sector: 'FMCG', description: 'Foods & Beverages' },
  { symbol: 'NESTLEIND', name: 'Nestle India', basePrice: 2450, sector: 'FMCG', description: 'Consumer Foods' },
  { symbol: 'COALINDIA', name: 'Coal India', basePrice: 480, sector: 'Energy', description: 'Coal Mining' },
  { symbol: 'POWERGRID', name: 'Power Grid', basePrice: 320, sector: 'Energy', description: 'Power Transmission' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma', basePrice: 1850, sector: 'Pharma', description: 'Pharmaceutical Manufacturer' },
];

export const BACKTESTING_STRATEGIES = [
  {
    id: 'sma-crossover',
    name: 'SMA 20/50 Crossover',
    description: 'Buy when 20-day SMA crosses above 50-day SMA',
    winRate: 58,
    profitFactor: 2.3,
    returns: 45.2
  },
  {
    id: 'rsi-oversold',
    name: 'RSI Oversold Recovery',
    description: 'Buy when RSI drops below 30, sell above 70',
    winRate: 52,
    profitFactor: 1.8,
    returns: 32.5
  },
  {
    id: 'bollinger-mean-revert',
    name: 'Bollinger Bands Mean Reversion',
    description: 'Trade bounces from Bollinger Band extremes',
    winRate: 55,
    profitFactor: 2.1,
    returns: 38.9
  },
  {
    id: 'macd-histogram',
    name: 'MACD Histogram',
    description: 'Buy on positive MACD histogram divergence',
    winRate: 53,
    profitFactor: 1.9,
    returns: 35.1
  },
  {
    id: 'momentum-breakout',
    name: 'Momentum Breakout',
    description: 'Breakout trading on momentum extremes',
    winRate: 48,
    profitFactor: 3.2,
    returns: 52.7
  },
];

interface PricePoint {
  time: string;
  price: number;
  change?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  volume?: number;
}

export function generatePriceData(basePrice: number, points: number = 100): PricePoint[] {
  const data: PricePoint[] = [];
  let price = basePrice;

  for (let i = 0; i < points; i++) {
    const randomChange = (Math.random() - 0.5) * 2 * basePrice * 0.02;
    const openPrice = price;
    price = Math.max(price + randomChange, basePrice * 0.85);
    const closePrice = price;
    const highPrice = Math.max(openPrice, closePrice) + Math.random() * basePrice * 0.01;
    const lowPrice = Math.min(openPrice, closePrice) - Math.random() * basePrice * 0.01;

    const time = new Date(Date.now() - (points - i) * 60000).toLocaleTimeString('en-IN');
    data.push({
      time,
      price: Math.round(closePrice * 100) / 100,
      change: ((closePrice - basePrice) / basePrice) * 100,
      open: Math.round(openPrice * 100) / 100,
      close: Math.round(closePrice * 100) / 100,
      high: Math.round(highPrice * 100) / 100,
      low: Math.round(Math.max(lowPrice, basePrice * 0.5) * 100) / 100,
      volume: Math.floor(Math.random() * 5000000),
    });
  }

  return data;
}

export function getRealtimePrice(basePrice: number, lastPrice?: number): number {
  const current = lastPrice || basePrice;
  const randomChange = (Math.random() - 0.5) * basePrice * 0.005; // ±0.25% per tick
  return Math.max(current + randomChange, basePrice * 0.85);
}

export function isMarketOpen(): boolean {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(now.getTime() + istOffset);

  const day = istTime.getUTCDay();

  // Market closed on weekends (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) return false;

  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  const currentTime = hours * 60 + minutes;

  const openTime = MARKET_HOURS.open.hours * 60 + MARKET_HOURS.open.minutes;
  const closeTime = MARKET_HOURS.close.hours * 60 + MARKET_HOURS.close.minutes;

  return currentTime >= openTime && currentTime <= closeTime;
}

export function getNextMarketOpen(): Date {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);

  const day = istTime.getUTCDay();
  let daysToAdd = 0;

  if (day === 0) { // Sunday
    daysToAdd = 1; // Next Monday
  } else if (day === 6) { // Saturday
    daysToAdd = 2; // Next Monday
  } else if (day >= 1 && day <= 5) { // Monday to Friday
    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    const currentTime = hours * 60 + minutes;
    const openTime = MARKET_HOURS.open.hours * 60 + MARKET_HOURS.open.minutes;

    if (currentTime >= openTime) {
      daysToAdd = 1; // Tomorrow
    }
  }

  const nextOpen = new Date(istTime);
  nextOpen.setUTCDate(nextOpen.getUTCDate() + daysToAdd);
  nextOpen.setUTCHours(MARKET_HOURS.open.hours, MARKET_HOURS.open.minutes, 0, 0);

  // Convert back to local time
  return new Date(nextOpen.getTime() - istOffset);
}

export function getTimeToMarketClose(): number {
  if (!isMarketOpen()) return 0;

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);

  const closeTime = new Date(istTime);
  closeTime.setUTCHours(MARKET_HOURS.close.hours, MARKET_HOURS.close.minutes, 0, 0);

  return Math.max(0, closeTime.getTime() - istTime.getTime());
}

export function getTopGainers(stocks: typeof TOP_STOCKS, count: number = 5) {
  return stocks
    .map(stock => ({
      ...stock,
      change: (Math.random() - 0.4) * 5,
      changePercent: (Math.random() - 0.4) * 5,
      volume: Math.floor(Math.random() * 10000000),
      pe: (Math.random() * 30 + 10).toFixed(2),
      marketCap: Math.floor(Math.random() * 500) + ' Cr',
    }))
    .sort((a, b) => b.change - a.change)
    .slice(0, count);
}

export function getTopLosers(stocks: typeof TOP_STOCKS, count: number = 5) {
  return stocks
    .map(stock => ({
      ...stock,
      change: (Math.random() - 0.6) * 5,
      changePercent: (Math.random() - 0.6) * 5,
      volume: Math.floor(Math.random() * 10000000),
      pe: (Math.random() * 30 + 10).toFixed(2),
      marketCap: Math.floor(Math.random() * 500) + ' Cr',
    }))
    .sort((a, b) => a.change - b.change)
    .slice(0, count);
}

export function getTechnicalIndicators(prices: PricePoint[]) {
  if (prices.length < 50) return null;

  const closes = prices.map(p => p.close || p.price);

  // SMA 20 & 50
  const sma20 = closes.slice(-20).reduce((a, b) => a + b) / 20;
  const sma50 = closes.slice(-50).reduce((a, b) => a + b) / 50;

  // RSI
  const changes = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }
  const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / 14;
  const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / 14;
  const rsi = 100 - (100 / (1 + gains / losses));

  // MACD
  const ema12 = closes[closes.length - 1]; // Simplified
  const ema26 = closes[closes.length - 1] * 0.98;
  const macd = ema12 - ema26;

  return {
    sma20: Math.round(sma20 * 100) / 100,
    sma50: Math.round(sma50 * 100) / 100,
    rsi: Math.round(rsi * 100) / 100,
    macd: Math.round(macd * 100) / 100,
    signal: 'BUY' as const,
  };
}

// Generate consistent historical data across all timeframes with market hours consideration
export function generateConsistentHistoricalData(symbol: string, period: string, limit: number) {
  const basePrice = TOP_STOCKS.find(s => s.symbol === symbol)?.basePrice ||
                   INDICES.find(i => i.symbol === symbol)?.basePrice || 1000;

  const data = [];
  const now = new Date();

  // Calculate interval in minutes based on period
  let intervalMinutes: number;
  switch (period) {
    case '1min': intervalMinutes = 1; break;
    case '5min': intervalMinutes = 5; break;
    case '15min': intervalMinutes = 15; break;
    case '1h': intervalMinutes = 60; break;
    case '1d': intervalMinutes = 24 * 60; break;
    default: intervalMinutes = 15;
  }

  // Start from current time and go backwards
  let currentTime = new Date(now);
  let currentPrice = basePrice;

  // Add some realistic volatility and trend
  const volatility = 0.003; // 0.3% volatility per interval
  const trend = (Math.random() - 0.5) * 0.0005; // Very slight trend

  for (let i = 0; i < limit; i++) {
    // Generate OHLC data with realistic movements
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice + trend * currentPrice;
    const open = currentPrice;
    const close = Math.max(open + change, basePrice * 0.7); // Don't go below 70% of base
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.3;

    // Only include data during market hours for intraday data
    let includeData = true;
    if (period !== '1d') {
      const istTime = new Date(currentTime.getTime() + (5.5 * 60 * 60 * 1000));
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const currentMinutes = hours * 60 + minutes;
      const marketOpen = 9 * 60 + 15; // 9:15 AM
      const marketClose = 15 * 60 + 30; // 3:30 PM

      // Skip if outside market hours
      if (currentMinutes < marketOpen || currentMinutes > marketClose) {
        includeData = false;
      }

      // Skip weekends
      const dayOfWeek = istTime.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday = 0, Saturday = 6
        includeData = false;
      }
    }

    if (includeData) {
      data.unshift({
        symbol,
        exchange: 'NSE',
        period,
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(Math.max(low, basePrice * 0.7) * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: Math.floor(Math.random() * 100000) + 10000,
        timestamp: currentTime.toISOString(),
      });
    }

    // Move to previous interval
    currentTime = new Date(currentTime.getTime() - intervalMinutes * 60 * 1000);
    currentPrice = close;
  }

  return data;
}

// Generate real-time price with market hours consideration
export function generateRealtimePrice(symbol: string) {
  const stockData = TOP_STOCKS.find(s => s.symbol === symbol);
  const indexData = INDICES.find(i => i.symbol === symbol);

  if (!stockData && !indexData) return null;

  const baseData = stockData || indexData!;
  const isOpen = isMarketOpen();
  const basePrice = baseData.basePrice;

  // Generate realistic price movements for demo purposes
  // Always add some movement, but smaller outside market hours
  const volatility = isOpen ? 0.005 : 0.001; // 0.5% during market, 0.1% outside
  const movement = (Math.random() - 0.5) * 2 * volatility;
  const change = basePrice * movement;
  const currentPrice = basePrice + change;
  const changePercent = (change / basePrice) * 100;

  // Generate OHLC data with realistic ranges
  const dayRange = baseData.basePrice * 0.02; // ±2% daily range
  const open = Math.round((baseData.basePrice + (Math.random() - 0.5) * dayRange) * 100) / 100;
  const high = Math.round(Math.max(open, currentPrice + Math.random() * dayRange * 0.5) * 100) / 100;
  const low = Math.round(Math.min(open, currentPrice - Math.random() * dayRange * 0.5) * 100) / 100;

  // Volume based on market hours (higher during market, lower outside)
  const baseVolume = isOpen ? 100000 : 10000;
  const volume = Math.floor(Math.random() * baseVolume * 2) + baseVolume;

  return {
    symbol,
    exchange: 'NSE',
    name: baseData.name,
    price: Math.round(currentPrice * 100) / 100,
    open: open,
    high: high,
    low: low,
    close: Math.round(currentPrice * 100) / 100,
    volume: volume,
    bid: Math.round(currentPrice * 0.999 * 100) / 100,
    ask: Math.round(currentPrice * 1.001 * 100) / 100,
    bid_qty: Math.floor(Math.random() * 1000) + 100,
    ask_qty: Math.floor(Math.random() * 1000) + 100,
    timestamp: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    change: Math.round(change * 100) / 100,
    change_percent: Math.round(changePercent * 100) / 100,
    market_open: isOpen
  };
}
