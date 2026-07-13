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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="h-12 w-12 animate-spin mb-4 text-indigo-600" />
          <p className="font-medium animate-pulse">Memeriksa kode kuis...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-100 shadow-xl shadow-red-100/50 rounded-3xl overflow-hidden">
          <div className="h-3 bg-red-500 w-full" />
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl font-black text-slate-800">Sesi Tidak Ditemukan / Sudah Dimulai</CardTitle>
            <CardDescription className="text-base mt-2">
              Kuis ini mungkin sudah berakhir, sedang berlangsung, atau URL tidak valid.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pb-8 flex justify-center">
            <Button onClick={() => router.push("/")} variant="outline" className="rounded-full">
              Kembali ke Beranda
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-slate-100 shadow-2xl shadow-indigo-100/50 rounded-3xl overflow-hidden">
        <div className="h-4 bg-gradient-to-r from-indigo-500 to-purple-600 w-full" />
        
        <CardHeader className="text-center pt-8 pb-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-12 hover:rotate-0 transition-transform">
            <span className="text-3xl">🎮</span>
          </div>
          <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">
            Siap Bermain?
          </CardTitle>
          <CardDescription className="text-base text-slate-500 mt-2">
            Kamu akan bergabung ke: <br/>
            <span className="font-bold text-indigo-600">{sessionTitle}</span>
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleJoin}>
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-sm font-bold text-slate-700 ml-1">
                Masukkan Nama Kamu
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="nickname"
                  placeholder="Contoh: Budi Keren"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full pl-12 h-14 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium transition-all"
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
              className="w-full h-14 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1"
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
