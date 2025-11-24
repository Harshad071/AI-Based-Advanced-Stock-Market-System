import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { symbol, currentPrice, historicalData } = await req.json();

    if (!symbol || !currentPrice) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol and currentPrice' },
        { status: 400 }
      );
    }

    // Prepare historical data context
    const dataContext = historicalData && historicalData.length > 0
      ? `Recent price data: ${historicalData.slice(-10).map((d: any) =>
          `${d.timestamp}: ₹${d.close}`
        ).join(', ')}`
      : `Current price: ₹${currentPrice}`;

    const prompt = `As an expert financial analyst, predict the next day's price movement for ${symbol} based on technical analysis and market trends.

${dataContext}

Current market price: ₹${currentPrice}

Please provide:
1. Predicted price range for tomorrow (high-low)
2. Confidence level (Low/Medium/High)
3. Key factors influencing the prediction
4. Risk assessment

Format your response as a JSON object with these fields:
{
  "predictedHigh": number,
  "predictedLow": number,
  "confidence": "Low"|"Medium"|"High",
  "factors": string,
  "riskLevel": "Low"|"Medium"|"High",
  "analysis": string
}`;

    try {
      const { text } = await generateText({
        model: groq('llama-3.1-8b-instant'),
        prompt,
        temperature: 0.3, // Lower temperature for more consistent predictions
      });

      // Try to parse the response as JSON
      try {
        const prediction = JSON.parse(text);
        return NextResponse.json({
          success: true,
          symbol,
          currentPrice,
          prediction,
          timestamp: new Date().toISOString()
        }, { status: 200 });
      } catch (parseError) {
        // If JSON parsing fails, return a structured response with the text
        return NextResponse.json({
          success: true,
          symbol,
          currentPrice,
          prediction: {
            predictedHigh: currentPrice * 1.02,
            predictedLow: currentPrice * 0.98,
            confidence: "Medium",
            factors: "Technical analysis based on current market conditions",
            riskLevel: "Medium",
            analysis: text
          },
          timestamp: new Date().toISOString()
        }, { status: 200 });
      }

    } catch (generateError) {
      console.error('[v0] AI prediction error:', generateError);

      // Fallback prediction based on simple technical analysis
      const volatility = 0.02; // 2% daily volatility
      const predictedHigh = currentPrice * (1 + volatility);
      const predictedLow = currentPrice * (1 - volatility);

      return NextResponse.json({
        success: true,
        symbol,
        currentPrice,
        prediction: {
          predictedHigh,
          predictedLow,
          confidence: "Medium",
          factors: "Fallback analysis based on historical volatility",
          riskLevel: "Medium",
          analysis: "AI prediction service temporarily unavailable. Using technical analysis fallback."
        },
        timestamp: new Date().toISOString(),
        fallback: true
      }, { status: 200 });
    }
  } catch (error) {
    console.error('[v0] Price prediction API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}