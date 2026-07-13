'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createNewSession, getSessions } from '@/app/actions/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Play, Plus, History, LogOut, Loader2, ArrowRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeacherPortal() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dashboard state
  const [sessions, setSessions] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Check simple session storage for persistence
  useEffect(() => {
    const auth = sessionStorage.getItem('teacher_auth');
    if (auth === 'true') {
      setIsLoggedIn(true);
      fetchDashboardData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for smooth animation
    setTimeout(() => {
      if (email === 'mzainul.arifin@ulm.ac.id' && password === 'ARIfin8167') {
        sessionStorage.setItem('teacher_auth', 'true');
        setIsLoggedIn(true);
        fetchDashboardData();
      } else {
        setError('Email atau password salah');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('teacher_auth');
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  const fetchDashboardData = async () => {
    setIsFetching(true);
    const result = await getSessions();
    if (result.success) {
      setSessions(result.sessions);
    }
    setIsFetching(false);
  };

  const handleCreateSession = async () => {
    setIsLoading(true);
    const result = await createNewSession();
    if (result.success) {
      router.push(`/teacher/session/${result.sessionId}/dashboard`);
    } else {
      alert("Gagal membuat sesi");
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Menunggu</span>;
      case 'active':
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Berjalan</span>;
      case 'finished':
        return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Selesai</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans selection:bg-blue-200">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden"
          >
            {/* AI Background Glows */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-[440px] relative z-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-slate-100 relative group">
                  <div className="absolute inset-0 bg-blue-100 rounded-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                  <Sparkles className="w-8 h-8 text-blue-500 relative z-10" />
                </div>
                <h1 className="text-3xl font-normal text-slate-800 tracking-tight">
                  Masuk ke <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">KuisSeru</span>
                </h1>
                <p className="text-slate-500 mt-3 text-lg font-light">Sistem Cerdas Manajemen Pembelajaran</p>
              </div>

              <Card className="border border-white/50 shadow-2xl shadow-blue-900/10 bg-white/70 backdrop-blur-2xl rounded-[32px] overflow-hidden">
                <CardContent className="p-8 sm:p-10">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 ml-1">Email Akademik</label>
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@ulm.ac.id"
                        required
                        className="h-14 rounded-2xl bg-white/50 border-white/50 shadow-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 transition-all text-base px-5"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 ml-1">Kata Sandi</label>
                      <Input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-14 rounded-2xl bg-white/50 border-white/50 shadow-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 transition-all text-base px-5"
                      />
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-sm font-medium bg-red-50 p-4 rounded-xl flex items-center gap-2"
                      >
                        <span className="flex-1">{error}</span>
                      </motion.div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-14 rounded-2xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] group mt-4 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative z-10 flex items-center justify-center">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Masuk
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <div className="text-center mt-8 text-sm text-slate-400 font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span>Didukung oleh AI KuisSeru</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto relative"
          >
            {/* Subtle Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none -z-10" />

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white/50 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-sm">
              <div className="flex items-center gap-4 px-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-slate-800 tracking-tight">
                    Halo, <span className="font-semibold">Zainul Arifin</span>
                  </h1>
                  <p className="text-slate-500 text-sm">Dashboard Utama KuisSeru</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => alert("Fitur Manajemen Akun (Ubah Profil & Sandi) sedang dalam tahap pengembangan.")}
                  className="rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 border-white bg-white/80 shadow-sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Pengaturan
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Action Card */}
              <div className="md:col-span-4">
                <div className="sticky top-8 space-y-6">
                  <Card className="border border-white/50 shadow-2xl shadow-blue-900/5 bg-white/70 backdrop-blur-2xl rounded-[32px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 group-hover:opacity-100 opacity-0 transition-opacity duration-500 pointer-events-none" />
                    <CardContent className="p-10 flex flex-col items-center text-center relative z-10">
                      <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-blue-100 shadow-inner">
                        <Sparkles className="w-10 h-10 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-semibold text-slate-800 mb-3 tracking-tight">Kuis Cerdas Baru</h2>
                      <p className="text-slate-500 mb-8 font-light leading-relaxed">
                        Bangkitkan semangat belajar dengan kuis interaktif yang dirancang khusus.
                      </p>
                      
                      <Button 
                        onClick={handleCreateSession}
                        disabled={isLoading}
                        size="lg"
                        className="w-full h-14 rounded-2xl text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 hover:opacity-100 transition-opacity" />
                        <span className="relative z-10 flex items-center justify-center">
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Mulai Sekarang</>}
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* History List */}
              <div className="md:col-span-8">
                <div className="bg-white/70 backdrop-blur-xl rounded-[32px] shadow-xl shadow-slate-200/40 border border-white p-8 min-h-[500px]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <History className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-medium text-slate-800">Sesi Kuis Anda</h2>
                    </div>
                  </div>

                  {isFetching ? (
                    <div className="flex justify-center items-center h-64 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-700 mb-1">Area Kerja Masih Kosong</h3>
                      <p className="text-slate-400 font-light">Mulai kuis interaktif pertama Anda hari ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={session.id} 
                          onClick={() => router.push(`/teacher/session/${session.id}/dashboard`)}
                          className="group bg-white hover:bg-blue-50/30 border border-slate-100 hover:border-blue-200 rounded-[24px] p-6 flex items-center justify-between cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-900/5"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                              <Play className="w-5 h-5 text-slate-400 group-hover:text-blue-500 ml-1" />
                            </div>
                            <div>
                              <h3 className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors text-lg mb-1 tracking-tight">
                                {session.title}
                              </h3>
                              <p className="text-sm text-slate-400 font-light">
                                ID Sesi: <span className="font-medium text-slate-500">{session.id.split('-')[0].toUpperCase()}</span> • {new Date(session.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(session.status)}
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-100 transition-all">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
