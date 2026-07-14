"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Timer, Loader2 } from "lucide-react";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

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

  useEffect(() => {
    if (!sessionId || !participantId) {
      router.push("/");
      return;
    }

    async function fetchData() {
      try {
        // Fetch session info
        const resSession = await fetch(`/api/quiz-sessions/${sessionId}`);
        if (resSession.ok) {
          const data = await resSession.json();
          setSessionInfo(data.session || data);
        }

        // Fetch questions
        const resQuestions = await fetch(`/api/quiz-sessions/${sessionId}/questions`);
        if (resQuestions.ok) {
          const data = await resQuestions.json();
          setQuestions(data.questions);
          // Set initial time remaining in seconds (timeLimit is in minutes)
          if (data.questions.length > 0) {
            setTimeRemaining((data.questions[0].timeLimit || 1) * 60);
          }
        }

        // Fetch participants to find current player
        const resParticipants = await fetch(`/api/quiz-sessions/${sessionId}/participants`);
        if (resParticipants.ok) {
          const data = await resParticipants.json();
          
          const currentPlayer = data.participants.find((p: any) => p.id === participantId);
          if (currentPlayer) {
            setPlayerNickname(currentPlayer.nickname);
            setCurrentScore(currentPlayer.score);
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

  // Timer logic
  useEffect(() => {
    if (isLoading || isFinished || questions.length === 0) return;
    
    // Reset forceSubmit if we moved to a new question
    if (forceSubmit) setForceSubmit(false);

    if (timeRemaining <= 0) {
      setForceSubmit(true); // Tell QuestionCard to submit
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, isFinished, questions.length, currentQuestionIndex, timeRemaining]);

  const handleAnswerSubmit = async (optionId: string, _isCorrect: boolean) => {
    // We send to backend, backend checks correctness
    try {
      const res = await fetch(`/api/quiz-sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: questions[currentQuestionIndex].id, optionId, participantId })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Update local score if correct
        if (data.isCorrect) {
          setCurrentScore(data.newScore);
        }
      }
    } catch (e) {
      console.error("Failed to submit answer", e);
    }

    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeRemaining((questions[currentQuestionIndex + 1].timeLimit || 1) * 60);
      } else {
        setIsFinished(true);
      }
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-700 dark:text-white">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500 dark:text-cyan-400" />
        <p>Memuat pertanyaan kuis...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-700 dark:text-white">
        <p>Tidak ada pertanyaan di sesi ini.</p>
      </div>
    );
  }

  const question = questions[currentQuestionIndex];
  const progressPercentage = isFinished ? 100 : (currentQuestionIndex / questions.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header Info */}
      <header className="flex justify-between items-center mb-6 bg-white/90 dark:bg-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.1)] dark:shadow-[0_0_20px_rgba(59,130,246,0.2)] border border-slate-200 dark:border-white/20 text-slate-800 dark:text-white relative z-10 mt-12 md:mt-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg hidden sm:inline drop-shadow-sm dark:drop-shadow-md">{playerNickname}</span>
        </div>
        
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight drop-shadow-sm dark:drop-shadow-md text-center flex-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-cyan-400 dark:to-blue-500">
          {sessionInfo?.title || "Kuis"}
        </h1>
        
        <div className="flex items-center gap-2">
          {/* Omitted points and rank for student view */}
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col gap-6 relative z-10">
        
        {/* Main Quiz Area */}
        <div className="w-full flex flex-col gap-6">
          
          <Card className="border border-slate-200 dark:border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.1)] dark:shadow-[0_0_40px_rgba(59,130,246,0.2)] bg-white/90 dark:bg-[#111827]/80 backdrop-blur-2xl rounded-3xl overflow-hidden ring-1 ring-slate-200 dark:ring-white/10">
            <CardHeader className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/10 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
                Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
              </CardTitle>
              <div className={`flex items-center font-bold px-3 py-1 rounded-full ${timeRemaining <= 10 ? 'text-red-700 bg-red-100 dark:text-red-100 dark:bg-red-600 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.3)] dark:shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'text-blue-700 bg-blue-100 dark:text-blue-100 dark:bg-blue-600 shadow-sm dark:shadow-[0_0_10px_rgba(37,99,235,0.5)]'}`}>
                <Timer className="w-4 h-4 mr-1" />
                {formatTime(timeRemaining)}
              </div>
            </CardHeader>
            <div className="px-6 -mt-3">
              <Progress value={progressPercentage} className="h-2 bg-slate-200 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-indigo-500 dark:[&>div]:from-cyan-400 dark:[&>div]:to-blue-600" />
            </div>
            
            <CardContent className="p-6 md:p-10 flex flex-col items-center text-center overflow-hidden relative min-h-[350px]">
              <AnimatePresence mode="wait">
                {isFinished ? (
                  <motion.div
                    key="finished"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full h-full flex flex-col items-center justify-center p-6 md:p-10"
                  >
                    <Trophy className="w-24 h-24 text-amber-500 dark:text-yellow-400 mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] dark:drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-bounce" />
                    <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-4 drop-shadow-sm dark:drop-shadow-md">
                      Kuis Selesai!
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                      Skor Akhir Kamu: <span className="font-bold text-blue-600 dark:text-cyan-400 text-2xl drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{currentScore} pts</span>
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-400/30 rounded-2xl p-6 text-lg font-medium text-blue-800 dark:text-blue-100 shadow-sm dark:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      Jawabanmu telah tersimpan. Silakan tunggu instruksi dari guru.
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={question.id}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="w-full absolute inset-0 p-6 md:p-10 flex flex-col"
                  >
                    <QuestionCard 
                      question={question} 
                      onAnswerSubmit={handleAnswerSubmit} 
                      forceSubmit={forceSubmit}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
          
        </div>
        
      </div>
    </>
  );
}

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] p-4 md:p-8 flex flex-col font-sans text-slate-800 dark:text-slate-200 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 dark:opacity-20 pointer-events-none animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-[150px]"></div>
      </div>

      <audio src="/bgm.mp3" autoPlay loop muted={false} />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-cyan-400" /></div>}>
        <QuizContent />
      </Suspense>
    </div>
  );
}
