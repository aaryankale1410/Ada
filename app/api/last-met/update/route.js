import { NextResponse } from 'next/server';
import { updateLastMet, clearCachedLlm, setCachedLlm } from '@/lib/data';
import { lastMetComment } from '@/lib/llm';

export async function POST() {
  await clearCachedLlm('last_met');
  const metData = await updateLastMet();
  const comment = await lastMetComment(metData.days_since);
  await setCachedLlm('last_met', comment);
  return NextResponse.json({ ...metData, llm_comment: comment });
}
