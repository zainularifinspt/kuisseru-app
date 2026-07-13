"use client";

import { useState } from "react";
import { mockQuizData } from "@/data/mockQuiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Timer } from "lucide-react";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { LiveScore } from "@/components/quiz/LiveScore";
import { Leaderboard, LeaderboardUser } from "@/components/quiz/Leaderboard";
import { AnimatePresence, motion } from "framer-motion";

export default function QuizPage() {
  const { questions, title, totalQuestions, player, leaderboard } = mockQuizData;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState(player.score);
  const [isFinished, setIsFinished] = useState(false);
  
  // Local state for leaderboard to show dynamic updates
  const [liveLeaderboard, setLiveLeaderboard] = useState<LeaderboardUser[]>(leaderboard);

  const question = questions[currentQuestionIndex] || questions[0];
  const progressPercentage = isFinished ? 100 : ((currentQuestionIndex) / questions.length) * 100;

  const handleAnswerSubmit = (optionId: string, isCorrect: boolean) => {
    if (isCorrect) {
      setCurrentScore(prev => {
        const newScore = prev + 100;
        
        // Update leaderboard
        setLiveLeaderboard(prevLb => {
          return prevLb.map(user => 
            user.nickname === player.nickname 
              ? { ...user, score: newScore }
              : user
          );
        });
        
        return newScore;
      });
    }
    
    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8 flex flex-col font-sans text-slate-800">
      <audio src="/bgm.mp3" autoPlay loop muted={false} />
      
      {/* Header Info */}
      <header className="flex justify-between items-center mb-6 bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/30 text-white">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 text-sm py-1 px-3 shadow-sm">
            <Star className="w-4 h-4 mr-1 fill-current" />
            Rank #{player.rank}
          </Badge>
          <span className="font-bold text-lg hidden sm:inline">{player.nickname}</span>
        </div>
        
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight drop-shadow-md text-center flex-1">
          {title}
        </h1>
        
        <div className="flex items-center gap-2">
          <LiveScore score={currentScore} />
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Quiz Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden ring-4 ring-white/50">
            <CardHeader className="bg-slate-50 border-b pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
              </CardTitle>
              <div className="flex items-center text-rose-500 font-bold bg-rose-100 px-3 py-1 rounded-full animate-pulse">
                <Timer className="w-4 h-4 mr-1" />
                00:15
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
                      {currentScore >= 1300 ? "Luar Biasa! Kamu sangat menguasai materi ini! 🌟" : 
                       currentScore >= 1000 ? "Hebat! Terus pertahankan prestasimu! 👍" : 
                       "Tetap Semangat! Coba Lagi Ya dan jangan pantang menyerah! 💪"}
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
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
          
        </div>
        
        {/* Sidebar / Leaderboard */}
        <div className="flex flex-col gap-6">
          <Leaderboard data={liveLeaderboard} currentPlayerNickname={player.nickname} />
        </div>
        
      </div>
    </div>
  );
}
