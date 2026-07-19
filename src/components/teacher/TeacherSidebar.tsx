'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createNewSession } from '@/app/actions/session';
import { signOut } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import { usePopup } from '@/components/ui/PopupProvider';

export function TeacherSidebar({ user }: { user: any }) {
  const router = useRouter();
  const { showAlert } = usePopup();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSession = async () => {
    setIsLoading(true);
    const result = await createNewSession();
    if (result.success) {
      router.push(`/teacher/session/${result.sessionId}/edit`);
    } else {
      showAlert("Gagal", "Gagal membuat sesi", "error");
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[55] bg-deep-obsidian/50 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}
      
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-[51]">
         <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 bg-surface rounded-lg shadow-md border-2 border-deep-obsidian cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-deep-obsidian" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
         </button>
      </div>

      <nav className={`${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed left-0 top-0 h-screen w-64 bg-deep-obsidian border-r-2 border-deep-obsidian py-8 px-4 z-[56] transition-transform duration-300 flex flex-col`}>
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyber-lime flex items-center justify-center font-heading font-bold text-deep-obsidian text-lg">
            K
          </div>
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
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>}
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
    </>
  );
}
