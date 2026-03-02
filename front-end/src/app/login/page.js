'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('user');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // ✅ Require admin code if admin selected
    if (selectedRole === 'admin' && !adminCode.trim()) {
      setError('Admin code is required');
      return;
    }

    try {
      const data = await login(form.email, form.password, selectedRole, adminCode);
      const actualRole = data?.user?.role || data?.role;

      if (actualRole !== selectedRole) {
        setError(`You are not registered as ${selectedRole}`);
        return;
      }

      router.refresh();
      router.push(actualRole === 'admin' ? '/admin' : '/');

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
          <Link href="/" className="font-['Playfair_Display',serif] italic text-2xl text-[#C87D87] tracking-wide block mb-4">
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

        {/* ROLE SELECTOR */}
        <div className="mb-6">
          <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#7a6a5a] mb-3 text-center">
            Sign in as
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setSelectedRole('user'); setAdminCode(''); setError(''); }}
              className={`flex flex-col items-center gap-2 py-4 border transition-all duration-300 ${
                selectedRole === 'user'
                  ? 'border-[#6B7556] bg-[#6B7556]/10'
                  : 'border-[#C87D87]/20 bg-transparent hover:border-[#C87D87]/40'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-colors ${selectedRole === 'user' ? 'text-[#6B7556]' : 'text-[#C87D87]/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={`font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase transition-colors ${selectedRole === 'user' ? 'text-[#6B7556]' : 'text-[#7a6a5a]'}`}>
                Member
              </span>
              {selectedRole === 'user' && <div className="w-4 h-px bg-[#6B7556]" />}
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('admin'); setError(''); }}
              className={`flex flex-col items-center gap-2 py-4 border transition-all duration-300 ${
                selectedRole === 'admin'
                  ? 'border-[#C87D87] bg-[#C87D87]/10'
                  : 'border-[#C87D87]/20 bg-transparent hover:border-[#C87D87]/40'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-colors ${selectedRole === 'admin' ? 'text-[#C87D87]' : 'text-[#C87D87]/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className={`font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase transition-colors ${selectedRole === 'admin' ? 'text-[#C87D87]' : 'text-[#7a6a5a]'}`}>
                Admin
              </span>
              {selectedRole === 'admin' && <div className="w-4 h-px bg-[#C87D87]" />}
            </button>
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
          <div>
            <label className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#7a6a5a] block mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-3 bg-[#FBEAD6]/40 border border-[#C87D87]/20 focus:border-[#C87D87]/50 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/40 transition-colors duration-300"
            />
          </div>

          <div>
            <label className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#7a6a5a] block mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="w-full px-4 py-3 bg-[#FBEAD6]/40 border border-[#C87D87]/20 focus:border-[#C87D87]/50 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/40 transition-colors duration-300"
            />
          </div>

          {/* ✅ ADMIN CODE — only shows when Admin is selected */}
          {selectedRole === 'admin' && (
            <div className="animate-[fadeInUp_0.3s_ease_forwards]">
              {/* Ornamental divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[#C87D87]/20" />
                <span className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.2em] uppercase text-[#C87D87]/50">
                  Admin Verification
                </span>
                <div className="flex-1 h-px bg-[#C87D87]/20" />
              </div>

              <label className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#7a6a5a] block mb-1.5">
                Admin Code
              </label>
              <input
                type="password"
                placeholder="Enter your admin code"
                value={adminCode}
                onChange={e => setAdminCode(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#C87D87]/5 border border-[#C87D87]/30 focus:border-[#C87D87]/60 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/40 transition-colors duration-300"
              />
              <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] text-[#C87D87]/40 mt-1.5 text-center">
                — Provided by your organization —
              </p>
            </div>
          )}
        </div>

        {/* Forgot password */}
        <div className="mt-3 text-right">
          <Link href="/forgot-password" className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/60 hover:text-[#C87D87] transition-colors border-b border-[#C87D87]/20">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-6 font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-white border py-3 transition-all duration-300 disabled:opacity-50 ${
            selectedRole === 'admin'
              ? 'bg-[#C87D87] border-[#C87D87] hover:bg-[#6B7556] hover:border-[#6B7556]'
              : 'bg-[#6B7556] border-[#6B7556] hover:bg-[#C87D87] hover:border-[#C87D87]'
          }`}
        >
          {loading ? '— Signing In —' : `Sign In as ${selectedRole === 'admin' ? 'Admin' : 'Member'}`}
        </button>

        {/* Footer */}
        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a] text-center mt-5">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-[#C87D87] hover:text-[#6B7556] transition-colors duration-300 border-b border-[#C87D87]/30">
            Create one
          </Link>
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="w-10 h-px bg-[#C87D87]/20" />
          <span className="text-[#C87D87]/30 text-[0.5rem]">✦</span>
          <div className="w-10 h-px bg-[#C87D87]/20" />
        </div>
      </form>
    </div>
  );
}
