"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Users, PlayCircle, Loader2 } from "lucide-react";

export default function QRCodeLoginPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [joinUrl, setJoinUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join/${sessionId}`);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: QR Code Area */}
        <div className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600 p-8 flex flex-col items-center justify-center text-white text-center">
          <h2 className="text-3xl font-extrabold mb-2">Scan untuk Bergabung!</h2>
          <p className="text-indigo-100 mb-8 font-medium">Gunakan kamera HP-mu</p>
          
          <div className="bg-white p-4 rounded-2xl shadow-inner mb-6">
            {joinUrl ? (
              <QRCodeSVG 
                value={joinUrl} 
                size={220} 
                level="H" 
                includeMargin={false}
                fgColor="#312e81" // indigo-900
              />
            ) : (
              <div className="w-[220px] h-[220px] flex items-center justify-center bg-slate-100 rounded-xl">
                <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
              </div>
            )}
          </div>
          
          <div className="text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
            Atau kunjungi: <span className="font-bold underline decoration-indigo-300 decoration-2 underline-offset-2">{joinUrl.replace(/^https?:\/\//, '')}</span>
          </div>
        </div>

        {/* Right Side: Controls & Info */}
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">KuisSeru</h1>
            <p className="text-slate-500 font-medium mb-6">Sesi Kuis Aktif</p>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center mb-8">
              <Users className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              <div className="text-4xl font-black text-slate-800">0</div>
              <p className="text-slate-500 text-sm font-medium">Siswa Terhubung</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full h-14 rounded-xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
              onClick={() => router.push(`/teacher/dashboard`)}
            >
              Lihat Ruang Tunggu
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full h-14 rounded-xl text-lg font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Mulai Langsung
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
