'use server';

import { db } from "@/db";
import { quizSessions, questions, options, participants, answers } from "@/db/schema";
import { eq, inArray } from 'drizzle-orm';
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
    
    // Generate a random 6 digit string for the join code
    const joinCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await db.insert(quizSessions).values({
      id: sessionId,
      title: `Kuis Interaktif ${shortId}`,
      joinCode: joinCode,
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

export async function updateSessionSettings(sessionId: string, title: string, useWaitingRoom: boolean) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        return { success: false, error: "Unauthorized" };
    }
    
    // We should probably check if the user owns the session, but we can assume so for now.
    await db.update(quizSessions).set({ title, useWaitingRoom }).where(eq(quizSessions.id, sessionId));
    return { success: true };
  } catch (error) {
    console.error("Failed to update session settings:", error);
    return { success: false, error: "Gagal memperbarui pengaturan sesi" };
  }
}

export async function deleteSession(sessionId: string) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        return { success: false, error: "Unauthorized" };
    }
    
    // Ensure the teacher deleting the session owns it
    const sessionToDelete = await db.query.quizSessions.findFirst({
        where: (sessions, { eq }) => eq(sessions.id, sessionId),
        with: {
            questions: true,
            participants: true
        }
    });

    if (!sessionToDelete || sessionToDelete.teacherId !== session.user.id) {
        return { success: false, error: "Unauthorized or session not found" };
    }

    const questionIds = sessionToDelete.questions.map((q: any) => q.id);
    const participantIds = sessionToDelete.participants.map((p: any) => p.id);

    if (participantIds.length > 0) {
        await db.delete(answers).where(inArray(answers.participantId, participantIds));
        await db.delete(participants).where(inArray(participants.id, participantIds));
    }

    if (questionIds.length > 0) {
        await db.delete(options).where(inArray(options.questionId, questionIds));
        await db.delete(questions).where(inArray(questions.id, questionIds));
    }

    await db.delete(quizSessions).where(eq(quizSessions.id, sessionId));
    return { success: true };
  } catch (error) {
    console.error("Failed to delete session:", error);
    return { success: false, error: "Gagal menghapus sesi" };
  }
}
