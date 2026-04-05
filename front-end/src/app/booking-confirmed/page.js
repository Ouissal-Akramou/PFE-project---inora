'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

const CROSSHATCH_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cline x1='0' y1='1' x2='18' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='0' x2='1' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='1' x2='62' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='0' x2='79' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='0' y1='79' x2='18' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='80' x2='1' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='79' x2='62' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='80' x2='79' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Crect x='2' y='2' width='3.5' height='3.5' transform='rotate(45 3.75 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='2' width='3.5' height='3.5' transform='rotate(45 75.25 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='2' y='73.5' width='3.5' height='3.5' transform='rotate(45 3.75 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='73.5' width='3.5' height='3.5' transform='rotate(45 75.25 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Ccircle cx='3.75' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='3.75' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Cline x1='8' y1='1' x2='8' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='12' y1='1' x2='12' y2='3' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='16' y1='1' x2='16' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='64' y1='1' x2='64' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='68' y1='1' x2='68' y2='3' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='72' y1='1' x2='72' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='8' x2='4' y2='8' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='12' x2='3' y2='12' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='16' x2='4' y2='16' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='64' x2='4' y2='64' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='68' x2='3' y2='68' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='72' x2='4' y2='72' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3C/svg%3E")`;

const SETTINGS_MAP = {
  wildflowers: 'Wild Flowers',
  candlelight: 'Candlelight Only',
  minimal: 'Clean & Minimal',
};

function getPricing(participants) {
  if (participants <= 2) return { rate: 150, label: null };
  if (participants <= 6) return { rate: 120, label: 'small group rate' };
  return { rate: 100, label: 'large group rate' };
}

function BookingConfirmedContent() {
  const searchParams = useSearchParams();
  const bookingId    = searchParams.get('bookingId');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    
    // ✅ Jib token mn localStorage
    const token = localStorage.getItem('token');
    
    fetch(`${API}/api/bookings/${bookingId}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(r => {
        if (r.status === 401) {
          // Token expired, redirect l login
          window.location.href = '/login?expired=true';
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then(d => {
        setBooking(d);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [bookingId]);

  const pricing  = booking ? getPricing(booking.participants ?? 1) : null;
  const total    = booking ? (booking.participants ?? 1) * (pricing?.rate ?? 150) : null;
  const savedAmt = booking && pricing?.label
    ? (booking.participants ?? 1) * (150 - pricing.rate)
    : 0;

  // Ila loading o ma3ndekch booking, tban loading spinner
  if (loading && !booking) {
    return (
      <div className="min-h-screen bg-[#FBEAD6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border border-[#C87D87]/20"/>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C87D87] animate-spin"/>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/50 tracking-[0.35em] text-xs uppercase">
            Loading your booking...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: '#FBEAD6', backgroundImage: CROSSHATCH_SVG }}>
      <style>{`
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lacePulse  { 0%,100%{opacity:.45} 50%{opacity:1} }
        @keyframes laceRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .fade-up { animation: fadeInUp .45s cubic-bezier(.4,0,.2,1) both; }
      `}</style>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 px-3 sm:px-5 py-3 flex items-center justify-between"
        style={{ backgroundColor: '#6B7556', boxShadow: '0 2px 20px rgba(40,50,30,0.18)' }}>
        <Link href="/" className="font-['Cormorant_Garamond',serif] italic text-[0.7rem] sm:text-[0.85rem]
          text-[rgba(251,234,214,0.60)] hover:text-[#FBEAD6] transition-colors group flex items-center gap-1 sm:gap-1.5">
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:-translate-x-0.5 transition-transform"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          <span className="hidden xs:inline">Home</span>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="font-['Playfair_Display',serif] italic text-[#FBEAD6] text-[0.9rem] sm:text-[1.1rem]">Inora</span>
        </div>
        <Link href="/account#bookings"
          className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] sm:text-[0.78rem] tracking-[0.14em] uppercase
            text-[rgba(251,234,214,0.55)] hover:text-[#FBEAD6] transition-colors">
          My Bookings →
        </Link>
      </header>

      {/* ── Main full-width layout ── */}
      <main className="w-full px-4 sm:px-6 md:px-10 pb-16 relative z-10 pt-6 sm:pt-8">

        {/* Top hero row - responsive stack */}
        <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto] gap-4 sm:gap-8 items-start mb-6 sm:mb-8 fade-up">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64"
                style={{ animation: 'laceRotate 10s linear infinite' }}>
                <circle cx="32" cy="32" r="30" fill="none" stroke="#6B7556"
                  strokeWidth="0.6" strokeOpacity="0.30" strokeDasharray="3 6"/>
              </svg>
              <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(107,117,86,0.12)', border: '1px solid rgba(107,117,86,0.30)' }}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{ animation: 'lacePulse 2.5s ease-in-out infinite' }}
                  fill="none" viewBox="0 0 24 24" stroke="#6B7556" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/75
                text-[0.7rem] sm:text-[0.82rem] tracking-[0.28em] uppercase mb-1">✦ Request Received ✦</p>
              <h1 className="font-['Playfair_Display',serif] italic text-[2rem] sm:text-[3rem] text-[#3a3027] leading-none">
                We'll be in touch<span className="text-[#C87D87]">.</span>
              </h1>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#5a4a3a]/80 text-[0.9rem] sm:text-[1.1rem] mt-1 sm:mt-2">
                Your booking request has been received.
              </p>
            </div>
          </div>
          {booking && (
            <div className="text-left sm:text-right fade-up flex-shrink-0">
              <p className="font-['Cormorant_Garamond',serif] text-[0.65rem] sm:text-[0.72rem] uppercase tracking-[0.2em]
                font-semibold mb-1" style={{ color: 'rgba(90,74,58,0.70)' }}>Reference</p>
              <p className="font-['Playfair_Display',serif] italic text-[1.8rem] text-[#3a3027]">
                #{String(booking.id).padStart(5,'0')}
              </p>
              <span className="inline-block mt-1 font-['Cormorant_Garamond',serif] italic
                text-[0.65rem] sm:text-[0.72rem] tracking-[0.12em] uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full"
                style={{ background:'rgba(209,153,0,0.10)', border:'1px solid rgba(209,153,0,0.25)',
                  color:'rgba(160,118,0,0.85)' }}>
                ◎ Pending confirmation
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6 sm:mb-7 fade-up">
          <div className="flex-1 h-px bg-[#3a3027]/6"/>
          <svg width="8" height="8" viewBox="0 0 8 8">
            <rect x="1" y="1" width="6" height="6" transform="rotate(45 4 4)"
              fill="none" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.38"/>
          </svg>
          <div className="flex-1 h-px bg-[#3a3027]/6"/>
        </div>

        {/* Two-column: summary | steps - responsive stack */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1.1fr_0.9fr] gap-5 mb-6 fade-up">

          {/* Booking summary card */}
          <div className="rounded-2xl overflow-hidden order-2 lg:order-1"
            style={{ background:'rgba(255,255,255,0.60)', border:'1px solid rgba(58,48,39,0.08)',
              boxShadow:'0 1px 8px rgba(58,48,39,0.04)' }}>
            <div className="px-4 sm:px-5 py-3"
              style={{ background:'rgba(255,255,255,0.40)', borderBottom:'1px solid rgba(58,48,39,0.06)' }}>
              <p className="font-['Cormorant_Garamond',serif] text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.22em]
                font-semibold" style={{ color:'rgba(90,74,58,0.85)' }}>Booking Summary</p>
            </div>
            {booking ? (
              <>
                {[
                  { l:'Activity', v: booking.activity || '—' },
                  { l:'Date',     v: booking.date ? new Date(booking.date).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : '—' },
                  { l:'Time',     v: booking.timeSlot || '—' },
                  { l:'Guests',   v: `${booking.participants ?? 1} ${(booking.participants??1)===1?'person':'people'}` },
                  { l:'Setting',  v: SETTINGS_MAP[booking.setting] || booking.setting || '—' },
                ].map(({ l, v }, idx, arr) => (
                  <div key={l} className="flex justify-between items-baseline px-4 sm:px-5 py-2 sm:py-2.5"
                    style={{ borderBottom: idx < arr.length-1 ? '1px solid rgba(58,48,39,0.05)' : 'none' }}>
                    <span className="font-['Cormorant_Garamond',serif] text-[0.65rem] sm:text-[0.72rem] uppercase
                      tracking-[0.14em] flex-shrink-0 mr-2 sm:mr-3 font-semibold"
                      style={{ color:'rgba(90,74,58,0.75)' }}>{l}</span>
                    <span className="font-['Cormorant_Garamond',serif] italic text-[0.9rem] sm:text-[1.05rem] text-right break-words max-w-[60%]"
                      style={{ color:'rgba(58,48,39,0.95)' }}>{v}</span>
                  </div>
                ))}
                {/* price row */}
                <div className="px-4 sm:px-5 py-3 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
                  style={{ background:'linear-gradient(135deg,rgba(107,117,86,0.08),rgba(107,117,86,0.03))',
                    borderTop:'1px solid rgba(107,117,86,0.10)' }}>
                  <div>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.65rem] sm:text-[0.72rem] uppercase
                      tracking-[0.14em] font-semibold" style={{ color:'rgba(90,74,58,0.80)' }}>
                      Estimated Total</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.85rem] sm:text-[0.92rem] mt-0.5"
                      style={{ color:'rgba(90,74,58,0.80)' }}>
                      {booking.participants ?? 1} × {pricing?.rate} MAD/person
                      {pricing?.label && <span className="ml-1 text-[#6B7556]/80 block sm:inline sm:ml-1.5">· {pricing.label}</span>}
                    </p>
                    {savedAmt > 0 && (
                      <p className="font-['Cormorant_Garamond',serif] italic text-[0.75rem] sm:text-[0.85rem] mt-0.5"
                        style={{ color:'#6B7556' }}>✦ You save {savedAmt} MAD</p>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    {savedAmt > 0 && (
                      <p className="font-['Cormorant_Garamond',serif] italic text-[0.7rem] sm:text-[0.8rem] line-through mb-0.5"
                        style={{ color:'rgba(90,74,58,0.35)' }}>
                        {(booking.participants ?? 1) * 150} MAD</p>
                    )}
                    <p className="font-['Playfair_Display',serif] italic text-[1.8rem] sm:text-[2.2rem] leading-none"
                      style={{ color:'#6B7556' }}>{total}</p>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-[0.68rem] tracking-widest uppercase mt-0.5"
                      style={{ color:'rgba(107,117,86,0.75)' }}>MAD</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 sm:p-5 space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-[#3a3027]/6 animate-pulse"/>
                    <div className="h-3 w-28 rounded bg-[#3a3027]/6 animate-pulse"/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3 order-1 lg:order-2">
            <p className="font-['Cormorant_Garamond',serif] text-[0.65rem] sm:text-[0.72rem] uppercase tracking-[0.22em]
              font-semibold px-0.5" style={{ color:'rgba(90,74,58,0.70)' }}>What happens next</p>
            {[
              { icon:'◎', step:'Admin reviews your request',             sub:'Usually within a few hours' },
              { icon:'◈', step:'You receive a confirmation notification', sub:'Check your profile notifications' },
              { icon:'◇', step:'Proceed to payment',                     sub:'A payment link appears in your bookings' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-2xl flex-1"
                style={{ background:'rgba(255,255,255,0.55)', border:'1px solid rgba(58,48,39,0.08)',
                  boxShadow:'0 1px 6px rgba(58,48,39,0.04)' }}>
                <span className="text-[#C87D87]/50 text-sm sm:text-base mt-0.5 flex-shrink-0">{s.icon}</span>
                <div className="flex-1">
                  <p className="font-['Playfair_Display',serif] italic text-[0.9rem] sm:text-[1.05rem] text-[#3a3027] leading-snug">
                    {s.step}</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.75rem] sm:text-[0.88rem] text-[#7a6a5a]/70 mt-0.5">
                    {s.sub}</p>
                </div>
                <span className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] sm:text-[0.68rem] text-[#C87D87]/45 flex-shrink-0">
                  0{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA row - responsive stack ── */}
        <div className="flex flex-col sm:flex-row gap-2.5 fade-up">
          <Link href="/"
            className="order-3 sm:order-1 font-['Cormorant_Garamond',serif] text-[0.85rem] sm:text-[0.90rem] tracking-[0.16em] uppercase
              px-4 sm:px-7 py-3 sm:py-3.5 rounded-xl border border-[#3a3027]/10 text-[#7a6a5a]/75
              hover:text-[#7a6a5a]/90 hover:bg-white/40 transition-all text-center">
            ← Back to Home
          </Link>

          <Link href="/account#bookings"
            className="order-1 sm:order-2 flex-1 relative overflow-hidden group font-['Cormorant_Garamond',serif]
              text-[0.85rem] sm:text-[0.90rem] tracking-[0.24em] uppercase text-[#FBEAD6] py-3 sm:py-3.5 rounded-xl
              transition-all text-center"
            style={{ background:'linear-gradient(135deg,#C87D87 0%,#b36d77 50%,#C87D87 100%)',
              boxShadow:'0 5px 20px rgba(200,125,135,0.28)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent
              -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"/>
            <span className="opacity-40 text-[0.45rem] sm:text-[0.5rem]">◆</span> View My Bookings <span className="opacity-40 text-[0.45rem] sm:text-[0.5rem]">◆</span>
          </Link>

          <Link href="/book"
            className="order-2 sm:order-3 font-['Cormorant_Garamond',serif] text-[0.85rem] sm:text-[0.90rem] tracking-[0.16em] uppercase
              px-4 sm:px-7 py-3 sm:py-3.5 rounded-xl border border-[#6B7556]/20 text-[#6B7556]/80
              hover:text-[#6B7556] hover:bg-[#6B7556]/5 transition-all text-center">
            Book Again →
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function BookingConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FBEAD6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border border-[#C87D87]/20"/>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C87D87] animate-spin"/>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/50 tracking-[0.35em] text-xs uppercase">
            Loading...
          </p>
        </div>
      </div>
    }>
      <BookingConfirmedContent />
    </Suspense>
  );
}