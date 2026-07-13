'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Play, Settings, BarChart, Square, Activity, Trophy, Loader2 } from "lucide-react";
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
        setSessionTitle(data.title);
        if (data.status === 'active') setQuizStatus('berjalan');
        else if (data.status === 'finished') setQuizStatus('selesai');
        
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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Guru</h1>
            <p className="text-slate-500 mt-1">Mengelola sesi kuis: <span className="font-bold text-indigo-600">{sessionTitle || "..."}</span></p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="rounded-full shadow-sm" onClick={() => router.push(`/teacher/session/${sessionId}/qr`)}>
              Lihat QR Code
            </Button>
            
            {quizStatus === 'berjalan' && (
              <Button 
                variant="destructive"
                className="rounded-full shadow-md shadow-red-200"
                onClick={handleEndQuiz}
              >
                <Square className="w-4 h-4 mr-2 fill-current" />
                Akhiri Kuis
              </Button>
            )}

            <Button 
              className={`rounded-full shadow-md transition-colors ${
                quizStatus !== 'menunggu'
                  ? "bg-slate-200 text-slate-500 hover:bg-slate-200 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
              }`}
              onClick={handleStartQuiz}
              disabled={quizStatus !== 'menunggu'}
            >
              <Play className="w-4 h-4 mr-2" />
              {quizStatus === 'berjalan' ? "Kuis Berjalan" : quizStatus === 'selesai' ? "Kuis Selesai" : "Mulai Kuis"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Waiting Room Panel */}
          <Card className="md:col-span-2 border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            {quizStatus === 'menunggu' ? (
              <>
                <CardHeader className="bg-white border-b pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Daftar Peserta (Ruang Tunggu)
                  </CardTitle>
                  <CardDescription>
                    Terdapat {players.length} siswa yang sudah masuk dan siap mengikuti kuis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-slate-50/50 p-6 min-h-[300px]">
                  {players.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full pt-12 text-slate-400">
                      <Loader2 className="w-8 h-8 mb-4 animate-spin text-indigo-300" />
                      <p>Menunggu siswa memindai QR Code...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {players.map((player) => (
                        <div 
                          key={player.id} 
                          className="animate-in fade-in zoom-in duration-500 bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-default"
                        >
                          <Avatar className="h-10 w-10 border-2 border-indigo-100">
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold">
                              {player.nickname.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-700 truncate" title={player.nickname}>
                              {player.nickname}
                            </span>
                            <span className="text-xs text-emerald-500 font-medium">Siap</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="bg-white border-b pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                    <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
                    Pemantauan Kuis Berjalan
                  </CardTitle>
                  <CardDescription>
                    Posisi sementara (Soal ke-{Math.floor(questionIndex)} dari 10)
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-slate-50/50 p-6 min-h-[300px]">
                  <div className="space-y-3">
                    {players
                      .sort((a, b) => b.score - a.score)
                      .map((player, idx) => (
                      <div 
                        key={player.id} 
                        className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm transition-all relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                        <div className="flex items-center gap-3 pl-3">
                          <div className="font-bold text-indigo-300 w-6">{idx + 1}.</div>
                          <Avatar className="h-8 w-8 border border-indigo-100">
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold">
                              {player.nickname.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-sm text-slate-700">
                            {player.nickname}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className="font-black text-slate-700">{player.score || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          {/* Quick Stats Panel */}
          <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                <BarChart className="w-5 h-5 text-indigo-500" />
                Statistik Sesi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4 bg-white">
              <div className="bg-indigo-50 p-4 rounded-xl flex items-center justify-between border border-indigo-100">
                <span className="text-indigo-900 font-medium">Total Peserta</span>
                <span className="text-2xl font-black text-indigo-700 transition-all duration-300">{players.length}</span>
              </div>
              <div className={`p-4 rounded-xl flex items-center justify-between border ${
                quizStatus === 'berjalan' ? "bg-emerald-50 border-emerald-100" : quizStatus === 'selesai' ? "bg-slate-100 border-slate-200" : "bg-orange-50 border-orange-100"
              }`}>
                <span className={`${quizStatus === 'berjalan' ? "text-emerald-900" : quizStatus === 'selesai' ? "text-slate-700" : "text-orange-900"} font-medium`}>Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  quizStatus === 'berjalan' ? "bg-emerald-200 text-emerald-800" : quizStatus === 'selesai' ? "bg-slate-300 text-slate-700" : "bg-orange-200 text-orange-800"
                }`}>
                  {quizStatus}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-200">
                <span className="text-slate-700 font-medium">Total Soal</span>
                <span className="text-xl font-black text-slate-600">10</span>
              </div>
              
              <div className="mt-4 p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
                <p className="text-sm text-slate-500">
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
