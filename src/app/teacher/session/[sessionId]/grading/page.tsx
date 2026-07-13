import { db } from "@/db";
import { quizSessions, participants } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Medal, Award, FileText } from "lucide-react";
import Link from "next/link";

export default async function GradingPage(props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;
  const session = await auth.api.getSession({
      headers: await headers()
  });

  if (!session || !session.user) {
      redirect("/");
  }

  const quizSession = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.id, params.sessionId),
  });

  if (!quizSession) {
    return <div className="p-8 text-center">Sesi tidak ditemukan</div>;
  }

  // Admin or the owner can view
  if (session.user.role !== 'admin' && quizSession.teacherId !== session.user.id) {
    return <div className="p-8 text-center text-red-500">Akses ditolak</div>;
  }

  const participantsList = await db.query.participants.findMany({
    where: eq(participants.quizSessionId, params.sessionId),
    orderBy: [desc(participants.score)],
  });

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 p-4 md:p-8 font-sans relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none animate-pulse"></div>
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111827]/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] shadow-[0_0_30px_rgba(59,130,246,0.15)] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link href="/teacher">
                <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 shadow-sm transition-all">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Kembali
                </Button>
              </Link>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-900/40 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                Menu Penilaian
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3 drop-shadow-md">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.4)] border border-cyan-400/30">
                <FileText className="w-6 h-6" />
              </div>
              {quizSession.title}
            </h1>
          </div>
          
          <div className="md:text-right bg-[#0f172a]/60 p-4 rounded-2xl border border-slate-700 shadow-inner min-w-[160px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Peserta</p>
            <p className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{participantsList.length}</p>
          </div>
        </header>

        <Card className="rounded-[2rem] border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.1)] bg-[#111827]/80 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-0">
            {participantsList.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-lg font-medium text-slate-400">Belum ada peserta yang mengikuti kuis ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f172a]/80 border-b border-white/10">
                      <th className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider w-24 text-center">Peringkat</th>
                      <th className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Nama Peserta</th>
                      <th className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">Skor Akhir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantsList.map((p, index) => (
                      <tr key={p.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors group">
                        <td className="py-4 px-6 text-center">
                          <div className={`mx-auto flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm shadow-inner border ${
                            index === 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.2)]' :
                            index === 1 ? 'bg-slate-300/20 text-slate-300 border-slate-400/30 shadow-[0_0_15px_rgba(203,213,225,0.1)]' :
                            index === 2 ? 'bg-amber-700/20 text-amber-600 border-amber-700/30' :
                            'bg-[#0f172a] text-slate-500 border-slate-700'
                          }`}>
                            {index === 0 ? <Trophy className="w-5 h-5 drop-shadow-md" /> :
                             index === 1 ? <Medal className="w-5 h-5 drop-shadow-md" /> :
                             index === 2 ? <Medal className="w-5 h-5 drop-shadow-md" /> :
                             index + 1}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-white text-lg group-hover:text-cyan-400 transition-colors">
                          {p.nickname}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-blue-900/40 text-blue-400 font-black text-xl border border-blue-500/30 shadow-inner group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-400 transition-all group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            {p.score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
