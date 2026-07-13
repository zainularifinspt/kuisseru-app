import { CheckCircle, XCircle } from "lucide-react";

export interface QuestionStat {
  id: string | number;
  label: string;
  correct: number;
  incorrect: number;
}

interface QuestionStatsChartProps {
  stats: QuestionStat[];
}

export function QuestionStatsChart({ stats }: QuestionStatsChartProps) {
  if (!stats || stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p>Belum ada data jawaban untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {stats.map((stat) => {
        const total = stat.correct + stat.incorrect;
        
        // Handle empty condition gracefully
        const correctPercent = total === 0 ? 0 : Math.round((stat.correct / total) * 100);
        const incorrectPercent = total === 0 ? 0 : Math.round((stat.incorrect / total) * 100);
        
        return (
          <div key={stat.id} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="font-bold text-slate-700">{stat.label}</span>
              <div className="flex gap-4 text-sm font-medium">
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> {stat.correct} Benar ({correctPercent}%)
                </span>
                <span className="text-rose-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> {stat.incorrect} Salah ({incorrectPercent}%)
                </span>
              </div>
            </div>
            
            {/* CSS Bar Chart */}
            <div className="h-6 flex rounded-full overflow-hidden bg-slate-100 shadow-inner">
              {total === 0 ? (
                <div className="w-full bg-slate-200 h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                  Belum dijawab
                </div>
              ) : (
                <>
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-1000 ease-out flex items-center justify-center text-xs text-white font-bold" 
                    style={{ width: `${correctPercent}%` }}
                  >
                    {correctPercent > 10 ? `${correctPercent}%` : ''}
                  </div>
                  <div 
                    className="bg-rose-400 h-full transition-all duration-1000 ease-out flex items-center justify-center text-xs text-white font-bold" 
                    style={{ width: `${incorrectPercent}%` }}
                  >
                     {incorrectPercent > 10 ? `${incorrectPercent}%` : ''}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
