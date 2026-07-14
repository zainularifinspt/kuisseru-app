"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Users, PlayCircle, Loader2, KeyRound } from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function QRCodeLoginPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [joinUrl, setJoinUrl] = useState<string>("");
  const [joinCode, setJoinCode] = useState<string>("");
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join/${sessionId}`);
    }

    // Fetch session and initial participants
    async function fetchData() {
      try {
        const sessionRes = await fetch(`/api/quiz-sessions/${sessionId}`);
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setJoinCode(sessionData.session.joinCode || "");
        }

        const partRes = await fetch(`/api/quiz-sessions/${sessionId}/participants`);
        if (partRes.ok) {
          const data = await partRes.json();
          setPlayerCount(data.participants?.length || 0);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();

    // Subscribe to pusher for real-time updates
    const pusherClient = getPusherClient();
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(`session-${sessionId}`);
    channel.bind('player-joined', () => {
      setPlayerCount(prev => prev + 1);
    });

    return () => {
      pusherClient.unsubscribe(`session-${sessionId}`);
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 dark:opacity-10 pointer-events-none animate-pulse"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-400/20 dark:bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '7s' }}></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '9s' }}></div>

      <div className="max-w-4xl w-full bg-white/90 dark:bg-[#111827]/80 backdrop-blur-xl rounded-[2rem] shadow-[0_0_40px_rgba(59,130,246,0.1)] dark:shadow-[0_0_40px_rgba(59,130,246,0.15)] border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: QR Code Area */}
        <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-indigo-900 dark:to-purple-900 p-8 flex flex-col items-center justify-center text-white text-center relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-300 to-blue-400 dark:from-cyan-400 dark:to-purple-500" />
          
          <h2 className="text-3xl font-black mb-2 drop-shadow-md">Bergabung!</h2>
          <p className="text-blue-100 dark:text-indigo-200 mb-8 font-medium">Scan QR atau masukkan kode</p>
          
          <div className="bg-white p-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-8 transition-transform hover:scale-105 duration-300">
            {joinUrl ? (
              <QRCodeSVG 
                value={joinUrl} 
                size={220} 
                level="H" 
                includeMargin={false}
                fgColor="#312e81" // indigo-900
              />
            ) : (
              <div className="w-[220px] h-[220px] flex items-center justify-center bg-slate-100 rounded-xl">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
            )}
          </div>
          
          {joinCode && (
            <div className="bg-white/20 dark:bg-[#0f172a]/60 border border-white/30 dark:border-indigo-500/30 px-8 py-4 rounded-2xl backdrop-blur-md shadow-inner flex flex-col items-center justify-center gap-2 w-full max-w-xs mx-auto mb-4">
              <span className="text-sm font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Kode Kuis
              </span>
              <span className="text-5xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                {joinCode}
              </span>
            </div>
          )}

          <div className="text-xs font-medium text-slate-400 mt-2">
            Link: <span className="text-slate-300">{joinUrl.replace(/^https?:\/\//, '')}</span>
          </div>
        </div>

        {/* Right Side: Controls & Info */}
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500 mb-2">KuisSeru</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Sesi Kuis Aktif</p>
            
            <div className="bg-slate-100 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-white/5 rounded-3xl p-8 text-center mb-8 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-blue-600 dark:text-white">
                <Users className="w-24 h-24" />
              </div>
              <Users className="w-12 h-12 text-blue-500 dark:text-cyan-400 mx-auto mb-4 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] relative z-10" />
              <div className="text-6xl font-black text-slate-800 dark:text-white mb-2 relative z-10 drop-shadow-sm dark:drop-shadow-md">{playerCount}</div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider relative z-10">Siswa Terhubung</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full h-16 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] border-0"
              onClick={() => router.push(`/teacher/session/${sessionId}/dashboard`)}
            >
              Lihat Ruang Tunggu
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full h-16 rounded-2xl text-lg font-bold border-2 border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"
              onClick={() => router.push(`/teacher/session/${sessionId}/dashboard`)}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Mulai Langsung
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
