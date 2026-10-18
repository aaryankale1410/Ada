import { NextResponse } from 'next/server';
import { updateLastSpecial, clearCachedLlm, setCachedLlm } from '@/lib/data';
import { lastSpecialComment } from '@/lib/llm';

export async function POST() {
  await clearCachedLlm('last_special');
  const specialData = await updateLastSpecial();
  const comment = await lastSpecialComment(specialData.days_since);
  await setCachedLlm('last_special', comment);
  return NextResponse.json({ ...specialData, llm_comment: comment });
}
