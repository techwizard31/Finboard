import { NextRequest, NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, interval = 'daily' } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Alpha Vantage free tier only supports daily, weekly, and monthly data
    // Map intraday intervals to daily (since intraday requires premium)
    let url: string;
    let dataKey: string;
    let mappedInterval = interval;

    // Map intraday intervals to daily
    if (['1min', '5min', '15min', '30min', '60min'].includes(interval)) {
      mappedInterval = 'daily';
      console.log(`⚠️  Interval '${interval}' requires premium. Using 'daily' instead.`);
    }

    if (mappedInterval === 'weekly') {
      url = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      dataKey = 'Weekly Time Series';
    } else if (mappedInterval === 'monthly') {
      url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      dataKey = 'Monthly Time Series';
    } else {
      // Default to daily - free tier compatible
      url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      dataKey = 'Time Series (Daily)';
    }

    const response = await fetch(url);
    const result = await response.json();

    // Log the actual API response for debugging
    console.log('Alpha Vantage Response:', JSON.stringify(result, null, 2));

    if (!result[dataKey]) {
      if (result['Error Message']) {
        throw new Error(`Alpha Vantage Error: ${result['Error Message']}`);
      }
      if (result['Note']) {
        throw new Error(`Alpha Vantage Rate Limit: ${result['Note']}`);
      }
      if (result['Information']) {
        throw new Error(`Alpha Vantage Info: ${result['Information']}`);
      }
      throw new Error(`Invalid response from API: ${JSON.stringify(result)}`);
    }

    const timeSeries = result[dataKey];
    const data = Object.entries(timeSeries)
      .slice(0, 100)
      .map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }))
      .reverse();

    return NextResponse.json({
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}