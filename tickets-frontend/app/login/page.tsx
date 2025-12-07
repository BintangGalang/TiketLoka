'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      login(data.access_token, data.user);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STYLE INPUT BARU (LEBIH JELAS & KONTRAS) ---
  const inputClassName = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#F57C00] focus:ring-2 focus:ring-[#F57C00]/20 outline-none transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* --- HEADER LOGO --- */}
        <div className="bg-[#0B2F5E] p-8 flex flex-col items-center justify-center text-center">
           <div className="relative h-24 w-72 mb-4">
                <Image 
                    src="/images/logo-login.png" 
                    alt="Logo TiketLoka" 
                    fill 
                    className="object-contain" 
                    priority
                />
           </div>
           <p className="text-blue-200 text-sm font-medium">Selamat datang kembali!</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName} // Gunakan style baru
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClassName} // Gunakan style baru
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0B2F5E] hover:bg-[#061A35] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-900/20 active:scale-95 mt-2"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Masuk Sekarang'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Belum punya akun?{' '}
            <Link href="/register" className="text-[#F57C00] font-bold hover:underline">
              Daftar disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}