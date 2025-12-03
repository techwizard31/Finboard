import { NextRequest, NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';

export async function GET(request: NextRequest) {
    try {
        const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`;
        const response = await fetch(url);
        const result = await response.json();

        const gainers = result.top_gainers?.slice(0, 10).map((stock: any) => ({
            symbol: stock.ticker,
            name: stock.ticker,
            price: parseFloat(stock.price),
            change: parseFloat(stock.change_amount),
            changePercent: parseFloat(stock.change_percentage.replace('%', '')),
            volume: parseInt(stock.volume),
        })) || [];

        return NextResponse.json({
            data: gainers,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch market gainers' },
            { status: 500 }
        );
    }
}