import { getChatsByUserId } from '../../../../../../lib/db/queries';
import { NextResponse } from 'next/server';



export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { chats } = await getChatsByUserId({
      id: params.userId,
      limit: 100,
      startingAfter: null,
      endingBefore: null,
    })
    return NextResponse.json(chats)
  } catch (err) {
    console.error('GET /api/users/[userId]/conversations error', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

  
