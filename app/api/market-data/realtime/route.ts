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
          continue;
        }

        console.log(`[v0] Executed order ${order.id} for ${order.symbol} at ₹${executedPrice}`);

        // Create or update holdings based on order type
        if (order.order_type === 'BUY') {
          // Check if holding already exists
          const { data: existingHolding } = await supabase
            .from('holdings')
            .select('*')
            .eq('portfolio_id', order.portfolio_id)
            .eq('symbol', order.symbol)
            .eq('exchange', order.exchange)
            .single();

          if (existingHolding) {
            // Update existing holding - calculate new average price
            const totalQuantity = existingHolding.quantity + order.quantity;
            const totalValue = (existingHolding.quantity * existingHolding.avg_buy_price) + (order.quantity * executedPrice);
            const newAvgPrice = totalValue / totalQuantity;

            const { error: holdingError } = await supabase
              .from('holdings')
              .update({
                quantity: totalQuantity,
                avg_buy_price: newAvgPrice,
                current_price: executedPrice,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingHolding.id);

            if (holdingError) {
              console.error(`[v0] Error updating holding for ${order.symbol}:`, holdingError);
            } else {
              console.log(`[v0] Updated holding for ${order.symbol}: ${totalQuantity} shares @ ₹${newAvgPrice.toFixed(2)}`);
            }
          } else {
            // Create new holding
            const { error: holdingError } = await supabase
              .from('holdings')
              .insert({
                portfolio_id: order.portfolio_id,
                symbol: order.symbol,
                exchange: order.exchange,
                quantity: order.quantity,
                avg_buy_price: executedPrice,
                current_price: executedPrice
              });

            if (holdingError) {
              console.error(`[v0] Error creating holding for ${order.symbol}:`, holdingError);
            } else {
              console.log(`[v0] Created new holding for ${order.symbol}: ${order.quantity} shares @ ₹${executedPrice}`);
            }
          }
        } else if (order.order_type === 'SELL') {
          // For sell orders, reduce the holding quantity
          const { data: existingHolding } = await supabase
            .from('holdings')
            .select('*')
            .eq('portfolio_id', order.portfolio_id)
            .eq('symbol', order.symbol)
            .eq('exchange', order.exchange)
            .single();

          if (existingHolding) {
            const newQuantity = existingHolding.quantity - order.quantity;

            if (newQuantity <= 0) {
              // Remove holding if quantity becomes zero or negative
              const { error: deleteError } = await supabase
                .from('holdings')
                .delete()
                .eq('id', existingHolding.id);

              if (deleteError) {
                console.error(`[v0] Error deleting holding for ${order.symbol}:`, deleteError);
              } else {
                console.log(`[v0] Removed holding for ${order.symbol} (sold all shares)`);
              }
            } else {
              // Update holding quantity
              const { error: holdingError } = await supabase
                .from('holdings')
                .update({
                  quantity: newQuantity,
                  current_price: executedPrice,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingHolding.id);

              if (holdingError) {
                console.error(`[v0] Error updating holding for ${order.symbol}:`, holdingError);
              } else {
                console.log(`[v0] Updated holding for ${order.symbol}: ${newQuantity} shares remaining`);
              }
            }
          } else {
            console.error(`[v0] No holding found for ${order.symbol} to sell`);
          }
        }

        // Create trade record
        const { error: tradeError } = await supabase
          .from('trades')
          .insert({
            portfolio_id: order.portfolio_id,
            order_id: order.id,
            symbol: order.symbol,
            exchange: order.exchange,
            trade_type: order.order_type,
            quantity: order.quantity,
            price: executedPrice,
            total_value: order.quantity * executedPrice
          });

        if (tradeError) {
          console.error(`[v0] Error creating trade record for order ${order.id}:`, tradeError);
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
      console.log(`[v0] Alpha Vantage API key not configured for ${symbol}`);
      return null;
    }

    // Remove .NS suffix for Alpha Vantage (don't add it back)
    const cleanSymbol = symbol.replace('.NS', '');
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${cleanSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;

    console.log(`[v0] Making API call to: ${url.replace(ALPHA_VANTAGE_API_KEY, '***API_KEY***')}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'InvestIQ-App/1.0'
      }
    });

    if (!response.ok) {
      console.error(`[v0] Alpha Vantage API error for ${symbol}: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`[v0] Alpha Vantage response for ${symbol}:`, data);

    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      console.log(`[v0] Quote data for ${symbol}:`, quote);

      const currentPrice = parseFloat(quote['05. price'] || quote['08. previous close']);
      const previousClose = parseFloat(quote['08. previous close']);
      const open = parseFloat(quote['02. open'] || previousClose);
      const high = parseFloat(quote['03. high'] || currentPrice);
      const low = parseFloat(quote['04. low'] || currentPrice);
      const volume = parseInt(quote['06. volume'] || '0');

      if (isNaN(currentPrice) || currentPrice <= 0) {
        console.error(`[v0] Invalid price data for ${symbol}:`, quote);
        return null;
      }

      const result = {
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

      console.log(`[v0] Successfully processed quote for ${symbol}: ₹${currentPrice}`);
      return result;
    }

    console.log(`[v0] No 'Global Quote' data found for ${symbol}`);
    return null;
  } catch (error) {
    console.error(`[v0] Error fetching ${symbol} from Alpha Vantage:`, error instanceof Error ? error.message : error);
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

    console.log('[v0] Attempting to fetch real-time quotes from Alpha Vantage');

    // Try to fetch a few key stocks to test API availability (respecting rate limits)
    const keyStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFC']; // Only 4 calls to stay within limits
    const quotes = [];

    for (const symbol of keyStocks) {
      const quote = await fetchAlphaVantageQuote(symbol);
      if (quote) {
        quotes.push(quote);
      }
      // Small delay between calls
      if (keyStocks.indexOf(symbol) < keyStocks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`[v0] Successfully fetched ${quotes.length} real quotes from Alpha Vantage`);

    // Filter out null results
    const validQuotes = quotes.filter(quote => quote !== null);

    // Always generate comprehensive mock data for all stocks (hybrid approach)
    console.log(`[v0] Generating enhanced mock data for all stocks (${validQuotes.length} real quotes available)`);

    const allSymbols = [...INDIAN_STOCKS.map(s => s.replace('.NS', '')), 'NIFTY50', 'BANKNIFTY', 'SENSEX'];
    const prices = [];

    for (const symbol of allSymbols) {
      // Check if we have real data for this symbol
      const realQuote = validQuotes.find(q => q.symbol === symbol);

      if (realQuote) {
        // Use real data if available
        console.log(`[v0] Using real data for ${symbol}`);
        prices.push(realQuote);
      } else {
        // Generate enhanced mock data
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
    }

    console.log(`[v0] Prepared ${prices.length} price records (${validQuotes.length} real, ${prices.length - validQuotes.length} mock)`);

    console.log('[v0] Upserting prices to Supabase');
    const { error: priceError } = await supabase
      .from('stock_prices')
      .upsert(prices, { onConflict: 'symbol,exchange' });

    if (priceError) {
      console.error('[v0] Error storing prices:', priceError.message);
      return NextResponse.json(
        { error: 'Failed to store prices', details: priceError.message },
        { status: 500 }
      );
    }

    console.log('[v0] Real-time data stored successfully');

    return NextResponse.json({
      success: true,
      data: prices,
      message: `Real-time data stored (${validQuotes.length} real, ${prices.length - validQuotes.length} enhanced mock)`,
      count: prices.length,
      realCount: validQuotes.length,
      mockCount: prices.length - validQuotes.length,
      source: validQuotes.length > 0 ? 'hybrid' : 'mock'
    });
  } catch (error) {
    console.error('[v0] Realtime API error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

