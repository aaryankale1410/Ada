import { NextResponse } from 'next/server';
import { getMetInsights } from '@/lib/data';

export async function GET() {
  return NextResponse.json(await getMetInsights());
}
