'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

export default function DashboardPage() {
  const [aiInsight, setAiInsight] = useState('')
  const [showAI, setShowAI] = useState(false)
  const [portfolioData, setPortfolioData] = useState({
    balance: 1000000,
    investedAmount: 650000,
    portfolioValue: 750000,
    totalGains: 100000,
    gainPercent: 15.38,
  })
  const [holdings, setHoldings] = useState([
    { symbol: 'RELIANCE', name: 'Reliance Industries', qty: 50, avgPrice: 3200, currentPrice: 3280, change: 2.5, sector: 'Energy' },
    { symbol: 'TCS', name: 'Tata Consultancy', qty: 30, avgPrice: 3800, currentPrice: 3950, change: 3.9, sector: 'IT' },
    { symbol: 'HDFC', name: 'HDFC Bank', qty: 100, avgPrice: 1750, currentPrice: 1720, change: -1.7, sector: 'Banking' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki', qty: 10, avgPrice: 10500, currentPrice: 10800, change: 2.9, sector: 'Auto' },
    { symbol: 'INFY', name: 'Infosys', qty: 40, avgPrice: 1850, currentPrice: 1900, change: 2.7, sector: 'IT' },
  ])

  // Fetch portfolio and holdings data
  const fetchPortfolioData = async () => {
    try {
      // For demo, we'll keep the static data but in a real app this would fetch from API
      // You could add endpoints to fetch portfolio and holdings data
      console.log('[v0] Fetching updated portfolio data');

      // Simulate portfolio updates based on executed orders
      // In a real implementation, this would fetch from the database
      // For now, we'll just refresh the AI insights which will reflect order changes
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
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsight(data.insight);
        console.log('[v0] Portfolio data updated, AI insight refreshed');
      }
    } catch (error) {
      console.error('[v0] Error fetching portfolio data:', error);
    }
  }

  // Poll for portfolio updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchPortfolioData, 10000);
    return () => clearInterval(interval);
  }, []);

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
        });

        if (response.ok) {
          const data = await response.json();
          setAiInsight(data.insight);
          console.log('[v0] AI insight generated:', data.insight);
        } else {
          console.error('[v0] Failed to fetch AI insights:', response.status);
          // Keep the static insight as fallback
        }
      } catch (error) {
        console.error('[v0] Error fetching AI insights:', error);
        // Keep the static insight as fallback
      }
    };

    fetchAIInsights();

    // Refresh AI insights every 30 seconds to reflect order executions
    const interval = setInterval(fetchAIInsights, 30000);
    return () => clearInterval(interval);
  }, []); // Remove holdings from dependencies since it's static

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        {/* Header with AI Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Portfolio Dashboard</h1>
            <p className="text-muted-foreground">AI-powered portfolio analytics & insights</p>
          </div>
          <button 
            onClick={() => setShowAI(!showAI)}
            className="text-sm px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90"
          >
            {showAI ? 'Hide' : 'Show'} AI Coach
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Portfolio Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Portfolio Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Growth (30 Days)</CardTitle>
                </CardHeader>
                <CardContent className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
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
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${(value / portfolioValue * 100).toFixed(1)}%`}
                        outerRadius={80}
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
                <ResponsiveContainer width="100%" height={300}>
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
                <CardTitle>Current Holdings ({holdings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Symbol</th>
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Qty</th>
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Avg Price</th>
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Current</th>
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Change</th>
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map(h => {
                        const value = h.qty * h.currentPrice
                        return (
                          <tr key={h.symbol} className="border-b border-border/50 hover:bg-card/50">
                            <td className="py-3 px-3"><span className="font-semibold">{h.symbol}</span></td>
                            <td className="py-3 px-3">{h.qty}</td>
                            <td className="py-3 px-3">₹{h.avgPrice}</td>
                            <td className="py-3 px-3">₹{h.currentPrice}</td>
                            <td className={`py-3 px-3 font-semibold ${h.change >= 0 ? 'gain' : 'loss'}`}>{h.change >= 0 ? '+' : ''}{h.change}%</td>
                            <td className="py-3 px-3 font-semibold">₹{formatCurrency(value)}</td>
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
      </main>
    </div>
  )
}
