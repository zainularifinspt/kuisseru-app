'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Play, Settings, BarChart, Square, Activity, Trophy, Loader2, Sparkles } from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";


type Player = {
  id: string;
  nickname: string;
  score: number;
  joinedAt: string;
};

export default function TeacherDashboard() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  // const { toast } = useToast();

  const [players, setPlayers] = useState<Player[]>([]);
  const [quizStatus, setQuizStatus] = useState<'menunggu' | 'berjalan' | 'selesai'>('menunggu');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTitle, setSessionTitle] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const questionIndex = 1; // Dummy for now, can be fetched if needed

  useEffect(() => {
    // 1. Fetch Session Info
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
        setTotalQuestions(data.stats.totalQuestions);
        if (data.session.status === 'active') setQuizStatus('berjalan');
        else if (data.session.status === 'finished') setQuizStatus('selesai');
        
        // 2. Fetch Participants
        const partRes = await fetch(`/api/quiz-sessions/${sessionId}/participants`);
        if (partRes.ok) {
          const partData = await partRes.json();
          setPlayers(partData.participants);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionId) {
      fetchSession();
      
      // 3. Subscribe to Pusher
      const pusherClient = getPusherClient();
      if (!pusherClient) return;

      const channel = pusherClient.subscribe(`session-${sessionId}`);
      
      channel.bind('player-joined', (data: { participant: Player }) => {
        setPlayers((prev) => {
          // Check if already exists to prevent duplicates in strict mode
          if (prev.some(p => p.id === data.participant.id)) return prev;
          return [...prev, data.participant];
        });
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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-8 font-sans text-slate-200 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '7s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '9s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827]/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_0_30px_rgba(59,130,246,0.15)] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-sm">
              <Sparkles className="w-6 h-6 text-cyan-400" /> Dashboard Guru
            </h1>
            <p className="text-slate-400 mt-1">Mengelola sesi kuis: <span className="font-bold text-cyan-400">{sessionTitle || "..."}</span></p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="rounded-xl shadow-sm border-cyan-500/30 text-cyan-400 bg-cyan-900/20 hover:bg-cyan-500/20 hover:text-cyan-300" onClick={() => window.open(`/teacher/session/${sessionId}/qr`, '_blank')}>
              Lihat QR Code
            </Button>
            
            {quizStatus === 'berjalan' && (
              <Button 
                variant="destructive"
                className="rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] bg-red-600 hover:bg-red-700 text-white font-bold border-0"
                onClick={handleEndQuiz}
              >
                <Square className="w-4 h-4 mr-2 fill-current" />
                Akhiri Kuis
              </Button>
            )}

            <Button 
              className={`rounded-xl shadow-md transition-all font-bold border-0 ${
                quizStatus !== 'menunggu'
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50" 
                  : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:-translate-y-1"
              }`}
              onClick={handleStartQuiz}
              disabled={quizStatus !== 'menunggu'}
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              {quizStatus === 'berjalan' ? "Kuis Berjalan" : quizStatus === 'selesai' ? "Kuis Selesai" : "Mulai Kuis"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Waiting Room Panel */}
          <Card className="md:col-span-2 border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.1)] bg-[#111827]/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
            {quizStatus === 'menunggu' ? (
              <>
                <CardHeader className="bg-[#0f172a]/60 border-b border-white/10 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl text-white">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Daftar Peserta (Ruang Tunggu)
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Terdapat {players.length} siswa yang sudah masuk dan siap mengikuti kuis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 min-h-[300px]">
                  {players.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full pt-12 text-slate-400">
                      <Loader2 className="w-10 h-10 mb-4 animate-spin text-cyan-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                      <p className="font-medium">Menunggu siswa memindai QR Code...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {players.map((player) => (
                        <div 
                          key={player.id} 
                          className="animate-in fade-in zoom-in duration-500 bg-[#1e293b]/80 border border-slate-700 rounded-xl p-3 flex items-center gap-3 shadow-inner hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:border-cyan-500/50 transition-all cursor-default"
                        >
                          <Avatar className="h-10 w-10 border-2 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                            <AvatarFallback className="bg-blue-900 text-cyan-300 font-bold">
                              {player.nickname.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-200 truncate" title={player.nickname}>
                              {player.nickname}
                            </span>
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Siap
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="bg-[#0f172a]/60 border-b border-white/10 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl text-white">
                    <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                    Pemantauan Kuis Berjalan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 min-h-[300px]">
                  <div className="space-y-3">
                    {players
                      .sort((a, b) => b.score - a.score)
                      .map((player, idx) => (
                      <div 
                        key={player.id} 
                        className="bg-[#1e293b]/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between shadow-inner transition-all relative overflow-hidden hover:border-cyan-500/30"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500"></div>
                        <div className="flex items-center gap-3 pl-3">
                          <div className="font-black text-cyan-500 w-6 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{idx + 1}.</div>
                          <Avatar className="h-9 w-9 border border-cyan-500/30">
                            <AvatarFallback className="bg-blue-900 text-cyan-300 text-xs font-bold">
                              {player.nickname.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-sm text-slate-200">
                            {player.nickname}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#0f172a] px-3 py-1.5 rounded-lg border border-slate-700">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span className="font-black text-white">{player.score || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          {/* Quick Stats Panel */}
          <Card className="border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.1)] bg-[#111827]/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-[#0f172a]/60 border-b border-white/10 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <BarChart className="w-5 h-5 text-cyan-400" />
                Statistik Sesi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="bg-blue-900/30 p-4 rounded-xl flex items-center justify-between border border-blue-500/30 shadow-inner">
                <span className="text-blue-300 font-bold">Total Peserta</span>
                <span className="text-2xl font-black text-white transition-all duration-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">{players.length}</span>
              </div>
              <div className={`p-4 rounded-xl flex items-center justify-between border shadow-inner ${
                quizStatus === 'berjalan' ? "bg-emerald-900/30 border-emerald-500/30" : quizStatus === 'selesai' ? "bg-slate-800 border-slate-600" : "bg-amber-900/30 border-amber-500/30"
              }`}>
                <span className={`${quizStatus === 'berjalan' ? "text-emerald-300" : quizStatus === 'selesai' ? "text-slate-300" : "text-amber-300"} font-bold`}>Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  quizStatus === 'berjalan' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : quizStatus === 'selesai' ? "bg-slate-700 text-slate-300 border-slate-500" : "bg-amber-500/20 text-amber-400 border-amber-500/50"
                }`}>
                  {quizStatus}
                </span>
              </div>
              <div className="bg-[#1e293b] p-4 rounded-xl flex items-center justify-between border border-slate-700 shadow-inner">
                <span className="text-slate-300 font-bold">Total Soal</span>
                <span className="text-xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{totalQuestions}</span>
              </div>
              
              <div className="mt-4 p-4 border border-white/10 bg-[#0f172a]/50 rounded-xl text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-purple-500/50" />
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  {quizStatus === 'menunggu' 
                    ? "Pastikan semua siswa sudah memindai QR Code sebelum menekan tombol Mulai Kuis."
                    : "Skor akan otomatis terupdate setiap ada siswa yang menjawab soal."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
