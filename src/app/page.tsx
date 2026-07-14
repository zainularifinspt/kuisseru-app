"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || joinCode.length !== 6) {
      setError("Kode PIN harus 6 angka");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/quiz-sessions/join-by-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ joinCode: joinCode.toUpperCase() }),
      });

      const data = await res.json();

      if (res.ok && data.sessionId) {
        router.push(`/join/${data.sessionId}`);
      } else {
        setError(data.error || "Gagal bergabung");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Animated Stars / Particles Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 dark:opacity-20 pointer-events-none animate-pulse"></div>
      
      {/* AI Background Glows */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-600/30 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-purple-400/20 dark:bg-purple-600/30 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

      <div className="text-center max-w-lg w-full bg-white/90 dark:bg-[#111827]/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[32px] shadow-[0_0_40px_rgba(59,130,246,0.1)] dark:shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-slate-200 dark:border-white/10 relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-[2rem] shadow-[0_0_20px_rgba(99,102,241,0.2)] dark:shadow-[0_0_20px_rgba(99,102,241,0.5)] mb-6 border border-blue-200 dark:border-blue-400/20 relative group overflow-hidden">
          <div className="absolute inset-0 bg-blue-400/10 dark:bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
          <Sparkles className="w-12 h-12 text-blue-600 dark:text-cyan-400 relative z-10 animate-bounce" style={{ animationDuration: '2s' }} />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight drop-shadow-sm dark:drop-shadow-md">
          Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 animate-gradient-x">KuisSeru</span>
        </h1>
        
        <p className="text-slate-600 dark:text-slate-300 mb-8 text-base sm:text-lg font-light leading-relaxed">
          Bangkitkan antusiasme belajar siswa melalui pengalaman kuis interaktif yang cerdas dan real-time.
        </p>
        
        <div className="space-y-6">
          <form onSubmit={handleJoin} className="bg-slate-50 dark:bg-[#0f172a]/60 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Masukkan 6 Angka PIN"
                  value={joinCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, ''); // only allow digits
                    setJoinCode(val);
                    if (error) setError("");
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-blue-500 dark:focus:border-cyan-500 sm:text-sm font-bold tracking-widest text-center transition-all shadow-inner"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading || joinCode.length !== 6} className="h-[50px] w-full sm:w-auto bg-blue-600 hover:bg-blue-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] dark:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk Kuis"}
              </Button>
            </div>
            {error && <p className="text-red-500 dark:text-red-400 text-sm font-bold animate-pulse">{error}</p>}
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Atau</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <Link href="/teacher" className="block">
            <Button size="lg" className="w-full rounded-xl text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 border-0 h-[56px] shadow-[0_0_20px_rgba(37,99,235,0.3)] dark:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all hover:scale-[1.03] active:scale-[0.98] group relative overflow-hidden text-white">
              <span className="relative z-10 flex items-center justify-center">
                Masuk sebagai Guru
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>
          </Link>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2 pt-2">
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-cyan-400 animate-pulse" />
            <span className="text-center">Siswa juga bisa memindai QR Code dari kelas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
