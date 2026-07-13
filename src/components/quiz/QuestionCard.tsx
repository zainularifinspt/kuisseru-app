"use client";

import { useState } from "react";
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

export function QuestionCard({ question, onAnswerSubmit }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOptionClick = (optionId: string) => {
    if (isSubmitted) return;
    
    const isCorrect = optionId === question.correctAnswerId || optionId === "c"; // mock logic
    
    setSelectedOption(optionId);
    setIsSubmitted(true);
    playFeedbackSound(isCorrect);
    
    // Simulate feedback delay
    setTimeout(() => {
      if (onAnswerSubmit) {
        onAnswerSubmit(optionId, isCorrect);
      }
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 mb-10 leading-tight text-center">
        <Latex>{question.content}</Latex>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === opt.id;
          const isCorrectMock = isSubmitted && isSelected && (opt.id === question.correctAnswerId || opt.id === "c"); // mock correct answer for demo
          const isWrongMock = isSubmitted && isSelected && !isCorrectMock;
          
          let stateClasses = "border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50";
          let iconState = null;
          
          if (isSubmitted) {
            if (isSelected) {
              if (isCorrectMock) {
                stateClasses = "border-green-500 bg-green-50 animate-bounce";
                iconState = <CheckCircle2 className="w-8 h-8 text-green-500" />;
              } else {
                stateClasses = "border-red-500 bg-red-50 animate-shake";
                iconState = <XCircle className="w-8 h-8 text-red-500" />;
              }
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
              {iconState}
            </button>
          );
        })}
      </div>
    </div>
  );
}
