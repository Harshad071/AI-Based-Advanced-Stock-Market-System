// Seed historical OHLC data for stocks and indices
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fetch real historical data from Yahoo Finance
async function fetchYahooHistoricalData(symbol, days = 730) {
  try {
    console.log(`Fetching real historical data for ${symbol} from Yahoo Finance`);

    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (days * 24 * 60 * 60);

    const exchange = symbol.includes('NIFTY') || symbol.includes('SENSEX') ? '' : '.NS';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}${exchange}?period1=${startDate}&period2=${endDate}&interval=1d`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.chart && data.chart.result && data.chart.result[0]) {
      const result = data.chart.result[0];
      const timestamps = result.timestamp || [];
      const quote = result.indicators.quote[0];

      if (timestamps.length > 0 && quote) {
        const historicalData = [];

        for (let i = 0; i < timestamps.length; i++) {
          const timestamp = timestamps[i];
          const open = quote.open?.[i];
          const high = quote.high?.[i];
          const low = quote.low?.[i];
          const close = quote.close?.[i];
          const volume = quote.volume?.[i];

          if (open !== null && open !== undefined &&
              high !== null && high !== undefined &&
              low !== null && low !== undefined &&
              close !== null && close !== undefined) {
            historicalData.push({
              symbol: symbol,
              exchange: symbol.includes('NIFTY') || symbol.includes('SENSEX') ? 'NSE' : 'NSE',
              period: '1day',
              open: parseFloat(open.toString()),
              high: parseFloat(high.toString()),
              low: parseFloat(low.toString()),
              close: parseFloat(close.toString()),
              volume: volume ? parseInt(volume.toString()) : 0,
              timestamp: new Date(timestamp * 1000).toISOString(),
            });
          }
        }

        return historicalData;
      }
    }

    return [];
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
}

// Fallback: Generate mock historical data if Yahoo Finance fails
function generateMockHistoricalData(symbol, basePrice, days = 730) {
  const data = [];
  let currentPrice = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Create more realistic price movements with trends and controlled volatility
  let trendDirection = Math.random() > 0.5 ? 1 : -1; // Up or down trend
  let trendStrength = 0.001; // Daily trend strength
  let trendCounter = 0;
  const trendChangeDays = 30; // Change trend every 30 days

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Change trend direction periodically
    if (trendCounter >= trendChangeDays) {
      trendDirection = Math.random() > 0.5 ? 1 : -1;
      trendCounter = 0;
    }
    trendCounter++;

    // Generate realistic OHLC data with controlled volatility
    const baseVolatility = 0.015; // 1.5% base daily volatility
    const randomVolatility = Math.random() * 0.01; // Additional random volatility
    const totalVolatility = baseVolatility + randomVolatility;

    // Apply trend
    const trendChange = trendDirection * trendStrength * currentPrice;
    const randomChange = (Math.random() - 0.5) * 2 * totalVolatility * currentPrice;

    const open = currentPrice;
    const close = Math.max(open + trendChange + randomChange, basePrice * 0.7); // Don't go below 70% of base

    // Ensure realistic high/low ranges
    const range = Math.abs(close - open) * (0.5 + Math.random() * 0.5); // 50-100% of the price change
    const high = Math.max(open, close) + range;
    const low = Math.min(open, close) - range * 0.3; // Low is closer to the lower price

    // Volume based on price movement (higher volume on bigger moves)
    const priceChangePercent = Math.abs((close - open) / open);
    const baseVolume = symbol.includes('NIFTY') || symbol.includes('SENSEX') ? 50000000 : 2000000;
    const volumeMultiplier = 1 + (priceChangePercent * 5); // Volume increases with price movement
    const volume = Math.floor(baseVolume * (0.5 + Math.random()) * volumeMultiplier);

    data.push({
      symbol: symbol,
      exchange: symbol.includes('NIFTY') || symbol.includes('SENSEX') ? 'NSE' : 'NSE',
      period: '1day',
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(Math.max(low, basePrice * 0.6) * 100) / 100, // Ensure low doesn't go too low
      close: Math.round(close * 100) / 100,
      volume: volume,
      timestamp: date.toISOString(),
    });

    currentPrice = close;
  }

  return data;
}

async function seedHistoricalData() {
  console.log('Starting historical data seeding with real Yahoo Finance data...');

  const stocks = [
    'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK', 'HCLTECH',
    'WIPRO', 'AXISBANK', 'MARUTI', 'BAJAJFINSV'
  ];

  const indices = ['NIFTY50', 'BANKNIFTY', 'SENSEX'];

  const allInstruments = [...stocks, ...indices];

  for (const symbol of allInstruments) {
    console.log(`Seeding data for ${symbol}...`);

    // Try to fetch real historical data first
    let historicalData = await fetchYahooHistoricalData(symbol, 730); // 2 years

    // If no real data, fall back to mock data
    if (historicalData.length === 0) {
      console.log(`No real data available for ${symbol}, using mock data`);
      // Use approximate current prices for mock data
      const mockPrices = {
        'RELIANCE': 3200, 'TCS': 3800, 'INFY': 1850, 'HDFC': 1750,
        'ICICIBANK': 1200, 'HCLTECH': 1650, 'WIPRO': 650, 'AXISBANK': 1100,
        'MARUTI': 10500, 'BAJAJFINSV': 1650, 'NIFTY50': 20000,
        'BANKNIFTY': 45000, 'SENSEX': 70000
      };
      historicalData = generateMockHistoricalData(symbol, mockPrices[symbol] || 1000);
    }

    if (historicalData.length > 0) {
      // Insert in batches of 100 to avoid payload size limits
      const batchSize = 100;
      for (let i = 0; i < historicalData.length; i += batchSize) {
        const batch = historicalData.slice(i, i + batchSize);

        const { error } = await supabase
          .from('ohlc_data')
          .upsert(batch, {
            onConflict: 'symbol,exchange,period,timestamp'
          });

        if (error) {
          console.error(`Error seeding ${symbol}:`, error);
        } else {
          console.log(`Inserted ${batch.length} records for ${symbol}`);
        }
      }
    } else {
      console.log(`No data available for ${symbol}`);
    }
  }

  console.log('Historical data seeding completed!');
}

seedHistoricalData().catch(console.error);