"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Loader2 } from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";

export default function QRCodeLoginPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [joinUrl, setJoinUrl] = useState<string>("");
  const [joinCode, setJoinCode] = useState<string>("");
  const [playerCount, setPlayerCount] = useState(0);
  const [sessionTitle, setSessionTitle] = useState("Kuis");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join/${sessionId}`);
    }

    async function fetchData() {
      try {
        const sessionRes = await fetch(`/api/quiz-sessions/${sessionId}`);
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setJoinCode(sessionData.session.joinCode || "");
          setSessionTitle(sessionData.session.title || "Kuis");
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
    <div className="min-h-[100dvh] bg-background font-sans text-on-background flex flex-col relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        .mesh-bg-proj {
          background-image: 
              radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
              radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
              radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
          animation: mesh-proj 15s ease infinite alternate;
          background-size: 200% 200%;
        }
        @keyframes mesh-proj {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />
      <div className="absolute inset-0 mesh-bg-proj -z-10"></div>

      {/* Top App Bar */}
      <header className="w-full top-0 sticky z-10 bg-surface/80 backdrop-blur-xl border-b-2 border-deep-obsidian">
        <div className="flex justify-between items-center px-4 md:px-10 py-4 w-full max-w-7xl mx-auto">
          <div className="flex flex-col">
            <span className="font-heading font-bold text-sm text-on-surface-variant uppercase tracking-wider">Kuis Sedang Berlangsung</span>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-electric-blue">{sessionTitle}</h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-heading font-bold text-sm text-on-surface-variant uppercase tracking-wider">PIN KUIS</span>
            {joinCode && (
              <div className="font-heading text-xl md:text-2xl font-bold bg-deep-obsidian text-cyber-lime px-6 py-2 rounded-full border-2 border-deep-obsidian shadow-[4px_4px_0px_rgba(10,10,10,1)]">
                {joinCode}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-4 md:p-10 gap-8 z-0 max-w-7xl mx-auto w-full">
        
        {/* Left: QR Code + Code */}
        <div className="flex flex-col items-center gap-6 flex-1 max-w-md w-full">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-secondary drop-shadow-md text-center">
            Scan untuk Bergabung!
          </h2>
          
          {/* QR Code Card */}
          <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-xl border-2 border-deep-obsidian rounded-xl p-6 shadow-[0_0_40px_rgba(0,82,255,0.15)] hover:scale-[1.02] transition-transform duration-300">
            {joinUrl ? (
              <QRCodeSVG 
                value={joinUrl} 
                size={240} 
                level="H" 
                includeMargin={false}
                fgColor="#0A0A0A"
              />
            ) : (
              <div className="w-[240px] h-[240px] flex items-center justify-center bg-surface-container rounded-xl">
                <Loader2 className="w-10 h-10 text-electric-blue animate-spin" />
              </div>
            )}
          </div>
          
          {/* Join Code */}
          {joinCode && (
            <div className="bg-deep-obsidian text-cyber-lime border-2 border-cyber-lime/30 px-8 py-4 rounded-xl flex flex-col items-center gap-2 w-full max-w-xs shadow-[0_0_15px_rgba(204,255,0,0.3)]">
              <span className="font-heading font-bold text-xs uppercase tracking-widest text-cyber-lime/70 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                Kode Kuis
              </span>
              <span className="text-4xl md:text-5xl font-heading font-bold tracking-[0.3em] drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]">
                {joinCode}
              </span>
            </div>
          )}

          <p className="font-sans text-xs text-on-secondary/60 text-center">
            {joinUrl.replace(/^https?:\/\//, '')}
          </p>
        </div>

        {/* Right: Player Count & Controls */}
        <div className="flex flex-col items-center gap-6 flex-1 max-w-md w-full">
          
          {/* Player Count Bento */}
          <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian rounded-xl p-8 w-full text-center shadow-[0_0_15px_rgba(204,255,0,0.4)] relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-cyber-lime/20 rounded-full blur-2xl"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-electric-blue mx-auto mb-4 relative z-10" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <div className="font-heading text-6xl font-bold text-deep-obsidian mb-2 relative z-10">{playerCount}</div>
            <p className="font-heading font-bold text-sm text-on-surface-variant uppercase tracking-wider relative z-10">Siswa Terhubung</p>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-4">
            <button 
              onClick={() => router.push(`/teacher/session/${sessionId}/dashboard`)}
              className="w-full bg-electric-blue text-on-primary font-heading font-bold py-4 px-8 rounded-full flex items-center justify-center gap-2 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,82,255,0.4)] transition-all duration-300 border-2 border-deep-obsidian text-lg cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Lihat Ruang Tunggu
            </button>
            <button 
              onClick={() => router.push(`/teacher/session/${sessionId}/dashboard`)}
              className="w-full bg-surface-container text-deep-obsidian font-heading font-bold py-4 px-8 rounded-full flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all duration-300 border-2 border-deep-obsidian text-lg cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
              Mulai Langsung
            </button>
            <button 
              onClick={() => router.push(`/teacher`)}
              className="w-full text-on-surface-variant font-heading font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 hover:bg-surface-variant/50 transition-all duration-300 text-sm cursor-pointer"
            >
              ← Kembali ke Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
