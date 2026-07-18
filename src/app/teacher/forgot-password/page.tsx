'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      // @ts-ignore: better-auth type definitions for forgetPassword may be incomplete
      const res = await authClient.forgetPassword({
        email,
        redirectTo: "/teacher/reset-password",
      });

      if (res.error) {
        setError(res.error.message || 'Gagal mengirim email reset password');
      } else {
        setMessage('Tautan untuk mereset password telah dikirim ke email Anda. Silakan cek kotak masuk Anda.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background text-on-background font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '-2s' }}></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl font-bold text-deep-obsidian tracking-tight">
            Lupa Password
          </h1>
          <p className="text-on-surface-variant mt-3 text-sm font-sans px-4">
            Masukkan email akademik Anda, kami akan mengirimkan tautan untuk mengatur ulang password.
          </p>
        </div>

        <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-2 border-deep-obsidian rounded-xl overflow-hidden relative shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="h-1 bg-[linear-gradient(90deg,#0052FF,#FF00E5,#0052FF)] bg-[length:200%_auto] animate-gradient-shift" />
          <div className="p-8 sm:p-10">
            {message ? (
              <div className="text-center">
                <div className="bg-[#E8F5E9] text-[#2E7D32] border-2 border-[#4CAF50] p-6 rounded-xl font-bold text-sm mb-6">
                  {message}
                </div>
                <Link href="/teacher" className="font-heading font-semibold text-sm text-electric-blue hover:underline">
                  Kembali ke halaman Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-heading font-semibold text-sm text-on-surface-variant px-2 uppercase tracking-wide">EMAIL</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full bg-surface-container-lowest border-2 border-deep-obsidian rounded-full px-6 py-4 font-heading text-lg font-medium text-on-surface placeholder:text-outline focus:outline-none focus:border-electric-blue focus:ring-4 focus:ring-primary-fixed transition-all"
                  />
                </div>

                {error && (
                  <div className="text-error text-sm font-bold bg-error-container border-2 border-error p-4 rounded-xl flex items-center gap-2">
                    <span className="flex-1">{error}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 group relative rounded-full border-2 border-deep-obsidian p-1 overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,82,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,#0052FF,#FF00E5,#0052FF)] bg-[length:200%_auto] animate-gradient-shift opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-transparent px-8 py-4 rounded-full flex items-center justify-center gap-2">
                    <span className="font-heading text-xl text-on-primary font-bold tracking-wide">
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Kirim Tautan"}
                    </span>
                  </div>
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link href="/teacher" className="font-heading font-semibold text-sm text-on-surface-variant hover:text-electric-blue transition-colors">
            ← Batal & Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
