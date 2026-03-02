'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function SignUp() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [adminCode, setAdminCode] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [error, setError] = useState('');

 async function handleSubmit(e) {
  e.preventDefault();
  if (form.password !== form.confirmPassword) return setError('Passwords do not match');
  if (form.password.length < 6) return setError('Password must be at least 6 characters');
  try {
    await register(form.fullName, form.email, form.password, adminCode || undefined);
    router.push('/login'); // ✅ always redirect to login after registration
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed');
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FBEAD6] relative overflow-hidden">

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_center,_rgba(200,125,135,0.18)_0%,_transparent_70%)]" />

      {/* Corner frame */}
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

      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md bg-white/70 border border-[#C87D87]/20 p-10 hover:shadow-[0_8px_40px_rgba(200,125,135,0.12)] transition-shadow duration-300">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="font-['Playfair_Display',serif] italic text-2xl text-[#C87D87] tracking-wide block mb-4">
            Inora
          </Link>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.28em] uppercase mb-2">
            Welcome
          </p>
          <h1 className="font-['Playfair_Display',serif] italic text-3xl text-[#6B7556]">
            Create Account
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-10 h-px bg-[#C87D87]/30" />
            <span className="text-[#C87D87]/40 text-xs">✦</span>
            <div className="w-10 h-px bg-[#C87D87]/30" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#C87D87] text-center mb-4 border border-[#C87D87]/20 py-2 bg-[#C87D87]/5">
            {error}
          </p>
        )}

        {/* Fields */}
        <div className="space-y-5">
          {[
            { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Your full name' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'At least 6 characters' },
            { label: 'Confirm Password', key: 'confirmPassword', type: 'password', placeholder: 'Repeat your password' },
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

          {/* ✅ OPTIONAL ADMIN CODE */}
          <div>
            <button
              type="button"
              onClick={() => { setShowAdminCode(!showAdminCode); setAdminCode(''); }}
              className="w-full flex items-center justify-center gap-2 py-2 font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/40 hover:text-[#C87D87] transition-colors duration-300"
            >
              <div className="flex-1 h-px bg-[#C87D87]/15" />
              <span>{showAdminCode ? '— cancel admin registration —' : '+ register as admin?'}</span>
              <div className="flex-1 h-px bg-[#C87D87]/15" />
            </button>

            {showAdminCode && (
              <div className="mt-3 animate-[fadeInUp_0.3s_ease_forwards]">
                <div className="flex items-center gap-3 mb-3">
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
                  className="w-full px-4 py-3 bg-[#C87D87]/5 border border-[#C87D87]/30 focus:border-[#C87D87]/60 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/40 transition-colors duration-300"
                />
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] text-[#C87D87]/40 mt-1.5 text-center">
                  — Provided by your organization —
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit — color changes if admin code is entered */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-7 font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-white border py-3 transition-all duration-300 disabled:opacity-50 ${
            showAdminCode && adminCode
              ? 'bg-[#C87D87] border-[#C87D87] hover:bg-[#6B7556] hover:border-[#6B7556]'
              : 'bg-[#6B7556] border-[#6B7556] hover:bg-[#C87D87] hover:border-[#C87D87]'
          }`}
        >
          {loading
            ? '— Creating —'
            : showAdminCode && adminCode
              ? 'Create Admin Account'
              : 'Create Account'
          }
        </button>

        {/* Footer */}
        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a] text-center mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[#C87D87] hover:text-[#6B7556] transition-colors duration-300 border-b border-[#C87D87]/30">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
