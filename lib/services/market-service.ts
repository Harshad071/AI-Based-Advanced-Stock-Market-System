import { createClient } from '@/lib/supabase/client';
import { initializeAngelOneClient } from '@/lib/angel-one-client';

const INDIAN_STOCKS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK', 'WIPRO', 'AXISBANK',
  'MARUTI', 'SUNPHARMA', 'LT', 'BAJAJFINSV', 'ITC', 'HCLTECH', 'SBIN',
  'ASIANPAINT', 'DMARUTI', 'TECHM', 'BAJAJ-AUTO', 'BHARTIARTL', 'ULTRACEMCO'
];

const INDICES_LIST = ['NIFTY50', 'BANKNIFTY', 'SENSEX'];

export async function fetchRealTimeQuotes() {
  try {
    const response = await fetch('/api/market-data/realtime', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('[v0] Failed to fetch real-time quotes');
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('[v0] Error fetching quotes:', error);
    return null;
  }
}

export async function getStockPricesFromSupabase(symbols?: string[]) {
  try {
    const supabase = createClient();
    
    let query = supabase
      .from('stock_prices')
      .select('*')
      .order('updated_at', { ascending: false });

    if (symbols && symbols.length > 0) {
      query = query.in('symbol', symbols);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('[v0] Error fetching from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[v0] Error getting stock prices:', error);
    return [];
  }
}

export async function getIndicesFromSupabase() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('indices')
      .select('*')
      .in('symbol', INDICES_LIST);

    if (error) {
      console.error('[v0] Error fetching indices:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[v0] Error getting indices:', error);
    return [];
  }
}

export async function getTopGainersRealtime(limit = 5) {
  try {
    const prices = await getStockPricesFromSupabase(INDIAN_STOCKS);
    
    return prices
      .map(p => ({
        ...p,
        change: ((p.price - 0) / 100) * 100, // Will be calculated properly with historical data
      }))
      .sort((a, b) => (b.change || 0) - (a.change || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('[v0] Error getting top gainers:', error);
    return [];
  }
}

export async function getTopLosersRealtime(limit = 5) {
  try {
    const prices = await getStockPricesFromSupabase(INDIAN_STOCKS);
    
    return prices
      .map(p => ({
        ...p,
        change: ((p.price - 0) / 100) * 100,
      }))
      .sort((a, b) => (a.change || 0) - (b.change || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('[v0] Error getting top losers:', error);
    return [];
  }
}
