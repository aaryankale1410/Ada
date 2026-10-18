import { NextResponse } from 'next/server';
import { getPeriodData, getCachedLlm, setCachedLlm } from '@/lib/data';
import { periodComment } from '@/lib/llm';

export async function GET() {
  const periodData = await getPeriodData();
  let comments = await getCachedLlm('period');
  if (!comments) {
    comments = await periodComment(periodData.days_since, periodData.days_until);
    await setCachedLlm('period', comments);
  }
  return NextResponse.json({ ...periodData, llm: comments });
}
