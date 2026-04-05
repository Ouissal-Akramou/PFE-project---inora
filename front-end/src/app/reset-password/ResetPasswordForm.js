'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

/* ─── lace SVG background ────────────────────────────────────── */
function LaceSVG() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      {/* ... khli l'code dyal LaceSVG kima howa ... */}
    </svg>
  );
}

/* ─── ornament divider ───────────────────────────────────────── */
function OrnamDivider() {
  return (
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
  );
}

/* ─── shared background wrapper — NO TypeScript types ────────── */
function Background({ children }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg,#4e5a3c 0%,#6B7556 45%,#5a6347 80%,#4a5535 100%)' }}
    >
      <style>{`
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes lacePulse { 0%,100%{opacity:.55} 50%{opacity:1} }
        @keyframes formIn    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes checkDraw { to{stroke-dashoffset:0} }
        @keyframes ringPop   { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus {
          -webkit-box-shadow:0 0 0px 1000px rgba(255,255,255,0.5) inset;
          -webkit-text-fill-color:#3a3027;
        }
      `}</style>

      {/* noise */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize:'200px' }} />

      {/* orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(251,234,214,0.10) 0%,transparent 70%)', animation:'floatOrb 10s ease-in-out infinite', filter:'blur(18px)' }} />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(200,125,135,0.12) 0%,transparent 70%)', animation:'floatOrb 13s ease-in-out infinite 2s', filter:'blur(22px)' }} />

      <LaceSVG />
      {children}
    </div>
  );
}

/* ─── invalid token screen ──────────────────────────────────── */
function InvalidToken() {
  return (
    <Background>
      <div className="relative z-10" style={{ animation:'formIn 0.9s cubic-bezier(.4,0,.2,1) forwards 0.2s', opacity:0 }}>
        <div className="relative w-[370px] bg-[#FBEAD6]/92 backdrop-blur-xl border border-[#FBEAD6]/25 rounded-2xl px-7 py-8 shadow-[0_32px_90px_rgba(10,18,6,0.55)] text-center">
          <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/12 pointer-events-none"/>
          <div className="absolute inset-[5px] rounded-xl border border-[#C87D87]/8 pointer-events-none"/>

          <div className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background:'rgba(200,125,135,0.09)', border:'1px solid rgba(200,125,135,0.22)' }}>
            <svg className="w-7 h-7 text-[#C87D87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>

          <Link href="/"
            className="font-['Playfair_Display',serif] italic text-xl text-[#C87D87] tracking-widest block mb-3 hover:text-[#a85e6a] transition-colors duration-300">
            Inora
          </Link>
          <OrnamDivider />
          <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.32em] uppercase text-[#C87D87]/55 mb-1">Invalid Link</p>
          <h2 className="font-['Playfair_Display',serif] italic text-2xl text-[#5a6347] leading-tight mb-2">Link Expired</h2>
          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/65 mb-6 leading-snug">
            This reset link is invalid or has expired.<br/>Request a new one from the forgot password page.
          </p>

          <Link href="/forgot-password"
            className="block w-full font-['Cormorant_Garamond',serif] text-sm tracking-[0.28em] uppercase text-white py-2.5 rounded-xl transition-all duration-300 mb-3 relative overflow-hidden group bg-[#6B7556] hover:bg-[#5a6347]">
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="opacity-50 text-[0.5rem]">◆</span>Request New Link<span className="opacity-50 text-[0.5rem]">◆</span>
            </span>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-300 rounded-xl"/>
          </Link>

          <div className="flex items-center gap-3 my-3"><div className="flex-1 h-px bg-[#C87D87]/12"/></div>
          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/70 text-center">
            <Link href="/login" className="text-[#C87D87] hover:text-[#6B7556] transition-colors duration-300 border-b border-[#C87D87]/25 pb-px">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </Background>
  );
}

/* ─── success screen ────────────────────────────────────────── */
function SuccessScreen() {
  return (
    <Background>
      <div className="relative z-10" style={{ animation:'formIn 0.6s cubic-bezier(.4,0,.2,1) forwards', opacity:0 }}>
        <div className="relative w-[370px] bg-[#FBEAD6]/92 backdrop-blur-xl border border-[#FBEAD6]/25 rounded-2xl px-7 py-8 shadow-[0_32px_90px_rgba(10,18,6,0.55)] text-center">
          <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/12 pointer-events-none"/>
          <div className="absolute inset-[5px] rounded-xl border border-[#C87D87]/8 pointer-events-none"/>

          <div className="mx-auto mb-5 w-20 h-20" style={{ animation:'ringPop .6s cubic-bezier(.34,1.56,.64,1) forwards' }}>
            <svg viewBox="0 0 80 80" className="w-full h-full">
              <circle cx="40" cy="40" r="36" fill="rgba(107,117,86,0.07)" stroke="rgba(107,117,86,0.22)" strokeWidth="1.2"/>
              <path d="M24 40 L35 51 L56 29" fill="none" stroke="#6B7556" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="44" strokeDashoffset="44"
                style={{ animation:'checkDraw .5s ease .45s forwards' }}/>
            </svg>
          </div>

          <Link href="/"
            className="font-['Playfair_Display',serif] italic text-xl text-[#C87D87] tracking-widest block mb-3 hover:text-[#a85e6a] transition-colors duration-300">
            Inora
          </Link>
          <OrnamDivider />

          <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.32em] uppercase text-[#C87D87]/55 mb-1" style={{ animation:'fadeInUp .4s ease .5s both' }}>All Done</p>
          <h2 className="font-['Playfair_Display',serif] italic text-2xl text-[#5a6347] leading-tight mb-2" style={{ animation:'fadeInUp .4s ease .55s both' }}>
            Password Updated<span className="text-[#C87D87]">·</span>
          </h2>
          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/65 mb-1 leading-snug" style={{ animation:'fadeInUp .4s ease .6s both' }}>
            Your password has been reset successfully.
          </p>
          <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/40 mb-6" style={{ animation:'fadeInUp .4s ease .65s both' }}>
            Redirecting you to sign in…
          </p>

          <Link href="/login"
            className="block w-full font-['Cormorant_Garamond',serif] text-sm tracking-[0.28em] uppercase text-white py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group bg-[#6B7556] hover:bg-[#5a6347]"
            style={{ animation:'fadeInUp .4s ease .7s both' }}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="opacity-50 text-[0.5rem]">◆</span>Sign In Now<span className="opacity-50 text-[0.5rem]">◆</span>
            </span>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-300 rounded-xl"/>
          </Link>
        </div>
      </div>
    </Background>
  );
}

/* ─── main form ─────────────────────────────────────────────── */
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
    setTokenChecked(true);
  }, [searchParams]);

  if (!tokenChecked) return null;
  if (!token) return <InvalidToken />;
  if (done) return <SuccessScreen />;

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Too short', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#C87D87', '#d19900', '#6B7556'][strength];
  const strengthWidth = [0, 33, 66, 100][strength];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
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

// PAGE PRINCIPALE avec Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(-45deg, #FBEAD6, #C87D87, #6B7556, #C87D87)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border border-[#FBEAD6]/20"/>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FBEAD6] animate-spin"/>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/70 tracking-[0.35em] text-xs uppercase">
            Chargement...
          </p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}