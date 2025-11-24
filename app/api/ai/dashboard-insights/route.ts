import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { holdings, portfolio } = await req.json();

    if (!holdings || !portfolio) {
      return NextResponse.json(
        { error: 'Missing holdings or portfolio data' },
        { status: 400 }
      );
    }

    const holdingsText = holdings
      .map((h: any) => `${h.symbol}: ${h.qty} units @ ₹${h.currentPrice} (avg: ₹${h.avgPrice}, change: ${h.change}%)`)
      .join('\n');

    const prompt = `As a financial advisor, analyze this portfolio and provide 2-3 specific, actionable insights in 2-3 sentences:

Portfolio Value: ₹${portfolio.value}
Invested: ₹${portfolio.invested}
Gains: ₹${portfolio.gains} (${portfolio.gainPercent}%)
Holdings:
${holdingsText}

Focus on: sector concentration, technical signals, rebalancing opportunities, or risk management.`;

    try {
      const { text } = await generateText({
        model: groq('llama-3.1-8b-instant'),
        prompt,
        temperature: 0.7,
      });

      return NextResponse.json({ insight: text }, { status: 200 });
    } catch (generateError) {
      console.error('[v0] Text generation error:', generateError);
      return NextResponse.json(
        { error: 'Failed to generate insights', details: generateError instanceof Error ? generateError.message : String(generateError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[v0] Dashboard insights error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
