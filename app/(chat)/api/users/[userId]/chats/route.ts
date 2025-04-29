import { getChatsByUserId } from '../../../../../../lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const result = await getChatsByUserId({
    id: params.userId,
    limit: 100,
    startingAfter: null,
    endingBefore: null,
  });

  return NextResponse.json(result.chats);
}
