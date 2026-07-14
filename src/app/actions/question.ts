'use server';

import { db } from "@/db";
import { questions, options, quizSessions } from "@/db/schema";
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function addQuestion(sessionId: string, questionContent: string, questionOptions: {text: string, isCorrect: boolean}[], timeLimit: number = 1) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        return { success: false, error: "Unauthorized" };
    }

    const questionId = randomUUID();
    
    // Add the question
    await db.insert(questions).values({
      id: questionId,
      content: questionContent,
      quizSessionId: sessionId,
      timeLimit: timeLimit,
    });
    
    // Add the options
    if (questionOptions.length > 0) {
        const optionsToInsert = questionOptions.map(opt => ({
            id: randomUUID(),
            questionId,
            text: opt.text,
            isCorrect: opt.isCorrect,
        }));
        
        await db.insert(options).values(optionsToInsert);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to add question:", error);
    return { success: false, error: "Gagal menambahkan pertanyaan" };
  }
}

export async function updateQuestion(questionId: string, questionContent: string, questionOptions: {text: string, isCorrect: boolean}[], timeLimit: number = 1) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        return { success: false, error: "Unauthorized" };
    }

    // Update the question
    await db.update(questions)
      .set({
        content: questionContent,
        timeLimit: timeLimit,
      })
      .where(eq(questions.id, questionId));
    
    // Replace options: delete old, insert new
    await db.delete(options).where(eq(options.questionId, questionId));
    
    if (questionOptions.length > 0) {
        const optionsToInsert = questionOptions.map(opt => ({
            id: randomUUID(),
            questionId,
            text: opt.text,
            isCorrect: opt.isCorrect,
        }));
        
        await db.insert(options).values(optionsToInsert);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update question:", error);
    return { success: false, error: "Gagal mengubah pertanyaan" };
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        return { success: false, error: "Unauthorized" };
    }

    // Delete options first (if not cascading)
    await db.delete(options).where(eq(options.questionId, questionId));
    // Delete question
    await db.delete(questions).where(eq(questions.id, questionId));
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete question:", error);
    return { success: false, error: "Gagal menghapus pertanyaan" };
  }
}

export async function publishSession(sessionId: string) {
    try {
        await db.update(quizSessions)
            .set({ status: 'waiting' })
            .where(eq(quizSessions.id, sessionId));
            
        return { success: true };
    } catch(e) {
        return { success: false };
    }
}

export async function getSessionQuestions(sessionId: string) {
    try {
        const sessionQs = await db.query.questions.findMany({
            where: (questions, { eq }) => eq(questions.quizSessionId, sessionId),
            with: {
                options: true
            }
        });
        return { success: true, questions: sessionQs };
    } catch(e) {
        return { success: false, questions: [] };
    }
}
