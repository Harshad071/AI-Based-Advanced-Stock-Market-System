'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useState, useEffect } from 'react'

interface Order {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED'
  createdAt: string
  executedAt?: string
  pnl?: number
  pnlPercent?: number
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'executed' | 'cancelled'>('executed')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        // Transform the data to match the Order interface
        const transformedOrders: Order[] = data.map((order: any) => ({
          id: order.id,
          symbol: order.symbol,
          type: order.order_type,
          quantity: order.quantity,
          price: order.price,
          status: order.status,
          createdAt: new Date(order.created_at).toLocaleString(),
          executedAt: order.executed_at ? new Date(order.executed_at).toLocaleString() : undefined,
          // For demo, add mock P&L
          pnl: order.status === 'EXECUTED' ? Math.floor(Math.random() * 10000 - 5000) : undefined,
          pnlPercent: order.status === 'EXECUTED' ? Math.random() * 10 - 5 : undefined,
        }))
        setOrders(transformedOrders)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    // Poll for order updates every 5 seconds to reflect executions
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const mockOrders: Order[] = [
    {
      id: '1',
      symbol: 'TCS',
      type: 'BUY',
      quantity: 10,
      price: 3800,
      status: 'EXECUTED',
      createdAt: '2025-11-18 10:30',
      executedAt: '2025-11-18 10:31',
      pnl: 1500,
      pnlPercent: 3.95,
    },
    {
      id: '2',
      symbol: 'INFY',
      type: 'SELL',
      quantity: 5,
      price: 1850,
      status: 'EXECUTED',
      createdAt: '2025-11-18 11:15',
      executedAt: '2025-11-18 11:16',
      pnl: 450,
      pnlPercent: 4.86,
    },
    {
      id: '3',
      symbol: 'RELIANCE',
      type: 'BUY',
      quantity: 2,
      price: 3200,
      status: 'PENDING',
      createdAt: '2025-11-18 14:20',
    },
    {
      id: '4',
      symbol: 'HDFC',
      type: 'BUY',
      quantity: 15,
      price: 1750,
      status: 'CANCELLED',
      createdAt: '2025-11-17 09:00',
    },
  ]

  const filtered = orders.filter(order => {
    if (activeTab === 'all') return true
    return order.status === activeTab.toUpperCase().replace('CANCELLED', 'CANCELLED')
  })

  // Trade statistics
  const executedOrders = orders.filter(o => o.status === 'EXECUTED')
  const totalTrades = executedOrders.length
  const totalPnL = executedOrders.reduce((sum, o) => sum + (o.pnl || 0), 0)
  const winningTrades = executedOrders.filter(o => (o.pnl || 0) > 0).length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

  // Monthly P&L data
  const monthlyPnL = [
    { month: 'Sep', pnl: 5200, trades: 12 },
    { month: 'Oct', pnl: 8500, trades: 18 },
    { month: 'Nov', pnl: 12300, trades: 24 },
  ]

  const getStatusColor = (status: string) => {
    if (status === 'EXECUTED') return 'gain'
    if (status === 'PENDING') return 'text-yellow-500'
    return 'loss'
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage all your trades</p>
        </div>

        {/* Trade Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{totalTrades}</p>
              <p className="text-xs text-muted-foreground mt-1">Executed orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'gain' : 'loss'}`}>
                ₹{totalPnL.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Realized gains/losses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold gain">{winRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">{winningTrades} / {totalTrades} trades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{orders.filter(o => o.status === 'PENDING').length}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting execution</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Monthly P&L</CardTitle>
            </CardHeader>
            <CardContent className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyPnL}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="pnl" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trades per Month</CardTitle>
            </CardHeader>
            <CardContent className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyPnL}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="trades" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'pending', 'executed', 'cancelled'] as const).map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab)}
              className="capitalize whitespace-nowrap"
            >
              {tab === 'pending' ? 'Pending' : tab === 'executed' ? 'Executed' : tab === 'cancelled' ? 'Cancelled' : 'All Orders'}
              {tab !== 'all' && ` (${orders.filter(o => o.status === tab.toUpperCase().replace('PENDING', 'PENDING')).length})`}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filtered.map(order => (
            <Card key={order.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Symbol</p>
                        <p className="text-lg font-semibold text-foreground">{order.symbol}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className={`text-lg font-semibold ${order.type === 'BUY' ? 'gain' : 'loss'}`}>
                          {order.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Qty</p>
                        <p className="text-lg font-semibold text-foreground">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-lg font-semibold text-foreground">₹{order.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className={`text-lg font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </p>
                      </div>
                      {order.pnl !== undefined && (
                        <div>
                          <p className="text-xs text-muted-foreground">P&L</p>
                          <p className={`text-lg font-semibold ${order.pnl >= 0 ? 'gain' : 'loss'}`}>
                            ₹{order.pnl.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {order.createdAt}
                      {order.executedAt && ` • Executed: ${order.executedAt}`}
                    </p>
                  </div>
                  {order.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newQuantity = prompt('Enter new quantity:', order.quantity.toString());
                          const newPrice = prompt('Enter new price:', order.price.toString());
                          if (newQuantity && newPrice) {
                            // Update order
                            fetch('/api/orders', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                id: order.id,
                                quantity: parseInt(newQuantity),
                                price: parseFloat(newPrice)
                              })
                            }).then(() => window.location.reload());
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="loss"
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/orders', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: order.id, status: 'CANCELLED' })
                            })
                            if (response.ok) {
                              // Refresh orders
                              window.location.reload()
                            } else {
                              alert('Failed to cancel order')
                            }
                          } catch (error) {
                            alert('Error cancelling order')
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No {activeTab} orders found.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
