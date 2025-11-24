'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PriceLineChart } from '@/components/charts/line-chart'
import { CandlestickChart } from '@/components/charts/candlestick-chart'
import { AIPredictionChart } from '@/components/charts/ai-prediction'
import { INDICES, generatePriceData, getTechnicalIndicators } from '@/lib/market-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState, useEffect, useMemo } from 'react'
import { useRealtimePrices } from '@/hooks/use-realtime-prices'
import { useParams } from 'next/navigation'

export default function IndexPage() {
  const params = useParams()
  const symbol = params.symbol as string
  const index = INDICES.find(i => i.symbol === symbol)
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'ai'>('line')
  const [timeframe, setTimeframe] = useState<'1min' | '5min' | '15min' | '1h' | '1d'>('15min')
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [priceLoaded, setPriceLoaded] = useState(false)
  const { prices, loading: priceLoading } = useRealtimePrices([symbol])
  const liveData = prices[symbol]

  // Set price as loaded once we have data
  useEffect(() => {
    if (!priceLoading && liveData) {
      setPriceLoaded(true)
    }
  }, [priceLoading, liveData])

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/market-data/historical?symbol=${symbol}&period=${timeframe}&limit=100`)
        if (response.ok) {
          const data = await response.json()
          setHistoricalData(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch historical data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (symbol) {
      fetchHistoricalData()
    }
  }, [symbol, timeframe])

  if (!index) {
    return <div className="ml-64 p-8">Index not found</div>
  }

  // Generate historical data once and store it
  const historicalChartData = useMemo(() => {
    if (historicalData.length > 0) {
      return historicalData.map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        price: item.close || item.price,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close || item.price,
        volume: item.volume
      }))
    } else {
      return generatePriceData(index.basePrice, 99) // Generate 99 points, we'll add current separately
    }
  }, [historicalData, index.basePrice])

  // Combine historical data with live current price
  const chartData = useMemo(() => {
    const data = [...historicalChartData]
    if (liveData?.price && data.length > 0) {
      // Update the last data point with live price to ensure consistency
      const lastIndex = data.length - 1
      const lastPoint = data[lastIndex]
      
      // Only update if the live price is more recent or we want to force the latest price
      data[lastIndex] = {
        ...lastPoint,
        price: liveData.price,
        close: liveData.price,
        // Update high/low for the current candle/point
        high: Math.max(lastPoint.high || 0, liveData.price),
        low: Math.min(lastPoint.low || liveData.price, liveData.price),
      }
    }
    return data
  }, [historicalChartData, liveData?.price])

  const indicators = getTechnicalIndicators(chartData)

  const candleData = Array.from({ length: 20 }).map((_, i) => {
    const start = i * 5
    const segment = chartData.slice(start, start + 5)
    return {
      time: segment[0]?.time || '',
      open: segment[0]?.open || segment[0]?.price || 0,
      high: segment[0]?.high || Math.max(...segment.map(p => p.price || p.close || 0)),
      low: segment[0]?.low || Math.min(...segment.map(p => p.price || p.close || 0)),
      close: segment[segment.length - 1]?.close || segment[segment.length - 1]?.price || 0,
    }
  })

  const aiData = chartData.map((point, i) => ({
    time: point.time,
    actual: point.close || point.price,
    predicted: (point.close || point.price) + (Math.random() - 0.5) * 100,
    upper: (point.close || point.price) + 200,
    lower: (point.close || point.price) - 200,
  }))

  const currentPrice = liveData?.price || (chartData.length > 0 ? (chartData[chartData.length - 1].close || chartData[chartData.length - 1].price) : index.basePrice)
  const change = liveData && liveData.open ? currentPrice - liveData.open : currentPrice - index.basePrice
  const changePercent = liveData && liveData.open ? (change / liveData.open) * 100 : (change / index.basePrice) * 100

  // Market depth data
  const bidAsk = Array.from({ length: 5 }).map((_, i) => ({
    level: i + 1,
    bid: 20000 - i * 50,
    bidQty: Math.floor(Math.random() * 10000),
    ask: 20000 + (i + 1) * 50,
    askQty: Math.floor(Math.random() * 10000),
  }))

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{index.name}</h1>
          <p className="text-muted-foreground mb-4">{index.description}</p>
          <div className="flex items-center gap-4">
            {priceLoaded ? (
              <>
                <p className="text-3xl font-bold text-foreground">₹{currentPrice.toFixed(0)}</p>
                <p className={`text-lg font-semibold ${changePercent >= 0 ? 'gain' : 'loss'}`}>
                  {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}% ({change >= 0 ? '+' : ''}₹{change.toFixed(0)})
                </p>
              </>
            ) : (
              <>
                <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 space-y-4">
            {/* Chart Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Chart Type & Timeframe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {(['line', 'candlestick', 'ai'] as const).map(type => (
                    <Button
                      key={type}
                      variant={chartType === type ? 'default' : 'outline'}
                      onClick={() => setChartType(type)}
                      className="capitalize text-sm"
                    >
                      {type === 'candlestick' ? 'Candlestick' : type === 'ai' ? 'AI Prediction' : 'Line'}
                    </Button>
                  ))}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 text-foreground">Timeframe</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['1min', '5min', '15min', '1h', '1d'] as const).map(tf => (
                      <Button
                        key={tf}
                        variant={timeframe === tf ? 'default' : 'outline'}
                        onClick={() => setTimeframe(tf)}
                        size="sm"
                        className="text-xs"
                      >
                        {tf}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card className="chart-container">
              <CardContent className="pt-6">
                {chartType === 'line' && <PriceLineChart data={chartData} color="hsl(var(--primary))" height={400} />}
                {chartType === 'candlestick' && <CandlestickChart data={candleData} height={400} />}
                {chartType === 'ai' && <AIPredictionChart data={aiData} symbol={symbol} currentPrice={currentPrice} height={400} />}
              </CardContent>
            </Card>

            {/* Technical Indicators */}
            {indicators && (
              <Card>
                <CardHeader>
                  <CardTitle>Technical Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">SMA 20</p>
                      <p className="text-lg font-bold text-foreground">₹{indicators.sma20.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SMA 50</p>
                      <p className="text-lg font-bold text-foreground">₹{indicators.sma50.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">RSI (14)</p>
                      <p className={`text-lg font-bold ${indicators.rsi > 70 ? 'loss' : indicators.rsi < 30 ? 'gain' : ''}`}>
                        {indicators.rsi.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">MACD</p>
                      <p className="text-lg font-bold">{indicators.macd.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Signal</p>
                      <p className="text-lg font-bold gain">{indicators.signal}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Market Depth & Stats */}
          <div className="space-y-4">
            {/* Index Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Index Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open</span>
                  <span className="font-semibold">₹{(liveData?.open || index.basePrice).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High</span>
                  <span className="font-semibold">₹{(liveData?.high || Math.max(...chartData.map(p => p.high || p.price || p.close || 0))).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low</span>
                  <span className="font-semibold">₹{(liveData?.low || Math.min(...chartData.map(p => p.low || p.price || p.close || 0))).toFixed(0)}</span>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-2">
                  <span className="text-muted-foreground">Close</span>
                  <span className="font-semibold">₹{currentPrice.toFixed(0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Market Depth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Market Depth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                  {bidAsk.map((level) => (
                    <div key={level.level} className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-green-500">{level.bidQty} @ ₹{level.bid}</p>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-xs text-red-500">₹{level.ask} @ {level.askQty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
