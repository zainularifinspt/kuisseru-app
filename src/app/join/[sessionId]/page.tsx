"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function JoinSessionPage() {
  const params = useParams();
  const router = useRouter();
  
  const sessionId = params.sessionId as string;
  const [nickname, setNickname] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");

  useEffect(() => {
    // If nickname is in localStorage (from page.tsx), auto-fill it
    const pendingNickname = localStorage.getItem("pendingNickname");
    if (pendingNickname) {
      setNickname(pendingNickname);
      localStorage.removeItem("pendingNickname");
    }

    async function checkSession() {
      try {
        setIsChecking(true);
        const res = await fetch(`/api/quiz-sessions/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setIsValidSession(true);
          setSessionTitle(data.title || "ASTHAQUIZZ Session");
        } else {
          setIsValidSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsValidSession(false);
      } finally {
        setIsChecking(false);
      }
    }
    
    if (sessionId) {
      checkSession();
    }
  }, [sessionId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert("Silakan masukkan namamu terlebih dahulu!");
      return;
    }

    try {
      setIsJoining(true);
      const res = await fetch(`/api/quiz-sessions/${sessionId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Gagal bergabung ke sesi");
      }

      const data = await res.json();
      
      localStorage.setItem("participantId", data.participant.id);
      localStorage.setItem("nickname", data.participant.nickname);
      localStorage.setItem("sessionId", sessionId);
      
      if (data.sessionStatus === 'active') {
        router.push(`/quiz?sessionId=${sessionId}&participantId=${data.participant.id}`);
      } else {
        router.push(`/waiting-room?sessionId=${sessionId}&participantId=${data.participant.id}`);
      }
      
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat bergabung ke kuis");
      setIsJoining(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-[100dvh] bg-background text-on-background flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-electric-blue" />
        <p className="font-heading font-semibold animate-pulse">Memeriksa sesi kuis...</p>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-[100dvh] bg-background text-on-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="bg-surface-container-low rounded-[2rem] border-4 border-error p-8 max-w-md w-full text-center relative z-10 shadow-[0_0_40px_rgba(186,26,26,0.1)]">
          <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-on-error-container" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h2 className="font-heading text-2xl font-bold text-deep-obsidian mb-2">Sesi Tidak Ditemukan</h2>
          <p className="font-sans text-on-surface-variant mb-6">
            Kuis ini mungkin sudah berakhir, sedang berlangsung, atau URL tidak valid.
          </p>
          <button 
            onClick={() => router.push("/")}
            className="w-full bg-surface-variant text-on-surface-variant font-heading font-bold py-3 rounded-full border-2 border-deep-obsidian hover:bg-surface-container-highest transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-[100dvh] relative overflow-hidden flex flex-col font-sans">
      {/* Background Shapes */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-tertiary-fixed rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float" style={{ animationDelay: '-4s' }}></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 z-10 w-full max-w-lg mx-auto py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-deep-obsidian mb-2 tracking-tight">
            ASTHAQUIZZ
          </h1>
          <h2 className="font-heading text-xl md:text-2xl font-semibold text-electric-blue">
            {sessionTitle}
          </h2>
        </div>

        {/* Decorative Animated Graphic */}
        <div className="w-full max-w-sm relative bg-[rgba(255,255,255,0.7)] backdrop-blur-xl rounded-[2.5rem] border-4 border-deep-obsidian p-8 mb-8 flex flex-col items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden group">
          {/* Animated Background Rays */}
          <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
             <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_10s_linear_infinite]" 
                  style={{ background: 'conic-gradient(from 0deg, transparent 0deg, var(--color-cyber-lime) 45deg, transparent 90deg, var(--color-electric-blue) 135deg, transparent 180deg, var(--color-mesh-pink) 225deg, transparent 270deg, var(--color-cyber-lime) 315deg, transparent 360deg)' }}>
             </div>
          </div>
          
          <div className="relative z-10 w-24 h-24 bg-electric-blue rounded-3xl rotate-12 flex items-center justify-center shadow-[8px_8px_0px_rgba(10,10,10,1)] animate-float border-4 border-deep-obsidian group-hover:rotate-[24deg] transition-transform duration-500">
            {/* Rocket SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white -rotate-45" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.13 22.19L11.5 18.36C10.07 15.01 7.21 12.14 3.86 10.71L.03 9.08C-.25 8.97-.25 8.59.03 8.47L22.1 0l-8.47 22.07c-.12.28-.5.28-.6.12z"/>
            </svg>
            
            {/* Engine fire */}
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-tr from-error to-[#FFB02E] rounded-full filter blur-md animate-pulse opacity-80 -z-10"></div>
          </div>
          <div className="relative z-10 mt-6 font-heading font-bold text-xl text-deep-obsidian text-center uppercase tracking-widest bg-white/80 px-4 py-1 rounded-full border-2 border-deep-obsidian">
            Bersiap!
          </div>
        </div>

        {/* Manual Entry Form */}
        <form onSubmit={handleJoin} className="w-full max-w-sm flex flex-col gap-4">
          <div className="relative group">
            <label className="font-heading font-semibold text-sm text-on-surface-variant px-2 mb-2 block uppercase tracking-wide">Nama Kamu</label>
            <div className="relative">
              <input 
                className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-full px-6 py-4 font-heading text-lg font-medium text-on-surface placeholder:text-outline focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all duration-300 peer" 
                id="nickname" 
                placeholder="Nama Panggilan" 
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isJoining}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute right-6 top-1/2 -translate-y-1/2 text-outline peer-focus:text-electric-blue transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={!nickname.trim() || isJoining}
            className="w-full mt-4 group relative rounded-full border-2 border-deep-obsidian p-1 overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,82,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#0052FF,#FF00E5,#0052FF)] bg-[length:200%_auto] animate-gradient-shift opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-transparent px-8 py-4 rounded-full flex items-center justify-center gap-2">
              <span className="font-heading text-xl text-on-primary font-bold tracking-wide shadow-sm">
                {isJoining ? <Loader2 className="w-6 h-6 animate-spin" /> : "Join Quiz"}
              </span>
              {!isJoining && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-on-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.13 22.19L11.5 18.36C10.07 15.01 7.21 12.14 3.86 10.71L.03 9.08C-.25 8.97-.25 8.59.03 8.47L22.1 0l-8.47 22.07c-.12.28-.5.28-.6.12z"/>
                </svg>
              )}
            </div>
          </button>
        </form>
      </main>
    </div>
  );
}
