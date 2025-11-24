import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.content) {
      return NextResponse.json({ error: 'No message content' }, { status: 400 });
    }

    const systemPrompt = `You are InvestIQ AI Assistant, an intelligent financial advisor integrated with the InvestIQ trading platform. You have access to comprehensive Indian stock market data and platform features.

PLATFORM FEATURES YOU CAN HELP WITH:
- Dashboard: Portfolio overview, performance metrics, AI insights, sector allocation
- Stock Analysis: Individual stock pages with charts, technical indicators, fundamentals
- Index Tracking: NIFTY50, SENSEX, BANKNIFTY with real-time data and analysis
- Backtesting Engine: Test trading strategies on historical data, compare performance
- Orders Management: View, create, edit, and track buy/sell orders
- Market Data: Real-time quotes, market depth, technical analysis
- AI-Powered Insights: Automated portfolio analysis and recommendations

YOUR CAPABILITIES:
- Technical analysis (RSI, MACD, moving averages, chart patterns)
- Stock recommendations for Indian markets (Reliance, TCS, Infosys, HDFC, etc.)
- Trading strategies (momentum, mean reversion, breakout trading)
- Portfolio optimization and diversification advice
- Risk management and position sizing
- Backtesting strategy analysis
- Order execution guidance
- Market trend analysis

RESPONSE GUIDELINES:
- Be professional, friendly, and knowledgeable
- Reference platform features when relevant (e.g., "Check the backtesting engine for strategy testing")
- Provide specific, actionable advice
- Include realistic price estimates when discussing stocks
- Focus on Indian markets (NSE/BSE)
- Keep responses concise but comprehensive
- Suggest using platform features for deeper analysis

When users ask about their portfolio, orders, or specific platform features, guide them to use the relevant sections of InvestIQ.`;

    const result = await streamText({
      model: groq('llama-3.1-8b-instant'),
      system: systemPrompt,
      messages: [
        ...messages.slice(0, -1).map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: lastMessage.content
        }
      ],
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
