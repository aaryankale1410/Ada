import { NextResponse } from 'next/server';
import { updatePeriod, clearCachedLlm, setCachedLlm } from '@/lib/data';
import { periodComment } from '@/lib/llm';

export async function POST() {
  await clearCachedLlm('period');
  const periodData = await updatePeriod();
  const comments = await periodComment(periodData.days_since, periodData.days_until);
  await setCachedLlm('period', comments);
  return NextResponse.json({ ...periodData, llm: comments });
}
