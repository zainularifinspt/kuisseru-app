"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Timer, Loader2 } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-white">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p>Memuat pertanyaan kuis...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-white">
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
      {/* Header Info */}
      <header className="flex justify-between items-center mb-6 bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/30 text-white">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg hidden sm:inline">{playerNickname}</span>
        </div>
        
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight drop-shadow-md text-center flex-1">
          {sessionInfo?.title || "Kuis"}
        </h1>
        
        <div className="flex items-center gap-2">
          {/* Omitted points and rank for student view */}
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col gap-6">
        
        {/* Main Quiz Area */}
        <div className="w-full flex flex-col gap-6">
          
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden ring-4 ring-white/50">
            <CardHeader className="bg-slate-50 border-b pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
              </CardTitle>
              <div className={`flex items-center font-bold px-3 py-1 rounded-full ${timeRemaining <= 10 ? 'text-rose-500 bg-rose-100 animate-pulse' : 'text-slate-600 bg-slate-200'}`}>
                <Timer className="w-4 h-4 mr-1" />
                {formatTime(timeRemaining)}
              </div>
            </CardHeader>
            <div className="px-6 -mt-3">
              <Progress value={progressPercentage} className="h-2 bg-slate-200 [&>div]:bg-indigo-500" />
            </div>
            
            <CardContent className="p-6 md:p-10 flex flex-col items-center text-center overflow-hidden relative min-h-[300px]">
              <AnimatePresence mode="wait">
                {isFinished ? (
                  <motion.div
                    key="finished"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full h-full flex flex-col items-center justify-center p-6 md:p-10"
                  >
                    <Trophy className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-xl animate-bounce" />
                    <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-4">
                      Kuis Selesai!
                    </h2>
                    <p className="text-xl text-slate-600 mb-8">
                      Skor Akhir Kamu: <span className="font-bold text-indigo-600">{currentScore} pts</span>
                    </p>
                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 text-lg font-medium text-indigo-900 shadow-inner">
                      Jawabanmu telah tersimpan. Silakan tunggu intruksi dari guru.
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={question.id}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="w-full absolute inset-0 p-6 md:p-10"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8 flex flex-col font-sans text-slate-800">
      <audio src="/bgm.mp3" autoPlay loop muted={false} />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-white" /></div>}>
        <QuizContent />
      </Suspense>
    </div>
  );
}
