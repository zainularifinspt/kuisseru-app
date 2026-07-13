'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Plus, Save, Play, CheckCircle2, Circle } from 'lucide-react';
import { addQuestion, publishSession, getSessionQuestions } from '@/app/actions/question';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { Loader2 } from 'lucide-react';

export default function EditQuizSession({ params }: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  const { sessionId } = use(params);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const [newQuestion, setNewQuestion] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [sessionId]);

  const fetchQuestions = async () => {
    setIsFetching(true);
    const res = await getSessionQuestions(sessionId);
    if (res.success) {
      setQuestions(res.questions);
    }
    setIsFetching(false);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    
    setIsSubmitting(true);
    const res = await addQuestion(sessionId, newQuestion, options);
    
    if (res.success) {
      setNewQuestion('');
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
        <header className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Editor Kuis</h1>
            <p className="text-slate-500">Ketik soal dengan dukungan LaTeX untuk matematika</p>
          </div>
          <Button 
            onClick={handlePublish}
            disabled={isSubmitting || questions.length === 0}
            className="rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Luncurkan Kuis
          </Button>
        </header>

        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-6">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Buat Pertanyaan Baru</h2>
                <form onSubmit={handleAddQuestion} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Pertanyaan (Mendukung LaTeX: $...$ atau $$...$$)</label>
                    <textarea 
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                      placeholder="Contoh: Berapakah hasil dari $\\int x^2 dx$ ?"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-600 block">Pilihan Jawaban (Pilih satu yang benar)</label>
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={() => handleSetCorrect(idx)}
                          className={`flex-shrink-0 ${opt.isCorrect ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}
                        >
                          {opt.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </button>
                        <Input
                          value={opt.text}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-slate-800 hover:bg-slate-900 text-white">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Tambahkan Pertanyaan</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-5 space-y-6">
            <Card className="rounded-3xl border-0 shadow-lg bg-blue-50/50">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Daftar Pertanyaan ({questions.length})
                </h2>
                
                {isFetching ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    Belum ada soal. Silakan tambahkan soal di sebelah kiri.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="font-medium text-slate-800 mb-3 text-sm">
                          <span className="text-blue-500 font-bold mr-2">{idx + 1}.</span>
                          <Latex>{q.content}</Latex>
                        </div>
                        <div className="space-y-2 pl-6">
                          {q.options?.map((opt: any, oIdx: number) => (
                            <div key={opt.id} className={`text-sm ${opt.isCorrect ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
                              {String.fromCharCode(65 + oIdx)}. <Latex>{opt.text}</Latex>
                              {opt.isCorrect && ' ✓'}
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
