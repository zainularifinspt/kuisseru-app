'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";

type Player = {
  id: string;
  nickname: string;
};

// Array of random fun icons for avatars
const AVATAR_ICONS = ["cruelty_free", "pets", "bug_report", "emoji_nature", "rocket_launch", "smart_toy", "face", "star"];
const AVATAR_COLORS = ["bg-cyber-lime", "bg-mesh-pink", "bg-electric-blue", "bg-primary-fixed", "bg-secondary-fixed"];

// Get a deterministic avatar style based on player ID
const getAvatarStyle = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  const icon = AVATAR_ICONS[hash % AVATAR_ICONS.length];
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return { icon, color };
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
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-electric-blue" />
        <p className="font-heading font-semibold text-deep-obsidian">Memuat data peserta...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Student Grid Bento Box */}
      <div className="bg-[rgba(251,248,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian w-full max-w-5xl rounded-xl p-6 md:p-8 mb-8 shadow-[0_0_15px_rgba(204,255,0,0.4)] relative">
        <div className="flex justify-between items-center mb-6 border-b-2 border-deep-obsidian pb-4">
          <h2 className="font-heading text-xl md:text-2xl font-bold text-deep-obsidian">Peserta Bergabung</h2>
          <span className="bg-electric-blue text-on-primary font-heading font-bold px-3 py-1 rounded-full border-2 border-deep-obsidian">
            {players.length}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 justify-items-center">
          {players.map((player) => {
            const { icon, color } = getAvatarStyle(player.id);
            const isMe = player.id === participantId;
            return (
              <div key={player.id} className="flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-200">
                <div className={`w-16 h-16 rounded-full ${color} border-2 border-deep-obsidian flex items-center justify-center shadow-[4px_4px_0px_rgba(10,10,10,1)] ${isMe ? 'ring-4 ring-electric-blue' : ''} text-on-primary`}>
                  {/* Using an emoji fallback if material icons aren't loaded everywhere, though in a real app we'd map this properly. We'll just use a fun emoji based on hash */}
                  <span className="text-3xl">
                    {["🦄","🦊","🐸","🐙","🦖","🦋","🐯","🐶"][players.indexOf(player) % 8]}
                  </span>
                </div>
                <span className="font-heading text-sm font-bold truncate w-full text-center text-deep-obsidian">
                  {player.nickname} {isMe && <span className="block text-[10px] text-electric-blue">(Kamu)</span>}
                </span>
              </div>
            );
          })}

          {/* Shimmer placeholder for incoming student */}
          <div className="flex flex-col items-center gap-2 opacity-50 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-surface-variant border-2 border-dashed border-deep-obsidian flex items-center justify-center text-deep-obsidian">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <span className="bg-surface-variant rounded w-12 h-4"></span>
          </div>
        </div>

        {players.length === 0 && (
          <div className="text-center py-8 text-on-surface-variant">
            <p className="font-heading">Belum ada peserta yang bergabung.</p>
          </div>
        )}
      </div>

      {/* Fun Fact Card */}
      <div className="bg-[rgba(251,248,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian w-full max-w-md rounded-lg p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyber-lime rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-deep-obsidian text-cyber-lime p-2 rounded-full flex-shrink-0 border-2 border-deep-obsidian">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-heading font-bold text-electric-blue mb-1">Tahukah Kamu?</h3>
            <p className="font-sans text-sm text-on-surface">
              Gurita memiliki tiga jantung! Dua memompa darah ke insang, dan satu memompa darah ke seluruh tubuhnya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaitingRoomShell() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') || '---';

  return (
    <div className="min-h-[100dvh] font-sans text-on-background flex flex-col relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        .mesh-bg {
          background-image: 
              radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
              radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
              radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
          animation: mesh-shift 15s ease infinite alternate;
          background-size: 200% 200%;
        }
        @keyframes mesh-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />
      
      {/* Background container */}
      <div className="absolute inset-0 mesh-bg -z-10"></div>

      {/* Top App Bar */}
      <header className="w-full top-0 sticky z-10 bg-surface/80 backdrop-blur-xl border-b-2 border-deep-obsidian">
        <div className="flex justify-between items-center p-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 border-2 border-deep-obsidian rounded-full p-1 bg-surface">
            {/* Simple dummy avatar for current user in header */}
            <div className="w-8 h-8 rounded-full border-2 border-deep-obsidian bg-cyber-lime flex items-center justify-center text-sm">
              🦖
            </div>
            <span className="font-heading font-bold text-sm pr-3">Kamu</span>
          </div>
          <div className="font-heading font-bold text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-mesh-pink to-electric-blue">
            ASTHAQUIZZ
          </div>
          <div className="font-heading font-bold text-xs md:text-sm bg-deep-obsidian text-cyber-lime px-3 py-2 md:px-4 rounded-full border-2 border-deep-obsidian">
            ID: {sessionId.substring(0,6).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-10 z-0">
        
        {/* Status Indicator */}
        <div className="text-center mb-8 animate-pulse">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-on-secondary mb-2 drop-shadow-md">
            Menunggu Guru...
          </h1>
          <p className="font-sans text-lg text-on-secondary opacity-80">
            Siapkan dirimu, kuis akan segera dimulai!
          </p>
        </div>

        <WaitingRoomContent />
        
      </main>
    </div>
  );
}

export default function WaitingRoomPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-electric-blue" /></div>}>
      <WaitingRoomShell />
    </Suspense>
  );
}

