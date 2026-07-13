import { NextResponse } from 'next/server';
import { db } from '@/db';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    const sessionParticipants = await db.query.participants.findMany({
      where: eq(participants.quizSessionId, sessionId),
      orderBy: (participants, { desc }) => [desc(participants.joinedAt)],
    });

    return NextResponse.json({ participants: sessionParticipants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
