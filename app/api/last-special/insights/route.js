import { NextResponse } from 'next/server';
import { getSpecialInsights } from '@/lib/data';

export async function GET() {
  return NextResponse.json(await getSpecialInsights());
}
