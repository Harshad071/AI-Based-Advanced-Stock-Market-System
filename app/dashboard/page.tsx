'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AIAssistant } from '@/components/ai/ai-assistant'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'

interface Holding {
  id: string
  symbol: string
  exchange: string
  quantity: number
  avg_buy_price: number
  current_price: number
  investedValue: number
  currentValue: number
  gainLoss: number
  gainLossPercent: number
  name: string
}

export default function DashboardPage() {
  const [aiInsight, setAiInsight] = useState('')
  const [showAI, setShowAI] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [portfolioData, setPortfolioData] = useState({
    balance: 1000000,
    investedAmount: 0,
    portfolioValue: 1000000,
    totalGains: 0,
    gainPercent: 0,
  })
  const [holdings, setHoldings] = useState<Holding[]>([])

  // Fetch portfolio and holdings data
  const fetchPortfolioData = async () => {
    try {
      console.log('[v0] Fetching updated portfolio data')

      // Fetch real holdings data from the database
      const holdingsResponse = await fetch('/api/holdings')
      if (holdingsResponse.ok) {
        const holdingsData = await holdingsResponse.json()
        setHoldings(holdingsData.holdings || [])

        // Update portfolio data based on holdings
        const summary = holdingsData.summary || {
          totalInvested: 0,
          totalCurrentValue: 1000000,
          totalGains: 0,
          gainPercent: 0
        }

        setPortfolioData({
          balance: 1000000, // This should come from portfolio table in real implementation
          investedAmount: summary.totalInvested,
          portfolioValue: summary.totalCurrentValue + (1000000 - summary.totalInvested), // Current holdings value + available cash
          totalGains: summary.totalGains,
          gainPercent: summary.gainPercent,
        })

        console.log('[v0] Holdings data updated:', holdingsData.holdings?.length || 0, 'holdings')
      }

      // Also refresh AI insights with current holdings
      const aiResponse = await fetch('/api/ai/dashboard-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdings,
          portfolio: {
            value: portfolioData.portfolioValue,
            invested: portfolioData.investedAmount,
            gains: portfolioData.totalGains,
            gainPercent: portfolioData.gainPercent,
          },
        }),
      })

      if (aiResponse.ok) {
        const aiData = await aiResponse.json()
        setAiInsight(aiData.insight)
        console.log('[v0] AI insight refreshed')
      }
    } catch (error) {
      console.error('[v0] Error fetching portfolio data:', error)
    }
  }

  // Sell dialog state
  const [sellDialog, setSellDialog] = useState<{
    isOpen: boolean;
    holding: Holding | null;
    quantity: string;
    price: string;
  }>({
    isOpen: false,
    holding: null,
    quantity: '',
    price: '',
  });

  // Handle opening sell dialog
  const openSellDialog = (holding: Holding) => {
    setSellDialog({
      isOpen: true,
      holding,
      quantity: holding.quantity.toString(),
      price: holding.current_price.toFixed(2),
    });
  };

  // Handle selling stocks
  const handleSellStock = async () => {
    const { holding, quantity, price } = sellDialog;
    if (!holding) return;

    const qty = parseInt(quantity);
    const prc = parseFloat(price);

    if (qty <= 0 || qty > holding.quantity) {
      alert('Invalid quantity. Must be between 1 and your current holdings.');
      return;
    }

    if (prc <= 0) {
      alert('Invalid price. Must be greater than 0.');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: holding.symbol,
          orderType: 'SELL',
          quantity: qty,
          price: prc,
        }),
      });

      if (response.ok) {
        alert(`Sell order placed for ${qty} shares of ${holding.symbol} at ₹${prc.toFixed(2)}`);
        setSellDialog({ isOpen: false, holding: null, quantity: '', price: '' });
        // Refresh data immediately
        fetchPortfolioData();
      } else {
        const error = await response.json();
        alert(`Failed to place sell order: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error placing sell order:', error);
      alert('Failed to place sell order. Please try again.');
    }
  };

  // Fetch initial data and poll for portfolio updates every 5 seconds for real-time P&L
  useEffect(() => {
    fetchPortfolioData() // Initial fetch
    const interval = setInterval(fetchPortfolioData, 5000)
    return () => clearInterval(interval)
  }, [])

  const demoBalance = portfolioData.balance
  const investedAmount = portfolioData.investedAmount
  const portfolioValue = portfolioData.portfolioValue
  const totalGains = portfolioData.totalGains
  const gainPercent = portfolioData.gainPercent

  // Consistent number formatting to avoid hydration mismatch
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Portfolio growth over time
  const growthData = Array.from({ length: 30 }).map((_, i) => ({
    date: `Day ${i + 1}`,
    value: investedAmount + (totalGains * (i + 1) / 30) + (Math.random() - 0.5) * 20000,
  }))

  // Sector allocation with better colors
  const sectorData = [
    { name: 'IT', value: 280000, color: '#6366f1' },
    { name: 'Banking', value: 200000, color: '#8b5cf6' },
    { name: 'Auto', value: 150000, color: '#06b6d4' },
    { name: 'Energy', value: 120000, color: '#ec4899' },
  ]

  // Returns distribution
  const returnsData = Array.from({ length: 12 }).map((_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    return: (Math.random() - 0.3) * 5,
    drawdown: -(Math.random() * 2),
  }))

  // AI-generated insights
  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const response = await fetch('/api/ai/dashboard-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            holdings,
            portfolio: {
              value: portfolioValue,
              invested: investedAmount,
              gains: totalGains,
              gainPercent,
            },
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setAiInsight(data.insight)
          console.log('[v0] AI insight generated:', data.insight)
        } else {
          console.error('[v0] Failed to fetch AI insights:', response.status)
          // Keep the static insight as fallback
        }
      } catch (error) {
        console.error('[v0] Error fetching AI insights:', error)
        // Keep the static insight as fallback
      }
    }

    fetchAIInsights()

    // Refresh AI insights every 30 seconds to reflect order executions
    const interval = setInterval(fetchAIInsights, 30000)
    return () => clearInterval(interval)
  }, []) // Remove holdings from dependencies since it's static

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
          {/* Header with AI Button */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Portfolio Dashboard</h1>
              <p className="text-muted-foreground text-sm md:text-base">AI-powered portfolio analytics & insights</p>
            </div>
            <button
              onClick={() => setShowAI(!showAI)}
              className="text-sm px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 w-full sm:w-auto"
            >
              {showAI ? 'Hide' : 'Show'} AI Coach
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
            {/* Main Portfolio Content */}
            <div className="lg:col-span-3 space-y-6 md:space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">₹{formatCurrency(portfolioValue)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total worth</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Invested Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">₹{formatCurrency(investedAmount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Capital deployed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Gains</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${totalGains >= 0 ? 'gain' : 'loss'}`}>
                      ₹{formatCurrency(totalGains)}
                    </p>
                    <p className={`text-xs mt-1 ${totalGains >= 0 ? 'gain' : 'loss'}`}>
                      +{gainPercent.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Available Cash</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">₹{formatCurrency(demoBalance - investedAmount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Buying power</p>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insight Card */}
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>💡</span>
                    AI Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{aiInsight}</p>
                </CardContent>
              </Card>

              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8">
                {/* Portfolio Growth */}
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Growth (30 Days)</CardTitle>
                  </CardHeader>
                  <CardContent className="chart-container">
                    <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                      <AreaChart data={growthData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }} style={{ backgroundColor: 'hsl(var(--background))' }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#f9fafb',
                          }}
                          formatter={(value: any) => `₹${value.toFixed(0)}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          fill="#6366f1"
                          fillOpacity={0.3}
                          stroke="#6366f1"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Sector Allocation Pie */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sector Allocation</CardTitle>
                  </CardHeader>
                  <CardContent className="chart-container">
                    <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                      <PieChart>
                        <Pie
                          data={sectorData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${(value / portfolioValue * 100).toFixed(1)}%`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${formatCurrency(Number(value))}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Returns by Month */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Returns & Drawdowns</CardTitle>
                </CardHeader>
                <CardContent className="chart-container">
                  <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                    <LineChart data={returnsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }} style={{ backgroundColor: 'hsl(var(--background))' }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f9fafb',
                        }}
                        formatter={(value: any) => `${value.toFixed(2)}%`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="return" stroke="#10b981" dot={false} strokeWidth={2} name="Returns" />
                      <Line type="monotone" dataKey="drawdown" stroke="#ef4444" dot={false} strokeWidth={2} name="Drawdown" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Holdings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Current Holdings ({holdings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-4">
                    {holdings.map(h => {
                      const value = h.quantity * h.current_price
                      return (
                        <div key={h.symbol} className="border border-border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-lg">{h.symbol}</span>
                            <span className={`font-semibold ${h.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {h.gainLossPercent >= 0 ? '+' : ''}{h.gainLossPercent.toFixed(2)}%
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Quantity:</span>
                              <span className="ml-2 font-medium">{h.quantity}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Avg Price:</span>
                              <span className="ml-2 font-medium">₹{h.avg_buy_price.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current:</span>
                              <span className="ml-2 font-medium">₹{h.current_price.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Value:</span>
                              <span className="ml-2 font-medium">₹{formatCurrency(value)}</span>
                            </div>
                          </div>
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => openSellDialog(h)}
                              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              Sell
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Symbol</th>
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Qty</th>
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Avg Price</th>
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Current</th>
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Change</th>
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Value</th>
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map(h => {
                          const value = h.quantity * h.current_price
                          return (
                            <tr key={h.symbol} className="border-b border-border/50 hover:bg-card/50">
                              <td className="py-3 px-3"><span className="font-semibold">{h.symbol}</span></td>
                              <td className="py-3 px-3">{h.quantity}</td>
                              <td className="py-3 px-3">₹{h.avg_buy_price.toFixed(2)}</td>
                              <td className="py-3 px-3">₹{h.current_price.toFixed(2)}</td>
                              <td className={`py-3 px-3 font-semibold ${h.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{h.gainLossPercent >= 0 ? '+' : ''}{h.gainLossPercent.toFixed(2)}%</td>
                              <td className="py-3 px-3 font-semibold">₹{formatCurrency(value)}</td>
                              <td className="py-3 px-3">
                                <button
                                  onClick={() => openSellDialog(h)}
                                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                  Sell
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Coach Sidebar */}
            {showAI && (
              <div className="lg:col-span-1 h-fit sticky top-8">
                <AIAssistant />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sell Dialog */}
      <Dialog open={sellDialog.isOpen} onOpenChange={(open) => !open && setSellDialog({ isOpen: false, holding: null, quantity: '', price: '' })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sell {sellDialog.holding?.symbol}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={sellDialog.quantity}
                onChange={(e) => setSellDialog(prev => ({ ...prev, quantity: e.target.value }))}
                className="col-span-3"
                min="1"
                max={sellDialog.holding?.quantity || 0}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (₹)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={sellDialog.price}
                onChange={(e) => setSellDialog(prev => ({ ...prev, price: e.target.value }))}
                className="col-span-3"
                min="0.01"
              />
            </div>
            {sellDialog.holding && (
              <div className="text-sm text-muted-foreground">
                Available: {sellDialog.holding.quantity} shares
                <br />
                Current Value: ₹{(parseInt(sellDialog.quantity || '0') * parseFloat(sellDialog.price || '0')).toFixed(2)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSellDialog({ isOpen: false, holding: null, quantity: '', price: '' })}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSellStock}>
              Place Sell Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
