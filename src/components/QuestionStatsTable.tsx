import { QuestionStat } from "./QuestionStatsChart";

interface QuestionStatsTableProps {
  stats: QuestionStat[];
}

export function QuestionStatsTable({ stats }: QuestionStatsTableProps) {
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto w-full border rounded-xl shadow-sm border-slate-100 bg-white">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-100">
          <tr>
            <th scope="col" className="px-6 py-4 font-bold">Soal</th>
            <th scope="col" className="px-6 py-4 font-bold text-center">Total Penjawab</th>
            <th scope="col" className="px-6 py-4 font-bold text-center text-emerald-600">Benar</th>
            <th scope="col" className="px-6 py-4 font-bold text-center text-rose-500">Salah</th>
            <th scope="col" className="px-6 py-4 font-bold text-center">Tingkat Kesulitan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stats.map((stat) => {
            const total = stat.correct + stat.incorrect;
            const correctPercent = total === 0 ? 0 : Math.round((stat.correct / total) * 100);
            
            // Determine difficulty label
            let difficulty = "Mudah";
            let difficultyColor = "bg-emerald-100 text-emerald-700";
            if (total > 0) {
              if (correctPercent < 40) {
                difficulty = "Sulit";
                difficultyColor = "bg-rose-100 text-rose-700";
              } else if (correctPercent < 70) {
                difficulty = "Sedang";
                difficultyColor = "bg-amber-100 text-amber-700";
              }
            } else {
              difficulty = "-";
              difficultyColor = "bg-slate-100 text-slate-500";
            }

            return (
              <tr key={stat.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">
                  {stat.label}
                </td>
                <td className="px-6 py-4 text-center font-medium">
                  {total} Siswa
                </td>
                <td className="px-6 py-4 text-center font-bold text-emerald-600">
                  {stat.correct} ({correctPercent}%)
                </td>
                <td className="px-6 py-4 text-center font-bold text-rose-500">
                  {stat.incorrect} ({total === 0 ? 0 : 100 - correctPercent}%)
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyColor}`}>
                    {difficulty}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
