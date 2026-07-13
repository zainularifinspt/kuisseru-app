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
    return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  // Not logged in or logged in but NOT admin
  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
        <Card className="w-full max-w-md shadow-2xl rounded-[32px] border-0 overflow-hidden bg-white/70 backdrop-blur-xl relative z-10">
          <CardContent className="p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 shadow-sm">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-semibold mb-2 text-slate-800">Portal Admin</h1>
            <p className="text-slate-500 mb-8 text-center text-sm">
              {isLoggedIn && !isAdmin ? "Anda login sebagai Guru. Akun ini tidak memiliki akses Admin." : "Silakan login menggunakan email & sandi administrator."}
            </p>
            
            {!isLoggedIn ? (
              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Kata Sandi</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200" required />
                </div>
                {loginError && <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded-lg">{loginError}</p>}
                <Button type="submit" disabled={isLoginLoading} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold shadow-md shadow-blue-200">
                  {isLoginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Akses Panel Admin'}
                </Button>
              </form>
            ) : (
              <Button onClick={handleLogout} className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-white">
                Logout & Kembali
              </Button>
            )}
            
            <div className="mt-8 text-center">
              <Button variant="link" onClick={() => router.push('/')} className="text-slate-400 hover:text-slate-600 text-xs">Kembali ke Halaman Utama</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans pb-12">
      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <Card className="rounded-[24px] border-0 shadow-2xl overflow-hidden">
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Pengaturan Profil Admin</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Nama Tampilan</label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-12 rounded-xl bg-slate-50" required />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)} className="flex-1 h-12 rounded-xl">Batal</Button>
                      <Button type="submit" disabled={isProfileUpdating} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
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

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm font-medium">Halo, <span className="text-blue-600">{user?.name}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsEditProfileOpen(true)} className="rounded-xl shadow-sm hover:bg-slate-50 border-slate-200">
              <Settings className="w-4 h-4 mr-2 text-slate-500" /> Edit Profil
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700">
              <LogOut className="w-4 h-4 mr-2" /> Keluar
            </Button>
          </div>
        </header>

        {isDataLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: Stats & Add Teacher */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-[32px] border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-blue-600 to-indigo-600 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <CardContent className="p-8">
                  <h3 className="text-blue-100 font-medium mb-1 flex items-center"><BookOpen className="w-4 h-4 mr-2" /> Total Kuis</h3>
                  <p className="text-5xl font-black mb-6">{sessions.length}</p>
                  
                  <h3 className="text-blue-100 font-medium mb-1 flex items-center"><Users className="w-4 h-4 mr-2" /> Total Akun Guru</h3>
                  <p className="text-3xl font-bold">{teachers.filter(t => t.role !== 'admin').length}</p>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-0 shadow-lg shadow-slate-200/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 rounded-xl"><UserPlus className="w-5 h-5 text-blue-600" /></div>
                    <h2 className="text-lg font-bold text-slate-800">Buat Akun Guru Baru</h2>
                  </div>
                  <form onSubmit={handleCreateTeacher} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">NAMA LENGKAP</label>
                      <Input value={newTeacherName} onChange={(e) => setNewTeacherName(e.target.value)} required placeholder="Budi Santoso, S.Pd" className="h-11 rounded-xl bg-slate-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">EMAIL</label>
                      <Input type="email" value={newTeacherEmail} onChange={(e) => setNewTeacherEmail(e.target.value)} required placeholder="guru@sekolah.id" className="h-11 rounded-xl bg-slate-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">KATA SANDI</label>
                      <Input type="password" value={newTeacherPassword} onChange={(e) => setNewTeacherPassword(e.target.value)} required placeholder="Minimal 8 karakter" className="h-11 rounded-xl bg-slate-50" />
                    </div>
                    {createMessage && (
                      <div className={`p-3 rounded-xl text-xs font-medium ${createMessage.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {createMessage}
                      </div>
                    )}
                    <Button type="submit" disabled={isCreatingTeacher} className="w-full h-12 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold mt-2">
                      {isCreatingTeacher ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tambahkan Akun'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Quizzes & Teacher List */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Quizzes Section */}
              <Card className="rounded-[32px] border-0 shadow-lg shadow-slate-200/50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-xl"><Sparkles className="w-5 h-5 text-indigo-600" /></div>
                      <h2 className="text-xl font-bold text-slate-800">Semua Kuis Terdaftar</h2>
                    </div>
                  </div>
                  
                  {sessions.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">Belum ada kuis yang dibuat.</div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                      {sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500"><Play className="w-4 h-4 ml-1" /></div>
                            <div>
                              <h3 className="font-bold text-slate-800">{session.title}</h3>
                              <p className="text-xs text-slate-500 mt-1">Pembuat: <span className="font-semibold text-slate-700">{session.teacher ? session.teacher.name : 'Tidak Diketahui (Telah Dihapus)'}</span></p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            session.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            session.status === 'finished' ? 'bg-slate-100 text-slate-600' :
                            'bg-amber-100 text-amber-700'
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
              <Card className="rounded-[32px] border-0 shadow-lg shadow-slate-200/50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-50 rounded-xl"><Users className="w-5 h-5 text-rose-600" /></div>
                      <h2 className="text-xl font-bold text-slate-800">Manajemen Akun Guru</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                    {teachers.filter(t => t.id !== user?.id).length === 0 ? (
                      <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">Belum ada akun guru lainnya.</div>
                    ) : (
                      teachers.filter(t => t.id !== user?.id).map((teacher) => (
                        <div key={teacher.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-rose-100 transition-colors">
                          <div>
                            <h3 className="font-bold text-slate-800">{teacher.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">{teacher.email}</p>
                            {teacher.role === 'admin' && <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">ADMIN</span>}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTeacher(teacher.id, teacher.name)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-10 w-10 p-0">
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
