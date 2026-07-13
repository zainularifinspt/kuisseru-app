import { NextResponse } from 'next/server';
import { db } from '@/db';
import { quizSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { joinCode } = await request.json();

    if (!joinCode || typeof joinCode !== 'string' || joinCode.length !== 6) {
      return NextResponse.json(
        { error: 'Kode PIN harus terdiri dari 6 angka.' },
        { status: 400 }
      );
    }

    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.joinCode, joinCode),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Kuis dengan kode PIN tersebut tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (session.status !== 'waiting' && session.status !== 'active') {
        return NextResponse.json(
            { error: 'Kuis belum dimulai atau sudah selesai.' },
            { status: 400 }
        );
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error joining by code:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal.' }, { status: 500 });
  }
}
