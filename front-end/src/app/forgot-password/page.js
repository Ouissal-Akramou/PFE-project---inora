'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ email }),
      });
      setMessage('If this email is registered, check your inbox for reset instructions.');
    } catch {
      setIsError(true);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4"
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

      {/* NOISE */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize:'200px' }} />

      {/* ORBS — hidden on mobile to reduce paint */}
      <div className="hidden sm:block absolute top-10 left-10 w-64 h-64 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(251,234,214,0.10) 0%,transparent 70%)', animation:'floatOrb 10s ease-in-out infinite', filter:'blur(18px)' }} />
      <div className="hidden sm:block absolute bottom-10 right-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(200,125,135,0.12) 0%,transparent 70%)', animation:'floatOrb 13s ease-in-out infinite 2s', filter:'blur(22px)' }} />

      {/* LACE SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:30}).map((_,row)=>Array.from({length:48}).map((_,col)=>{const x=col*32+(row%2===0?0:16),y=row*32;return <circle key={`d-${row}-${col}`} cx={x} cy={y} r="1.2" fill="#FBEAD6" fillOpacity="0.22"/>}))}
        {Array.from({length:30}).map((_,row)=>Array.from({length:47}).map((_,col)=>{const x1=col*32+(row%2===0?0:16),y1=row*32;return <line key={`h-${row}-${col}`} x1={x1} y1={y1} x2={x1+32} y2={y1} stroke="#FBEAD6" strokeWidth="0.35" strokeOpacity="0.18"/>}))}
        {Array.from({length:29}).map((_,row)=>Array.from({length:48}).map((_,col)=>{const x1=col*32+(row%2===0?0:16),y1=row*32,x2=x1+(row%2===0?16:-16),y2=y1+32;return <line key={`dl-${row}-${col}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FBEAD6" strokeWidth="0.35" strokeOpacity="0.18"/>}))}
        {[
          {cx:120,cy:120},{cx:360,cy:80},{cx:720,cy:50},{cx:1080,cy:80},{cx:1320,cy:120},
          {cx:60,cy:450},{cx:1380,cy:450},
          {cx:200,cy:790},{cx:720,cy:840},{cx:1240,cy:790},
          {cx:480,cy:185},{cx:960,cy:185},
          {cx:480,cy:695},{cx:960,cy:695},
          {cx:240,cy:340},{cx:1200,cy:340},
          {cx:240,cy:580},{cx:1200,cy:580},
        ].map(({cx,cy},i)=>(
          <g key={`m-${i}`} transform={`translate(${cx},${cy})`} style={{animation:`lacePulse ${3.5+(i%3)*0.8}s ease-in-out infinite ${i*0.25}s`}}>
            <circle r="28" fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.35" strokeDasharray="3 5"/>
            <circle r="20" fill="none" stroke="#FBEAD6" strokeWidth="0.55" strokeOpacity="0.30"/>
            <circle r="12" fill="none" stroke="#FBEAD6" strokeWidth="0.45" strokeOpacity="0.25"/>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,j)=><line key={j} x1={Math.cos(a*Math.PI/180)*5} y1={Math.sin(a*Math.PI/180)*5} x2={Math.cos(a*Math.PI/180)*28} y2={Math.sin(a*Math.PI/180)*28} stroke="#FBEAD6" strokeWidth="0.4" strokeOpacity="0.28"/>)}
            <rect x="-3.5" y="-3.5" width="7" height="7" transform="rotate(45)" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.45"/>
            <circle r="1.5" fill="#FBEAD6" fillOpacity="0.45"/>
          </g>
        ))}
        {Array.from({length:9}).map((_,i)=>{const x=80+i*160;return <g key={`st-${i}`}><path d={`M${x},14 Q${x+80},50 ${x+160},14`} fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.30"/><circle cx={x+80} cy={50} r="2.2" fill="#FBEAD6" fillOpacity="0.28"/><circle cx={x} cy={14} r="1.4" fill="#FBEAD6" fillOpacity="0.32"/><circle cx={x+160} cy={14} r="1.4" fill="#FBEAD6" fillOpacity="0.32"/></g>})}
        {Array.from({length:9}).map((_,i)=>{const x=80+i*160;return <g key={`sb-${i}`}><path d={`M${x},886 Q${x+80},850 ${x+160},886`} fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.30"/><circle cx={x+80} cy={850} r="2.2" fill="#FBEAD6" fillOpacity="0.28"/><circle cx={x} cy={886} r="1.4" fill="#FBEAD6" fillOpacity="0.32"/></g>})}
        {Array.from({length:6}).map((_,i)=>{const y=75+i*150;return <g key={`sl-${i}`}><path d={`M14,${y} Q50,${y+75} 14,${y+150}`} fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.30"/><circle cx={50} cy={y+75} r="2.2" fill="#FBEAD6" fillOpacity="0.28"/></g>})}
        {Array.from({length:6}).map((_,i)=>{const y=75+i*150;return <g key={`sr-${i}`}><path d={`M1426,${y} Q1390,${y+75} 1426,${y+150}`} fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.30"/><circle cx={1390} cy={y+75} r="2.2" fill="#FBEAD6" fillOpacity="0.28"/></g>})}
        {[{cx:0,cy:0,s:0,e:90},{cx:1440,cy:0,s:90,e:180},{cx:1440,cy:900,s:180,e:270},{cx:0,cy:900,s:270,e:360}].map(({cx,cy,s,e},idx)=>(
          <g key={`cf-${idx}`}>
            {[55,90,125,160,195,230].map((r,i)=><path key={i} d={`M${cx+Math.cos(s*Math.PI/180)*r},${cy+Math.sin(s*Math.PI/180)*r} A${r},${r} 0 0 1 ${cx+Math.cos(e*Math.PI/180)*r},${cy+Math.sin(e*Math.PI/180)*r}`} fill="none" stroke="#FBEAD6" strokeWidth="0.55" strokeOpacity={0.18+i*0.04} style={{animation:`lacePulse ${3.5+i*0.5}s ease-in-out infinite ${i*0.3}s`}}/>)}
            {Array.from({length:15}).map((_,j)=>{const a=(s+(e-s)/14*j)*Math.PI/180;return <line key={j} x1={cx+Math.cos(a)*30} y1={cy+Math.sin(a)*30} x2={cx+Math.cos(a)*230} y2={cy+Math.sin(a)*230} stroke="#FBEAD6" strokeWidth="0.35" strokeOpacity="0.16"/>})}
            {[55,90,125,160,195,230].map((r,i)=>Array.from({length:7}).map((_,j)=>{const a=(s+(e-s)/6*j)*Math.PI/180;return <circle key={`fd-${i}-${j}`} cx={cx+Math.cos(a)*r} cy={cy+Math.sin(a)*r} r="1.2" fill="#FBEAD6" fillOpacity="0.30"/>}))}
          </g>
        ))}
        <rect x="18" y="18" width="1404" height="864" rx="4" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.18" strokeDasharray="6 10"/>
        <rect x="10" y="10" width="1420" height="880" rx="6" fill="none" stroke="#FBEAD6" strokeWidth="0.4" strokeOpacity="0.12" strokeDasharray="2 8"/>
        {[
          {cx:330,cy:200},{cx:1110,cy:200},{cx:720,cy:140},
          {cx:200,cy:490},{cx:1240,cy:490},
          {cx:330,cy:700},{cx:1110,cy:700},{cx:720,cy:760},
          {cx:560,cy:330},{cx:880,cy:330},
          {cx:560,cy:580},{cx:880,cy:580},
        ].map(({cx,cy},i)=>(
          <g key={`ld-${i}`} transform={`translate(${cx},${cy})`} style={{animation:`lacePulse ${4+i*0.2}s ease-in-out infinite ${i*0.4}s`}}>
            <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" fill="none" stroke="#FBEAD6" strokeWidth="0.5" strokeOpacity="0.28"/>
            <rect x="-9" y="-9" width="18" height="18" transform="rotate(45)" fill="none" stroke="#FBEAD6" strokeWidth="0.35" strokeOpacity="0.18"/>
            <circle r="1.3" fill="#FBEAD6" fillOpacity="0.35"/>
          </g>
        ))}
      </svg>

      {/* FORM */}
      <div className="relative z-10 w-full flex justify-center" style={{ animation:'formIn 0.9s cubic-bezier(.4,0,.2,1) forwards 0.2s', opacity:0 }}>
        <form onSubmit={handleSubmit}
          className="relative w-full max-w-[370px] bg-[#FBEAD6]/92 backdrop-blur-xl border border-[#FBEAD6]/25 rounded-2xl px-5 py-5 sm:px-7 sm:py-6 shadow-[0_32px_90px_rgba(10,18,6,0.55)]">

          <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/12 pointer-events-none"/>
          <div className="absolute inset-[5px] rounded-xl border border-[#C87D87]/8 pointer-events-none"/>

          {/* Header */}
          <div className="text-center mb-5">
            <Link href="/"
              className="font-['Playfair_Display',serif] italic text-xl sm:text-2xl text-[#C87D87] tracking-widest block mb-2 hover:text-[#a85e6a] transition-colors duration-300">
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
            <h2 className="font-['Playfair_Display',serif] italic text-xl sm:text-2xl text-[#5a6347] leading-tight">
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
                className="w-full px-3.5 py-2.5 sm:py-2 bg-white/55 border border-[#C87D87]/18 focus:border-[#C87D87]/50 focus:bg-white/70 focus:outline-none rounded-lg font-['Cormorant_Garamond',serif] italic text-base sm:text-sm text-[#3a3027] placeholder:text-[#7a6a5a]/35 transition-all duration-300 group-hover:border-[#C87D87]/28"
              />
              <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"/>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || !!message}
            className="w-full mt-4 relative overflow-hidden font-['Cormorant_Garamond',serif] text-sm tracking-[0.28em] uppercase text-white border-0 py-3 sm:py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 group bg-[#6B7556] hover:bg-[#5a6347] min-h-[44px]">
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