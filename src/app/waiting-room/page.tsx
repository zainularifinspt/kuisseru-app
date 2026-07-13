'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Hourglass, Gamepad2, Loader2 } from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";

type Player = {
  id: string;
  nickname: string;
};

function WaitingRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const participantId = searchParams.get('participantId');
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    async function checkSessionAndFetchParticipants() {
      try {
        // Fetch session status first
        const sessionRes = await fetch(`/api/quiz-sessions/${sessionId}`);
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.session?.status === 'active' || sessionData.status === 'active') {
            router.push(`/quiz?sessionId=${sessionId}&participantId=${participantId}`);
            return;
          }
        }

        const res = await fetch(`/api/quiz-sessions/${sessionId}/participants`);
        if (res.ok) {
          const data = await res.json();
          setPlayers(data.participants);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkSessionAndFetchParticipants();

    const pusherClient = getPusherClient();
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(`session-${sessionId}`);
    
    channel.bind('player-joined', (data: { participant: Player }) => {
      setPlayers((prev) => {
        if (prev.some(p => p.id === data.participant.id)) return prev;
        return [...prev, data.participant];
      });
    });
    
    channel.bind('quiz-started', () => {
      router.push(`/quiz?sessionId=${sessionId}&participantId=${participantId}`);
    });

    return () => {
      pusherClient.unsubscribe(`session-${sessionId}`);
    };
  }, [sessionId, participantId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-500" />
        <p>Memuat data peserta...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <h3 className="text-lg font-bold text-slate-200 flex items-center drop-shadow-md">
          <Users className="w-5 h-5 mr-2 text-cyan-400" />
          Peserta Bergabung
        </h3>
        <span className="bg-blue-500/20 text-cyan-400 border border-cyan-400/30 font-black px-4 py-1 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-pulse transition-all">
          {players.length}
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {players.map((player) => (
          <div 
            key={player.id} 
            className={`animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 ${player.id === participantId ? 'bg-indigo-600/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-[#1e293b]/50 border-white/10 hover:bg-blue-900/40 hover:border-blue-400/50'} border rounded-xl p-4 flex flex-col items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] cursor-default group backdrop-blur-sm`}
          >
            <Avatar className="h-14 w-14 border-2 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] mb-3 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-all duration-300">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl">
                {player.nickname.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-bold text-slate-200 truncate w-full text-center drop-shadow-md">
              {player.nickname} {player.id === participantId && <span className="text-cyan-400 block text-xs mt-1">(Kamu)</span>}
            </span>
          </div>
        ))}
      </div>
      
      {players.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <div className="inline-block p-4 rounded-full bg-white/5 mb-4 border border-white/10">
            <Hourglass className="w-8 h-8 text-slate-500 animate-pulse" />
          </div>
          <p>Belum ada peserta yang bergabung.</p>
        </div>
      )}
      
      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-2 text-slate-300 bg-[#0f172a]/60 px-6 py-3 rounded-full text-sm font-bold border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <Gamepad2 className="w-5 h-5 animate-pulse text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
          Bersiap-siap...
        </div>
      </div>
    </>
  );
}

export default function WaitingRoomPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-8 flex flex-col font-sans items-center justify-center overflow-x-hidden relative">
      
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none animate-pulse"></div>
      <div className="fixed top-20 left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <Card className="w-full max-w-4xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] bg-white/5 backdrop-blur-2xl rounded-[2rem] overflow-hidden relative z-10">
        <div className="h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 w-full animate-gradient-x" />
        
        <CardHeader className="bg-black/20 border-b border-white/5 pb-8 pt-10 flex flex-col items-center justify-center text-center">
          <div className="bg-gradient-to-br from-blue-900/60 to-purple-900/60 p-5 rounded-3xl mb-6 animate-bounce shadow-[0_0_30px_rgba(59,130,246,0.4)] border border-blue-400/30" style={{ animationDuration: '3s' }}>
            <Hourglass className="w-14 h-14 text-cyan-400" />
          </div>
          <CardTitle className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-lg">
            Ruang Tunggu
          </CardTitle>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-lg">
            Kuis akan segera dimulai. Tunggu aba-aba dari guru ya! 🚀
          </p>
        </CardHeader>
        
        <CardContent className="p-6 md:p-10 min-h-[400px]">
          <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-10 h-10 animate-spin text-cyan-400" /></div>}>
            <WaitingRoomContent />
          </Suspense>
        </CardContent>
      </Card>
      
    </div>
  );
}
