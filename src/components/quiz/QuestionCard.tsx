"use client";

import { useState, useEffect } from "react";
import 'katex/dist/katex.min.css';
import Latex from "react-latex-next";
import { Loader2 } from "lucide-react";

type Option = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  content: string;
  options: Option[];
};

interface QuestionCardProps {
  question: Question;
  onAnswerSubmit?: (optionId: string, isCorrect: boolean) => void;
  forceSubmit?: boolean;
}

export function QuestionCard({ question, onAnswerSubmit, forceSubmit }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (optionId: string | null) => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    
    if (onAnswerSubmit) {
      onAnswerSubmit(optionId || "", false);
    }
  };

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
      {/* Question Card */}
      <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian w-full rounded-xl p-8 md:p-12 mb-10 text-center relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        {/* Decorative corner glyphs */}
        <div className="absolute top-4 left-4 w-8 h-8 opacity-20">
          <svg className="text-electric-blue" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polygon points="12 2 22 20 2 20 12 2"></polygon>
          </svg>
        </div>
        <h1 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-deep-obsidian max-w-4xl mx-auto leading-tight">
          <Latex>{question.content}</Latex>
        </h1>
      </div>
      
      {/* Answer Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === opt.id;
          
          const optionThemes = [
            { bg: 'bg-[#E3F2FD]', iconBg: 'bg-electric-blue', hoverGlow: 'from-electric-blue/10' }, // A: Blue
            { bg: 'bg-[#E8F5E9]', iconBg: 'bg-tertiary', hoverGlow: 'from-tertiary/10' }, // B: Green
            { bg: 'bg-[#FFF3E0]', iconBg: 'bg-[#FF9800]', hoverGlow: 'from-[#FF9800]/10' }, // C: Orange
            { bg: 'bg-[#F3E5F5]', iconBg: 'bg-soft-violet', hoverGlow: 'from-soft-violet/10' } // D: Purple
          ];
          
          const theme = optionThemes[idx % optionThemes.length];
          
          // Selection logic styling
          let wrapperClasses = `${theme.bg} border-2 border-deep-obsidian text-deep-obsidian`;
          if (isSelected) {
            wrapperClasses += ` border-[4px] shadow-[inset_0_0_20px_rgba(255,255,255,0.8),0_0_15px_var(--color-electric-blue)]`;
          } else if (isSubmitted) {
            wrapperClasses += ` opacity-50 grayscale`;
          }

          return (
            <button 
              key={opt.id} 
              onClick={() => handleOptionClick(opt.id)}
              disabled={isSubmitted}
              className={`w-full rounded-full p-4 flex items-center group relative overflow-hidden text-left focus:outline-none transition-all duration-200 ${wrapperClasses} ${!isSubmitted ? 'hover:scale-[1.02] hover:shadow-[inset_0_0_15px_rgba(255,255,255,0.5)] active:scale-95' : 'cursor-default'}`}
            >
              {!isSubmitted && (
                <div className={`absolute inset-0 bg-gradient-to-r ${theme.hoverGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              )}
              <div className={`w-12 h-12 rounded-full ${theme.iconBg} text-white flex items-center justify-center font-heading text-xl font-bold mr-4 flex-shrink-0 border-2 border-deep-obsidian z-10`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="font-heading text-lg md:text-xl font-medium text-deep-obsidian z-10 break-words w-full pr-4">
                <Latex>{opt.text}</Latex>
              </span>
            </button>
          );
        })}
      </div>
      
      {!isSubmitted && (
        <button 
          onClick={() => handleSubmit(selectedOption)}
          disabled={!selectedOption}
          className={`mt-10 px-10 py-4 font-heading font-bold rounded-full transition-all w-full max-w-sm text-lg border-2 border-deep-obsidian ${selectedOption ? 'bg-electric-blue text-white hover:scale-105 shadow-[4px_4px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_rgba(10,10,10,1)] cursor-pointer' : 'bg-surface-variant text-outline cursor-not-allowed'}`}
        >
          Kunci Jawaban
        </button>
      )}
      
      {isSubmitted && (
        <div className="mt-10 px-8 py-4 bg-surface-container-high border-2 border-deep-obsidian rounded-full text-deep-obsidian font-heading font-bold text-lg animate-pulse shadow-[4px_4px_0px_rgba(10,10,10,1)] flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" /> Jawaban tersimpan! Menunggu instruksi...
        </div>
      )}
    </div>
  );
}
