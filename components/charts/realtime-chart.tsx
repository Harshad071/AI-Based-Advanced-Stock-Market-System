'use client';

import { LineChart, Line, CandlestickChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { generatePriceData, getRealtimePrice } from '@/lib/market-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RealtimeChartProps {
  symbol: string;
  basePrice: number;
  chartType?: 'line' | 'candlestick' | 'prediction';
}

export function RealtimeChart({ symbol, basePrice, chartType = 'line' }: RealtimeChartProps) {
  const [data, setData] = useState(generatePriceData(basePrice, 50));
  const [lastPrice, setLastPrice] = useState(basePrice);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastPrice(prev => {
        const newPrice = getRealtimePrice(basePrice, prev);
        setData(d => [
          ...d.slice(1),
          {
            time: new Date().toLocaleTimeString('en-IN'),
            price: newPrice,
            close: newPrice,
            high: newPrice * 1.001,
            low: newPrice * 0.999,
            open: d[d.length - 1]?.close || newPrice,
            volume: Math.floor(Math.random() * 5000000),
          }
        ]);
        return newPrice;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [basePrice]);

  const currentPrice = data[data.length - 1].price;
  const change = currentPrice - basePrice;
  const changePercent = (change / basePrice) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{symbol}</span>
          <span className={`text-2xl font-bold ${changePercent >= 0 ? 'gain' : 'loss'}`}>
            ₹{currentPrice.toFixed(2)}
          </span>
        </CardTitle>
        <p className={`text-sm ${changePercent >= 0 ? 'gain' : 'loss'}`}>
          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}% ({change >= 0 ? '+' : ''}₹{change.toFixed(2)})
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" />
            <YAxis domain={['dataMin - 100', 'dataMax + 100']} />
            <Tooltip 
              formatter={(value) => `₹${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none' }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
