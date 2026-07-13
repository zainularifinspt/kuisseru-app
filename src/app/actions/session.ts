'use server';

import { db } from "@/db";
import { quizSessions } from "@/db/schema";
import { randomUUID } from 'crypto';

export async function createNewSession(teacherId: string = "teacher-1") {
  try {
    const sessionId = randomUUID();
    const shortId = sessionId.split('-')[0].toUpperCase();
    
    await db.insert(quizSessions).values({
      id: sessionId,
      title: `Kuis Interaktif ${shortId}`,
      status: 'waiting',
      teacherId: teacherId,
    });
    
    return { success: true, sessionId };
  } catch (error) {
    console.error("Failed to create session:", error);
    return { success: false, error: "Gagal membuat sesi baru" };
  }
}

export async function getSessions(teacherId: string = "teacher-1") {
  try {
    const sessions = await db.query.quizSessions.findMany({
      where: (sessions, { eq }) => eq(sessions.teacherId, teacherId),
      orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
    });
    return { success: true, sessions };
  } catch (error) {
    console.error("Failed to get sessions:", error);
    return { success: false, sessions: [] };
  }
}
