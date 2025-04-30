// app/api/history/route.ts
/* eslint-disable import/no-unresolved */
import { auth } from '@/app/(auth)/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getChatsByUserId } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit          = parseInt(searchParams.get('limit') || '10', 10);
  const startingAfter  = searchParams.get('starting_after');
  const endingBefore   = searchParams.get('ending_before');
  const explicitUserId = searchParams.get('userId');      //  ← NEW

  if (startingAfter && endingBefore) {
    return NextResponse.json(
      'Only one of starting_after or ending_before can be provided!',
      { status: 400 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json('Unauthorized!', { status: 401 });
  }

  // in production: guard this with an isAdmin() check!
  const targetUserId = explicitUserId || session.user.id;

  try {
    const chats = await getChatsByUserId({
      id:           targetUserId,
      limit,
      startingAfter,
      endingBefore,
    });
    return NextResponse.json(chats);
  } catch (err) {
    console.error('/api/history', err);
    return NextResponse.json('Failed to fetch chats!', { status: 500 });
  }
}
