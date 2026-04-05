'use client';

import { useState, useEffect, Suspense } from 'react'; // ✅ AJOUT : Importer Suspense
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
    setTokenChecked(true);
  }, [searchParams]);

  if (!tokenChecked) return null;
  if (!token)        return <InvalidToken />;
  if (done)          return <SuccessScreen />;

  const strength      = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Too short', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#C87D87', '#d19900', '#6B7556'][strength];
  const strengthWidth = [0, 33, 66, 100][strength];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body:        JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Reset failed. Please try again.'); return; }
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Background>
      <div className="relative z-10" style={{ animation:'formIn 0.9s cubic-bezier(.4,0,.2,1) forwards 0.2s', opacity:0 }}>
        <form onSubmit={handleSubmit}
          className="relative w-[370px] bg-[#FBEAD6]/92 backdrop-blur-xl border border-[#FBEAD6]/25 rounded-2xl px-7 py-6 shadow-[0_32px_90px_rgba(10,18,6,0.55)]">

          <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/12 pointer-events-none"/>
          <div className="absolute inset-[5px] rounded-xl border border-[#C87D87]/8 pointer-events-none"/>

          {/* header */}
          <div className="text-center mb-5">
            <Link href="/"
              className="font-['Playfair_Display',serif] italic text-2xl text-[#C87D87] tracking-widest block mb-2 hover:text-[#a85e6a] transition-colors duration-300">
              Inora
            </Link>
            <OrnamDivider />
            <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.32em] uppercase text-[#C87D87]/55 mb-1">
              Account Recovery
            </p>
            <h2 className="font-['Playfair_Display',serif] italic text-2xl text-[#5a6347] leading-tight">
              New Password
            </h2>
            <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/65 mt-2 leading-snug">
              Choose a strong password to protect your account.
            </p>
          </div>

          {/* error banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2 border border-[#C87D87]/35 bg-[#C87D87]/8 px-3 py-2.5 rounded-lg"
              style={{ animation:'fadeInUp 0.3s ease forwards' }}>
              <span className="text-[#C87D87] text-xs flex-shrink-0 mt-0.5">◆</span>
              <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#C87D87]">{error}</p>
            </div>
          )}

          {/* password field */}
          <div className="group mb-2">
            <label className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#5a4a3a]/75 font-semibold block mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2 pr-10 bg-white/55 border border-[#C87D87]/18 focus:border-[#C87D87]/50 focus:bg-white/70 focus:outline-none rounded-lg font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] placeholder:text-[#7a6a5a]/35 transition-all duration-300 group-hover:border-[#C87D87]/28"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C87D87]/50 hover:text-[#C87D87] transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                )}
              </button>
              <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"/>
            </div>
          </div>

          {/* strength bar */}
          {password.length > 0 && (
            <div className="mb-4" style={{ animation:'fadeInUp 0.25s ease forwards' }}>
              <div className="h-1 w-full bg-[#3a3027]/8 rounded-full overflow-hidden mb-1">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width:`${strengthWidth}%`, background: strengthColor }}/>
              </div>
              <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] text-right"
                style={{ color: strengthColor }}>{strengthLabel}</p>
            </div>
          )}

          {/* hint */}
          <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] text-[#7a6a5a]/40 mb-4">
            Minimum 6 characters — use a mix of letters, numbers &amp; symbols for a stronger password.
          </p>

          {/* submit */}
          <button type="submit" disabled={loading || password.length < 6}
            className="w-full mt-1 relative overflow-hidden font-['Cormorant_Garamond',serif] text-sm tracking-[0.28em] uppercase text-white border-0 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group bg-[#6B7556] hover:bg-[#5a6347]">
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="opacity-50 text-[0.5rem]">◆</span>
              {loading ? '— Updating —' : 'Set New Password'}
              <span className="opacity-50 text-[0.5rem]">◆</span>
            </span>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-300 rounded-xl"/>
          </button>

          {/* footer */}
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
    </Background>
  );
}
