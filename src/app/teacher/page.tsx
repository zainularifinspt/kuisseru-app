'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createNewSession, getSessions } from '@/app/actions/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Play, Plus, History, LogOut, Loader2, ArrowRight, Settings, Pencil, FileText, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signOut, useSession } from '@/lib/auth-client';
import { updateProfile } from '@/app/actions/user';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function TeacherPortal() {
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();
  const isLoggedIn = !!sessionData?.user;
  const user = sessionData?.user;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dashboard state
  const [sessions, setSessions] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Profile Edit state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchDashboardData(user.id);
      setNewName(user.name);
    }
  }, [isLoggedIn, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn.email({
          email,
          password
      });
      
      if (res.error) {
          setError(res.error.message || 'Login gagal');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setEmail('');
    setPassword('');
  };

  const fetchDashboardData = async (teacherId: string) => {
    setIsFetching(true);
    const result = await getSessions(teacherId);
    if (result.success) {
      setSessions(result.sessions);
    }
    setIsFetching(false);
  };

  const handleCreateSession = async () => {
    setIsLoading(true);
    const result = await createNewSession();
    if (result.success) {
      router.push(`/teacher/session/${result.sessionId}/edit`);
    } else {
      alert("Gagal membuat sesi");
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileUpdating(true);
    const res = await updateProfile(newName);
    if (res.success) {
      alert("Profil berhasil diperbarui!");
      setIsEditProfileOpen(false);
      window.location.reload();
    } else {
      alert("Gagal memperbarui profil: " + res.error);
    }
    setIsProfileUpdating(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Konsep</span>;
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-200 font-sans selection:bg-cyan-500/30 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none animate-pulse"></div>
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <Card className="rounded-[24px] border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.2)] bg-[#1e293b]/90 overflow-hidden">
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Pengaturan Profil</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Nama Lengkap</label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-12 rounded-xl bg-[#0f172a] border-slate-600 focus:border-cyan-400 text-white" required />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)} className="flex-1 h-12 rounded-xl border-white/20 text-slate-300 hover:bg-white/10 hover:text-white">Batal</Button>
                      <Button type="submit" disabled={isProfileUpdating} className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                        {isProfileUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            <div className="w-full max-w-[440px] relative z-10">
              <div className="absolute -top-16 right-0 z-50">
                <ThemeToggle />
              </div>
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] mb-6 border border-blue-400/20 relative group">
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                  <Sparkles className="w-8 h-8 text-cyan-400 relative z-10 animate-pulse" />
                </div>
                <h1 className="text-3xl font-normal text-white tracking-tight drop-shadow-md">
                  Masuk ke <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">KuisSeru</span>
                </h1>
                <p className="text-slate-400 mt-3 text-lg font-light">Sistem Cerdas Manajemen Pembelajaran</p>
              </div>

              <Card className="border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.2)] bg-[#111827]/80 backdrop-blur-2xl rounded-[32px] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
                <CardContent className="p-8 sm:p-10">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Email Akademik</label>
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@ulm.ac.id"
                        required
                        className="h-14 rounded-2xl bg-[#0f172a]/80 border-slate-600 focus:bg-[#1e293b] focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all text-base px-5 text-white shadow-inner"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Kata Sandi</label>
                      <Input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-14 rounded-2xl bg-[#0f172a]/80 border-slate-600 focus:bg-[#1e293b] focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all text-base px-5 text-white shadow-inner"
                      />
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-200 text-sm font-medium bg-red-900/50 border border-red-500/30 p-4 rounded-xl flex items-center gap-2"
                      >
                        <span className="flex-1">{error}</span>
                      </motion.div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] group mt-4 relative overflow-hidden border-0"
                    >
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
              
              <div className="text-center mt-8 text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse" />
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
            className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto relative z-10"
          >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.05)] dark:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <div className="flex items-center gap-4 px-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] dark:shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-400/30">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-slate-800 dark:text-white tracking-tight flex items-center gap-2 flex-wrap drop-shadow-sm">
                    <span>Halo, <span className="font-extrabold text-blue-600 dark:text-cyan-400">{user?.name}</span></span>
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${user?.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/30'}`}>
                      {user?.role === 'admin' ? 'Admin' : 'Guru'}
                    </span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Dashboard Utama KuisSeru</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ThemeToggle />
                {user?.role === 'admin' && (
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/admin')}
                    className="rounded-xl text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-white hover:bg-cyan-100 dark:hover:bg-cyan-600/20 border-cyan-300 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-900/20 shadow-sm dark:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-colors"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Panel Admin
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profil
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="rounded-xl text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                  <Card className="border border-slate-200 dark:border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.05)] dark:shadow-[0_0_40px_rgba(59,130,246,0.15)] bg-white/90 dark:bg-[#111827]/80 backdrop-blur-2xl rounded-[2rem] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:opacity-100 opacity-0 transition-opacity duration-500 pointer-events-none" />
                    <CardContent className="p-10 flex flex-col items-center text-center relative z-10">
                      <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                        <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight drop-shadow-sm dark:drop-shadow-md">Kuis Cerdas Baru</h2>
                      <p className="text-slate-600 dark:text-slate-400 mb-8 font-light leading-relaxed">
                        Bangkitkan semangat belajar dengan kuis interaktif yang dirancang khusus.
                      </p>
                      
                      <Button 
                        onClick={handleCreateSession}
                        disabled={isLoading}
                        size="lg"
                        className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all hover:scale-[1.03] active:scale-[0.98] relative overflow-hidden border-0"
                      >
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
                <div className="bg-white/80 dark:bg-[#111827]/60 backdrop-blur-xl rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/5 p-8 min-h-[500px]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-500/20">
                        <History className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-md">Sesi Kuis Anda</h2>
                    </div>
                  </div>

                  {isFetching ? (
                    <div className="flex justify-center items-center h-64 text-cyan-400">
                      <Loader2 className="w-10 h-10 animate-spin drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-5 border border-slate-700 shadow-inner">
                        <Sparkles className="w-10 h-10 text-slate-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-300 mb-2">Area Kerja Masih Kosong</h3>
                      <p className="text-slate-500 font-light">Mulai kuis interaktif pertama Anda hari ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={session.id} 
                          className="group bg-slate-50 dark:bg-[#1e293b]/60 hover:bg-slate-100 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-cyan-500/50 rounded-[1.5rem] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                        >
                          <div 
                            className="flex items-center gap-5 cursor-pointer flex-1"
                            onClick={() => {
                              if (session.status === 'draft') {
                                router.push(`/teacher/session/${session.id}/edit`);
                              } else {
                                router.push(`/teacher/session/${session.id}/dashboard`);
                              }
                            }}
                          >
                            <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-500 dark:group-hover:bg-cyan-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] dark:group-hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-300 border border-slate-300 dark:border-slate-700 group-hover:border-blue-400 dark:group-hover:border-cyan-400">
                              <Play className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-white ml-1 transition-colors" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors text-lg md:text-xl mb-1 tracking-tight">
                                {session.title}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-500 font-light">
                                ID Sesi: <span className="font-semibold text-slate-700 dark:text-slate-400">{session.id.split('-')[0].toUpperCase()}</span> • <span className="text-slate-600 dark:text-slate-400">{new Date(session.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 self-end sm:self-center">
                            {getStatusBadge(session.status)}
                            
                            {session.status !== 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/teacher/session/${session.id}/grading`);
                                }}
                                className="rounded-xl border-blue-500/30 dark:border-cyan-500/30 text-blue-600 dark:text-cyan-400 hover:bg-blue-500/10 dark:hover:bg-cyan-500/20 hover:text-blue-700 dark:hover:text-cyan-300 ml-2 shadow-[0_0_10px_rgba(59,130,246,0.1)] dark:shadow-[0_0_10px_rgba(34,211,238,0.1)] bg-transparent"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Penilaian
                              </Button>
                            )}
                            
                            <div 
                              className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-white group-hover:bg-blue-600 transition-all duration-300 cursor-pointer border border-slate-300 dark:border-slate-700 group-hover:border-blue-500"
                              onClick={() => {
                                if (session.status === 'draft') {
                                  router.push(`/teacher/session/${session.id}/edit`);
                                } else {
                                  router.push(`/teacher/session/${session.id}/dashboard`);
                                }
                              }}
                            >
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
