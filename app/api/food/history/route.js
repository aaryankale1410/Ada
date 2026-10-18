import { NextResponse } from 'next/server';
import { getFoodHistory } from '@/lib/data';

export async function GET() {
  const history = await getFoodHistory();
  return NextResponse.json({ history });
}
