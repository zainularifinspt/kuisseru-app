'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createNewSession, getSessions } from '@/app/actions/session';
import { Loader2, Shield, GraduationCap, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signOut, useSession } from '@/lib/auth-client';
import { updateProfile } from '@/app/actions/user';
import Link from 'next/link';

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

  // Mobile sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
      const res = await signIn.email({ email, password });
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
        return <span className="bg-deep-obsidian text-surface-variant font-heading font-bold px-2 py-1 rounded-full text-xs uppercase tracking-wider">Konsep</span>;
      case 'waiting':
        return <span className="bg-deep-obsidian text-cyber-lime font-heading font-bold px-2 py-1 rounded-full text-xs uppercase tracking-wider">Menunggu</span>;
      case 'active':
        return <span className="bg-deep-obsidian text-[#4CAF50] font-heading font-bold px-2 py-1 rounded-full text-xs uppercase tracking-wider">Berjalan</span>;
      case 'finished':
        return <span className="bg-deep-obsidian text-outline font-heading font-bold px-2 py-1 rounded-full text-xs uppercase tracking-wider">Selesai</span>;
      default:
        return null;
    }
  };

  // ── LOGIN SCREEN ──
  if (!isLoggedIn) {
    return (
      <div className="min-h-[100dvh] bg-background text-on-background font-sans flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Shapes */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '-2s' }}></div>
        </div>

        {/* Profile Edit Modal */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-obsidian/60 backdrop-blur-md">
            <div className="w-full max-w-md bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl p-8">
              <h2 className="font-heading text-xl font-bold text-deep-obsidian mb-6">Pengaturan Profil</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="space-y-2">
                  <label className="font-heading font-semibold text-sm text-on-surface-variant">Nama Lengkap</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-full px-6 py-3 font-heading text-on-surface focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditProfileOpen(false)} className="flex-1 py-3 rounded-full border-2 border-deep-obsidian font-heading font-bold text-deep-obsidian hover:bg-surface-container-highest transition-colors">Batal</button>
                  <button type="submit" disabled={isProfileUpdating} className="flex-1 py-3 rounded-full bg-electric-blue text-on-primary font-heading font-bold border-2 border-deep-obsidian hover:shadow-[0_0_15px_rgba(0,82,255,0.3)] transition-all">
                    {isProfileUpdating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="w-full max-w-[440px] relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-deep-obsidian rounded-2xl mb-6 border-2 border-deep-obsidian shadow-[4px_4px_0px_rgba(10,10,10,1)]">
              <GraduationCap className="w-8 h-8 text-cyber-lime" strokeWidth={2.5} />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-obsidian tracking-tight">
              Masuk ke <span className="text-electric-blue">ASTHAQUIZZ</span>
            </h1>
            <p className="text-on-surface-variant mt-3 text-lg font-sans">Sistem Cerdas Manajemen Pembelajaran</p>
          </div>

          <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian rounded-xl overflow-hidden relative shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <div className="h-1 bg-[linear-gradient(90deg,#0052FF,#FF00E5,#0052FF)] bg-[length:200%_auto] animate-gradient-shift" />
            <div className="p-8 sm:p-10">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-heading font-semibold text-sm text-on-surface-variant px-2 uppercase tracking-wide">Email Akademik</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@ulm.ac.id"
                    required
                    className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-full px-6 py-4 font-heading text-lg font-medium text-on-surface placeholder:text-outline focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="font-heading font-semibold text-sm text-on-surface-variant px-2 uppercase tracking-wide">Kata Sandi</label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-full px-6 py-4 font-heading text-lg font-medium text-on-surface placeholder:text-outline focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all"
                  />
                </div>

                {error && (
                  <div className="text-error text-sm font-bold bg-error-container border-2 border-error p-4 rounded-xl flex items-center gap-2">
                    <span className="flex-1">{error}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 group relative rounded-full border-2 border-deep-obsidian p-1 overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,82,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,#0052FF,#FF00E5,#0052FF)] bg-[length:200%_auto] animate-gradient-shift opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-transparent px-8 py-4 rounded-full flex items-center justify-center gap-2">
                    <span className="font-heading text-xl text-on-primary font-bold tracking-wide">
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Masuk"}
                    </span>
                  </div>
                </button>
              </form>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/" className="font-heading font-semibold text-sm text-on-surface-variant hover:text-electric-blue transition-colors">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD SCREEN ──
  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'waiting');
  const finishedSessions = sessions.filter(s => s.status === 'finished');
  const draftSessions = sessions.filter(s => s.status === 'draft');

  return (
    <div className="min-h-[100dvh] bg-background text-on-background font-sans antialiased overflow-x-hidden">
      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-deep-obsidian/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl p-8">
              <h2 className="font-heading text-xl font-bold text-deep-obsidian mb-6">Pengaturan Profil</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="space-y-2">
                  <label className="font-heading font-semibold text-sm text-on-surface-variant">Nama Lengkap</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-full px-6 py-3 font-heading text-on-surface focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditProfileOpen(false)} className="flex-1 py-3 rounded-full border-2 border-deep-obsidian font-heading font-bold text-deep-obsidian hover:bg-surface-container-highest transition-colors">Batal</button>
                  <button type="submit" disabled={isProfileUpdating} className="flex-1 py-3 rounded-full bg-electric-blue text-on-primary font-heading font-bold border-2 border-deep-obsidian hover:shadow-[0_0_15px_rgba(0,82,255,0.3)] transition-all">
                    {isProfileUpdating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[55] bg-deep-obsidian/50 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* SideNavBar */}
      <nav className={`${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed left-0 top-0 h-screen w-64 bg-deep-obsidian border-r-2 border-deep-obsidian py-8 px-4 z-[56] transition-transform duration-300`}>
        <div className="mb-12 flex items-center gap-3">
          <img src="/logo.png" alt="AsthaQuizz Logo" className="w-10 h-10 object-contain drop-shadow-md" />
          <div>
            <h1 className="font-heading font-bold text-cyber-lime text-xl">ASTHAQUIZZ</h1>
            <p className="font-sans text-surface-variant/70 text-xs">Dashboard Guru</p>
          </div>
        </div>

        <ul className="flex flex-col gap-2 flex-grow">
          <li>
            <Link href="/teacher" className="flex items-center gap-4 px-4 py-3 rounded-lg text-cyber-lime font-heading font-bold text-sm border-l-4 border-cyber-lime bg-white/10 transition-colors duration-200 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              Dashboard
            </Link>
          </li>
          <li>
            <button onClick={handleCreateSession} disabled={isLoading} className="flex items-center gap-4 px-4 py-3 rounded-lg text-surface-variant/70 font-heading font-bold text-sm hover:bg-white/5 hover:text-surface-variant transition-colors duration-200 w-full text-left cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Kuis Baru
            </button>
          </li>
          {user?.role === 'admin' && (
            <li>
              <Link href="/admin" className="flex items-center gap-4 px-4 py-3 rounded-lg text-surface-variant/70 font-heading font-bold text-sm hover:bg-white/5 hover:text-surface-variant transition-colors duration-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                Panel Admin
              </Link>
            </li>
          )}
          <li>
            <button onClick={() => setIsEditProfileOpen(true)} className="flex items-center gap-4 px-4 py-3 rounded-lg text-surface-variant/70 font-heading font-bold text-sm hover:bg-white/5 hover:text-surface-variant transition-colors duration-200 w-full text-left cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
              Pengaturan
            </button>
          </li>
        </ul>

        <div className="mt-auto">
          <div className="bg-surface-variant/10 rounded-xl p-4 border border-surface-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-electric-blue flex items-center justify-center text-white font-heading font-bold border-2 border-cyber-lime">
                {user?.name?.substring(0,1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-sm text-surface-variant truncate">{user?.name}</p>
                <p className="font-sans text-xs text-surface-variant/70 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 mt-3 rounded-lg text-red-400 bg-red-400/10 font-heading font-bold text-sm hover:bg-red-500 hover:text-white transition-colors duration-200 w-full cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            Keluar
          </button>
        </div>
      </nav>

      {/* Main Content Area Wrapper */}
      <div className="md:ml-64 flex flex-col min-h-[100dvh]">
        
        {/* TopNavBar */}
        <header className="hidden md:flex justify-between items-center px-8 h-20 bg-surface/80 backdrop-blur-md border-b-2 border-deep-obsidian sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-xl font-bold text-deep-obsidian">ASTHAQUIZZ Dashboard</h2>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-heading font-bold text-sm text-on-surface-variant flex items-center gap-1.5">
              {user?.role === 'admin' ? (
                <><Shield className="w-4 h-4 text-electric-blue" /> Admin</>
              ) : (
                <><GraduationCap className="w-4 h-4 text-electric-blue" /> Guru</>
              )}
            </span>
          </div>
        </header>

        {/* Mobile Top Bar */}
        <header className="md:hidden flex justify-between items-center px-4 h-16 bg-surface/90 backdrop-blur-md border-b-2 border-deep-obsidian sticky top-0 z-40">
          <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-deep-obsidian" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
          </button>
          <span className="font-heading font-bold text-deep-obsidian">ASTHAQUIZZ</span>
          <div className="w-8 h-8 rounded-full bg-electric-blue flex items-center justify-center text-white font-heading font-bold text-sm">
            {user?.name?.substring(0,1).toUpperCase()}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 pb-32 md:pb-6">
          <div className="max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 pt-6 md:pt-0">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-deep-obsidian mb-2 flex items-center gap-3">
              Halo, {user?.name} 
              <Hand className="w-8 h-8 md:w-10 md:h-10 text-[#FFB02E] origin-bottom-right animate-[wave_2.5s_infinite]" />
            </h2>
            <p className="font-sans text-on-surface-variant text-lg">
              Anda memiliki {activeSessions.length} kuis aktif hari ini.
            </p>
          </div>
          <button 
            onClick={handleCreateSession}
            disabled={isLoading}
            className="bg-electric-blue text-on-primary font-heading font-bold px-8 py-4 rounded-full flex items-center gap-2 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,82,255,0.4)] transition-all duration-300 border-2 border-deep-obsidian disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Buat Kuis Baru
              </>
            )}
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Quick Stats Bento */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Stat Card 1 */}
            <div className="bg-surface-container rounded-xl border-2 border-deep-obsidian p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-deep-obsidian flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyber-lime" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                </div>
                <span className="bg-deep-obsidian text-cyber-lime font-heading font-bold px-3 py-1 rounded-full text-xs">
                  {sessions.length} total
                </span>
              </div>
              <h3 className="font-heading text-3xl font-bold text-deep-obsidian relative z-10">{sessions.length}</h3>
              <p className="font-sans text-on-surface-variant relative z-10">Total Sesi Kuis</p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-surface-container rounded-xl border-2 border-deep-obsidian p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-mesh-pink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-deep-obsidian flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-mesh-pink" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
                <span className="bg-deep-obsidian text-mesh-pink font-heading font-bold px-3 py-1 rounded-full text-xs">
                  {finishedSessions.length} selesai
                </span>
              </div>
              <h3 className="font-heading text-3xl font-bold text-deep-obsidian relative z-10">{finishedSessions.length}</h3>
              <p className="font-sans text-on-surface-variant relative z-10">Kuis Selesai</p>
            </div>
          </div>

          {/* Live Activity Widget */}
          <div className="lg:col-span-4 bg-deep-obsidian rounded-xl p-6 border-2 border-deep-obsidian text-surface">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-lg font-bold text-surface">Aktivitas Terkini</h3>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-cyber-lime opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-lime"></span>
              </span>
            </div>
            <div className="space-y-4">
              {activeSessions.length > 0 ? activeSessions.slice(0,3).map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-electric-blue/20 flex items-center justify-center border border-electric-blue/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-electric-blue" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm truncate"><span className="font-semibold text-cyber-lime">{s.title}</span></p>
                    <p className="font-sans text-xs text-surface-variant/50">Status: {s.status}</p>
                  </div>
                </div>
              )) : (
                <p className="font-sans text-sm text-surface-variant/50">Belum ada aktivitas terbaru.</p>
              )}
            </div>
          </div>
        </div>

        {/* Active Quizzes Section */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-8 border-b-2 border-deep-obsidian pb-4">
            <h3 className="font-heading text-xl font-bold text-deep-obsidian">Sesi Kuis Aktif</h3>
            <span className="bg-deep-obsidian text-surface px-3 py-1 rounded-full font-heading font-bold text-sm">{activeSessions.length}</span>
          </div>
          
          {isFetching ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-electric-blue" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <div key={session.id} className="bg-surface rounded-xl border-2 border-deep-obsidian p-6 hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full group cursor-pointer"
                  onClick={() => router.push(`/teacher/session/${session.id}/dashboard`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(session.status)}
                  </div>
                  <h4 className="font-heading text-lg font-bold text-deep-obsidian mb-2 line-clamp-2">{session.title}</h4>
                  <p className="font-sans text-on-surface-variant mb-6 text-sm">
                    ID: {session.id.split('-')[0].toUpperCase()} • {new Date(session.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                  <div className="mt-auto flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); router.push(`/teacher/session/${session.id}/dashboard`); }}
                      className="flex-1 bg-electric-blue text-on-primary font-heading font-bold py-3 rounded-full flex items-center justify-center gap-2 border-2 border-deep-obsidian group-hover:shadow-[0_0_15px_rgba(0,82,255,0.3)] transition-all text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      Kontrol
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); router.push(`/teacher/session/${session.id}/grading`); }}
                      className="bg-surface-container text-on-surface-variant font-heading font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 border-2 border-deep-obsidian hover:bg-surface-container-highest transition-all text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                      Nilai
                    </button>
                  </div>
                </div>
              ))}
              {activeSessions.length === 0 && (
                <div className="col-span-full bg-surface-container border-2 border-dashed border-outline p-6 rounded-xl flex flex-col items-center justify-center text-center min-h-[200px]">
                  <p className="font-heading font-bold text-on-surface-variant">Belum ada kuis aktif.</p>
                  <p className="font-sans text-sm text-outline mt-1">Buat kuis baru untuk memulai!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* All Sessions / History Section */}
        {(finishedSessions.length > 0 || draftSessions.length > 0) && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-8 border-b-2 border-deep-obsidian pb-4">
              <h3 className="font-heading text-xl font-bold text-deep-obsidian">Riwayat & Konsep</h3>
              <span className="bg-deep-obsidian text-surface px-3 py-1 rounded-full font-heading font-bold text-sm">{finishedSessions.length + draftSessions.length}</span>
            </div>
            <div className="space-y-4">
              {[...draftSessions, ...finishedSessions].map((session) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={session.id} 
                  className="bg-surface rounded-xl border-2 border-deep-obsidian p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                  onClick={() => {
                    if (session.status === 'draft') {
                      router.push(`/teacher/session/${session.id}/edit`);
                    } else {
                      router.push(`/teacher/session/${session.id}/grading`);
                    }
                  }}
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center group-hover:bg-electric-blue group-hover:text-white transition-all duration-300 border-2 border-deep-obsidian flex-shrink-0">
                      {session.status === 'draft' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-outline group-hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-outline group-hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-deep-obsidian group-hover:text-electric-blue transition-colors text-lg truncate">
                        {session.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant font-sans">
                        ID: {session.id.split('-')[0].toUpperCase()} • {new Date(session.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(session.status)}
                    {session.status !== 'draft' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/teacher/session/${session.id}/grading`); }}
                        className="bg-surface-container text-on-surface-variant font-heading font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 border-2 border-deep-obsidian hover:bg-electric-blue hover:text-white transition-all text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                        Penilaian
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}


        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface/90 backdrop-blur-md border-t-2 border-deep-obsidian z-50 px-6 py-4 flex justify-between items-center">
        <Link href="/teacher" className="flex flex-col items-center gap-1 text-electric-blue">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
          <span className="font-heading font-bold text-[10px]">Home</span>
        </Link>
        <button onClick={handleCreateSession} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-electric-blue">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          <span className="font-heading font-bold text-[10px]">Buat</span>
        </button>
        <button onClick={() => setIsEditProfileOpen(true)} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-electric-blue">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span className="font-heading font-bold text-[10px]">Profil</span>
        </button>
      </nav>
      </div>
    </div>
  );
}
