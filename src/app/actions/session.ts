'use server';

import { db } from "@/db";
import { quizSessions } from "@/db/schema";
import { randomUUID } from 'crypto';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createNewSession() {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        return { success: false, error: "Unauthorized" };
    }
    
    const sessionId = randomUUID();
    const shortId = sessionId.split('-')[0].toUpperCase();
    
    await db.insert(quizSessions).values({
      id: sessionId,
      title: `Kuis Interaktif ${shortId}`,
      status: 'draft',
      teacherId: session.user.id,
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
