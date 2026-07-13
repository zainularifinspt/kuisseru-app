import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-50">
      {/* Animated Stars / Particles Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none animate-pulse"></div>
      
      {/* AI Background Glows */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

      <div className="text-center max-w-lg w-full bg-[#111827]/80 backdrop-blur-2xl p-10 rounded-[32px] shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-white/10 relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-[2rem] shadow-[0_0_20px_rgba(99,102,241,0.5)] mb-8 border border-blue-400/20 relative group overflow-hidden">
          <div className="absolute inset-0 bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
          <Sparkles className="w-12 h-12 text-cyan-400 relative z-10 animate-bounce" style={{ animationDuration: '2s' }} />
        </div>
        
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
          Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">KuisSeru</span>
        </h1>
        
        <p className="text-slate-300 mb-10 text-lg font-light leading-relaxed">
          Bangkitkan antusiasme belajar siswa melalui pengalaman kuis interaktif yang cerdas dan real-time.
        </p>
        
        <div className="space-y-4">
          <Link href="/teacher" className="block">
            <Button size="lg" className="w-full rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 h-16 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all hover:scale-[1.03] active:scale-[0.98] group relative overflow-hidden text-white">
              <span className="relative z-10 flex items-center justify-center">
                Masuk sebagai Guru
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>
          </Link>
          <div className="text-sm text-slate-400 pt-4 font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Siswa dapat bergabung dengan memindai QR Code dari kelas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
