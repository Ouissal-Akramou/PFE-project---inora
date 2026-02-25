'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

 async function handleSubmit(e) {
  e.preventDefault();
  try {
    await login(form.email, form.password);  // calls refreshUser inside
    router.push('/');
    router.refresh();  // force full reload
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed');
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Keep your exact beautiful design */}
      <div className="absolute inset-0 bg-cover bg-center -z-20" 
           style={{ backgroundImage: "url(https://images.unsplash.com/photo-1523430410476-0185cb1f6ff9)" }} />
      <div className="absolute inset-0 animate-gradient-bg -z-10 opacity-70"></div>
      
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-10 border border-[#C87D87]/20 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-[#6B7556] mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-[#C87D87] text-lg">Sign in to your account and continue your journey</p>
        </div>
        
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        
        <div className="space-y-4">
          <label className="block text-[#6B7556] font-medium mb-2">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-[#C87D87]/30 bg-white/70 backdrop-blur-sm text-[#6B7556] placeholder-[#C87D87] focus:outline-none focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/30 transition shadow-sm"
            required
          />
          
          <label className="block text-[#6B7556] font-medium mb-2">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-[#C87D87]/30 bg-white/70 backdrop-blur-sm text-[#6B7556] placeholder-[#C87D87] focus:outline-none focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/30 transition shadow-sm"
            required
          />
        </div>
        
        <div className="flex justify-between items-center text-sm text-[#6B7556]">
          <Link href="/forgot-password" className="text-[#C87D87] hover:text-[#6B7556] transition">
            Forgot password?
          </Link>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6B7556] to-[#556b42] hover:scale-105 transition shadow-lg hover:shadow-xl mt-4"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        
        <p className="text-center text-[#6B7556] mt-6">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-[#C87D87] font-medium hover:text-[#6B7556] transition">
            Sign up
          </Link>
        </p>
      </form>
      
      {/* Your gradient CSS */}
      <style jsx>{`
        .animate-gradient-bg {
          background: linear-gradient(-45deg, #FBEAD6, #C87D87, #6B7556, #C87D87);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
