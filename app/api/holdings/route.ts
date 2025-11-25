import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // For demo, get holdings from all portfolios or assume portfolio_id = 1
    // In a real app, this would be filtered by user
    const { data: holdings, error } = await supabase
      .from('holdings')
      .select(`
        id,
        symbol,
        exchange,
        quantity,
        avg_buy_price,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching holdings:', error)
      return NextResponse.json({ error: 'Failed to fetch holdings' }, { status: 500 })
    }

    // Get current prices from stock_prices table
    const symbols = [...new Set(holdings.map(h => h.symbol))]
    const { data: currentPrices, error: priceError } = await supabase
      .from('stock_prices')
      .select('symbol, price')
      .in('symbol', symbols)

    if (error) {
      console.error('Error fetching holdings:', error)
      return NextResponse.json({ error: 'Failed to fetch holdings' }, { status: 500 })
    }

    if (priceError) {
      console.error('Error fetching current prices:', priceError)
      return NextResponse.json({ error: 'Failed to fetch current prices' }, { status: 500 })
    }

    // Create price map for quick lookup
    const priceMap = new Map()
    currentPrices?.forEach(price => {
      priceMap.set(price.symbol, price.price)
    })

    // Aggregate holdings by symbol
    const holdingsMap = new Map()

    holdings.forEach(holding => {
      const key = holding.symbol
      if (holdingsMap.has(key)) {
        const existing = holdingsMap.get(key)
        const totalQuantity = existing.quantity + holding.quantity
        const totalInvested = (existing.quantity * existing.avg_buy_price) + (holding.quantity * holding.avg_buy_price)
        const weightedAvgPrice = totalInvested / totalQuantity

        holdingsMap.set(key, {
          ...existing,
          quantity: totalQuantity,
          avg_buy_price: weightedAvgPrice,
          investedValue: totalInvested,
          id: existing.id, // Keep the first ID
          created_at: existing.created_at, // Keep the earliest date
        })
      } else {
        holdingsMap.set(key, {
          ...holding,
          investedValue: holding.quantity * holding.avg_buy_price
        })
      }
    })

    // Calculate portfolio summary
    let totalInvested = 0
    let totalCurrentValue = 0

    const holdingsWithCalculations = Array.from(holdingsMap.values()).map(holding => {
      // Use current price from stock_prices table, fallback to stored current_price
      const currentPrice = priceMap.get(holding.symbol) || holding.current_price || holding.avg_buy_price
      const currentValue = holding.quantity * currentPrice
      const gainLoss = currentValue - holding.investedValue
      const gainLossPercent = holding.investedValue > 0 ? (gainLoss / holding.investedValue) * 100 : 0

      totalInvested += holding.investedValue
      totalCurrentValue += currentValue

      return {
        ...holding,
        current_price: currentPrice, // Update with latest price
        currentValue,
        gainLoss,
        gainLossPercent,
        // Add name field (would come from stock_prices table in real implementation)
        name: holding.symbol // Placeholder
      }
    })

    const totalGains = totalCurrentValue - totalInvested
    const gainPercent = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0

    return NextResponse.json({
      holdings: holdingsWithCalculations,
      summary: {
        totalInvested,
        totalCurrentValue,
        totalGains,
        gainPercent,
        holdingCount: holdings.length
      }
    })
  } catch (error) {
    console.error('Holdings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}