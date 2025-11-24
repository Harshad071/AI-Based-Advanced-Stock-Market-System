'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TOP_STOCKS, generatePriceData } from '@/lib/market-data'
import Link from 'next/link'
import { useState, useMemo } from 'react'

export default function StocksPage() {
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState<string | null>(null)

  const sectors = [...new Set(TOP_STOCKS.map(s => s.sector))]

  const filtered = useMemo(() => {
    return TOP_STOCKS.filter(stock => {
      const matchesSearch = stock.name.toLowerCase().includes(search.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(search.toLowerCase())
      const matchesSector = !sector || stock.sector === sector
      return matchesSearch && matchesSector
    })
  }, [search, sector])

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Stocks</h1>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(stock => {
            const data = generatePriceData(stock.basePrice, 100)
            const currentPrice = data[data.length - 1].price
            const change = currentPrice - stock.basePrice
            const changePercent = (change / stock.basePrice) * 100

            return (
              <Link key={stock.symbol} href={`/stocks/${stock.symbol}`}>
                <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                  <CardHeader className="pb-2">
                    <div>
                      <CardTitle className="text-lg">{stock.name}</CardTitle>
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
                      <p>Day High: ₹{Math.max(...data.map(p => p.price)).toFixed(2)}</p>
                      <p>Day Low: ₹{Math.min(...data.map(p => p.price)).toFixed(2)}</p>
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
      </main>
    </div>
  )
}
