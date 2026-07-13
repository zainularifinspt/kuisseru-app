"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, CheckCircle, XCircle, ArrowLeft, Trophy, ListOrdered } from "lucide-react";
import { QuestionStatsChart } from "@/components/QuestionStatsChart";
import { QuestionStatsTable } from "@/components/QuestionStatsTable";

export default function TeacherAnalyticsPage() {
  const [totalStudents, setTotalStudents] = useState(32);
  const [averageScore, setAverageScore] = useState(78);
  const [currentQuestion, setCurrentQuestion] = useState(5);
  const totalQuestions = 10;

  const [mockQuestionStats, setMockQuestionStats] = useState([
    { id: 1, correct: 28, incorrect: 4, label: "Soal 1" },
    { id: 2, correct: 25, incorrect: 7, label: "Soal 2" },
    { id: 3, correct: 15, incorrect: 17, label: "Soal 3" },
    { id: 4, correct: 30, incorrect: 2, label: "Soal 4" },
    { id: 5, correct: 20, incorrect: 12, label: "Soal 5" },
  ]);

  const [mockLeaderboard, setMockLeaderboard] = useState([
    { rank: 1, name: "Budi Santoso", score: 4500, correct: 5 },
    { rank: 2, name: "Siti Rahma", score: 4200, correct: 4 },
    { rank: 3, name: "Joko Anwar", score: 3900, correct: 4 },
    { rank: 4, name: "Rina Kumala", score: 3800, correct: 4 },
    { rank: 5, name: "Andi Wijaya", score: 3500, correct: 3 },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMockQuestionStats((prev) => 
        prev.map(stat => {
          if (stat.correct + stat.incorrect < totalStudents) {
            // Randomly add some answers
            const isCorrect = Math.random() > 0.3;
            return {
              ...stat,
              correct: stat.correct + (isCorrect ? 1 : 0),
              incorrect: stat.incorrect + (isCorrect ? 0 : 1)
            };
          }
          return stat;
        })
      );

      setMockLeaderboard((prev) => {
        let updated = prev.map(p => ({ ...p, score: p.score + Math.floor(Math.random() * 100) }));
        updated.sort((a, b) => b.score - a.score);
        return updated.map((p, idx) => ({ ...p, rank: idx + 1 }));
      });

      setAverageScore(prev => {
        const diff = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        return Math.min(100, Math.max(0, prev + diff));
      });
      
    }, 2000);

    return () => clearInterval(interval);
  }, [totalStudents]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                Statistik Kuis <span className="text-indigo-600">Live</span>
              </h1>
              <p className="text-slate-500 mt-1">Kelas Matematika 6A • Berlangsung</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-700 font-bold text-sm">LIVE</span>
            </div>
            <Button variant="destructive" className="rounded-full shadow-md shadow-red-200">
              Akhiri Kuis
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-none shadow-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-indigo-100">Total Siswa</span>
                <Users className="h-6 w-6 text-indigo-200" />
              </div>
              <div className="text-4xl font-black">{totalStudents}</div>
              <div className="mt-2 text-sm text-indigo-200 font-medium">Hadir & Berpartisipasi</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-none shadow-md bg-gradient-to-br from-emerald-400 to-emerald-500 text-white">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-emerald-100">Rata-rata Skor</span>
                <BarChart3 className="h-6 w-6 text-emerald-200" />
              </div>
              <div className="text-4xl font-black">{averageScore}%</div>
              <div className="mt-2 text-sm text-emerald-100 font-medium">Akurasi Keseluruhan</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-none shadow-md bg-gradient-to-br from-amber-400 to-amber-500 text-white">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-amber-100">Progress Kuis</span>
                <div className="h-6 w-6 rounded-full border-2 border-amber-200 flex items-center justify-center text-xs font-bold">{currentQuestion}</div>
              </div>
              <div className="text-4xl font-black">{currentQuestion} <span className="text-xl text-amber-100">/ {totalQuestions}</span></div>
              <div className="mt-2 text-sm text-amber-100 font-medium">Soal Sedang Aktif</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-slate-100 bg-white">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-slate-500">Soal Tersulit</span>
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="text-2xl font-black text-slate-800">Soal 3</div>
              <div className="mt-2 text-sm text-red-500 font-medium bg-red-50 py-1 px-2 rounded-md inline-block max-w-fit">
                17 Siswa Salah
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <Card className="lg:col-span-2 rounded-2xl shadow-sm border-slate-100">
            <CardHeader className="border-b bg-white rounded-t-2xl">
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Analitik Jawaban per Soal
              </CardTitle>
              <CardDescription>Visualisasi jumlah siswa yang menjawab benar dan salah secara real-time</CardDescription>
            </CardHeader>
            <CardContent className="p-6 bg-white rounded-b-2xl">
              
              <QuestionStatsChart stats={mockQuestionStats} />

            </CardContent>
          </Card>

          {/* Leaderboard Table */}
          <Card className="rounded-2xl shadow-sm border-slate-100 bg-white">
            <CardHeader className="border-b bg-slate-50 rounded-t-2xl">
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Peringkat Teratas (Live)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {mockLeaderboard.map((student, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                        ${student.rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                          student.rank === 2 ? 'bg-slate-200 text-slate-700 border border-slate-300' : 
                          student.rank === 3 ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                          'bg-indigo-50 text-indigo-600 font-medium'}
                      `}>
                        {student.rank}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{student.name}</span>
                        <span className="text-xs text-slate-500 font-medium">{student.correct} Benar</span>
                      </div>
                    </div>
                    <div className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      {student.score}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl text-center">
                <Button variant="link" className="text-indigo-600">Lihat Semua Siswa</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Table */}
        <Card className="rounded-2xl shadow-sm border-slate-100">
          <CardHeader className="border-b bg-white rounded-t-2xl">
            <CardTitle className="text-xl flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-indigo-500" />
              Tabel Rincian Soal
            </CardTitle>
            <CardDescription>Rincian tingkat kesulitan dan persentase jawaban per soal</CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-white rounded-b-2xl">
            <QuestionStatsTable stats={mockQuestionStats} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
