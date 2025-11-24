'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PriceLineChart } from '@/components/charts/line-chart'
import { CandlestickChart } from '@/components/charts/candlestick-chart'
import { AIPredictionChart } from '@/components/charts/ai-prediction'
import { TOP_STOCKS, generatePriceData, getTechnicalIndicators } from '@/lib/market-data'
import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useRealtimePrices } from '@/hooks/use-realtime-prices'

export default function StockDetailPage() {
  const params = useParams()
  const symbol = params.symbol as string
  const stock = TOP_STOCKS.find(s => s.symbol === symbol)
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'ai'>('line')
  const [timeframe, setTimeframe] = useState<'1min' | '5min' | '15min' | '1h' | '1d'>('15min')
  const [quantity, setQuantity] = useState(1)
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY')
  const [isEditing, setIsEditing] = useState(false)
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Get real-time price data
  const { prices: realtimePrices, loading: realtimeLoading } = useRealtimePrices([symbol])

  // Get current price from real-time data or fallback to stock data
  const realtimePrice = realtimePrices[symbol]
  const currentPrice = realtimePrice?.price || stock?.basePrice || 0
  const change = (realtimePrice as any)?.change || 0
  const changePercent = (realtimePrice as any)?.change_percent || 0

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

  if (!stock) {
    return <div className="ml-64 p-8">Stock not found</div>
  }

  // Use historical data if available, otherwise generate mock data
  const priceData = useMemo(() => {
    return historicalData.length > 0
      ? historicalData.map(item => ({
          time: item.time,
          price: item.close,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        }))
      : generatePriceData(stock.basePrice, 100)
  }, [historicalData, stock.basePrice])

  // Calculate indicators and OHLC data only on client side to avoid hydration mismatch
  const [indicators, setIndicators] = useState<any>(null)
  const [ohlcData, setOhlcData] = useState({
    open: 0,
    high: 0,
    low: 0,
    close: 0
  })
  const [volume, setVolume] = useState(0)

  useEffect(() => {
    if (priceData.length > 0) {
      setIndicators(getTechnicalIndicators(priceData))

      // Calculate OHLC data on client side
      const highs = priceData.map(p => p.high || p.price)
      const lows = priceData.map(p => p.low || p.price)

      setOhlcData({
        open: priceData[0]?.open || priceData[0]?.price || 0,
        high: Math.max(...highs),
        low: Math.min(...lows),
        close: priceData[priceData.length - 1]?.close || priceData[priceData.length - 1]?.price || 0
      })

      // Calculate volume on client side
      setVolume(Math.floor(Math.random() * 5000000))
    }
  }, [priceData])

  const candleData = historicalData.length > 0
    ? historicalData.slice(-20).map((item, i) => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }))
    : Array.from({ length: 20 }).map((_, i) => {
        const start = i * 5
        const segment = priceData.slice(start, start + 5)
        return {
          time: segment[0]?.time || '',
          open: segment[0]?.price || 0,
          high: Math.max(...segment.map(p => p.price || 0)),
          low: Math.min(...segment.map(p => p.price || 0)),
          close: segment[segment.length - 1]?.price || 0,
        }
      })

  const aiData = priceData.map((point) => ({
    time: point.time,
    actual: point.price,
    predicted: point.price + (Math.random() - 0.5) * 100,
    upper: point.price + 200,
    lower: point.price - 200,
  }))

  const totalValue = quantity * currentPrice

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{stock.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <p className="text-3xl font-bold text-foreground">₹{currentPrice.toFixed(2)}</p>
            <p className={`text-lg font-semibold ${changePercent >= 0 ? 'gain' : 'loss'}`}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}% ({change >= 0 ? '+' : ''}₹{change.toFixed(2)})
            </p>
          </div>
          <p className="text-muted-foreground">{stock.sector}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Chart Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Chart Analysis</CardTitle>
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
                      {type === 'candlestick' ? 'Candlestick' : type === 'ai' ? 'AI Prediction' : 'Line Chart'}
                    </Button>
                  ))}
                </div>

                {/* Time Frame Selection */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Time Frame</p>
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
                {chartType === 'line' && <PriceLineChart data={priceData} color="hsl(var(--primary))" height={400} />}
                {chartType === 'candlestick' && <CandlestickChart data={candleData} height={400} />}
                {chartType === 'ai' && <AIPredictionChart data={aiData} symbol={symbol} currentPrice={currentPrice} height={400} />}
              </CardContent>
            </Card>

            {/* Technical Indicators */}
            {indicators && (
              <Card>
                <CardHeader>
                  <CardTitle>Technical Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">SMA 20</p>
                      <p className="text-lg font-bold text-foreground">₹{indicators.sma20.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SMA 50</p>
                      <p className="text-lg font-bold text-foreground">₹{indicators.sma50.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">RSI (14)</p>
                      <p className={`text-lg font-bold ${indicators.rsi > 70 ? 'loss' : indicators.rsi < 30 ? 'gain' : ''}`}>
                        {indicators.rsi.toFixed(2)}
                      </p>
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

          {/* Trading Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Trade {stock.symbol}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Type Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={orderType === 'BUY' ? 'default' : 'outline'}
                  onClick={() => setOrderType('BUY')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Buy
                </Button>
                <Button
                  variant={orderType === 'SELL' ? 'default' : 'outline'}
                  onClick={() => setOrderType('SELL')}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Sell
                </Button>
              </div>

              {/* Quantity Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-foreground">Quantity</label>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Done
                  </button>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-card/50 p-3 rounded space-y-2 border border-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="text-foreground font-semibold">₹{currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Qty:</span>
                  <span className="text-foreground font-semibold">{quantity}</span>
                </div>
                <div className="border-t border-border/50 pt-2 flex justify-between">
                  <span className="text-foreground font-semibold">Total:</span>
                  <span className="text-lg font-bold text-foreground">₹{totalValue.toFixed(2)}</span>
                </div>
              </div>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-3 border-t border-border/50 pt-3">
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">Stop Loss (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={stopLoss}
                      onChange={e => setStopLoss(e.target.value)}
                      placeholder={`e.g. ${(currentPrice * 0.95).toFixed(2)}`}
                      className="w-full px-3 py-2 bg-card border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">Take Profit (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={takeProfit}
                      onChange={e => setTakeProfit(e.target.value)}
                      placeholder={`e.g. ${(currentPrice * 1.05).toFixed(2)}`}
                      className="w-full px-3 py-2 bg-card border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          symbol: stock.symbol,
                          orderType,
                          quantity,
                          price: currentPrice,
                          stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
                          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined
                        })
                      })
                      if (response.ok) {
                        alert(`${orderType} order placed for ${quantity} shares at ₹${currentPrice.toFixed(2)}${stopLoss ? ` with Stop Loss ₹${stopLoss}` : ''}${takeProfit ? ` and Take Profit ₹${takeProfit}` : ''}`)
                        setIsEditing(false)
                        setShowAdvanced(false)
                        setStopLoss('')
                        setTakeProfit('')
                      } else {
                        alert('Failed to place order')
                      }
                    } catch (error) {
                      alert('Error placing order')
                    }
                  }}
                >
                  Place Order
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </Button>
              </div>

              {/* Account Info */}
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/50">
                <p>Demo Balance: ₹10,00,000</p>
                <p>Available: ₹{(1000000 - totalValue).toLocaleString('en-IN')}</p>
                <p className="pt-1">Market: {new Date().getHours() >= 9 && new Date().getHours() < 16 ? 'Open' : 'Closed'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Details & Fundamentals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>OHLC Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Open</p>
                  <p className="text-lg font-semibold text-foreground">₹{ohlcData.open.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">High</p>
                  <p className="text-lg font-semibold text-foreground">₹{ohlcData.high.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Low</p>
                  <p className="text-lg font-semibold text-foreground">₹{ohlcData.low.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Close</p>
                  <p className="text-lg font-semibold text-foreground">₹{ohlcData.close.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sector</span>
                <span className="font-semibold text-foreground">{stock.sector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">52W High</span>
                <span className="font-semibold text-foreground">₹{(stock.basePrice * 1.25).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">52W Low</span>
                <span className="font-semibold text-foreground">₹{(stock.basePrice * 0.75).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Volume</span>
                <span className="font-semibold text-foreground">{volume.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
