"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, User, ArrowRight } from "lucide-react";

export default function JoinSessionPage() {
  const params = useParams();
  const router = useRouter();
  
  const sessionId = params.sessionId as string;
  const [nickname, setNickname] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");

  // Check if session is valid when page loads
  useEffect(() => {
    async function checkSession() {
      try {
        setIsChecking(true);
        const res = await fetch(`/api/quiz-sessions/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setIsValidSession(true);
          setSessionTitle(data.title || "KuisSeru Session");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Gagal bergabung ke sesi");
      }

      const data = await res.json();
      
      // Save to localStorage or similar if needed for next pages
      localStorage.setItem("participantId", data.participant.id);
      localStorage.setItem("nickname", data.participant.nickname);
      localStorage.setItem("sessionId", sessionId);
      
      // Redirect to waiting room
      router.push(`/waiting-room?sessionId=${sessionId}&participantId=${data.participant.id}`);
      
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat bergabung ke kuis");
      setIsJoining(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none animate-pulse"></div>
        <div className="flex flex-col items-center text-slate-300 relative z-10">
          <Loader2 className="h-12 w-12 animate-spin mb-4 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          <p className="font-medium animate-pulse">Memeriksa kode kuis...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none animate-pulse"></div>
        
        <Card className="max-w-md w-full bg-[#111827]/80 backdrop-blur-xl border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)] rounded-3xl overflow-hidden relative z-10">
          <div className="h-3 bg-gradient-to-r from-red-500 to-rose-600 w-full" />
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl font-black text-white drop-shadow-md">Sesi Tidak Ditemukan</CardTitle>
            <CardDescription className="text-base mt-2 text-slate-300">
              Kuis ini mungkin sudah berakhir, sedang berlangsung, atau URL tidak valid.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pb-8 flex justify-center">
            <Button onClick={() => router.push("/")} variant="outline" className="rounded-full border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
              Kembali ke Beranda
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none animate-pulse"></div>
      
      <div className="absolute top-0 -left-32 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />

      <Card className="max-w-md w-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_rgba(59,130,246,0.3)] rounded-3xl overflow-hidden relative z-10">
        <div className="h-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 w-full animate-gradient-x" />
        
        <CardHeader className="text-center pt-8 pb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-12 hover:rotate-0 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <span className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>🎮</span>
          </div>
          <CardTitle className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            Siap Bermain?
          </CardTitle>
          <CardDescription className="text-base text-slate-300 mt-2">
            Kamu akan bergabung ke: <br/>
            <span className="font-bold text-cyan-400 text-lg">{sessionTitle}</span>
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleJoin}>
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-sm font-bold text-slate-300 ml-1">
                Masukkan Nama Kamu
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  id="nickname"
                  placeholder="Contoh: Budi Keren"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full pl-12 h-14 rounded-2xl bg-[#0f172a]/80 border border-slate-600 focus:bg-[#1e293b]/90 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 text-white text-lg font-medium transition-all shadow-inner"
                  autoComplete="off"
                  maxLength={20}
                  disabled={isJoining}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pb-8 pt-4">
            <Button 
              type="submit" 
              disabled={!nickname.trim() || isJoining}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] text-white border-0 transition-all hover:-translate-y-1 hover:scale-[1.02]"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Masuk...
                </>
              ) : (
                <>
                  Mulai Kuis <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
