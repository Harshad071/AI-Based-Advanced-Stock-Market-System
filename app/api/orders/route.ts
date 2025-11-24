import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isMarketOpen, getNextMarketOpen } from '@/lib/market-data'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // For demo, get orders from all portfolios or assume portfolio_id = 1
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        symbol,
        order_type,
        quantity,
        price,
        status,
        created_at,
        executed_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status, quantity, price } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const updateData: any = {}
    if (status) updateData.status = status
    if (quantity) updateData.quantity = quantity
    if (price) updateData.price = price

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Update order API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if market is open for order execution
    if (!isMarketOpen()) {
      const nextOpen = getNextMarketOpen();
      return NextResponse.json({
        error: 'Orders can only be placed during market hours',
        nextOpen: nextOpen.toISOString(),
        message: `Indian stock market operates from 9:15 AM to 3:30 PM IST. Next opening: ${nextOpen.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
      }, { status: 403 });
    }

    const { symbol, orderType, quantity, price } = await request.json()

    if (!symbol || !orderType || !quantity || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // For demo, get or create a portfolio
    let { data: portfolio } = await supabase
      .from('portfolios')
      .select('id')
      .limit(1)
      .single()

    if (!portfolio) {
      // Create a demo portfolio
      const { data: newPortfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Demo user uuid
          initial_capital: 1000000,
          current_value: 1000000,
          total_invested: 0,
          total_returns: 0
        })
        .select('id')
        .single()

      if (portfolioError) {
        console.error('Error creating portfolio:', portfolioError)
        return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
      }

      portfolio = newPortfolio
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        portfolio_id: portfolio.id,
        symbol,
        exchange: 'NSE', // Assume NSE
        order_type: orderType,
        quantity,
        price,
        status: 'PENDING'
      })
      .select()
      .single()

    if (error) {
      console.error('Error placing order:', error)
      return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Place order API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}