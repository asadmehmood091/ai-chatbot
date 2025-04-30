// app/api/users/route.ts
import { getAllUsers } from '../../../../lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await getAllUsers();    
    return NextResponse.json(users);
  } catch (err) {
    console.error('/api/users', err);
    return NextResponse.json('Failed to fetch users!', { status: 500 });
  }
}
