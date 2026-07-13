'use server';

import { db } from "@/db";
import { user, quizSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({
      headers: await headers()
  });
  
  if (!session || !session.user || session.user.role !== 'admin') {
      throw new Error("Unauthorized: Admin only");
  }
  return session.user;
}

export async function getAllSessions() {
  try {
    await requireAdmin();
    const sessions = await db.query.quizSessions.findMany({
      with: {
        teacher: {
          columns: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [desc(quizSessions.createdAt)],
    });
    return { success: true, sessions };
  } catch (error: any) {
    console.error("Failed to get all sessions:", error);
    return { success: false, error: error.message, sessions: [] };
  }
}

export async function getTeachers() {
  try {
    await requireAdmin();
    // Assuming all non-admin users are teachers, or we just return all users for MVP
    const teachers = await db.query.user.findMany({
      orderBy: [desc(user.createdAt)],
    });
    return { success: true, teachers };
  } catch (error: any) {
    console.error("Failed to get teachers:", error);
    return { success: false, error: error.message, teachers: [] };
  }
}

export async function deleteTeacher(userId: string) {
  try {
    await requireAdmin();
    
    // As requested: "kuisnya tetap ada namun tanpa nama pembuat (Set Null)"
    // quizSessions.teacherId is now nullable
    await db.update(quizSessions)
      .set({ teacherId: null })
      .where(eq(quizSessions.teacherId, userId));
      
    // Delete the user (this will cascade delete sessions and accounts if we configured it, 
    // but better-auth adapter doesn't automatically cascade unless set in DB schema).
    // Let's just delete from user table.
    await db.delete(user).where(eq(user.id, userId));
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete teacher:", error);
    return { success: false, error: error.message };
  }
}
