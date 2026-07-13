import { NextResponse } from 'next/server';
import { db } from '@/db';
import { questions, answers, participants } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    // Get total participants in the session
    const participantsList = await db.query.participants.findMany({
      where: eq(participants.quizSessionId, sessionId),
    });
    
    const totalStudents = participantsList.length;

    // Get stats per question
    const statsQuery = await db
      .select({
        questionId: questions.id,
        label: questions.content,
        correct: sql<number>`SUM(CASE WHEN ${answers.isCorrect} = 1 THEN 1 ELSE 0 END)`,
        incorrect: sql<number>`SUM(CASE WHEN ${answers.isCorrect} = 0 THEN 1 ELSE 0 END)`,
      })
      .from(questions)
      .leftJoin(answers, eq(questions.id, answers.questionId))
      .where(eq(questions.quizSessionId, sessionId))
      .groupBy(questions.id)
      .all();

    const questionStats = statsQuery.map((stat, idx) => ({
      id: stat.questionId,
      label: `Soal ${idx + 1}`, // Can be adjusted
      correct: Number(stat.correct) || 0,
      incorrect: Number(stat.incorrect) || 0,
    }));

    // Calculate average score
    const totalScore = participantsList.reduce((acc, curr) => acc + curr.score, 0);
    const averageScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;

    // Leaderboard
    const leaderboard = [...participantsList]
      .sort((a, b) => b.score - a.score)
      .map((p, idx) => ({
        rank: idx + 1,
        name: p.nickname,
        score: p.score,
        // Since we don't store total correct directly in participants, we can estimate or we could join it.
        // For now, let's omit or calculate if needed.
        correct: Math.floor(p.score / 100), // Assuming 100 points per correct answer for mockup
      }));

    return NextResponse.json({ 
      totalStudents,
      averageScore,
      questionStats,
      leaderboard: leaderboard.slice(0, 5) // Top 5
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
