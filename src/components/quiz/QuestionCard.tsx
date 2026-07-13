"use client";

import { useState, useEffect } from "react";
import 'katex/dist/katex.min.css';
import Latex from "react-latex-next";
import { CheckCircle2, XCircle } from "lucide-react";
import { playFeedbackSound } from "@/lib/audio";

type Option = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  content: string;
  options: Option[];
  correctAnswerId?: string; // For mock data purpose
};

interface QuestionCardProps {
  question: Question;
  onAnswerSubmit?: (optionId: string, isCorrect: boolean) => void;
}

export function QuestionCard({ question, onAnswerSubmit, forceSubmit }: QuestionCardProps & { forceSubmit?: boolean }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (optionId: string | null) => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    
    // We don't have correctAnswerId in the client anymore for security, 
    // so we can't show correct/wrong state immediately accurately based on mock.
    // We will just show that it's submitted, backend will return if it's correct.
    
    if (onAnswerSubmit) {
      onAnswerSubmit(optionId || "", false);
    }
  };

  // Listen to forceSubmit from parent
  useEffect(() => {
    if (forceSubmit && !isSubmitted) {
      handleSubmit(selectedOption);
    }
  }, [forceSubmit, isSubmitted, selectedOption]);

  const handleOptionClick = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedOption(optionId);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-10 leading-tight text-center drop-shadow-md">
        <Latex>{question.content}</Latex>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === opt.id;
          
          const baseColors = [
            "bg-rose-600 border-rose-500 hover:bg-rose-500 hover:shadow-[0_0_25px_rgba(225,29,72,0.6)]", // A: Red
            "bg-blue-600 border-blue-500 hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]", // B: Blue
            "bg-amber-500 border-amber-400 hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(217,119,6,0.6)]", // C: Yellow
            "bg-emerald-600 border-emerald-500 hover:bg-emerald-500 hover:shadow-[0_0_25px_rgba(5,150,105,0.6)]" // D: Green
          ];
          
          const colorClass = baseColors[idx % baseColors.length];
          let stateClasses = `${colorClass} text-white`;
          
          if (isSubmitted) {
            if (isSelected) {
              stateClasses = `${colorClass.split(' ')[0]} border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] opacity-100 ring-4 ring-white/50`;
            } else {
              stateClasses = `${colorClass.split(' ')[0]} border-transparent opacity-40 grayscale-[30%]`;
            }
          } else if (isSelected) {
            stateClasses = `${colorClass.split(' ')[0]} border-white scale-[1.03] ring-4 ring-white/50 shadow-2xl`;
          }

          return (
            <button 
              key={opt.id} 
              onClick={() => handleOptionClick(opt.id)}
              disabled={isSubmitted}
              className={`group relative w-full p-5 md:p-8 rounded-3xl border-b-4 transition-all duration-300 shadow-lg text-left flex items-center justify-between ${stateClasses} ${!isSubmitted ? 'hover:-translate-y-2' : 'cursor-default'}`}
            >
              <div className="flex items-center w-full">
                <span className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl font-black text-xl mr-5 shadow-inner transition-colors ${
                  isSelected ? 'bg-white text-slate-900' : 'bg-white/20 text-white'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className={`text-xl md:text-2xl font-bold break-words w-full ${
                  isSelected ? 'text-white' : 'text-white/90 group-hover:text-white'
                }`}>
                  <Latex>{opt.text}</Latex>
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      {!isSubmitted && (
        <button 
          onClick={() => handleSubmit(selectedOption)}
          className={`mt-10 px-10 py-5 font-black rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all w-full max-w-md text-xl border-b-4 ${selectedOption ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-blue-700 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] cursor-pointer' : 'bg-slate-700 text-slate-400 border-slate-800 cursor-not-allowed opacity-50'}`}
          disabled={!selectedOption}
        >
          Kunci Jawaban
        </button>
      )}
      
      {isSubmitted && (
        <div className="mt-10 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white text-center font-bold text-lg animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          Jawaban tersimpan! Menunggu soal berikutnya... ⏳
        </div>
      )}
    </div>
  );
}
