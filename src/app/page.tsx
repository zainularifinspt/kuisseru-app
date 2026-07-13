import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          KuisSeru
        </h1>
        <p className="text-slate-600 mb-8">
          Selamat datang di platform kuis interaktif yang seru dan menegangkan!
        </p>
        <Link href="/quiz">
          <Button size="lg" className="w-full rounded-full text-lg font-bold bg-indigo-600 hover:bg-indigo-700 h-14 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] mb-3">
            Mulai Kuis Demo
          </Button>
        </Link>
        <Link href="/teacher">
          <Button size="lg" variant="outline" className="w-full rounded-full text-md font-semibold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 h-12 transition-all hover:scale-[1.02]">
            Masuk sebagai Guru
          </Button>
        </Link>
      </div>
    </div>
  );
}
