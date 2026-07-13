'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Sparkles, UserPlus, Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-client';

export default function AdminPortal() {
  const router = useRouter();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // Teacher form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Handle simple admin login (for MVP phase)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') { // Simple hardcoded admin password for MVP
      setIsAdminLoggedIn(true);
    } else {
      alert('Password admin salah!');
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    const { data, error } = await signUp.email({
        email,
        password,
        name
    });
    
    if (data) {
      setMessage('✅ Akun Guru berhasil dibuat!');
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setMessage('❌ Gagal: ' + (error?.message || 'Terjadi kesalahan'));
    }
    setIsSubmitting(false);
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl rounded-3xl border-0 overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Portal Admin</h1>
            <p className="text-slate-500 mb-8 text-center">Silakan masukkan kata sandi akses admin</p>
            
            <form onSubmit={handleAdminLogin} className="w-full space-y-4">
              <Input
                type="password"
                placeholder="Kata Sandi Admin"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="h-14 rounded-xl"
                required
              />
              <Button type="submit" className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700">
                Akses Panel Admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Manajemen Pengguna</h1>
              <p className="text-slate-500">Buat dan kelola akun guru (Fase 0)</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push('/')} className="rounded-xl">
            Kembali ke Beranda
          </Button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="rounded-3xl border-0 shadow-xl shadow-blue-900/5">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <UserPlus className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold">Buat Akun Guru Baru</h2>
              </div>
              
              <form onSubmit={handleCreateTeacher} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Nama Lengkap</label>
                  <Input 
                    value={name} onChange={(e) => setName(e.target.value)} required
                    placeholder="Contoh: Budi Santoso, S.Pd" className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Email Login</label>
                  <Input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="guru@sekolah.id" className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Kata Sandi</label>
                  <Input 
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    placeholder="Minimal 8 karakter" className="rounded-xl h-12"
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white mt-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buat Akun Guru'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="rounded-3xl border-0 shadow-xl shadow-blue-900/5 bg-blue-600 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
             <CardContent className="p-8 relative z-10">
                <Users className="w-10 h-10 mb-4 text-blue-200" />
                <h2 className="text-2xl font-bold mb-2">Manajemen Kredensial</h2>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  Semua akun yang dibuat di sini akan menggunakan sistem autentikasi aman (Better Auth).
                  Guru dapat login menggunakan email dan password yang Anda tentukan di panel ini.
                </p>
                <div className="p-4 bg-black/20 rounded-2xl backdrop-blur-sm border border-white/10">
                   <p className="text-sm text-blue-50">Sesuai dengan PRD Fase 0, ini adalah pintu utama untuk mengatur akses pengajar sebelum mereka bisa membuat kuis interaktif (Fase 1).</p>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
