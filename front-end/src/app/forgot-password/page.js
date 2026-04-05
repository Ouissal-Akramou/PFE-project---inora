'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error('Failed to send reset email');
      }

      setMessage('If this email is registered, check your inbox for reset instructions.');
    } catch (err) {
      setIsError(true);
      setMessage('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg,#4e5a3c 0%,#6B7556 45%,#5a6347 80%,#4a5535 100%)' }}
    >
      <style>{`
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes lacePulse  { 0%,100%{opacity:.55} 50%{opacity:1} }
        @keyframes formIn     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus {
          -webkit-box-shadow:0 0 0px 1000px rgba(255,255,255,0.5) inset;
          -webkit-text-fill-color:#3a3027;
        }
      `}</style>

      {/* NOISE, ORBS & LACE SVG */}
      {/* Khlli kolchi kifma howa, ma tmaskhach */}

      {/* FORM */}
      <div className="relative z-10" style={{ animation:'formIn 0.9s cubic-bezier(.4,0,.2,1) forwards 0.2s', opacity:0 }}>
        <form onSubmit={handleSubmit}
          className="relative w-[370px] bg-[#FBEAD6]/92 backdrop-blur-xl border border-[#FBEAD6]/25 rounded-2xl px-7 py-6 shadow-[0_32px_90px_rgba(10,18,6,0.55)]">

          <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/12 pointer-events-none"/>
          <div className="absolute inset-[5px] rounded-xl border border-[#C87D87]/8 pointer-events-none"/>

          {/* Header */}
          <div className="text-center mb-5">
            <Link href="/"
              className="font-['Playfair_Display',serif] italic text-2xl text-[#C87D87] tracking-widest block mb-2 hover:text-[#a85e6a] transition-colors duration-300">
              Inora
            </Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C87D87]/30"/>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <g transform="translate(7 7)">
                  <line x1="-5" y1="0" x2="5" y2="0" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.6"/>
                  <line x1="0" y1="-5" x2="0" y2="5" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.6"/>
                  <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.4"/>
                  <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.4"/>
                  <circle r="1.3" fill="#C87D87" fillOpacity="0.6"/>
                </g>
              </svg>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C87D87]/30"/>
            </div>
            <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.32em] uppercase text-[#C87D87]/55 mb-1">
              Account Recovery
            </p>
            <h2 className="font-['Playfair_Display',serif] italic text-2xl text-[#5a6347] leading-tight">
              Reset Password
            </h2>
            <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/65 mt-2 leading-snug">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {/* Message banner */}
          {message && (
            <div
              className={`mb-4 flex items-start gap-2 border px-3 py-2.5 rounded-lg ${
                isError
                  ? 'border-[#C87D87]/35 bg-[#C87D87]/8'
                  : 'border-[#6B7556]/35 bg-[#6B7556]/8'
              }`}
              style={{ animation:'fadeInUp 0.3s ease forwards' }}>
              <span className={`text-xs flex-shrink-0 mt-0.5 ${isError ? 'text-[#C87D87]' : 'text-[#6B7556]'}`}>◆</span>
              <p className={`font-['Cormorant_Garamond',serif] italic text-sm ${isError ? 'text-[#C87D87]' : 'text-[#6B7556]'}`}>
                {message}
              </p>
            </div>
          )}

          {/* Email field */}
          <div className="group mb-3">
            <label className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#5a4a3a]/75 font-semibold block mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-white/55 border border-[#C87D87]/18 focus:border-[#C87D87]/50 focus:bg-white/70 focus:outline-none rounded-lg font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] placeholder:text-[#7a6a5a]/35 transition-all duration-300 group-hover:border-[#C87D87]/28"
              />
              <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"/>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || !!message}
            className="w-full mt-4 relative overflow-hidden font-['Cormorant_Garamond',serif] text-sm tracking-[0.28em] uppercase text-white border-0 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 group bg-[#6B7556] hover:bg-[#5a6347]">
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="opacity-50 text-[0.5rem]">◆</span>
              {loading ? '— Sending —' : 'Send Reset Link'}
              <span className="opacity-50 text-[0.5rem]">◆</span>
            </span>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-300 rounded-xl"/>
          </button>

          {/* Divider + back link */}
          <div className="flex items-center gap-3 mt-4 mb-3">
            <div className="flex-1 h-px bg-[#C87D87]/12"/>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/70 text-center">
            Remembered it?{' '}
            <Link href="/login"
              className="text-[#C87D87] hover:text-[#6B7556] transition-colors duration-300 border-b border-[#C87D87]/25 pb-px">
              Back to Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}