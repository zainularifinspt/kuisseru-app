'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Hourglass, Gamepad2 } from "lucide-react";

const SIMULATED_PLAYERS = [
  "Rina", "Agus", "Dewi", "Eko", "Fitri", 
  "Galih", "Hani", "Iwan", "Sari", "Bagas"
];

export default function WaitingRoomPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<{nickname: string}[]>([
    { nickname: "Budi" },
    { nickname: "Siti" },
    { nickname: "Joko" },
  ]);

  useEffect(() => {
    // Simulasikan peserta baru bergabung secara periodik
    let index = 0;
    const interval = setInterval(() => {
      if (index < SIMULATED_PLAYERS.length) {
        setPlayers((prev) => [...prev, { nickname: SIMULATED_PLAYERS[index] }]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 2500); // add a new player every 2.5 seconds

    // Simulasikan guru memulai kuis setelah 15 detik
    const startTimeout = setTimeout(() => {
      router.push('/quiz');
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(startTimeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8 flex flex-col font-sans text-slate-800 items-center justify-center overflow-x-hidden">
      
      <Card className="w-full max-w-3xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden ring-4 ring-white/50 relative z-10">
        <CardHeader className="bg-slate-50 border-b pb-8 pt-8 flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-100 p-4 rounded-full mb-4 animate-bounce shadow-sm">
            <Hourglass className="w-12 h-12 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            Ruang Tunggu
          </CardTitle>
          <p className="text-slate-500 text-lg">
            Kuis akan segera dimulai. Tunggu aba-aba dari guru ya!
          </p>
        </CardHeader>
        
        <CardContent className="p-6 md:p-10">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-700 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-500" />
              Peserta Bergabung
            </h3>
            <span className="bg-indigo-100 text-indigo-700 font-black px-3 py-1 rounded-full animate-pulse transition-all">
              {players.length}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {players.map((player, idx) => (
              <div 
                key={idx} 
                className="animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 hover:shadow-lg cursor-default group"
              >
                <Avatar className="h-14 w-14 border-4 border-white shadow-sm mb-3 group-hover:border-indigo-200 transition-colors">
                  <AvatarFallback className="bg-indigo-200 text-indigo-700 font-bold text-xl">
                    {player.nickname.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-bold text-slate-700 truncate w-full text-center">
                  {player.nickname}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-6 py-3 rounded-full text-sm font-bold border border-slate-200 shadow-inner">
              <Gamepad2 className="w-5 h-5 animate-pulse text-indigo-400" />
              Bersiap-siap...
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Background decorations */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="fixed bottom-20 right-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
    </div>
  );
}
