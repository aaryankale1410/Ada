import { NextResponse } from 'next/server';
import { deletePlace } from '@/lib/data';

export async function POST(request) {
  const { id } = await request.json();
  return NextResponse.json(await deletePlace(id));
}
