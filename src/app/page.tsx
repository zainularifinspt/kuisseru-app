import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* AI Background Glows */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center max-w-lg w-full bg-white/70 backdrop-blur-2xl p-10 rounded-[32px] shadow-2xl shadow-blue-900/10 border border-white relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-[2rem] shadow-sm mb-8 border border-blue-100 relative group">
          <Sparkles className="w-12 h-12 text-blue-600" />
        </div>
        
        <h1 className="text-4xl font-semibold text-slate-800 mb-4 tracking-tight">
          Platform <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">KuisSeru</span>
        </h1>
        
        <p className="text-slate-500 mb-10 text-lg font-light leading-relaxed">
          Bangkitkan antusiasme belajar siswa melalui pengalaman kuis interaktif yang cerdas dan real-time.
        </p>
        
        <div className="space-y-4">
          <Link href="/teacher" className="block">
            <Button size="lg" className="w-full rounded-2xl text-lg font-medium bg-blue-600 hover:bg-blue-700 h-16 shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center justify-center text-white">
                Masuk sebagai Guru
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
          <div className="text-sm text-slate-400 pt-4 font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>Siswa dapat bergabung dengan memindai QR Code dari kelas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
