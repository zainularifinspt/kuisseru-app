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
    const response = await auth.api.signUpEmail({
        headers: await headers(),
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
    console.error("Full error from better-auth:", error, error.cause, error.message);
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
