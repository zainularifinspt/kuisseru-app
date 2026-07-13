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
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl shadow-sm gap-4">
          <div className="flex-1 space-y-2">
            <h1 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Editor Kuis</h1>
            <div className="flex items-center gap-2 max-w-md">
              <Input 
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="text-xl font-bold border-transparent hover:border-slate-200 focus:border-blue-500 bg-slate-50 rounded-xl h-12 transition-all"
                placeholder="Masukkan Judul Kuis"
              />
              <Button 
                variant="outline" 
                onClick={handleSaveTitle} 
                disabled={isSavingTitle}
                className="h-12 w-12 p-0 flex-shrink-0 rounded-xl border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              >
                {isSavingTitle ? <Loader2 className="w-5 h-5 animate-spin" /> : isTitleSaved ? <Check className="w-5 h-5 text-green-500" /> : <Save className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          <Button 
            onClick={handlePublish}
            disabled={isSubmitting || questions.length === 0}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 h-12 px-6 shadow-md shadow-blue-200"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Luncurkan Kuis
          </Button>
        </header>

        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-6">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 text-slate-800">Buat Pertanyaan Baru</h2>
                <form onSubmit={handleAddQuestion} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Pertanyaan (Mendukung LaTeX: $...$ atau $$...$$)</label>
                    <textarea 
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none resize-none transition-all"
                      placeholder="Contoh: Berapakah hasil dari $\int x^2 dx$ ?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Waktu Pengerjaan (Menit)
                    </label>
                    <Input 
                      type="number"
                      min="1"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 w-full md:w-1/3"
                      placeholder="Menit"
                      required
                    />
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <label className="text-sm font-medium text-slate-600 block">Pilihan Jawaban (Pilih satu yang benar)</label>
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={() => handleSetCorrect(idx)}
                          className={`flex-shrink-0 transition-colors ${opt.isCorrect ? 'text-emerald-500 drop-shadow-sm' : 'text-slate-200 hover:text-slate-400'}`}
                        >
                          {opt.isCorrect ? <CheckCircle2 className="w-7 h-7 fill-emerald-50" /> : <Circle className="w-7 h-7" />}
                        </button>
                        <Input
                          value={opt.text}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                          className={`h-12 rounded-xl transition-all ${opt.isCorrect ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-medium text-lg mt-8 shadow-xl shadow-slate-200">
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Tambahkan Pertanyaan</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-5 space-y-6">
            <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-b from-blue-50/50 to-white">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                  Daftar Pertanyaan ({questions.length})
                </h2>
                
                {isFetching ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium mb-1">Belum ada soal</p>
                    <p className="text-sm text-slate-400">Silakan tambahkan soal di panel sebelah kiri.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-medium text-slate-800 text-base leading-relaxed">
                            <span className="text-blue-500 font-black mr-2 text-lg">{idx + 1}.</span>
                            <Latex>{q.content}</Latex>
                          </div>
                          <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded flex items-center gap-1 ml-4 whitespace-nowrap">
                            <Clock className="w-3 h-3" /> {q.timeLimit} mnt
                          </span>
                        </div>
                        <div className="space-y-2 pl-7 mt-4">
                          {q.options?.map((opt: any, oIdx: number) => (
                            <div key={opt.id} className={`text-sm p-2 rounded-lg flex items-center ${opt.isCorrect ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100' : 'text-slate-500 bg-slate-50 border border-transparent'}`}>
                              <span className="w-6 font-bold">{String.fromCharCode(65 + oIdx)}.</span> 
                              <span className="flex-1"><Latex>{opt.text}</Latex></span>
                              {opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-2" />}
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
