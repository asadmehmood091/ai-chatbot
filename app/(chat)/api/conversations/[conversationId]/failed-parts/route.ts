import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const { rows } = await sql/*sql*/`
      SELECT
        m.parts,
        c."userId",
        m."createdAt",
        m.role
      FROM "Chat" c
      LEFT JOIN "Message_v2" m
        ON m."chatId" = c.id
      WHERE m.role = 'user'
      ORDER BY m."createdAt" DESC;
    `;

    // Transform rows to extract text from parts and format the response
    const formattedRows = rows.map(row => ({
        //@ts-ignore
      message: row.parts.find(part => part.type === 'text')?.text || '',
      userId: row.userId,
      createdAt: row.createdAt,
      role: row.role
    }));

    return NextResponse.json(formattedRows); // ← 200 OK
  } catch (err) {
    console.error('[messages-with-userid-createdat-role] 🔥', err);
    return NextResponse.json(
      { message: 'Internal server error', error: String(err) },
      { status: 500 },
    );
  }
}