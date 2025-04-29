import { getMessagesByChatId } from '../../../../../../lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const messages = await getMessagesByChatId({ id: params.chatId });
    return NextResponse.json(messages);
  } catch (error) {
    console.error(`GET /api/chats/[chatId]/messages error for chatId ${params.chatId}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}