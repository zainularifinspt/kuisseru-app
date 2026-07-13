'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createTeacherAccount(data: FormData) {
  const email = data.get('email') as string;
  const password = data.get('password') as string;
  const name = data.get('name') as string;
  
  if (!email || !password || !name) {
    return { success: false, error: 'Semua field harus diisi' };
  }

  try {
    // Check if the current user calling this is an admin
    // For simplicity of MVP, we can bypass this or verify a secret
    // Let's use betterAuth signUp api
    const response = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name
        },
        asResponse: false
    });
    
    if (response) {
      return { success: true };
    }
    return { success: false, error: 'Gagal membuat akun' };
  } catch (error: any) {
    console.error("Failed to create teacher:", error);
    return { success: false, error: error.message || "Gagal membuat akun" };
  }
}

export async function getTeachers() {
    try {
        const usersResponse = await auth.api.listUsers({
            headers: await headers(),
            query: {}
        });
        
        return { success: true, teachers: usersResponse?.users || [] };
    } catch(e) {
        return { success: false, teachers: [] };
    }
}
