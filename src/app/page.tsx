"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Create refs for the 6 digit inputs
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleDigitChange = (index: number, value: string) => {
    // Only allow numbers
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    
    // Update the joinCode string
    const codeArray = joinCode.padEnd(6, ' ').split('');
    codeArray[index] = digit || ' ';
    const newCode = codeArray.join('').trim();
    setJoinCode(newCode);
    if (error) setError("");

    // Move focus to next input if a digit was entered
    if (digit && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !joinCode[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    setJoinCode(pastedData);
    
    // Focus the next empty input or the last one
    if (pastedData.length > 0) {
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs[focusIndex].current?.focus();
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || joinCode.length !== 6) {
      setError("Kode PIN harus 6 angka");
      return;
    }
    
    // If nickname is provided, we might want to pass it as a query param or localStorage
    // since the current flow is join-by-code -> redirect to /join/[sessionId]


    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/quiz-sessions/join-by-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: joinCode.toUpperCase() }),
      });

      const data = await res.json();

      if (res.ok && data.sessionId) {
        if (nickname.trim()) {
          const joinRes = await fetch(`/api/quiz-sessions/${data.sessionId}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname: nickname.trim() }),
          });

          if (!joinRes.ok) {
            const errData = await joinRes.json().catch(() => null);
            setError(errData?.error || "Gagal bergabung ke sesi");
            setIsLoading(false);
            return;
          }

          const joinData = await joinRes.json();
          localStorage.setItem("participantId", joinData.participant.id);
          localStorage.setItem("nickname", joinData.participant.nickname);
          localStorage.setItem("sessionId", data.sessionId);
          
          if (joinData.sessionStatus === 'active') {
            router.push(`/quiz?sessionId=${data.sessionId}&participantId=${joinData.participant.id}`);
          } else {
            router.push(`/waiting-room?sessionId=${data.sessionId}&participantId=${joinData.participant.id}`);
          }
        } else {
          router.push(`/join/${data.sessionId}`);
        }
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
    <div className="bg-background text-on-background min-h-[100dvh] relative overflow-hidden flex flex-col font-sans">
      {/* Background Shapes */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-tertiary-fixed rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float" style={{ animationDelay: '-4s' }}></div>
      </div>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 z-10 w-full max-w-lg mx-auto py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-deep-obsidian mb-2 tracking-tight">
            ASTHAQUIZZ
          </h1>
          <h2 className="font-heading text-3xl font-semibold text-electric-blue">
            Siap Beraksi?
          </h2>
        </div>

        {/* Manual Entry Form */}
        <form onSubmit={handleJoin} className="w-full max-w-sm flex flex-col gap-4">
          <div className="flex flex-col gap-2 mb-2">
            <label className="font-heading font-semibold text-sm text-on-surface-variant px-2 uppercase tracking-wide">PIN Game (6 Digit)</label>
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength={1}
                  placeholder="•"
                  value={joinCode[index] || ""}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-full aspect-square text-center font-heading text-2xl font-bold bg-surface-container-lowest border-2 border-deep-obsidian rounded-xl focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all outline-none"
                />
              ))}
            </div>
          </div>

          <div className="relative group">
            <label className="font-heading font-semibold text-sm text-on-surface-variant px-2 mb-2 block uppercase tracking-wide">Nama Kamu</label>
            <div className="relative">
              <input 
                className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-full px-6 py-4 font-heading text-lg font-medium text-on-surface placeholder:text-outline focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all duration-300 peer" 
                id="nickname" 
                placeholder="Nama Panggilan" 
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute right-6 top-1/2 -translate-y-1/2 text-outline peer-focus:text-electric-blue transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
          </div>
          
          {error && <p className="text-error text-sm font-bold text-center animate-pulse mt-2">{error}</p>}

          <button 
            type="submit"
            disabled={isLoading || joinCode.length !== 6}
            className="w-full mt-4 group relative rounded-full border-2 border-deep-obsidian p-1 overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,82,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#0052FF,#FF00E5,#0052FF)] bg-[length:200%_auto] animate-gradient-shift opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-transparent px-8 py-4 rounded-full flex items-center justify-center gap-2">
              <span className="font-heading text-xl text-on-primary font-bold tracking-wide shadow-sm">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Join Quiz"}
              </span>
              {!isLoading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-on-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.13 22.19L11.5 18.36C10.07 15.01 7.21 12.14 3.86 10.71L.03 9.08C-.25 8.97-.25 8.59.03 8.47L22.1 0l-8.47 22.07c-.12.28-.5.28-.6.12z"/>
                </svg>
              )}
            </div>
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/teacher" className="font-heading font-semibold text-sm text-on-surface-variant hover:text-electric-blue transition-colors">
            Atau masuk sebagai Guru
          </Link>
        </div>

      </main>
    </div>
  );
}
