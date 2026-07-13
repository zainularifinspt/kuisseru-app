'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createNewSession, getSessions } from '@/app/actions/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Play, Plus, History, LogOut, Loader2, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans selection:bg-indigo-200">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center min-h-screen p-4"
          >
            <div className="w-full max-w-[440px]">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-slate-100">
                  <Sparkles className="w-8 h-8 text-indigo-500" />
                </div>
                <h1 className="text-3xl font-normal text-slate-800 tracking-tight">
                  Masuk ke <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">KuisSeru</span>
                </h1>
                <p className="text-slate-500 mt-3 text-lg font-light">Portal khusus manajemen pengajar</p>
              </div>

              <Card className="border-0 shadow-2xl shadow-indigo-100/50 bg-white/80 backdrop-blur-xl rounded-[32px] overflow-hidden">
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
                        className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 transition-all text-base px-5"
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
                        className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 transition-all text-base px-5"
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
                      className="w-full h-14 rounded-2xl text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] group mt-4"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Lanjutkan
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <div className="text-center mt-8 text-sm text-slate-400 font-medium">
                Sistem Terintegrasi Universitas Lambung Mangkurat
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="p-4 md:p-8 lg:p-12 max-w-6xl mx-auto"
          >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-normal text-slate-800 tracking-tight">
                    Selamat datang, <span className="font-semibold">M. Zainul Arifin</span>
                  </h1>
                  <p className="text-slate-500 text-lg">Pusat kendali sesi kuis interaktif Anda</p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Keluar
              </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Action Card */}
              <div className="md:col-span-1">
                <div className="sticky top-8 space-y-6">
                  <Card className="border-0 shadow-xl shadow-indigo-100/50 bg-white rounded-3xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
                    <CardContent className="p-8 flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Play className="w-8 h-8 text-indigo-600 ml-1" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 mb-2">Mulai Sesi Baru</h2>
                      <p className="text-slate-500 mb-8 font-medium">Buat ruang kelas virtual baru dan dapatkan QR code untuk siswa Anda.</p>
                      
                      <Button 
                        onClick={handleCreateSession}
                        disabled={isLoading}
                        size="lg"
                        className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Buat Kuis Baru</>}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* History List */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 min-h-[500px]">
                  <div className="flex items-center gap-3 mb-8">
                    <History className="w-6 h-6 text-slate-400" />
                    <h2 className="text-xl font-semibold text-slate-800">Riwayat Sesi</h2>
                  </div>

                  {isFetching ? (
                    <div className="flex justify-center items-center h-64 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-500 font-medium">Belum ada sesi kuis yang pernah dibuat.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <div 
                          key={session.id} 
                          onClick={() => router.push(`/teacher/session/${session.id}/dashboard`)}
                          className="group bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all hover:shadow-sm"
                        >
                          <div>
                            <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors text-lg mb-1">
                              {session.title}
                            </h3>
                            <p className="text-sm text-slate-400 font-medium">
                              ID: {session.id.split('-')[0].toUpperCase()} • {new Date(session.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(session.status)}
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-100 transition-all">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
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
