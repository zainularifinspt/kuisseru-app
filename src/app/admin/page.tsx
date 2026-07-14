'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { signIn, signOut, useSession, signUp } from '@/lib/auth-client';
import { getAllSessions, getTeachers, deleteTeacher } from '@/app/actions/admin';
import { updateProfile } from '@/app/actions/user';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPortal() {
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();
  
  const isLoggedIn = !!sessionData?.user;
  const user = sessionData?.user;
  const isAdmin = user?.role === 'admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Dashboard Data
  const [sessions, setSessions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Profile Edit
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);

  // Teacher Creation Modal
  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
  const [createMessage, setCreateMessage] = useState('');

  // Mobile sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchAdminData();
      setNewName(user.name);
    }
  }, [isLoggedIn, isAdmin, user]);

  const fetchAdminData = async () => {
    setIsDataLoading(true);
    const [sessionsRes, teachersRes] = await Promise.all([
      getAllSessions(),
      getTeachers()
    ]);
    if (sessionsRes.success) setSessions(sessionsRes.sessions);
    if (teachersRes.success) setTeachers(teachersRes.teachers);
    setIsDataLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError('');

    try {
      const res = await signIn.email({ email, password });
      if (res.error) {
        setLoginError(res.error.message || 'Login gagal');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Terjadi kesalahan saat login');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setEmail('');
    setPassword('');
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus guru ${name}?\n\nKuis yang dibuat oleh guru ini tidak akan dihapus.`)) {
      const res = await deleteTeacher(id);
      if (res.success) {
        fetchAdminData();
      } else {
        alert("Gagal menghapus guru: " + res.error);
      }
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

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingTeacher(true);
    setCreateMessage('');
    
    const { data, error } = await signUp.email({
        email: newTeacherEmail,
        password: newTeacherPassword,
        name: newTeacherName
    });
    
    if (data) {
      setCreateMessage('✅ Akun Guru berhasil dibuat!');
      setNewTeacherName('');
      setNewTeacherEmail('');
      setNewTeacherPassword('');
      fetchAdminData();
      setTimeout(() => {
        setIsCreateTeacherOpen(false);
        setCreateMessage('');
      }, 2000);
    } else {
      setCreateMessage('❌ Gagal: ' + (error?.message || 'Terjadi kesalahan'));
    }
    setIsCreatingTeacher(false);
  };

  if (isPending) {
    return <div className="min-h-[100dvh] flex items-center justify-center bg-background"><Loader2 className="w-10 h-10 animate-spin text-electric-blue" /></div>;
  }

  // ── LOGIN / ACCESS DENIED SCREEN ──
  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-[100dvh] bg-background text-on-background font-sans flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Shapes */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-mesh-pink rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-electric-blue rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '-2s' }}></div>
        </div>

        <div className="w-full max-w-[440px] relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-deep-obsidian rounded-xl mb-6 border-2 border-deep-obsidian shadow-[4px_4px_0px_rgba(10,10,10,1)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyber-lime" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-obsidian tracking-tight">
              Portal Admin
            </h1>
            <p className="text-on-surface-variant mt-3 text-sm font-sans font-medium">
              {isLoggedIn && !isAdmin ? "Anda login sebagai Guru. Akun ini tidak memiliki akses Admin." : "Silakan login menggunakan email & sandi administrator."}
            </p>
          </div>

          <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian rounded-xl overflow-hidden relative shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <div className="h-1 bg-[linear-gradient(90deg,#0052FF,#FF00E5,#0052FF)] bg-[length:200%_auto] animate-gradient-shift" />
            <div className="p-8 sm:p-10">
              {!isLoggedIn ? (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-heading font-bold text-sm text-on-surface-variant uppercase tracking-wide">Email Admin</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@kuisseru.com"
                      required
                      className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl px-4 py-3 font-heading text-base font-medium text-on-surface placeholder:text-outline focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-heading font-bold text-sm text-on-surface-variant uppercase tracking-wide">Kata Sandi</label>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl px-4 py-3 font-heading text-base font-medium text-on-surface placeholder:text-outline focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all"
                    />
                  </div>

                  {loginError && (
                    <div className="text-error text-sm font-bold bg-error-container border-2 border-error p-3 rounded-lg flex items-center gap-2">
                      <span className="flex-1">{loginError}</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoginLoading}
                    className="w-full mt-4 group relative rounded-xl border-2 border-deep-obsidian p-1 overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,82,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,#0052FF,#FF00E5,#0052FF)] bg-[length:200%_auto] animate-gradient-shift opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-transparent px-8 py-3 rounded-lg flex items-center justify-center gap-2">
                      <span className="font-heading text-lg text-on-primary font-bold tracking-wide">
                        {isLoginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Akses Panel Admin"}
                      </span>
                    </div>
                  </button>
                </form>
              ) : (
                <button onClick={handleLogout} className="w-full mt-4 bg-error text-on-error font-heading font-bold px-8 py-4 rounded-xl border-2 border-deep-obsidian hover:shadow-[0_0_15px_rgba(186,26,26,0.4)] transition-all cursor-pointer">
                  Logout & Kembali
                </button>
              )}
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/" className="font-heading font-semibold text-sm text-on-surface-variant hover:text-electric-blue transition-colors">
              ← Kembali ke Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── ADMIN DASHBOARD ──
  const totalStudents = sessions.reduce((acc, curr) => acc + (curr._count?.participants || 0), 0);

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
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl px-4 py-3 font-heading text-on-surface focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditProfileOpen(false)} className="flex-1 py-3 rounded-xl border-2 border-deep-obsidian font-heading font-bold text-deep-obsidian hover:bg-surface-container-highest transition-colors">Batal</button>
                  <button type="submit" disabled={isProfileUpdating} className="flex-1 py-3 rounded-xl bg-electric-blue text-on-primary font-heading font-bold border-2 border-deep-obsidian hover:shadow-[0_0_15px_rgba(0,82,255,0.3)] transition-all">
                    {isProfileUpdating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Teacher Modal */}
      <AnimatePresence>
        {isCreateTeacherOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-deep-obsidian/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-mesh-pink flex items-center justify-center border-2 border-deep-obsidian">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-on-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <h2 className="font-heading text-xl font-bold text-deep-obsidian">Tambah Guru Baru</h2>
              </div>
              <form onSubmit={handleCreateTeacher} className="space-y-5">
                <div className="space-y-2">
                  <label className="font-heading font-semibold text-sm text-on-surface-variant">Nama Lengkap</label>
                  <input value={newTeacherName} onChange={(e) => setNewTeacherName(e.target.value)} className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl px-4 py-3 font-heading text-on-surface focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="font-heading font-semibold text-sm text-on-surface-variant">Email (Sebagai Username)</label>
                  <input type="email" value={newTeacherEmail} onChange={(e) => setNewTeacherEmail(e.target.value)} className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl px-4 py-3 font-heading text-on-surface focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="font-heading font-semibold text-sm text-on-surface-variant">Kata Sandi Default</label>
                  <input type="password" value={newTeacherPassword} onChange={(e) => setNewTeacherPassword(e.target.value)} minLength={8} className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl px-4 py-3 font-heading text-on-surface focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all" required />
                  <p className="text-xs text-on-surface-variant/70 font-sans">Minimal 8 karakter.</p>
                </div>
                
                {createMessage && (
                  <div className={`p-3 rounded-lg border-2 font-heading font-bold text-sm ${createMessage.includes('✅') ? 'bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]' : 'bg-error-container border-error text-error'}`}>
                    {createMessage}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsCreateTeacherOpen(false)} className="flex-1 py-3 rounded-xl border-2 border-deep-obsidian font-heading font-bold text-deep-obsidian hover:bg-surface-container-highest transition-colors">Batal</button>
                  <button type="submit" disabled={isCreatingTeacher} className="flex-1 py-3 rounded-xl bg-electric-blue text-on-primary font-heading font-bold border-2 border-deep-obsidian hover:shadow-[0_0_15px_rgba(0,82,255,0.3)] transition-all">
                    {isCreatingTeacher ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Buat Akun'}
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
      <nav className={`${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed left-0 top-0 h-screen w-64 bg-deep-obsidian border-r-2 border-deep-obsidian py-8 px-4 z-[56] transition-transform duration-300 flex flex-col`}>
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyber-lime flex items-center justify-center font-heading font-bold text-deep-obsidian text-lg">
            A
          </div>
          <div>
            <h1 className="font-heading font-bold text-cyber-lime text-xl">KuisSeru</h1>
            <p className="font-sans text-surface-variant/70 text-xs mt-1">Admin Console</p>
          </div>
        </div>

        <ul className="flex flex-col gap-2 flex-grow">
          <li>
            <Link href="/admin" className="flex items-center gap-4 px-4 py-3 rounded-lg text-cyber-lime font-heading font-bold text-sm border-l-4 border-cyber-lime bg-white/10 transition-colors duration-200 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              Dashboard
            </Link>
          </li>
          <li>
            <button onClick={() => setIsCreateTeacherOpen(true)} className="flex items-center gap-4 px-4 py-3 rounded-lg text-surface-variant/70 font-heading font-bold text-sm hover:bg-white/5 hover:text-surface-variant transition-colors duration-200 w-full text-left cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              Tambah Guru
            </button>
          </li>
          <li>
            <button onClick={() => setIsEditProfileOpen(true)} className="flex items-center gap-4 px-4 py-3 rounded-lg text-surface-variant/70 font-heading font-bold text-sm hover:bg-white/5 hover:text-surface-variant transition-colors duration-200 w-full text-left cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
              Pengaturan Admin
            </button>
          </li>
        </ul>

        <div className="mt-auto">
          <div className="bg-surface-variant/10 rounded-xl p-4 border border-surface-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mesh-pink flex items-center justify-center text-white font-heading font-bold border-2 border-cyber-lime">
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
          <h2 className="font-heading text-2xl font-bold text-deep-obsidian">Manajemen Portal Admin</h2>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-heading font-bold text-sm text-on-surface-variant flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-mesh-pink" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
            Administrator
          </span>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="md:hidden flex justify-between items-center px-4 h-16 bg-surface/90 backdrop-blur-md border-b-2 border-deep-obsidian sticky top-0 z-40">
        <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-deep-obsidian" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
        <span className="font-heading font-bold text-deep-obsidian">KuisSeru Admin</span>
        <div className="w-8 h-8 rounded-xl bg-mesh-pink flex items-center justify-center text-white font-heading font-bold text-sm border-2 border-deep-obsidian">
          {user?.name?.substring(0,1).toUpperCase()}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8">
        <div className="max-w-6xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 pt-4 md:pt-0">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-obsidian mb-2">
              Kelola Pengguna
            </h1>
            <p className="font-sans text-on-surface-variant text-lg">
              Pantau guru, sesi, dan aktivitas secara keseluruhan.
            </p>
          </div>
          <button 
            onClick={() => setIsCreateTeacherOpen(true)}
            className="bg-electric-blue text-on-primary font-heading font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,82,255,0.4)] transition-all duration-300 border-2 border-deep-obsidian cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            Tambah Guru Baru
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stat Card 1 */}
          <div className="bg-surface-container rounded-xl border-2 border-deep-obsidian p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-deep-obsidian flex items-center justify-center shadow-[4px_4px_0px_rgba(10,10,10,1)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyber-lime" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
            </div>
            <h3 className="font-heading text-3xl font-bold text-deep-obsidian relative z-10">{teachers.length}</h3>
            <p className="font-sans font-bold text-on-surface-variant relative z-10 uppercase text-xs tracking-wider mt-1">Total Guru</p>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-surface-container rounded-xl border-2 border-deep-obsidian p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-mesh-pink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-deep-obsidian flex items-center justify-center shadow-[4px_4px_0px_rgba(10,10,10,1)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-mesh-pink" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
              </div>
            </div>
            <h3 className="font-heading text-3xl font-bold text-deep-obsidian relative z-10">{sessions.length}</h3>
            <p className="font-sans font-bold text-on-surface-variant relative z-10 uppercase text-xs tracking-wider mt-1">Sesi Kuis Dibuat</p>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-surface-container rounded-xl border-2 border-deep-obsidian p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-lime/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-deep-obsidian flex items-center justify-center shadow-[4px_4px_0px_rgba(10,10,10,1)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyber-lime" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
            </div>
            <h3 className="font-heading text-3xl font-bold text-deep-obsidian relative z-10">{totalStudents}</h3>
            <p className="font-sans font-bold text-on-surface-variant relative z-10 uppercase text-xs tracking-wider mt-1">Siswa Terlibat</p>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian rounded-xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="bg-surface-container-high border-b-2 border-deep-obsidian p-6">
            <h2 className="font-heading text-xl font-bold text-deep-obsidian">Daftar Guru Terdaftar</h2>
          </div>
          
          {isDataLoading ? (
            <div className="p-16 flex justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-electric-blue" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="p-16 text-center">
              <p className="font-heading font-bold text-on-surface-variant">Belum ada guru yang terdaftar selain admin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b-2 border-deep-obsidian">
                    <th className="py-4 px-6 font-heading font-bold text-on-surface-variant text-xs uppercase tracking-wider">Nama Guru</th>
                    <th className="py-4 px-6 font-heading font-bold text-on-surface-variant text-xs uppercase tracking-wider">Email</th>
                    <th className="py-4 px-6 font-heading font-bold text-on-surface-variant text-xs uppercase tracking-wider">Bergabung</th>
                    <th className="py-4 px-6 font-heading font-bold text-on-surface-variant text-xs uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-electric-blue text-white flex items-center justify-center font-heading font-bold border-2 border-deep-obsidian">
                            {t.name?.substring(0,2).toUpperCase() || 'GU'}
                          </div>
                          <div>
                            <p className="font-heading font-bold text-deep-obsidian group-hover:text-electric-blue transition-colors">{t.name || 'Guru'}</p>
                            {t.role === 'admin' && <span className="bg-mesh-pink/20 text-mesh-pink px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 inline-block">Admin</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-sans text-on-surface-variant text-sm">
                        {t.email}
                      </td>
                      <td className="py-4 px-6 font-sans text-on-surface-variant text-sm">
                        {new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {t.id !== user.id && t.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteTeacher(t.id, t.name || 'Guru')}
                            className="bg-error/10 text-error hover:bg-error hover:text-white p-2 rounded-lg transition-colors border border-error/30 hover:border-error cursor-pointer"
                            title="Hapus Guru"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface/90 backdrop-blur-md border-t-2 border-deep-obsidian z-50 px-6 py-4 flex justify-between items-center">
        <Link href="/admin" className="flex flex-col items-center gap-1 text-electric-blue">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
          <span className="font-heading font-bold text-[10px]">Dashboard</span>
        </Link>
        <button onClick={() => setIsCreateTeacherOpen(true)} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-electric-blue">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span className="font-heading font-bold text-[10px]">Tambah</span>
        </button>
        <button onClick={() => setIsEditProfileOpen(true)} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-electric-blue">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
          <span className="font-heading font-bold text-[10px]">Profil</span>
        </button>
      </nav>
      </div>
    </div>
  );
}
