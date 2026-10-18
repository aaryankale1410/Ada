import { NextResponse } from 'next/server';
import { addFood } from '@/lib/data';

export async function POST(request) {
  const body = await request.json();
  const updated = await addFood(body.items);
  return NextResponse.json({ history: updated });
}
