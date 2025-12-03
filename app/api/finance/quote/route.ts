import { NextRequest, NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, provider = 'alphaVantage' } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    let data;

    if (provider === 'alphaVantage') {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result['Global Quote']) {
        const quote = result['Global Quote'];
        data = {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          open: parseFloat(quote['02. open']),
          previousClose: parseFloat(quote['08. previous close']),
          timestamp: quote['07. latest trading day'],
        };
      } else {
        throw new Error('Invalid response from Alpha Vantage');
      }
    } else if (provider === 'finnhub') {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const response = await fetch(url);
      const result = await response.json();

      data = {
        symbol: symbol,
        price: result.c,
        change: result.d,
        changePercent: result.dp,
        high: result.h,
        low: result.l,
        open: result.o,
        previousClose: result.pc,
        timestamp: new Date(result.t * 1000).toISOString(),
      };
    }

    return NextResponse.json({
      data,
      timestamp: new Date().toISOString(),
      source: provider,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote data' },
      { status: 500 }
    );
  }
}