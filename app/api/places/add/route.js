import { NextResponse } from 'next/server';
import { addPlace } from '@/lib/data';

export async function POST(request) {
  const { place, notes = '' } = await request.json();
  return NextResponse.json(await addPlace(place, notes));
}
