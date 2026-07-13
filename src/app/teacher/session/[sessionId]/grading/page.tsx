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
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/teacher">
                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-slate-500 hover:text-blue-600">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Kembali
                </Button>
              </Link>
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                Menu Penilaian
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              {quizSession.title}
            </h1>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-slate-500">Total Peserta</p>
            <p className="text-3xl font-black text-slate-800">{participantsList.length}</p>
          </div>
        </header>

        <Card className="rounded-[32px] border-0 shadow-lg shadow-slate-200/50 overflow-hidden">
          <CardContent className="p-0">
            {participantsList.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                Belum ada peserta yang mengikuti kuis ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="py-4 px-6 font-semibold text-slate-500 text-sm w-20">Peringkat</th>
                      <th className="py-4 px-6 font-semibold text-slate-500 text-sm">Nama Peserta</th>
                      <th className="py-4 px-6 font-semibold text-slate-500 text-sm text-right">Skor Akhir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantsList.map((p, index) => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm bg-slate-100 text-slate-600">
                            {index === 0 ? <Trophy className="w-4 h-4 text-amber-500" /> :
                             index === 1 ? <Medal className="w-4 h-4 text-slate-400" /> :
                             index === 2 ? <Medal className="w-4 h-4 text-amber-700" /> :
                             index + 1}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-800 text-lg">
                          {p.nickname}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-lg border border-blue-100">
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
