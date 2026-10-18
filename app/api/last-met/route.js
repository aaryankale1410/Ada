import { NextResponse } from 'next/server';
import { getLastMet, getCachedLlm, setCachedLlm } from '@/lib/data';
import { lastMetComment } from '@/lib/llm';

export async function GET() {
  const metData = await getLastMet();
  let comment = await getCachedLlm('last_met');
  if (!comment) {
    comment = await lastMetComment(metData.days_since);
    await setCachedLlm('last_met', comment);
  }
  return NextResponse.json({ ...metData, llm_comment: comment });
}
