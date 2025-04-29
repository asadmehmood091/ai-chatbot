import { getMessagesByChatId } from '../../../../../../lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: { chatId: string } }
) {
  const messages = await getMessagesByChatId({ id: params.chatId });
  return NextResponse.json(messages);
}
