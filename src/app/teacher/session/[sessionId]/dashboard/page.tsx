'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";

type Player = {
  id: string;
  nickname: string;
  score: number;
  joinedAt: string;
  answersCount?: number;
};

const AVATAR_EMOJIS = ["🦄","🦊","🐸","🐙","🦖","🦋","🐯","🐶","🐱","🦁","🐼","🐧"];
const AVATAR_COLORS = ["bg-cyber-lime","bg-mesh-pink","bg-electric-blue","bg-soft-violet","bg-tertiary-fixed"];

function getPlayerAvatar(id: string, idx: number) {
  return {
    emoji: AVATAR_EMOJIS[idx % AVATAR_EMOJIS.length],
    color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
  };
}

export default function TeacherDashboard() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [quizStatus, setQuizStatus] = useState<'menunggu' | 'berjalan' | 'selesai'>('menunggu');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTitle, setSessionTitle] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/quiz-sessions/${sessionId}`);
        if (!res.ok) {
          alert("Sesi tidak ditemukan");
          router.push("/teacher");
          return;
        }
        const data = await res.json();
        setSessionTitle(data.session.title);
        setJoinCode(data.session.joinCode || "");
        setTotalQuestions(data.stats.totalQuestions);
        if (data.session.status === 'active') setQuizStatus('berjalan');
        else if (data.session.status === 'finished') setQuizStatus('selesai');
        
        const partRes = await fetch(`/api/quiz-sessions/${sessionId}/participants`);
        if (partRes.ok) {
          const partData = await partRes.json();
          setPlayers(partData.participants.map((p: any) => ({ ...p, answersCount: p.answers?.length || 0 })));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionId) {
      fetchSession();
      
      const pusherClient = getPusherClient();
      if (!pusherClient) return;

      const channel = pusherClient.subscribe(`session-${sessionId}`);
      
      channel.bind('player-joined', (data: { participant: Player }) => {
        setPlayers((prev) => {
          if (prev.some(p => p.id === data.participant.id)) return prev;
          return [...prev, data.participant];
        });
      });

      channel.bind('answer-submitted', (data: { participantId: string, score: number }) => {
        setPlayers((prev) => 
          prev.map(p => 
            p.id === data.participantId 
              ? { ...p, score: data.score, answersCount: (p.answersCount || 0) + 1 }
              : p
          )
        );
      });

      return () => {
        pusherClient.unsubscribe(`session-${sessionId}`);
      };
    }
  }, [sessionId, router]);

  const handleStartQuiz = async () => {
    if (players.length === 0) {
      alert("Belum ada peserta yang bergabung!");
      return;
    }
    
    try {
      const res = await fetch(`/api/quiz-sessions/${sessionId}/start`, {
        method: 'POST',
      });
      if (res.ok) {
        setQuizStatus('berjalan');
      } else {
        alert("Gagal memulai kuis");
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleEndQuiz = async () => {
    if (window.confirm('Yakin ingin mengakhiri kuis ini sekarang?')) {
      try {
        const res = await fetch(`/api/quiz-sessions/${sessionId}/end`, {
          method: 'POST',
        });
        if (res.ok) {
          setQuizStatus('selesai');
        } else {
          alert("Gagal mengakhiri kuis");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
      </div>
    );
  }

  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="min-h-[100dvh] bg-background p-4 md:p-8 font-sans text-on-background relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(255,255,255,0.7)] backdrop-blur-xl p-6 rounded-xl border-2 border-deep-obsidian shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="h-1 absolute top-0 left-0 right-0 bg-[linear-gradient(90deg,#0052FF,#FF00E5,#0052FF)] bg-[length:200%_auto] animate-gradient-shift"></div>
          <div>
            <button onClick={() => router.push('/teacher')} className="flex items-center gap-2 mb-2 font-heading font-bold text-sm text-on-surface-variant hover:text-electric-blue transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Kembali ke Dashboard
            </button>
            <h1 className="font-heading text-2xl font-bold text-deep-obsidian flex items-center gap-2">
              ✨ Dashboard Guru
            </h1>
            <p className="font-sans text-on-surface-variant mt-1">
              Mengelola sesi: <span className="font-heading font-bold text-electric-blue">{sessionTitle || "..."}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => window.open(`/teacher/session/${sessionId}/qr`, '_blank')}
              className="bg-surface-container text-deep-obsidian font-heading font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 border-2 border-deep-obsidian hover:bg-surface-container-highest transition-all text-sm cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 17h2v2h-2zM19 19h2v2h-2zM15 19h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2z"/></svg>
              QR Code
            </button>
            
            {quizStatus === 'berjalan' && (
              <button 
                onClick={handleEndQuiz}
                className="bg-error text-on-error font-heading font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 border-2 border-deep-obsidian hover:shadow-[0_0_15px_rgba(186,26,26,0.4)] transition-all text-sm cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
                Akhiri Kuis
              </button>
            )}

            <button 
              onClick={handleStartQuiz}
              disabled={quizStatus !== 'menunggu'}
              className={`font-heading font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 border-2 border-deep-obsidian transition-all text-sm cursor-pointer ${
                quizStatus !== 'menunggu'
                  ? "bg-surface-variant text-outline cursor-not-allowed opacity-50" 
                  : "bg-deep-obsidian text-cyber-lime hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:scale-105"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              {quizStatus === 'berjalan' ? "Kuis Berjalan" : quizStatus === 'selesai' ? "Kuis Selesai" : "Mulai Kuis"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Waiting Room / Leaderboard Panel */}
          <div className="md:col-span-2 bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian rounded-xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            {quizStatus === 'menunggu' ? (
              <>
                <div className="bg-surface-container-high border-b-2 border-deep-obsidian p-6">
                  <h2 className="font-heading text-xl font-bold text-deep-obsidian flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-electric-blue" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                    Daftar Peserta (Ruang Tunggu)
                  </h2>
                  <p className="font-sans text-on-surface-variant text-sm mt-1">
                    Terdapat {players.length} siswa yang sudah masuk dan siap mengikuti kuis.
                  </p>
                </div>
                <div className="p-6 min-h-[300px]">
                  {players.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full pt-12 text-on-surface-variant">
                      <Loader2 className="w-10 h-10 mb-4 animate-spin text-electric-blue" />
                      <p className="font-heading font-semibold">Menunggu siswa memindai QR Code...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 justify-items-center">
                      {players.map((player, idx) => {
                        const { emoji, color } = getPlayerAvatar(player.id, idx);
                        return (
                          <div key={player.id} className="flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-200">
                            <div className={`w-14 h-14 rounded-full ${color} border-2 border-deep-obsidian flex items-center justify-center shadow-[4px_4px_0px_rgba(10,10,10,1)] text-2xl`}>
                              {emoji}
                            </div>
                            <span className="font-heading font-bold text-xs truncate w-full text-center text-deep-obsidian">{player.nickname}</span>
                            <span className="text-xs font-heading font-bold text-[#4CAF50] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse"></span> Siap
                            </span>
                          </div>
                        );
                      })}
                      {/* Shimmer placeholder */}
                      <div className="flex flex-col items-center gap-2 opacity-50 animate-pulse">
                        <div className="w-14 h-14 rounded-full bg-surface-variant border-2 border-dashed border-deep-obsidian flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-outline" />
                        </div>
                        <span className="bg-surface-variant rounded w-10 h-3"></span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="bg-surface-container-high border-b-2 border-deep-obsidian p-6">
                  <h2 className="font-heading text-xl font-bold text-deep-obsidian flex items-center gap-2">
                    <span className="flex h-3 w-3 relative mr-1">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#4CAF50] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4CAF50]"></span>
                    </span>
                    Leaderboard Langsung
                  </h2>
                </div>
                <div className="p-6 min-h-[300px]">
                  <div className="space-y-3">
                    {sortedPlayers.map((player, idx) => {
                      const { emoji, color } = getPlayerAvatar(player.id, idx);
                      const isTop3 = idx < 3;
                      const isFinished = totalQuestions > 0 && player.answersCount === totalQuestions;
                      return (
                        <div 
                          key={player.id} 
                          className={`border-2 border-deep-obsidian rounded-xl p-3 flex items-center justify-between transition-all relative overflow-hidden ${isTop3 ? 'bg-surface-container shadow-[0_0_10px_rgba(0,82,255,0.1)]' : 'bg-surface'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`font-heading font-bold w-8 text-center ${idx === 0 ? 'text-[#FFD700] text-lg' : idx === 1 ? 'text-[#C0C0C0]' : idx === 2 ? 'text-[#CD7F32]' : 'text-on-surface-variant'}`}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx+1}.`}
                            </div>
                            <div className={`w-10 h-10 rounded-full ${color} border-2 border-deep-obsidian flex items-center justify-center text-xl shadow-[2px_2px_0px_rgba(10,10,10,1)]`}>
                              {emoji}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-heading font-bold text-sm text-deep-obsidian flex items-center gap-2">
                                {player.nickname}
                                {quizStatus === 'berjalan' && (
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${isFinished ? 'bg-[#4CAF50] text-white border-[#4CAF50]' : 'bg-surface-variant text-on-surface-variant border-outline'}`}>
                                    {isFinished ? 'SELESAI' : 'MENGERJAKAN'}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="bg-deep-obsidian text-cyber-lime px-3 py-1.5 rounded-full font-heading font-bold text-sm border border-cyber-lime/30">
                            {player.score || 0} pts
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian rounded-xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <div className="bg-surface-container-high border-b-2 border-deep-obsidian p-6">
              <h2 className="font-heading text-xl font-bold text-deep-obsidian flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-electric-blue" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>
                Statistik Sesi
              </h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {joinCode && (
                <div className="bg-deep-obsidian p-4 rounded-xl flex items-center justify-between border-2 border-deep-obsidian relative overflow-hidden">
                  <span className="text-cyber-lime/70 font-heading font-bold text-sm">Kode Kuis</span>
                  <span className="text-2xl font-heading font-bold text-cyber-lime tracking-widest drop-shadow-[0_0_10px_rgba(204,255,0,0.5)]">
                    {joinCode}
                  </span>
                </div>
              )}
              <div className="bg-surface-container rounded-xl p-4 flex items-center justify-between border-2 border-deep-obsidian">
                <span className="font-heading font-bold text-sm text-on-surface-variant">Total Peserta</span>
                <span className="text-2xl font-heading font-bold text-deep-obsidian">{players.length}</span>
              </div>
              <div className={`rounded-xl p-4 flex items-center justify-between border-2 border-deep-obsidian ${
                quizStatus === 'berjalan' ? "bg-[#E8F5E9]" : quizStatus === 'selesai' ? "bg-surface-variant" : "bg-[#FFF3E0]"
              }`}>
                <span className="font-heading font-bold text-sm text-on-surface-variant">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider border-2 border-deep-obsidian ${
                  quizStatus === 'berjalan' ? "bg-[#4CAF50] text-white" : quizStatus === 'selesai' ? "bg-outline text-white" : "bg-[#FF9800] text-white"
                }`}>
                  {quizStatus}
                </span>
              </div>
              <div className="bg-surface-container rounded-xl p-4 flex items-center justify-between border-2 border-deep-obsidian">
                <span className="font-heading font-bold text-sm text-on-surface-variant">Total Soal</span>
                <span className="text-xl font-heading font-bold text-deep-obsidian">{totalQuestions}</span>
              </div>
              
              <div className="mt-4 p-4 border-2 border-deep-obsidian bg-surface-container-high rounded-xl text-center relative overflow-hidden">
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  {quizStatus === 'menunggu' 
                    ? "Pastikan semua siswa sudah memindai QR Code sebelum menekan tombol Mulai Kuis."
                    : "Skor akan otomatis terupdate setiap ada siswa yang menjawab soal."
                  }
                </p>
              </div>

              {quizStatus !== 'menunggu' && (
                <button 
                  onClick={() => router.push(`/teacher/session/${sessionId}/grading`)}
                  className="w-full bg-electric-blue text-on-primary font-heading font-bold py-3 rounded-full flex items-center justify-center gap-2 border-2 border-deep-obsidian hover:shadow-[0_0_15px_rgba(0,82,255,0.3)] transition-all text-sm cursor-pointer mt-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                  Lihat Penilaian
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
