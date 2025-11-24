import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    // Check stock prices
    const { data: stocks, error: stocksError } = await supabase
      .from('stock_prices')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5);

    // Check indices
    const { data: indices, error: indicesError } = await supabase
      .from('indices')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(3);

    // Check historical data
    const { data: historical, error: historicalError } = await supabase
      .from('ohlc_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        stocks: {
          count: stocks?.length || 0,
          error: stocksError?.message,
          sample: stocks
        },
        indices: {
          count: indices?.length || 0,
          error: indicesError?.message,
          sample: indices
        },
        historical: {
          count: historical?.length || 0,
          error: historicalError?.message,
          sample: historical
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}