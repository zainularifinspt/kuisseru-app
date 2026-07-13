'use server';

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateProfile(newName: string) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        return { success: false, error: "Unauthorized" };
    }
    
    await db.update(user)
      .set({ name: newName })
      .where(eq(user.id, session.user.id));
      
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    return { success: false, error: error.message };
  }
}
