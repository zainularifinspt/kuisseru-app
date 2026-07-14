import { db } from "@/db";
import { quizSessions, participants, questions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";

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
    return <div className="p-8 text-center font-heading font-bold text-deep-obsidian">Sesi tidak ditemukan</div>;
  }

  // Admin or the owner can view
  if (session.user.role !== 'admin' && quizSession.teacherId !== session.user.id) {
    return <div className="p-8 text-center font-heading font-bold text-error">Akses ditolak</div>;
  }

  const participantsList = await db.query.participants.findMany({
    where: eq(participants.quizSessionId, params.sessionId),
    orderBy: [desc(participants.score)],
  });

  const questionsList = await db.query.questions.findMany({
    where: eq(questions.quizSessionId, params.sessionId),
    with: {
      options: true,
      answers: {
        with: {
          participant: true
        }
      }
    }
  });

  return (
    <div className="min-h-[100dvh] bg-background text-on-background font-sans antialiased overflow-x-hidden">
      <TeacherSidebar user={session.user} />
      
      <div className="md:ml-64 flex flex-col min-h-[100dvh] p-4 md:p-8 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="max-w-5xl w-full mx-auto space-y-8 relative z-10">
        {/* Header */}
        <header className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl p-6 md:p-8 rounded-xl border-2 border-deep-obsidian shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="h-1 absolute top-0 left-0 right-0 bg-[linear-gradient(90deg,#0052FF,#FF00E5,#0052FF)] bg-[length:200%_auto] animate-gradient-shift"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Link href="/teacher" className="flex items-center gap-2 font-heading font-bold text-sm text-on-surface-variant hover:text-electric-blue transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                  Kembali
                </Link>
                <span className="bg-deep-obsidian text-electric-blue font-heading font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                  Menu Penilaian
                </span>
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-deep-obsidian flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-electric-blue flex items-center justify-center text-white border-2 border-deep-obsidian shadow-[4px_4px_0px_rgba(10,10,10,1)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                </div>
                {quizSession.title}
              </h1>
            </div>
          
            <div className="bg-deep-obsidian p-4 rounded-xl border-2 border-deep-obsidian text-center min-w-[140px]">
              <p className="text-xs font-heading font-bold text-cyber-lime/70 uppercase tracking-wider mb-1">Total Peserta</p>
              <p className="text-4xl font-heading font-bold text-cyber-lime">{participantsList.length}</p>
            </div>
          </div>
        </header>

        {/* Leaderboard Table */}
        <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian rounded-xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          {participantsList.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-surface-variant border-2 border-deep-obsidian flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-outline" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
              </div>
              <p className="font-heading text-lg font-bold text-on-surface-variant">Belum ada peserta yang mengikuti kuis ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high border-b-2 border-deep-obsidian">
                    <th className="py-5 px-6 font-heading font-bold text-on-surface-variant text-xs uppercase tracking-wider w-24 text-center">Peringkat</th>
                    <th className="py-5 px-6 font-heading font-bold text-on-surface-variant text-xs uppercase tracking-wider">Nama Peserta</th>
                    <th className="py-5 px-6 font-heading font-bold text-on-surface-variant text-xs uppercase tracking-wider text-right">Skor Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {participantsList.map((p, index) => (
                    <tr key={p.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                      <td className="py-4 px-6 text-center">
                        <div className={`mx-auto flex items-center justify-center w-10 h-10 rounded-full font-heading font-bold text-sm border-2 border-deep-obsidian ${
                          index === 0 ? 'bg-[#FFD700] text-deep-obsidian shadow-[4px_4px_0px_rgba(10,10,10,1)]' :
                          index === 1 ? 'bg-[#C0C0C0] text-deep-obsidian shadow-[3px_3px_0px_rgba(10,10,10,1)]' :
                          index === 2 ? 'bg-[#CD7F32] text-white shadow-[2px_2px_0px_rgba(10,10,10,1)]' :
                          'bg-surface-container text-on-surface-variant'
                        }`}>
                          {index === 0 ? '🥇' :
                           index === 1 ? '🥈' :
                           index === 2 ? '🥉' :
                           index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-heading font-bold text-deep-obsidian text-lg group-hover:text-electric-blue transition-colors">
                        {p.nickname}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-deep-obsidian text-cyber-lime font-heading font-bold text-xl border-2 border-deep-obsidian shadow-[2px_2px_0px_rgba(10,10,10,0.5)]">
                          {p.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Per-Question Analysis */}
        <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian rounded-xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="p-6 md:p-8 border-b-2 border-deep-obsidian flex items-center gap-3 bg-surface-container-high">
            <div className="w-10 h-10 rounded-xl bg-deep-obsidian flex items-center justify-center border-2 border-deep-obsidian">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyber-lime" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-deep-obsidian">Analisis Per Soal</h2>
          </div>
          
          {questionsList.length === 0 ? (
            <div className="p-16 text-center text-on-surface-variant font-heading">Belum ada soal.</div>
          ) : (
            <div className="divide-y-2 divide-outline-variant">
              {questionsList.map((q, idx) => {
                const totalAnswers = q.answers.length;
                const correctAnswers = q.answers.filter((a) => a.isCorrect);
                const correctCount = correctAnswers.length;
                const correctPercentage = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;
                const correctNames = correctAnswers.map((a) => a.participant.nickname);

                return (
                  <div key={q.id} className="p-6 md:p-8 hover:bg-surface-container-low transition-colors">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-bold text-deep-obsidian mb-2">
                          <span className="text-electric-blue mr-2">Soal {idx + 1}.</span>
                          <Latex>{q.content}</Latex>
                        </h3>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-surface-container p-4 rounded-xl border-2 border-deep-obsidian min-w-[120px]">
                        <span className="text-xs font-heading font-bold text-on-surface-variant mb-1 uppercase">Benar</span>
                        <span className={`text-3xl font-heading font-bold ${
                          correctPercentage >= 75 ? 'text-[#4CAF50]' : 
                          correctPercentage >= 50 ? 'text-[#FF9800]' : 'text-error'
                        }`}>
                          {correctPercentage}%
                        </span>
                      </div>
                    </div>

                    {correctNames.length > 0 ? (
                      <div className="bg-[#E8F5E9] border-2 border-deep-obsidian rounded-xl p-4">
                        <p className="text-sm font-heading font-bold text-[#2E7D32] mb-2 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                          Siswa yang menjawab benar:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {correctNames.map((name, i) => (
                            <span key={i} className="bg-white border-2 border-deep-obsidian text-deep-obsidian text-xs font-heading font-bold px-3 py-1.5 rounded-full shadow-[2px_2px_0px_rgba(10,10,10,1)]">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-surface-container border-2 border-dashed border-outline rounded-xl p-4 text-center">
                        <p className="text-sm font-heading font-bold text-on-surface-variant">
                          {totalAnswers > 0 ? "Belum ada yang menjawab benar." : "Belum ada yang menjawab soal ini."}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
