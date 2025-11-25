'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TOP_STOCKS } from '@/lib/market-data'
import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { useRealtimePrices } from '@/hooks/use-realtime-prices'

export default function StocksPage() {
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [priceUpdateTrigger, setPriceUpdateTrigger] = useState(0)

  // Get real-time prices for all stocks
  const { prices: realtimePrices } = useRealtimePrices(TOP_STOCKS.map(s => s.symbol))

  // Force re-render when prices change
  useEffect(() => {
    setPriceUpdateTrigger(prev => prev + 1)
  }, [realtimePrices])

  const sectors = [...new Set(TOP_STOCKS.map(s => s.sector))]

  const filtered = useMemo(() => {
    return TOP_STOCKS.filter(stock => {
      const matchesSearch = stock.name.toLowerCase().includes(search.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(search.toLowerCase())
      const matchesSector = !sector || stock.sector === sector
      return matchesSearch && matchesSector
    })
  }, [search, sector, priceUpdateTrigger]) // Use priceUpdateTrigger to trigger re-render when prices change

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 md:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">InvestIQ</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">Stocks</h1>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search stocks by name or symbol..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Sector Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={sector === null ? 'default' : 'outline'}
              onClick={() => setSector(null)}
              size="sm"
            >
              All
            </Button>
            {sectors.map(s => (
              <Button
                key={s}
                variant={sector === s ? 'default' : 'outline'}
                onClick={() => setSector(s)}
                size="sm"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

          {/* Stocks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filtered.map(stock => {
            const realtimePrice = realtimePrices[stock.symbol]
            const currentPrice = realtimePrice?.price || stock.basePrice
            const change = currentPrice - stock.basePrice
            const changePercent = (change / stock.basePrice) * 100
            const dayHigh = realtimePrice?.high || currentPrice * 1.02
            const dayLow = realtimePrice?.low || currentPrice * 0.98

            return (
              <Link key={stock.symbol} href={`/stocks/${stock.symbol}`}>
                <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                  <CardHeader className="pb-2">
                    <div>
                      <CardTitle className="text-lg">{realtimePrice?.name || stock.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{stock.symbol} • {stock.sector}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-foreground">₹{currentPrice.toFixed(2)}</p>
                      <p className={`text-sm font-semibold ${changePercent >= 0 ? 'gain' : 'loss'}`}>
                        {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Day High: ₹{dayHigh.toFixed(2)}</p>
                      <p>Day Low: ₹{dayLow.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

          {filtered.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No stocks found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
