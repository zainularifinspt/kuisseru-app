import { NextResponse } from 'next/server';
import { db } from '@/db';
import { quizSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.id, sessionId),
      with: {
        participants: true,
        questions: true,
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      session: {
        id: session.id,
        title: session.title,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      stats: {
        totalParticipants: session.participants.length,
        totalQuestions: session.questions.length,
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
