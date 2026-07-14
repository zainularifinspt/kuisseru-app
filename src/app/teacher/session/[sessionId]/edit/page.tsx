'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Plus, Save, Play, CheckCircle2, Circle, Clock, Check } from 'lucide-react';
import { addQuestion, publishSession, getSessionQuestions } from '@/app/actions/question';
import { updateSessionTitle } from '@/app/actions/session';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function EditQuizSession({ params }: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  const { sessionId } = use(params);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  // Title state
  const [sessionTitle, setSessionTitle] = useState('Memuat judul...');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isTitleSaved, setIsTitleSaved] = useState(false);

  // Question state
  const [newQuestion, setNewQuestion] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('1'); // Default 1 minute
  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSessionInfo();
    fetchQuestions();
  }, [sessionId]);

  const fetchSessionInfo = async () => {
    try {
      const res = await fetch(`/api/quiz-sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionTitle(data.session.title);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuestions = async () => {
    setIsFetching(true);
    const res = await getSessionQuestions(sessionId);
    if (res.success) {
      setQuestions(res.questions);
    }
    setIsFetching(false);
  };

  const handleSaveTitle = async () => {
    setIsSavingTitle(true);
    const res = await updateSessionTitle(sessionId, sessionTitle);
    if (res.success) {
      setIsTitleSaved(true);
      setTimeout(() => setIsTitleSaved(false), 2000);
    } else {
      alert("Gagal menyimpan judul");
    }
    setIsSavingTitle(false);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    
    setIsSubmitting(true);
    // Convert minutes to seconds for internal representation if needed, or just save as minutes.
    // The user requested to use minutes, but internally we might want minutes or seconds.
    // Our schema doesn't specify, we'll store minutes directly as requested by the user.
    const timeLimitVal = parseInt(timeLimitMinutes, 10) || 1;
    const res = await addQuestion(sessionId, newQuestion, options, timeLimitVal);
    
    if (res.success) {
      setNewQuestion('');
      setTimeLimitMinutes('1');
      setOptions([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]);
      await fetchQuestions();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleSetCorrect = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setOptions(newOptions);
  };

  const handlePublish = async () => {
    if (questions.length === 0) {
      alert("Tambahkan setidaknya satu soal sebelum meluncurkan sesi.");
      return;
    }
    
    setIsSubmitting(true);
    const res = await publishSession(sessionId);
    if (res.success) {
      router.push(`/teacher/session/${sessionId}/dashboard`);
    } else {
      alert("Gagal meluncurkan kuis.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-200 p-4 md:p-8 relative overflow-hidden font-sans transition-colors duration-300">
      
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-400/20 dark:bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '7s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '9s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white/90 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] shadow-[0_0_30px_rgba(59,130,246,0.05)] dark:shadow-[0_0_30px_rgba(59,130,246,0.15)] border border-slate-200 dark:border-white/10 gap-4">
          <div className="flex-1 space-y-2">
            <h1 className="text-sm font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">Editor Kuis</h1>
            <div className="flex items-center gap-2 max-w-md">
              <Input 
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="text-xl font-bold border-transparent hover:border-blue-300 dark:hover:border-cyan-500/50 focus:border-blue-500 dark:focus:border-cyan-400 bg-slate-100 dark:bg-[#0f172a]/60 text-slate-900 dark:text-white rounded-xl h-12 transition-all shadow-inner"
                placeholder="Masukkan Judul Kuis"
              />
              <Button 
                variant="outline" 
                onClick={handleSaveTitle} 
                disabled={isSavingTitle}
                className="h-12 w-12 p-0 flex-shrink-0 rounded-xl border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/30 bg-white dark:bg-white/5"
              >
                {isSavingTitle ? <Loader2 className="w-5 h-5 animate-spin" /> : isTitleSaved ? <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> : <Save className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          <Button 
            onClick={handlePublish}
            disabled={isSubmitting || questions.length === 0}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white h-12 px-6 shadow-[0_0_20px_rgba(34,211,238,0.4)] border-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Luncurkan Kuis
          </Button>
        </header>

        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-6">
            <Card className="rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.05)] dark:shadow-[0_0_40px_rgba(59,130,246,0.1)] bg-white/90 dark:bg-[#111827]/80 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-purple-500" />
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white drop-shadow-sm">Buat Pertanyaan Baru</h2>
                <form onSubmit={handleAddQuestion} className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Pertanyaan (Mendukung LaTeX: $...$ atau $$...$$)</label>
                    <textarea 
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full h-32 p-4 rounded-2xl bg-slate-50 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 text-slate-900 dark:text-white outline-none resize-none transition-all shadow-inner"
                      placeholder="Contoh: Berapakah hasil dari $\int x^2 dx$ ?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-cyan-400" /> Waktu Pengerjaan (Menit)
                    </label>
                    <Input 
                      type="number"
                      min="1"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 dark:bg-[#0f172a] border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-cyan-400 text-slate-900 dark:text-white w-full md:w-1/3 shadow-inner"
                      placeholder="Menit"
                      required
                    />
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Pilihan Jawaban (Pilih satu yang benar)</label>
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={() => handleSetCorrect(idx)}
                          className={`flex-shrink-0 transition-all duration-300 hover:scale-110 ${opt.isCorrect ? 'text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] dark:drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                          {opt.isCorrect ? <CheckCircle2 className="w-7 h-7 fill-emerald-100 dark:fill-emerald-900/50" /> : <Circle className="w-7 h-7" />}
                        </button>
                        <Input
                          value={opt.text}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                          className={`h-12 rounded-xl transition-all shadow-inner text-slate-900 dark:text-white ${opt.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/30 dark:focus:ring-emerald-400/30' : 'bg-slate-50 dark:bg-[#0f172a] border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-cyan-400'}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-lg mt-8 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-1 border-0">
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Tambahkan Pertanyaan</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-5 space-y-6">
            <Card className="rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.05)] dark:shadow-[0_0_40px_rgba(59,130,246,0.1)] bg-white/90 dark:bg-[#1e293b]/60 backdrop-blur-xl">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                  <Sparkles className="w-6 h-6 text-blue-500 dark:text-cyan-400 animate-pulse" />
                  Daftar Pertanyaan ({questions.length})
                </h2>
                
                {isFetching ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500 dark:text-cyan-400" /></div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-[#0f172a] rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                      <Sparkles className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-bold mb-1">Belum ada soal</p>
                    <p className="text-sm text-slate-500">Silakan tambahkan soal di panel sebelah kiri.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="bg-slate-50 dark:bg-[#0f172a]/80 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-400/50 dark:hover:border-cyan-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-bold text-slate-800 dark:text-white text-base leading-relaxed">
                            <span className="text-blue-600 dark:text-cyan-400 font-black mr-2 text-lg">{idx + 1}.</span>
                            <Latex>{q.content}</Latex>
                          </div>
                          <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-cyan-300 px-2 py-1 rounded flex items-center gap-1 ml-4 whitespace-nowrap border border-blue-300 dark:border-blue-500/30">
                            <Clock className="w-3 h-3" /> {q.timeLimit} mnt
                          </span>
                        </div>
                        <div className="space-y-2 pl-7 mt-4">
                          {q.options?.map((opt: any, oIdx: number) => (
                            <div key={opt.id} className={`text-sm p-2 rounded-lg flex items-center ${opt.isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-500/30' : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-transparent'}`}>
                              <span className="w-6 font-bold text-slate-500 dark:text-slate-300">{String.fromCharCode(65 + oIdx)}.</span> 
                              <span className="flex-1"><Latex>{opt.text}</Latex></span>
                              {opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 ml-2" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
