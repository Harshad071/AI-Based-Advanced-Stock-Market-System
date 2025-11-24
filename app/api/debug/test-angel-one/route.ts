import { initializeAngelOneClient } from '@/lib/angel-one-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    steps: [],
  };

  try {
    // Step 1: Check environment variables
    results.steps.push({
      name: 'Environment Variables',
      status: 'checking',
      vars: {
        ANGEL_ONE_API_KEY: process.env.ANGEL_ONE_API_KEY ? 'SET' : 'MISSING',
        ANGEL_ONE_CLIENT_ID: process.env.ANGEL_ONE_CLIENT_ID ? 'SET' : 'MISSING',
        ANGEL_ONE_SECRET_KEY: process.env.ANGEL_ONE_SECRET_KEY ? 'SET' : 'MISSING',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      },
    });

    // Step 2: Initialize client
    results.steps.push({
      name: 'Initialize Angel One Client',
      status: 'checking',
    });

    const angelClient = initializeAngelOneClient();
    results.steps[results.steps.length - 1].status = 'success';

    // Step 3: Test login
    results.steps.push({
      name: 'Angel One Login',
      status: 'checking',
    });

    console.log('[v0] Testing Angel One login...');
    const loginSuccess = await angelClient.login();
    
    if (loginSuccess) {
      results.steps[results.steps.length - 1].status = 'success';
      results.steps[results.steps.length - 1].details = 'Login successful';
    } else {
      results.steps[results.steps.length - 1].status = 'failed';
      results.steps[results.steps.length - 1].details = 'Login failed - check credentials';
    }

    // Step 4: Test quote fetch
    if (loginSuccess) {
      results.steps.push({
        name: 'Fetch Quote - TCS',
        status: 'checking',
      });

      console.log('[v0] Testing quote fetch for TCS...');
      const quoteResponse = await angelClient.getQuotes(['TCS']);
      
      if (quoteResponse.status === 'SUCCESS' && quoteResponse.data?.fetched?.length > 0) {
        results.steps[results.steps.length - 1].status = 'success';
        results.steps[results.steps.length - 1].data = quoteResponse.data.fetched[0];
      } else {
        results.steps[results.steps.length - 1].status = 'failed';
        results.steps[results.steps.length - 1].message = quoteResponse.message;
        results.steps[results.steps.length - 1].response = quoteResponse;
      }
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    results.steps.push({
      name: 'Error',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    });

    console.error('[v0] Debug endpoint error:', error);
    return NextResponse.json(results, { status: 200 });
  }
}
