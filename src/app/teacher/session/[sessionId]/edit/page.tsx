'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { addQuestion, publishSession, getSessionQuestions, updateQuestion, deleteQuestion } from '@/app/actions/question';
import { updateSessionTitle } from '@/app/actions/session';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

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
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('1');
  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  const resetForm = () => {
    setEditingQuestionId(null);
    setNewQuestion('');
    setTimeLimitMinutes('1');
    setOptions([
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]);
  };

  const handleAddOrUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    
    setIsSubmitting(true);
    const timeLimitVal = parseInt(timeLimitMinutes, 10) || 1;
    
    let res;
    if (editingQuestionId) {
      res = await updateQuestion(editingQuestionId, newQuestion, options, timeLimitVal);
    } else {
      res = await addQuestion(sessionId, newQuestion, options, timeLimitVal);
    }
    
    if (res.success) {
      resetForm();
      await fetchQuestions();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleDeleteQuestion = async () => {
    if (!editingQuestionId) return;
    if (!confirm("Apakah Anda yakin ingin menghapus soal ini?")) return;
    
    setIsSubmitting(true);
    const res = await deleteQuestion(editingQuestionId);
    if (res.success) {
      resetForm();
      await fetchQuestions();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleEditClick = (q: any) => {
    setEditingQuestionId(q.id);
    setNewQuestion(q.content);
    setTimeLimitMinutes(String(q.timeLimit || 1));
    if (q.options && q.options.length > 0) {
      setOptions(q.options.map((o: any) => ({ text: o.text, isCorrect: o.isCorrect })));
    } else {
      setOptions([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]);
    }
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

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      // Ensure at least one is correct if we removed the correct one
      if (options[index].isCorrect) {
        newOptions[0].isCorrect = true;
      }
      setOptions(newOptions);
    }
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
    <div className="min-h-[100dvh] bg-background text-on-background font-sans antialiased overflow-x-hidden">
      {/* Background Shapes */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-[hsla(28,100%,74%,0.15)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-[hsla(189,100%,56%,0.15)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[hsla(355,100%,93%,0.15)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '-1s' }}></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[55] bg-deep-obsidian/50 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* SideNavBar */}
      <nav className={`${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed left-0 top-0 h-screen w-64 bg-deep-obsidian border-r-2 border-deep-obsidian py-8 px-4 z-[56] transition-transform duration-300 flex flex-col`}>
        <div className="mb-12 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-cyber-lime flex items-center justify-center border-2 border-deep-obsidian">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-deep-obsidian" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
          </div>
          <div>
            <h1 className="font-heading font-bold text-cyber-lime text-xl leading-tight">ASTHAQUIZZ</h1>
            <p className="font-heading font-bold text-surface-variant/70 text-xs">Teacher Console</p>
          </div>
        </div>

        <ul className="flex flex-col gap-2 flex-grow">
          <li>
            <Link href="/teacher" className="flex items-center gap-4 px-4 py-3 rounded-lg text-surface-variant/70 font-heading font-bold text-sm hover:bg-white/5 hover:text-surface-variant transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/teacher" className="flex items-center gap-4 px-4 py-3 rounded-lg text-cyber-lime font-heading font-bold text-sm border-l-4 border-cyber-lime bg-white/10 transition-colors duration-200 hover:bg-white/5 scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
              Sesi Kuis
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <div className="md:ml-64 flex flex-col min-h-[100dvh]">
        {/* TopNavBar */}
        <header className="sticky top-0 z-40 bg-[rgba(255,255,255,0.7)] backdrop-blur-md border-b-2 border-deep-obsidian h-20 flex justify-between items-center px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-deep-obsidian" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
            </button>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-deep-obsidian tracking-tight truncate hidden sm:block">Editor Kuis</h2>
          </div>
        </header>

        {/* Editor Canvas */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Sidebar: Question List */}
            <aside className="md:col-span-4 lg:col-span-3 flex flex-col gap-4">
              <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl p-6 rounded-xl border-2 border-deep-obsidian md:sticky md:top-28 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-deep-obsidian">Soal</h3>
                  <span className="bg-deep-obsidian text-cyber-lime font-heading font-bold text-xs px-3 py-1 rounded-full">{questions.length} Total</span>
                </div>
                
                <div className="flex flex-col gap-3 max-h-[40vh] md:max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {isFetching ? (
                    <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-electric-blue" /></div>
                  ) : questions.length === 0 ? (
                    <div className="p-4 text-center text-on-surface-variant font-heading text-sm bg-surface-container rounded-lg border-2 border-dashed border-outline">
                      Belum ada soal
                    </div>
                  ) : (
                    questions.map((q, idx) => {
                      const isActive = editingQuestionId === q.id;
                      return (
                        <div 
                          key={q.id} 
                          onClick={() => handleEditClick(q)}
                          className={`p-3 rounded-lg border-2 cursor-pointer flex items-center gap-3 transition-colors ${isActive ? 'border-electric-blue bg-electric-blue/5' : 'border-outline-variant hover:border-deep-obsidian bg-white'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0 ${isActive ? 'bg-electric-blue text-white' : 'bg-surface-variant text-deep-obsidian'}`}>
                            {idx + 1}
                          </div>
                          <span className="font-sans text-sm truncate flex-1"><Latex>{q.content}</Latex></span>
                        </div>
                      );
                    })
                  )}
                </div>
                
                <button 
                  onClick={resetForm}
                  className="mt-6 w-full py-3 rounded-full bg-deep-obsidian text-white font-heading font-bold flex items-center justify-center gap-2 hover:bg-electric-blue transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  Tambah Soal Baru
                </button>
              </div>
            </aside>

            {/* Main Editor Area */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-8">
              
              {/* Quiz Metadata Card */}
              <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl p-6 md:p-8 rounded-2xl border-2 border-deep-obsidian shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="font-heading font-bold text-sm text-deep-obsidian mb-2 block uppercase tracking-wide">Judul Kuis</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input 
                        type="text" 
                        value={sessionTitle}
                        onChange={(e) => setSessionTitle(e.target.value)}
                        className="flex-1 bg-white rounded-full border-2 border-deep-obsidian px-6 py-4 font-heading text-xl md:text-2xl focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed focus:outline-none shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] transition-all" 
                      />
                      <button 
                        onClick={handleSaveTitle}
                        disabled={isSavingTitle}
                        className="bg-deep-obsidian text-cyber-lime font-heading font-bold px-8 py-4 rounded-full hover:bg-inverse-surface transition-colors whitespace-nowrap border-2 border-deep-obsidian disabled:opacity-50"
                      >
                        {isSavingTitle ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isTitleSaved ? "Tersimpan!" : "Simpan Judul"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add/Edit Question Form Card */}
              <form onSubmit={handleAddOrUpdateQuestion} className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl p-6 md:p-8 rounded-2xl border-2 border-deep-obsidian relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                {/* Decorative blob */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col gap-6 md:gap-8">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading text-xl md:text-2xl font-bold flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-electric-blue text-white flex items-center justify-center font-heading text-xl shadow-[2px_2px_0px_rgba(10,10,10,1)] border-2 border-deep-obsidian">
                        {editingQuestionId ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.995.995 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> : '+'}
                      </span>
                      {editingQuestionId ? 'Edit Pertanyaan' : 'Pertanyaan Baru'}
                    </h3>
                    
                    {editingQuestionId && (
                      <button 
                        type="button"
                        onClick={handleDeleteQuestion}
                        className="w-10 h-10 rounded-full border-2 border-deep-obsidian flex items-center justify-center hover:bg-error/10 hover:text-error hover:border-error transition-colors text-deep-obsidian"
                        title="Hapus Soal"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="font-heading font-bold text-sm text-deep-obsidian mb-2 block">Teks Pertanyaan (Mendukung LaTeX)</label>
                    <textarea 
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      required
                      className="w-full bg-white rounded-xl border-2 border-deep-obsidian p-6 font-sans text-lg focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed focus:outline-none resize-none" 
                      placeholder="Masukkan pertanyaan di sini... Mendukung LaTeX contoh: $$x^2 + y^2 = z^2$$" 
                      rows={4}
                    ></textarea>
                  </div>

                  <div>
                    <label className="font-heading font-bold text-sm text-deep-obsidian mb-2 block">Waktu Pengerjaan (Menit)</label>
                    <input 
                      type="number"
                      min="1"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(e.target.value)}
                      required
                      className="w-full md:w-1/3 bg-white rounded-full border-2 border-deep-obsidian px-6 py-3 font-sans focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="font-heading font-bold text-sm text-deep-obsidian block">Pilihan Jawaban (Pilih satu yang benar dengan ceklis)</label>
                      {options.length < 5 && (
                        <button 
                          type="button" 
                          onClick={handleAddOption}
                          className="text-electric-blue font-heading font-bold text-sm hover:underline"
                        >
                          + Tambah Opsi (Maks 5)
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {options.map((opt, idx) => (
                        <div key={idx} className="relative group flex gap-2 items-center">
                          <div className="flex-1 relative">
                            {/* Glow effect for active/hover */}
                            <div className={`absolute -inset-1 rounded-xl blur transition duration-300 ${opt.isCorrect ? 'bg-cyber-lime opacity-30' : 'bg-electric-blue opacity-0 group-hover:opacity-20'}`}></div>
                            <div className={`relative flex items-center bg-white rounded-xl border-2 p-3 md:p-4 gap-3 md:gap-4 transition-all ${opt.isCorrect ? 'border-deep-obsidian shadow-[4px_4px_0px_0px_rgba(204,255,0,1)] border-[4px]' : 'border-deep-obsidian'}`}>
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-heading text-xl flex-shrink-0 ${opt.isCorrect ? 'bg-cyber-lime text-deep-obsidian' : 'bg-deep-obsidian text-white'}`}>
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <input 
                                type="text"
                                value={opt.text}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                required
                                className="flex-1 border-none bg-transparent focus:ring-0 font-heading p-0 text-base md:text-lg focus:outline-none w-full"
                                placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                              />
                              <button 
                                type="button"
                                onClick={() => handleSetCorrect(idx)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${opt.isCorrect ? 'bg-cyber-lime border-2 border-deep-obsidian text-deep-obsidian' : 'border-2 border-surface-variant hover:border-deep-obsidian text-surface-variant hover:text-deep-obsidian'}`}
                                title="Tandai sebagai Benar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                              </button>
                            </div>
                          </div>
                          {options.length > 2 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveOption(idx)}
                              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-transparent hover:border-error text-surface-variant hover:text-error hover:bg-error/10 transition-colors flex-shrink-0"
                              title="Hapus Opsi"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col-reverse md:flex-row justify-end gap-4">
                    {editingQuestionId && (
                      <button 
                        type="button"
                        onClick={resetForm}
                        className="w-full md:w-auto px-8 py-4 rounded-full border-2 border-deep-obsidian font-heading font-bold hover:bg-surface-variant transition-colors text-center"
                      >
                        Batal Edit
                      </button>
                    )}
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto px-8 py-4 rounded-full bg-deep-obsidian text-white font-heading font-bold flex items-center justify-center gap-2 hover:bg-electric-blue transition-colors duration-300 border-2 border-deep-obsidian disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> {editingQuestionId ? 'Simpan Perubahan' : 'Tambah Soal'}</>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Action Bar */}
              <div className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-4 mb-12">
                <button 
                  onClick={() => router.push(`/teacher`)}
                  className="px-8 py-4 rounded-full border-2 border-deep-obsidian font-heading font-bold hover:bg-surface-variant transition-colors text-center"
                >
                  Kembali ke Dashboard
                </button>
                <button 
                  onClick={handlePublish}
                  disabled={isSubmitting || questions.length === 0}
                  className="px-8 py-4 rounded-full bg-electric-blue text-white font-heading font-bold hover:scale-105 transition-transform duration-200 flex justify-center items-center gap-2 shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] border-2 border-deep-obsidian disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4v2h14V4H5zm0 10h4v6h6v-6h4l-7-7-7 7z"/></svg>}
                  Luncurkan Kuis
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
