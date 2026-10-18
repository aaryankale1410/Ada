import { NextResponse } from 'next/server';
import { getFoodHistory } from '@/lib/data';
import { suggestFood } from '@/lib/llm';

export async function GET() {
  const history = await getFoodHistory();
  const suggestion = await suggestFood(history);
  return NextResponse.json({ suggestion });
}
