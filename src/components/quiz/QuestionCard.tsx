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
      <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 mb-10 leading-tight text-center">
        <Latex>{question.content}</Latex>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === opt.id;
          
          let stateClasses = "border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50";
          
          if (isSubmitted) {
            if (isSelected) {
              stateClasses = "border-indigo-500 bg-indigo-50 opacity-80";
            } else {
              stateClasses = "border-slate-100 bg-slate-50 opacity-50";
            }
          } else if (isSelected) {
            stateClasses = "border-indigo-500 bg-indigo-50 scale-[1.02] ring-2 ring-indigo-200";
          }

          return (
            <button 
              key={opt.id} 
              onClick={() => handleOptionClick(opt.id)}
              disabled={isSubmitted}
              className={`group relative w-full p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm text-left flex items-center justify-between ${stateClasses} ${!isSubmitted ? 'hover:shadow-md hover:-translate-y-1' : 'cursor-default'}`}
            >
              <div className="flex items-center">
                <span className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-colors mr-4 ${
                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-500 group-hover:text-white'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className={`text-lg md:text-xl font-semibold ${
                  isSelected ? 'text-indigo-900' : 'text-slate-700 group-hover:text-indigo-900'
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
          className="mt-8 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all w-full max-w-md text-lg"
        >
          Kunci Jawaban
        </button>
      )}
      
      {isSubmitted && (
        <div className="mt-8 p-4 bg-slate-100 rounded-xl text-slate-600 text-center font-medium animate-pulse">
          Jawaban tersimpan! Menunggu soal berikutnya...
        </div>
      )}
    </div>
  );
}
