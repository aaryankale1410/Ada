import { NextResponse } from 'next/server';
import { getLastSpecial, getCachedLlm, setCachedLlm } from '@/lib/data';
import { lastSpecialComment } from '@/lib/llm';

export async function GET() {
  const specialData = await getLastSpecial();
  let comment = await getCachedLlm('last_special');
  if (!comment) {
    comment = await lastSpecialComment(specialData.days_since);
    await setCachedLlm('last_special', comment);
  }
  return NextResponse.json({ ...specialData, llm_comment: comment });
}
