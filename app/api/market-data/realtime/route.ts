import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { generateRealtimePrice, isMarketOpen } from '@/lib/market-data';

// Function to execute pending orders during market hours
async function executePendingOrders() {
  if (!isMarketOpen()) return;

  try {
    const supabase = createAdminClient();

    // Get all pending orders
    const { data: pendingOrders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'PENDING');

    if (fetchError) {
      console.error('[v0] Error fetching pending orders:', fetchError);
      return;
    }

    if (!pendingOrders || pendingOrders.length === 0) return;

    console.log(`[v0] Found ${pendingOrders.length} pending orders to execute`);

    // Execute each pending order
    for (const order of pendingOrders) {
      try {
        // Get current price for the symbol
        const currentPrice = generateRealtimePrice(order.symbol);
        if (!currentPrice) {
          console.error(`[v0] Could not get price for ${order.symbol}`);
          continue;
        }

        // For demo purposes, execute at current market price
        // In real implementation, this would check if order price matches market conditions
        const executedPrice = currentPrice.price;

        // Update order status to EXECUTED
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'EXECUTED',
            executed_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (updateError) {
          console.error(`[v0] Error executing order ${order.id}:`, updateError);
        } else {
          console.log(`[v0] Executed order ${order.id} for ${order.symbol} at ₹${executedPrice}`);
        }
      } catch (orderError) {
        console.error(`[v0] Error processing order ${order.id}:`, orderError);
      }
    }
  } catch (error) {
    console.error('[v0] Error in executePendingOrders:', error);
  }
}

const INDIAN_STOCKS = [
  'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFC.NS', 'ICICIBANK.NS', 'WIPRO.NS', 'AXISBANK.NS',
  'MARUTI.NS', 'SUNPHARMA.NS', 'LT.NS', 'BAJAJFINSV.NS', 'ITC.NS', 'HCLTECH.NS', 'SBIN.NS',
  'ASIANPAINT.NS', 'TECHM.NS', 'BAJAJ-AUTO.NS', 'BHARTIARTL.NS', 'ULTRACEMCO.NS'
];

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;


async function fetchAlphaVantageQuote(symbol: string) {
  try {
    console.log(`[v0] Fetching real-time quote for ${symbol} from Alpha Vantage`);

    const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API key not configured');
    }

    // Remove .NS suffix for Alpha Vantage
    const cleanSymbol = symbol.replace('.NS', '');
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${cleanSymbol}.NS&apikey=${ALPHA_VANTAGE_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      const currentPrice = parseFloat(quote['05. price'] || quote['08. previous close']);
      const previousClose = parseFloat(quote['08. previous close']);
      const open = parseFloat(quote['02. open'] || previousClose);
      const high = parseFloat(quote['03. high'] || currentPrice);
      const low = parseFloat(quote['04. low'] || currentPrice);
      const volume = parseInt(quote['06. volume'] || '0');

      return {
        symbol: cleanSymbol,
        exchange: 'NSE',
        name: cleanSymbol,
        price: currentPrice,
        open: open,
        high: high,
        low: low,
        close: previousClose,
        volume: volume,
        bid: currentPrice * 0.999,
        ask: currentPrice * 1.001,
        bid_qty: Math.floor(Math.random() * 1000) + 100,
        ask_qty: Math.floor(Math.random() * 1000) + 100,
        timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching ${symbol} from Alpha Vantage:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] GET /api/market-data/realtime - fetching real-time data from Alpha Vantage');

    // Check if market is open
    const marketOpen = isMarketOpen();
    console.log(`[v0] Market status: ${marketOpen ? 'OPEN' : 'CLOSED'}`);

    // Execute any pending orders if market is open
    await executePendingOrders();

    const supabase = createAdminClient();

    console.log('[v0] Fetching real-time quotes from Yahoo Finance');

    // Fetch real-time quotes for all stocks
    const quotePromises = INDIAN_STOCKS.map(symbol => fetchAlphaVantageQuote(symbol));
    const quotes = await Promise.all(quotePromises);

    // Filter out null results
    const validQuotes = quotes.filter(quote => quote !== null);

    if (validQuotes.length === 0) {
      console.log('[v0] No real data available, falling back to mock data');
      // Fallback to mock data if Yahoo Finance fails
      const allSymbols = [...INDIAN_STOCKS.map(s => s.replace('.NS', '')), 'NIFTY50', 'BANKNIFTY', 'SENSEX'];
      const prices = [];

      for (const symbol of allSymbols) {
        const priceData = generateRealtimePrice(symbol);
        if (priceData) {
          const dbFields = {
            symbol: priceData.symbol,
            exchange: priceData.exchange,
            name: priceData.name,
            price: priceData.price,
            open: priceData.open,
            high: priceData.high,
            low: priceData.low,
            close: priceData.close,
            volume: priceData.volume,
            bid: priceData.bid,
            ask: priceData.ask,
            bid_qty: priceData.bid_qty,
            ask_qty: priceData.ask_qty,
            timestamp: priceData.timestamp,
            updated_at: priceData.updated_at,
          };
          prices.push(dbFields);
        }
      }

      console.log('[v0] Generated', prices.length, 'mock real-time prices');

      console.log('[v0] Upserting', prices.length, 'prices to Supabase');
      const { error: priceError } = await supabase
        .from('stock_prices')
        .upsert(prices, { onConflict: 'symbol,exchange' });

      if (priceError) {
        console.error('[v0] Error storing prices in realtime endpoint:', priceError.message);
        return NextResponse.json(
          { error: 'Failed to store prices', details: priceError.message },
          { status: 500 }
        );
      }

      console.log('[v0] Mock real-time data stored successfully');

      return NextResponse.json({
        success: true,
        data: prices,
        message: 'Mock real-time data generated and stored (Yahoo Finance unavailable)',
        count: prices.length,
        source: 'mock'
      });
    }

    console.log('[v0] Received', validQuotes.length, 'real-time quotes from Yahoo Finance');

    console.log('[v0] Upserting', validQuotes.length, 'prices to Supabase');
    const { error: priceError } = await supabase
      .from('stock_prices')
      .upsert(validQuotes, { onConflict: 'symbol,exchange' });

    if (priceError) {
      console.error('[v0] Error storing prices in realtime endpoint:', priceError.message);
      return NextResponse.json(
        { error: 'Failed to store prices', details: priceError.message },
        { status: 500 }
      );
    }

    console.log('[v0] Real-time data stored successfully');

    return NextResponse.json({
      success: true,
      data: validQuotes,
      message: 'Real-time data fetched from Yahoo Finance and stored',
      count: validQuotes.length,
      source: 'yahoo'
    });
  } catch (error) {
    console.error('[v0] Realtime API error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

