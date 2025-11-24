'use client';

import { useRealtimePrices } from '@/hooks/use-realtime-prices';
import { useEffect, useState } from 'react';

interface QuoteDisplayProps {
  symbols?: string[];
  updateInterval?: number;
}

export function RealtimeQuotes({ symbols, updateInterval = 5000 }: QuoteDisplayProps) {
  const { prices, loading, error } = useRealtimePrices(symbols);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && Object.keys(prices).length > 0) {
      setLastUpdate(new Date());
    }
  }, [prices, loading]);

  // The hook handles all fetching and subscriptions

  if (loading && Object.keys(prices).length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Connecting to real-time data from Angel One...
      </div>
    );
  }

  if (error && Object.keys(prices).length === 0) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  const sortedPrices = Object.entries(prices)
    .filter(([_, data]) => data && data.price)
    .sort(([aSymbol], [bSymbol]) => aSymbol.localeCompare(bSymbol));

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        {sortedPrices.length} stocks • Last update: {lastUpdate?.toLocaleTimeString() || 'connecting...'}
      </div>
      {sortedPrices.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          Waiting for real-time data...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sortedPrices.map(([symbol, data]) => (
            <div
              key={symbol}
              className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary transition-colors"
            >
              <div className="space-y-1">
                <div className="font-semibold text-foreground">{symbol}</div>
                <div className="text-xs text-muted-foreground">
                  Vol: {data.volume ? (data.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-lg font-bold text-foreground">
                  ₹{data.price.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  B:{data.bid?.toFixed(2) || 'N/A'} | A:{data.ask?.toFixed(2) || 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
