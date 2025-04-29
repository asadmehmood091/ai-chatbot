import { getAllUsers } from '../../../../lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  const allUsers = await getAllUsers();
  return NextResponse.json(allUsers);
}
