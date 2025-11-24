'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIAssistant } from '@/components/ai/ai-assistant';
import { MarketStatus } from '@/components/market/market-status';
import { RealtimeQuotes } from '@/components/market/realtime-quotes';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const INDIAN_STOCKS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK', 'WIPRO', 'AXISBANK',
  'MARUTI', 'SUNPHARMA', 'LT', 'BAJAJFINSV', 'ITC', 'HCLTECH', 'SBIN',
  'ASIANPAINT', 'DMARUTI', 'TECHM', 'BAJAJ-AUTO', 'BHARTIARTL', 'ULTRACEMCO'
];

const INDICES_SYMBOLS = ['NIFTY50', 'BANKNIFTY', 'SENSEX'];

export default function Home() {
  const [showAI, setShowAI] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [stockPrices, setStockPrices] = useState<any>({});
  const [indicesPrices, setIndicesPrices] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        console.log('[v0] Fetching market data from debug API');
        const response = await fetch('/api/debug/market-data');
        const data = await response.json();

        if (data.success) {
          // Set stock prices
          const stocksMap: any = {};
          data.data.stocks.sample?.forEach((stock: any) => {
            stocksMap[stock.symbol] = stock;
          });
          setStockPrices(stocksMap);

          // Set indices prices
          const indicesMap: any = {};
          data.data.indices.sample?.forEach((index: any) => {
            indicesMap[index.symbol] = index;
          });
          setIndicesPrices(indicesMap);

          console.log('[v0] Market data loaded successfully');
        }
      } catch (error) {
        console.error('[v0] Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const topGainers = Object.values(stockPrices)
    .filter((p: any) => p && p.price && p.open)
    .sort((a: any, b: any) => {
      const changeA = ((a.price - a.open) / a.open) * 100;
      const changeB = ((b.price - b.open) / b.open) * 100;
      return changeB - changeA;
    })
    .slice(0, 5);

  const topLosers = Object.values(stockPrices)
    .filter((p: any) => p && p.price && p.open)
    .sort((a: any, b: any) => {
      const changeA = ((a.price - a.open) / a.open) * 100;
      const changeB = ((b.price - b.open) / b.open) * 100;
      return changeA - changeB;
    })
    .slice(0, 5);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        {/* Header with Market Status */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">InvestIQ</h1>
            <div className="flex items-center gap-4">
              <MarketStatus />
              <button
                onClick={() => setShowAI(!showAI)}
                className="text-sm px-3 py-1 rounded bg-primary text-primary-foreground hover:opacity-90"
              >
                {showAI ? 'Hide' : 'Show'} AI Assistant
              </button>
              <span className={`text-xs ${isRefreshing ? 'text-yellow-600' : 'text-green-600'}`}>
                {isRefreshing ? 'Fetching from Angel One...' : `Last update: ${lastRefresh?.toLocaleTimeString() || 'loading'}`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Indices Grid */}
            <div>
              <h2 className="text-xl font-bold mb-4">Market Indices</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INDICES_SYMBOLS.map(symbol => {
                  const data = indicesPrices[symbol];
                  const change = data && data.open ? data.price - data.open : 0;
                  const changePercent = data && data.open ? (change / data.open) * 100 : 0;

                  return (
                    <Link key={symbol} href={`/indices/${symbol}`}>
                      <Card className="cursor-pointer hover:border-primary transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{data?.name || symbol}</CardTitle>
                          <p className="text-xs text-muted-foreground">{symbol}</p>
                        </CardHeader>
                        <CardContent>
                          {loading ? (
                            <p className="text-muted-foreground">Loading...</p>
                          ) : data && data.price ? (
                            <>
                              <p className="text-2xl font-bold text-foreground mb-2">
                                ₹{data.price.toFixed(2)}
                              </p>
                              <p className={`text-sm font-semibold ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                              </p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">No data</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Real-time Quotes */}
            <div>
              <h2 className="text-xl font-bold mb-4">Real-time Stock Quotes</h2>
              <RealtimeQuotes symbols={INDIAN_STOCKS} updateInterval={5000} />
            </div>

            {/* Top Gainers and Losers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Top Gainers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-green-600 text-xl">📈</span>
                    Top Gainers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loading ? (
                      <p className="text-muted-foreground">Loading...</p>
                    ) : topGainers.length > 0 ? (
                      topGainers.map((stock: any) => {
                        const change = ((stock.price - stock.open) / stock.open) * 100;
                        return (
                          <Link key={stock.symbol} href={`/stocks/${stock.symbol}`}>
                            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card transition-colors cursor-pointer">
                              <div>
                                <p className="font-semibold text-foreground">{stock.symbol}</p>
                                <p className="text-xs text-muted-foreground">{stock.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-foreground">₹{stock.price.toFixed(2)}</p>
                                <p className="text-green-600 text-sm font-semibold">+{change.toFixed(2)}%</p>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground">No data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Losers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-red-600 text-xl">📉</span>
                    Top Losers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loading ? (
                      <p className="text-muted-foreground">Loading...</p>
                    ) : topLosers.length > 0 ? (
                      topLosers.map((stock: any) => {
                        const change = ((stock.price - stock.open) / stock.open) * 100;
                        return (
                          <Link key={stock.symbol} href={`/stocks/${stock.symbol}`}>
                            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card transition-colors cursor-pointer">
                              <div>
                                <p className="font-semibold text-foreground">{stock.symbol}</p>
                                <p className="text-xs text-muted-foreground">{stock.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-foreground">₹{stock.price.toFixed(2)}</p>
                                <p className="text-red-600 text-sm font-semibold">{change.toFixed(2)}%</p>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground">No data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          {showAI && (
            <div className="lg:col-span-1 h-fit sticky top-8">
              <AIAssistant />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
