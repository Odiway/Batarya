import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not set' }, { status: 500 });
  }

  const url = `https://newsapi.org/v2/everything?q=battery+manufacturing OR production OR assembly&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
