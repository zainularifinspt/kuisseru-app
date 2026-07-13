'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Sparkles, UserPlus, Loader2, Users, BookOpen, Trash2, LogOut, Settings, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession, signUp } from '@/lib/auth-client';
import { getAllSessions, getTeachers, deleteTeacher } from '@/app/actions/admin';
import { updateProfile } from '@/app/actions/user';

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

  // Teacher Creation
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
  const [createMessage, setCreateMessage] = useState('');

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
    if (confirm(`Apakah Anda yakin ingin menghapus guru ${name}?\n\nKuis yang dibuat oleh guru ini tidak akan dihapus, melainkan pembuatnya akan diset menjadi "Tidak Diketahui".`)) {
      const res = await deleteTeacher(id);
      if (res.success) {
        fetchAdminData(); // Refresh data
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
    } else {
      setCreateMessage('❌ Gagal: ' + (error?.message || 'Terjadi kesalahan'));
    }
    setIsCreatingTeacher(false);
  };

  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]"><Loader2 className="w-10 h-10 animate-spin text-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" /></div>;
  }

  // Not logged in or logged in but NOT admin
  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none animate-pulse"></div>
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '9s' }} />
        
        <Card className="w-full max-w-md shadow-[0_0_50px_rgba(59,130,246,0.15)] rounded-[32px] border border-white/10 overflow-hidden bg-[#111827]/80 backdrop-blur-2xl relative z-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardContent className="p-8 sm:p-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 text-cyan-400 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <Shield className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black mb-2 text-white tracking-tight drop-shadow-md">Portal Admin</h1>
            <p className="text-slate-400 mb-8 text-center text-sm">
              {isLoggedIn && !isAdmin ? "Anda login sebagai Guru. Akun ini tidak memiliki akses Admin." : "Silakan login menggunakan email & sandi administrator."}
            </p>
            
            {!isLoggedIn ? (
              <form onSubmit={handleLogin} className="w-full space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Admin</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-2xl bg-[#0f172a]/80 border-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 text-white shadow-inner" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Kata Sandi</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl bg-[#0f172a]/80 border-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 text-white shadow-inner" required />
                </div>
                {loginError && <p className="text-red-200 text-sm font-medium text-center bg-red-900/50 py-3 rounded-xl border border-red-500/30">{loginError}</p>}
                <Button type="submit" disabled={isLoginLoading} className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] border-0 mt-2">
                  {isLoginLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Akses Panel Admin'}
                </Button>
              </form>
            ) : (
              <Button onClick={handleLogout} className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] border-0">
                Logout & Kembali
              </Button>
            )}
            
            <div className="mt-8 text-center">
              <Button variant="link" onClick={() => router.push('/')} className="text-slate-500 hover:text-cyan-400 transition-colors text-sm font-medium">Kembali ke Halaman Utama</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans pb-12 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none animate-pulse"></div>
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <Card className="rounded-[24px] border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.2)] bg-[#1e293b]/90 overflow-hidden">
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Pengaturan Profil Admin</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-300">Nama Tampilan</label>
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

      <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] shadow-[0_0_30px_rgba(59,130,246,0.15)] border border-white/10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(34,211,238,0.5)] border border-cyan-400/30">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2 mt-1">
                Halo, <span className="text-cyan-400 font-bold">{user?.name}</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.2)]">Admin</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsEditProfileOpen(true)} className="rounded-xl shadow-sm bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
              <Settings className="w-4 h-4 mr-2 text-cyan-400" /> Profil
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="rounded-xl text-red-400 hover:bg-red-900/30 hover:text-red-300 border border-transparent hover:border-red-500/30">
              <LogOut className="w-4 h-4 mr-2" /> Keluar
            </Button>
          </div>
        </header>

        {isDataLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" /></div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: Stats & Add Teacher */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-[2.5rem] border border-cyan-400/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
                <CardContent className="p-8 sm:p-10 relative z-10">
                  <h3 className="text-cyan-400 font-bold mb-2 flex items-center text-sm uppercase tracking-wider"><BookOpen className="w-4 h-4 mr-2" /> Total Kuis Terdaftar</h3>
                  <p className="text-6xl font-black mb-8 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">{sessions.length}</p>
                  
                  <h3 className="text-blue-400 font-bold mb-2 flex items-center text-sm uppercase tracking-wider"><Users className="w-4 h-4 mr-2" /> Total Akun Guru</h3>
                  <p className="text-4xl font-black drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">{teachers.filter(t => t.role !== 'admin').length}</p>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.1)] bg-[#111827]/80 backdrop-blur-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-900/40 rounded-xl border border-blue-500/30 shadow-inner"><UserPlus className="w-5 h-5 text-cyan-400" /></div>
                    <h2 className="text-xl font-bold text-white drop-shadow-sm">Buat Akun Guru Baru</h2>
                  </div>
                  <form onSubmit={handleCreateTeacher} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nama Lengkap</label>
                      <Input value={newTeacherName} onChange={(e) => setNewTeacherName(e.target.value)} required placeholder="Budi Santoso, S.Pd" className="h-12 rounded-xl bg-[#0f172a] border-slate-600 focus:border-cyan-400 text-white shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                      <Input type="email" value={newTeacherEmail} onChange={(e) => setNewTeacherEmail(e.target.value)} required placeholder="guru@sekolah.id" className="h-12 rounded-xl bg-[#0f172a] border-slate-600 focus:border-cyan-400 text-white shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Kata Sandi</label>
                      <Input type="password" value={newTeacherPassword} onChange={(e) => setNewTeacherPassword(e.target.value)} required placeholder="Minimal 8 karakter" className="h-12 rounded-xl bg-[#0f172a] border-slate-600 focus:border-cyan-400 text-white shadow-inner" />
                    </div>
                    {createMessage && (
                      <div className={`p-4 rounded-xl text-sm font-bold ${createMessage.includes('✅') ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                        {createMessage}
                      </div>
                    )}
                    <Button type="submit" disabled={isCreatingTeacher} className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold mt-4 shadow-[0_0_15px_rgba(34,211,238,0.4)] border-0">
                      {isCreatingTeacher ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tambahkan Akun'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Quizzes & Teacher List */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Quizzes Section */}
              <Card className="rounded-[2rem] border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.1)] bg-[#111827]/80 backdrop-blur-xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-900/40 rounded-xl border border-purple-500/30 shadow-inner"><Sparkles className="w-5 h-5 text-purple-400" /></div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-sm">Semua Kuis Terdaftar</h2>
                    </div>
                  </div>
                  
                  {sessions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10 font-medium">Belum ada kuis yang dibuat.</div>
                  ) : (
                    <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                      {sessions.map((session) => (
                        <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#1e293b]/60 border border-slate-700 hover:border-purple-500/50 rounded-2xl shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-900/30 flex items-center justify-center text-purple-400 border border-purple-500/20"><Play className="w-5 h-5 ml-1" /></div>
                            <div>
                              <h3 className="font-bold text-white text-lg">{session.title}</h3>
                              <p className="text-sm text-slate-400 mt-1">Pembuat: <span className="font-bold text-cyan-400">{session.teacher ? session.teacher.name : 'Tidak Diketahui (Telah Dihapus)'}</span></p>
                            </div>
                          </div>
                          <span className={`self-start sm:self-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            session.status === 'active' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.1)]' :
                            session.status === 'finished' ? 'bg-slate-800 text-slate-300 border-slate-600' :
                            'bg-amber-900/40 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.1)]'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Teachers Section */}
              <Card className="rounded-[2rem] border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.1)] bg-[#111827]/80 backdrop-blur-xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-rose-900/40 rounded-xl border border-rose-500/30 shadow-inner"><Users className="w-5 h-5 text-rose-400" /></div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-sm">Manajemen Akun Guru</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {teachers.filter(t => t.id !== user?.id).length === 0 ? (
                      <div className="text-center py-12 text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10 font-medium">Belum ada akun guru lainnya.</div>
                    ) : (
                      teachers.filter(t => t.id !== user?.id).map((teacher) => (
                        <div key={teacher.id} className="flex items-center justify-between p-5 bg-[#1e293b]/60 border border-slate-700 hover:border-cyan-500/50 rounded-2xl shadow-sm hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all">
                          <div>
                            <h3 className="font-bold text-white text-lg">{teacher.name}</h3>
                            <p className="text-sm text-slate-400 font-medium mt-1">{teacher.email}</p>
                            {teacher.role === 'admin' && <span className="inline-block mt-2 px-3 py-1 bg-blue-900/40 text-blue-400 border border-blue-500/30 text-[10px] font-black tracking-wider rounded-md">ADMIN</span>}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTeacher(teacher.id, teacher.name)} className="text-rose-400 hover:text-white hover:bg-rose-600 rounded-xl h-12 w-12 p-0 border border-transparent hover:border-rose-500 shadow-sm transition-all">
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
