import { NextResponse } from 'next/server';
import { db } from '@/db';
import { quizSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { pusherServer } from '@/lib/pusher';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    // In a real application, you would also verify the user is the teacher who owns this session.

    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'active') {
      return NextResponse.json({ error: 'Session is not in active state' }, { status: 400 });
    }

    const updatedSession = await db.update(quizSessions)
      .set({ status: 'finished', updatedAt: new Date() })
      .where(eq(quizSessions.id, sessionId))
      .returning();

    // Trigger pusher event for students to know the quiz has ended
    await pusherServer.trigger(`session-${sessionId}`, 'quiz-ended', {
      sessionId,
      status: 'finished',
      endedAt: new Date().toISOString()
    });

    return NextResponse.json({ session: updatedSession[0] });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
