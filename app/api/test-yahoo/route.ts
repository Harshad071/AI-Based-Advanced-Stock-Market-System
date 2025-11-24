import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test Yahoo Finance API with a simple symbol
    const symbol = 'RELIANCE.NS';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${Math.floor(Date.now() / 1000) - 86400}&period2=${Math.floor(Date.now() / 1000)}&interval=1d`;

    console.log('[v0] Testing Yahoo Finance API with URL:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      symbol,
      url,
      data: data.chart?.result?.[0]?.meta || 'No meta data',
      error: data.chart?.error || null
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}