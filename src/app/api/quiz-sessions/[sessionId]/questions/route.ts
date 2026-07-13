import { NextResponse } from 'next/server';
import { db } from '@/db';
import { questions, options } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const quizQuestions = await db.query.questions.findMany({
      where: eq(questions.quizSessionId, sessionId),
      with: {
        options: {
          columns: {
            id: true,
            text: true,
            // intentionally omit isCorrect so client doesn't know the answer
          },
        },
      },
    });

    return NextResponse.json({ questions: quizQuestions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
