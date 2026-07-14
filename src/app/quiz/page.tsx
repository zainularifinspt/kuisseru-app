"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { AnimatePresence, motion } from "framer-motion";

type Question = {
  id: string;
  content: string;
  timeLimit?: number;
  options: { id: string; text: string }[];
};

type SessionInfo = {
  title: string;
  status: string;
};

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const participantId = searchParams.get('participantId');

  const [isLoading, setIsLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const [playerNickname, setPlayerNickname] = useState("");
  const [currentScore, setCurrentScore] = useState(0);

  const [forceSubmit, setForceSubmit] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [timeLimit, setTimeLimit] = useState(60);

  useEffect(() => {
    if (!sessionId || !participantId) {
      router.push("/");
      return;
    }

    async function fetchData() {
      try {
        const resSession = await fetch(`/api/quiz-sessions/${sessionId}`);
        if (resSession.ok) {
          const data = await resSession.json();
          setSessionInfo(data.session || data);
        }

        const resQuestions = await fetch(`/api/quiz-sessions/${sessionId}/questions`);
        if (resQuestions.ok) {
          const data = await resQuestions.json();
          setQuestions(data.questions);
          if (data.questions.length > 0) {
            const limit = (data.questions[0].timeLimit || 1) * 60;
            setTimeRemaining(limit);
            setTimeLimit(limit);
          }
        }

        const resParticipants = await fetch(`/api/quiz-sessions/${sessionId}/participants`);
        if (resParticipants.ok) {
          const data = await resParticipants.json();
          const currentPlayer = data.participants.find((p: any) => p.id === participantId);
          if (currentPlayer) {
            setPlayerNickname(currentPlayer.nickname);
            setCurrentScore(currentPlayer.score || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [sessionId, participantId, router]);

  useEffect(() => {
    if (isLoading || isFinished || questions.length === 0) return;
    
    if (forceSubmit) setForceSubmit(false);

    if (timeRemaining <= 0) {
      setForceSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, isFinished, questions.length, currentQuestionIndex, timeRemaining]);

  const handleAnswerSubmit = async (optionId: string, _isCorrect: boolean) => {
    try {
      const res = await fetch(`/api/quiz-sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: questions[currentQuestionIndex].id, optionId, participantId })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.isCorrect) {
          setCurrentScore(data.newScore);
        }
      }
    } catch (e) {
      console.error("Failed to submit answer", e);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        const limit = (questions[currentQuestionIndex + 1].timeLimit || 1) * 60;
        setTimeRemaining(limit);
        setTimeLimit(limit);
      } else {
        setIsFinished(true);
      }
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh]">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-electric-blue" />
        <p className="font-heading font-semibold">Memuat pertanyaan kuis...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh]">
        <p className="font-heading font-semibold">Tidak ada pertanyaan di sesi ini.</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full max-w-lg mx-auto p-4 z-10">
        <motion.div
          key="finished"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian w-full rounded-xl p-8 md:p-12 mb-10 text-center relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-cyber-lime mx-auto mb-6 drop-shadow-[0_0_15px_rgba(204,255,0,0.8)] animate-bounce border-2 border-deep-obsidian rounded-full p-2 bg-deep-obsidian" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-deep-obsidian mb-4">
            Kuis Selesai!
          </h2>
          <p className="font-sans text-xl text-on-surface-variant mb-8">
            Skor Akhir Kamu: <span className="font-heading font-bold text-electric-blue text-2xl ml-2">{currentScore} pts</span>
          </p>
          <div className="bg-surface-container-high border-2 border-deep-obsidian rounded-2xl p-6 text-lg font-medium text-deep-obsidian">
            Silakan tunggu instruksi dari guru.
          </div>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Timer SVG logic
  const FULL_DASH_ARRAY = 283;
  const rawTimeFraction = timeRemaining / timeLimit;
  const timeFraction = rawTimeFraction - (1 / timeLimit) * (1 - rawTimeFraction);
  const circleDasharray = `${(timeFraction * FULL_DASH_ARRAY).toFixed(0)} 283`;
  const isTimeCritical = timeRemaining <= 5;

  return (
    <>
      <header className="w-full flex flex-col pt-4 px-4 md:px-10 z-10 sticky top-0 bg-background/80 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4 w-full max-w-6xl mx-auto">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-deep-obsidian font-bold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-heading font-bold text-deep-obsidian uppercase tracking-wider hidden sm:inline">Keluar Kuis</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-deep-obsidian text-cyber-lime font-heading font-bold px-4 py-2 rounded-full border border-cyber-lime/30">
              Skor: {currentScore}
            </div>
            <div className="bg-surface-container-high w-10 h-10 rounded-full flex items-center justify-center border-2 border-deep-obsidian overflow-hidden text-lg font-bold">
              {playerNickname.substring(0, 1).toUpperCase()}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-6xl mx-auto h-4 bg-surface-variant rounded-full border-2 border-deep-obsidian overflow-hidden">
          <div 
            className="h-full bg-cyber-lime transition-all duration-500 ease-in-out relative"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20"></div>
          </div>
        </div>
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center mt-2 px-1">
          <span className="font-heading font-bold text-sm text-on-surface-variant">Soal {currentQuestionIndex + 1} dari {questions.length}</span>
          <span className="font-heading font-bold text-sm text-on-surface-variant truncate max-w-[150px] sm:max-w-xs">{sessionInfo?.title}</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-10 py-8 w-full max-w-6xl mx-auto z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full flex flex-col items-center"
          >
            {/* Timer Widget */}
            <div className="relative w-24 h-24 mb-8 flex-shrink-0">
              <svg className="w-full h-full -rotate-90 origin-center" viewBox="0 0 100 100">
                <circle className="text-surface-variant" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="8"></circle>
                <circle 
                  className={`transition-all duration-1000 linear ${isTimeCritical ? 'text-error' : 'text-mesh-pink'}`}
                  cx="50" cy="50" fill="none" r="45" 
                  stroke="currentColor" strokeDasharray={circleDasharray} strokeDashoffset="0" strokeWidth="8"
                ></circle>
              </svg>
              <div className={`absolute inset-0 flex items-center justify-center font-heading text-3xl font-bold ${isTimeCritical ? 'text-error animate-pulse' : 'text-deep-obsidian'}`}>
                {timeRemaining}
              </div>
            </div>

            {/* Question Card Content */}
            <QuestionCard 
              question={question} 
              onAnswerSubmit={handleAnswerSubmit} 
              forceSubmit={forceSubmit}
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

export default function QuizPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col relative font-sans text-body-md overflow-x-hidden selection:bg-electric-blue selection:text-white">
      <style dangerouslySetInnerHTML={{__html: `
        .bg-mesh-active {
            background: radial-gradient(circle at top left, var(--color-mesh-pink) 0%, transparent 40%),
                        radial-gradient(circle at bottom right, var(--color-electric-blue) 0%, transparent 40%);
            opacity: 0.15;
            z-index: -1;
        }
      `}} />
      <div className="fixed inset-0 w-full h-full bg-mesh-active pointer-events-none"></div>
      
      <Suspense fallback={<div className="flex items-center justify-center min-h-[100dvh]"><Loader2 className="w-12 h-12 animate-spin text-electric-blue" /></div>}>
        <QuizContent />
      </Suspense>
    </div>
  );
}
