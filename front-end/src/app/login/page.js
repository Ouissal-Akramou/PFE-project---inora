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
    await login(form.email, form.password); // ✅ context handles API call
    router.refresh();
    router.push('/');
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed');
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FBEAD6] relative overflow-hidden">

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_center,_rgba(200,125,135,0.18)_0%,_transparent_70%)]" />

      {/* Page corner frame */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <div className="absolute inset-3 border border-[#C87D87]/20" />
        <div className="absolute top-3 left-3 w-10 h-10">
          <div className="absolute top-0 left-0 w-full h-px bg-[#C87D87]/50" />
          <div className="absolute top-0 left-0 w-px h-full bg-[#C87D87]/50" />
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#C87D87]/70" />
        </div>
        <div className="absolute top-3 right-3 w-10 h-10">
          <div className="absolute top-0 right-0 w-full h-px bg-[#C87D87]/50" />
          <div className="absolute top-0 right-0 w-px h-full bg-[#C87D87]/50" />
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#C87D87]/70" />
        </div>
        <div className="absolute bottom-3 left-3 w-10 h-10">
          <div className="absolute bottom-0 left-0 w-full h-px bg-[#C87D87]/50" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-[#C87D87]/50" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#C87D87]/70" />
        </div>
        <div className="absolute bottom-3 right-3 w-10 h-10">
          <div className="absolute bottom-0 right-0 w-full h-px bg-[#C87D87]/50" />
          <div className="absolute bottom-0 right-0 w-px h-full bg-[#C87D87]/50" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#C87D87]/70" />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-white/70 border border-[#C87D87]/20 p-10 hover:shadow-[0_8px_40px_rgba(200,125,135,0.12)] transition-shadow duration-300"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-['Playfair_Display',serif] italic text-2xl text-[#C87D87] tracking-wide block mb-4"
          >
            Inora
          </Link>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.28em] uppercase mb-2">
            Welcome Back
          </p>
          <h1 className="font-['Playfair_Display',serif] italic text-3xl text-[#6B7556]">
            Sign In
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-10 h-px bg-[#C87D87]/30" />
            <span className="text-[#C87D87]/40 text-xs">✦</span>
            <div className="w-10 h-px bg-[#C87D87]/30" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#C87D87] text-center mb-5 border border-[#C87D87]/20 py-2 bg-[#C87D87]/5">
            {error}
          </p>
        )}

        {/* Fields */}
        <div className="space-y-5">
          {[
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Enter your password' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#7a6a5a] block mb-1.5">
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#FBEAD6]/40 border border-[#C87D87]/20 focus:border-[#C87D87]/50 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/40 transition-colors duration-300"
              />
            </div>
          ))}
        </div>

        {/* Forgot password */}
        <div className="mt-3 text-right">
          <Link
            href="/forgot-password"
            className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/60 hover:text-[#C87D87] transition-colors border-b border-[#C87D87]/20"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-white bg-[#6B7556] border border-[#6B7556] py-3 hover:bg-[#C87D87] hover:border-[#C87D87] transition-all duration-300 disabled:opacity-50"
        >
          {loading ? '— Signing In —' : 'Sign In'}
        </button>

        {/* Footer */}
        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a] text-center mt-5">
          Don't have an account?{' '}
          <Link
            href="/sign-up"
            className="text-[#C87D87] hover:text-[#6B7556] transition-colors duration-300 border-b border-[#C87D87]/30"
          >
            Create one
          </Link>
        </p>

        {/* Bottom ornament */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="w-10 h-px bg-[#C87D87]/20" />
          <span className="text-[#C87D87]/30 text-[0.5rem]">✦</span>
          <div className="w-10 h-px bg-[#C87D87]/20" />
        </div>
      </form>
    </div>
  );
}
