'use client'

import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Brush } from 'recharts'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2 } from 'lucide-react'

interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
}

interface CandlestickChartProps {
  data: CandleData[]
  height?: number
}

export function CandlestickChart({ data, height = 400 }: CandlestickChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const CustomCandlestick = (props: any) => {
    const { x, y, width, height: barHeight, payload } = props
    if (!payload) return null

    const { open, high, low, close } = payload
    const yScale = (value: number) => {
      const minPrice = Math.min(...data.map(d => d.low))
      const maxPrice = Math.max(...data.map(d => d.high))
      return y + barHeight - (((value - minPrice) / (maxPrice - minPrice)) * barHeight)
    }

    const wickX = x + width / 2
    const bodyWidth = width * 0.6

    return (
      <g>
        {/* Wick */}
        <line x1={wickX} y1={yScale(high)} x2={wickX} y2={yScale(low)} stroke={close >= open ? '#22c55e' : '#ef4444'} strokeWidth={2} />
        {/* Body */}
        <rect
          x={x + width * 0.2}
          y={yScale(Math.max(open, close))}
          width={bodyWidth}
          height={Math.abs(yScale(open) - yScale(close)) || 2}
          fill={close >= open ? '#22c55e' : '#ef4444'}
          stroke={close >= open ? '#22c55e' : '#ef4444'}
          strokeWidth={2}
          rx={1}
        />
      </g>
    )
  }

  const chartContent = (
    <ComposedChart
      data={data}
      margin={{ top: 20, right: 60, left: 40, bottom: 20 }}
      style={{ backgroundColor: '#000000ff' }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis
        dataKey="time"
        stroke="#868c9aff"
        style={{ fontSize: isFullscreen ? '14px' : '12px' }}
        tick={{ fill: '#cab5b5ff' }}
      />
      <YAxis
        stroke="#6b7280"
        style={{ fontSize: isFullscreen ? '14px' : '12px' }}
        tick={{ fill: '#ccb9b9ff' }}
        domain={['auto', 'auto']}
        tickFormatter={(value) => `₹${value.toFixed(0)}`}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: '#000000ff',
          border: '1px solid #374151',
          borderRadius: '8px',
          color: '#f9fafb',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          fontSize: isFullscreen ? '14px' : '12px',
        }}
        content={({ payload }) => {
          if (payload && payload[0]) {
            const data = payload[0].payload
            return (
              <div className="p-3 bg-popover border border-border rounded text-popover-foreground">
                <p className="font-semibold mb-1">Candle Data</p>
                <p>Open: ₹{data.open.toFixed(2)}</p>
                <p>High: ₹{data.high.toFixed(2)}</p>
                <p>Low: ₹{data.low.toFixed(2)}</p>
                <p>Close: ₹{data.close.toFixed(2)}</p>
              </div>
            )
          }
          return null
        }}
      />
      <Bar dataKey="close" shape={<CustomCandlestick />} isAnimationActive={false} />
      <Brush
        dataKey="time"
        height={30}
        stroke="#6b7280"
        fill="#1f2937"
        tickFormatter={() => ''}
      />
    </ComposedChart>
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
              <h3 className="text-xl font-semibold">Candlestick Chart - Fullscreen View</h3>
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
