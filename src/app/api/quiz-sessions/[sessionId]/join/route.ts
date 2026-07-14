import { NextResponse } from 'next/server';
import { db } from '@/db';
import { participants, quizSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { pusherServer } from '@/lib/pusher';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { nickname } = body;

    if (!nickname || nickname.trim() === '') {
      return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 });
    }

    if (nickname.length > 20) {
      return NextResponse.json({ error: 'Nama maksimal 20 karakter' }, { status: 400 });
    }

    // Check if the session exists and is in waiting status
    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status === 'finished' || session.status === 'draft') {
      return NextResponse.json({ error: 'Sesi kuis sudah selesai atau belum siap' }, { status: 400 });
    }

    // Check uniqueness
    const existingParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participants.quizSessionId, sessionId),
        eq(participants.nickname, nickname.trim())
      ),
    });

    if (existingParticipant) {
      return NextResponse.json({ error: 'Nama ini sudah digunakan, silakan pilih nama lain!' }, { status: 400 });
    }

    // Insert the participant
    const participantId = randomUUID();
    const newParticipant = {
      id: participantId,
      quizSessionId: sessionId,
      nickname,
      score: 0,
      joinedAt: new Date(),
    };

    await db.insert(participants).values(newParticipant);

    // Trigger pusher event for the teacher's dashboard
    await pusherServer.trigger(`session-${sessionId}`, 'player-joined', {
      participant: newParticipant,
    });

    return NextResponse.json({ participant: newParticipant, sessionStatus: session.status });
  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
