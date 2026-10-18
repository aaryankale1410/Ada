import { NextResponse } from 'next/server';
import { OPEN_WHEN_HANDLERS } from '@/lib/llm';

export async function GET(request, { params }) {
  const { category } = await params;
  const handler = OPEN_WHEN_HANDLERS[category];
  if (!handler) {
    return NextResponse.json({ error: `Unknown category: ${category}` }, { status: 400 });
  }
  const message = await handler();
  return NextResponse.json({ category, message });
}
