"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Trophy } from "lucide-react";

interface LiveScoreProps {
  score: number;
}

export function LiveScore({ score }: LiveScoreProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const controls = useAnimation();

  useEffect(() => {
    if (score !== displayScore) {
      // Animate score change
      controls.start({
        scale: [1, 1.5, 1],
        color: ["#ffffff", "#fef08a", "#ffffff"],
        transition: { duration: 0.5 }
      });
      
      // Counting animation logic
      const step = Math.ceil(Math.abs(score - displayScore) / 10);
      const interval = setInterval(() => {
        setDisplayScore((prev) => {
          if (prev < score) return Math.min(prev + step, score);
          if (prev > score) return Math.max(prev - step, score);
          clearInterval(interval);
          return prev;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [score, controls, displayScore]);

  return (
    <div className="bg-white/30 px-3 py-1.5 rounded-full flex items-center font-black text-lg drop-shadow relative overflow-hidden">
      <Trophy className="w-5 h-5 text-yellow-300 mr-2 z-10" />
      <motion.span 
        animate={controls}
        className="z-10 tabular-nums"
      >
        {displayScore} pts
      </motion.span>
      
      {/* Sparkle effect on score change */}
      {score !== displayScore && (
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 2, 0] }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-yellow-400/40 rounded-full blur-md z-0"
        />
      )}
    </div>
  );
}
