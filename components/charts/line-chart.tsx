'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from 'recharts'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2 } from 'lucide-react'

interface LineChartProps {
  data: Array<{ time: string; price: number }>
  color?: string
  height?: number
}

export function PriceLineChart({ data, color = '#3b82f6', height = 400 }: LineChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  // Ensure data is properly formatted
  const chartData = data.map(item => ({
    ...item,
    price: Number(item.price) || 0
  }));

  const chartContent = (
    <AreaChart
      data={chartData}
      margin={{ top: 20, right: 60, left: 40, bottom: 20 }}
      style={{ backgroundColor: '#dbeafe' }}
    >
      <defs>
        <linearGradient id={`colorPrice${isFullscreen ? 'Full' : ''}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.9}/>
          <stop offset="50%" stopColor={color} stopOpacity={0.6}/>
          <stop offset="95%" stopColor={color} stopOpacity={0.2}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
      <XAxis
        dataKey="time"
        stroke="#6b7280"
        style={{ fontSize: isFullscreen ? '14px' : '12px' }}
        tick={{ fill: '#9ca3af' }}
      />
      <YAxis
        stroke="#6b7280"
        style={{ fontSize: isFullscreen ? '14px' : '12px' }}
        tick={{ fill: '#9ca3af' }}
        domain={['auto', 'auto']}
        tickFormatter={(value) => `₹${value.toFixed(0)}`}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          color: '#f9fafb',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          fontSize: isFullscreen ? '14px' : '12px',
        }}
        formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Price']}
        labelStyle={{ color: '#f9fafb', fontWeight: 'bold' }}
      />
      <Area
        type="monotone"
        dataKey="price"
        stroke={color}
        strokeWidth={isFullscreen ? 6 : 4}
        fill={`url(#colorPrice${isFullscreen ? 'Full' : ''})`}
        isAnimationActive={true}
        animationDuration={1000}
      />
      <Brush
        dataKey="time"
        height={30}
        stroke={color}
        fill="#1f2937"
        tickFormatter={() => ''}
      />
    </AreaChart>
  );

  return (
    <>
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={height}>
          {chartContent}
        </ResponsiveContainer>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="w-full h-full max-w-7xl max-h-[90vh] bg-card rounded-lg border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Price Chart - Fullscreen View</h3>
              <Button
                variant="outline"
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-2"
              >
                <Minimize2 className="h-4 w-4" />
                Exit Fullscreen
              </Button>
            </div>
            <div className="w-full h-[calc(100%-80px)]">
              <ResponsiveContainer width="100%" height="100%">
                {chartContent}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
