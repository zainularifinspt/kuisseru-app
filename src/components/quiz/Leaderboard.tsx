"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

export type LeaderboardUser = {
  rank: number;
  nickname: string;
  score: number;
};

interface LeaderboardProps {
  data: LeaderboardUser[];
  currentPlayerNickname: string;
}

export function Leaderboard({ data, currentPlayerNickname }: LeaderboardProps) {
  // Sort just in case
  const sortedData = [...data].sort((a, b) => b.score - a.score).map((u, i) => ({ ...u, rank: i + 1 }));

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="flex items-center text-xl font-extrabold text-slate-800">
          <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
          Leaderboard (Live)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        <div className="flex flex-col divide-y divide-slate-50 relative">
          {sortedData.map((user) => {
            const isMe = user.nickname === currentPlayerNickname;
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={user.nickname} // use nickname as key for layout animation
                className={`flex items-center p-4 transition-colors ${
                  isMe ? 'bg-indigo-50/80 border-l-4 border-indigo-500' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${
                  user.rank === 1 ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 
                  user.rank === 2 ? 'bg-slate-300 text-slate-700 shadow-sm' : 
                  user.rank === 3 ? 'bg-amber-600 text-white shadow-sm' : 
                  'bg-slate-100 text-slate-500'
                }`}>
                  {user.rank}
                </div>
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm mr-3">
                  <AvatarFallback className={`${
                    isMe ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200'
                  } font-bold`}>
                    {user.nickname.substring(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className={`font-bold ${isMe ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {user.nickname}
                    {isMe && <span className="ml-2 text-xs text-indigo-500 font-normal">(Kamu)</span>}
                  </p>
                </div>
                <div className="font-black text-slate-800">
                  {user.score}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
