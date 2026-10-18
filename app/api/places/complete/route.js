import { NextResponse } from 'next/server';
import { completePlace } from '@/lib/data';

export async function POST(request) {
  const { id } = await request.json();
  return NextResponse.json(await completePlace(id));
}
