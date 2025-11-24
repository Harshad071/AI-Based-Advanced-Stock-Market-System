'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useCallback } from 'react';

interface PriceData {
  symbol: string;
  exchange: string;
  price: number;
  bid: number;
  ask: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  name: string;
  timestamp: string;
}

export function useRealtimePrices(symbols?: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchPrices = async () => {
      try {
        console.log('[v0] Starting fetchPrices for symbols:', symbols);

        // First try to fetch real-time data from the real-time API
        console.log('[v0] Making fetch request to /api/market-data/realtime');
        const realtimeResponse = await fetch('/api/market-data/realtime', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        let priceMap: Record<string, PriceData> = {};

        if (realtimeResponse.ok) {
          const realtimeData = await realtimeResponse.json();
          console.log('[v0] Real-time API response received:', realtimeData.success);

          if (realtimeData.success && realtimeData.data) {
            // Process real-time data
            realtimeData.data.forEach((stock: any) => {
              if (!symbols || symbols.length === 0 || symbols.includes(stock.symbol)) {
                priceMap[stock.symbol] = {
                  symbol: stock.symbol,
                  exchange: stock.exchange,
                  price: stock.price,
                  bid: stock.bid,
                  ask: stock.ask,
                  open: stock.open,
                  high: stock.high,
                  low: stock.low,
                  close: stock.close,
                  volume: stock.volume,
                  name: stock.name,
                  timestamp: stock.timestamp
                };
                console.log('[v0] Added real-time stock:', stock.symbol, stock.price);
              }
            });
          }
        }

        // If no real-time data, fall back to database data
        if (Object.keys(priceMap).length === 0) {
          console.log('[v0] No real-time data, falling back to database');
          const response = await fetch('/api/debug/market-data');

          if (response.ok) {
            const debugData = await response.json();
            console.log('[v0] Debug API response received:', debugData.success);

            if (debugData.success) {
              // Add stocks data
              const stocks = debugData.data.stocks.sample || [];
              console.log('[v0] Processing', stocks.length, 'stocks from DB');
              stocks.forEach((stock: any) => {
                if (!symbols || symbols.length === 0 || symbols.includes(stock.symbol)) {
                  priceMap[stock.symbol] = stock;
                  console.log('[v0] Added DB stock:', stock.symbol, stock.price);
                }
              });

              // Add indices data
              const indices = debugData.data.indices.sample || [];
              console.log('[v0] Processing', indices.length, 'indices from DB');
              indices.forEach((index: any) => {
                if (!symbols || symbols.length === 0 || symbols.includes(index.symbol)) {
                  priceMap[index.symbol] = index;
                  console.log('[v0] Added DB index:', index.symbol, index.price);
                }
              });
            }
          }
        }

        console.log('[v0] Final priceMap keys:', Object.keys(priceMap));
        setPrices(priceMap);
        setError(null);
        console.log('[v0] Successfully set prices');
      } catch (err) {
        console.error('[v0] Error in fetchPrices:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch prices');
        setPrices({}); // Clear any existing data on error
      } finally {
        console.log('[v0] Setting loading to false');
        setLoading(false);
      }
    };

    fetchPrices();

    // Set up polling for updates
    const interval = setInterval(() => {
      fetchPrices();
    }, 30000); // Poll every 30 seconds

    return () => {
      console.log('[v0] Clearing price update interval');
      clearInterval(interval);
    };
  }, [symbols]);

  return { prices, loading, error };
}
