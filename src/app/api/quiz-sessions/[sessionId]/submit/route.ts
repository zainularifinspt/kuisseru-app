import { NextResponse } from 'next/server';
import { db } from '@/db';
import { options, participants, answers } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { pusherServer } from '@/lib/pusher';
import { randomUUID } from 'crypto';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { questionId, optionId, participantId } = body;

    if (!sessionId || !questionId || !participantId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let isCorrect = false;
    
    // Check if the option is correct if provided
    if (optionId) {
      const selectedOption = await db.query.options.findFirst({
        where: eq(options.id, optionId),
      });

      if (selectedOption) {
        isCorrect = selectedOption.isCorrect;
      }
    }

    const pointsAwarded = isCorrect ? 100 : 0; // Fixed 100 points for correct answer for now

    // Update participant score
    let newScore = 0;
    if (isCorrect) {
      const result = await db
        .update(participants)
        .set({ score: sql`${participants.score} + ${pointsAwarded}` })
        .where(eq(participants.id, participantId))
        .returning({ score: participants.score });
        
      if (result.length > 0) {
        newScore = result[0].score;
      }
    } else {
      const p = await db.query.participants.findFirst({
        where: eq(participants.id, participantId)
      });
      newScore = p?.score || 0;
    }

    // Insert the answer into the database (if they actually answered)
    if (optionId) {
      await db.insert(answers).values({
        id: randomUUID(),
        participantId,
        questionId,
        optionId,
        isCorrect: isCorrect,
        answeredAt: new Date(),
      });
    }

    // Trigger Pusher event for real-time leaderboard and stats updates
    try {
      await pusherServer.trigger(`session-${sessionId}`, 'answer-submitted', {
        participantId,
        score: newScore,
        questionId,
        isCorrect
      });
    } catch (e) {
      console.error('Failed to trigger pusher event', e);
    }

    // Fetch the correct option for this question to send back to client for review mode
    const correctOption = await db.query.options.findFirst({
      where: (opts, { eq, and }) => and(eq(opts.questionId, questionId), eq(opts.isCorrect, true))
    });

    return NextResponse.json({ 
      isCorrect, 
      newScore,
      pointsAwarded,
      correctOptionId: correctOption?.id || null
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
