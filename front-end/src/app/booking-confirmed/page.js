'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function BookingConfirmed() {
  const searchParams = useSearchParams();
  const bookingId    = searchParams.get('bookingId');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`${API}/api/bookings/${bookingId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => setBooking(d))
      .catch(() => {});
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-[#FBEAD6] flex items-center justify-center px-6">

      <style>{`
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes pulse-ring {
          0%   { transform:scale(1);   opacity:.6; }
          100% { transform:scale(1.5); opacity:0;  }
        }
        .fade-up { animation: fadeInUp .5s ease both; }
      `}</style>

      {/* Dot bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #3a3027 1px, transparent 0)',
          backgroundSize:  '22px 22px',
        }}/>

      <div className="w-full max-w-md text-center">

        {/* Icon */}
        <div className="relative w-20 h-20 mx-auto mb-8 fade-up" style={{ animationDelay:'.05s' }}>
          <div className="absolute inset-0 rounded-full bg-[#6B7556]/15 animate-[pulse-ring_2s_ease-out_infinite]"/>
          <div className="absolute inset-0 rounded-full bg-[#6B7556]/10 animate-[pulse-ring_2s_ease-out_.4s_infinite]"/>
          <div className="relative w-full h-full rounded-full bg-[#6B7556]/18 border border-[#6B7556]/25 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#6B7556]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="fade-up" style={{ animationDelay:'.12s' }}>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/60 text-[0.58rem] tracking-[0.4em] uppercase mb-2">
            ✦ Request Received ✦
          </p>
          <h1 className="font-['Playfair_Display',serif] italic text-[clamp(2rem,5vw,3rem)] text-[#3a3027] leading-tight mb-2">
            We'll be in touch<span className="text-[#C87D87]">.</span>
          </h1>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/60 text-base leading-relaxed">
            Your booking request has been received and is awaiting confirmation from our team.
            You'll be notified once it's approved.
          </p>
        </div>

        {/* Booking summary */}
        {booking && (
          <div className="fade-up mt-8 bg-white/55 border border-[#C87D87]/14 rounded-2xl overflow-hidden"
            style={{ animationDelay:'.2s' }}>
            <div className="h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent"/>
            <div className="px-6 py-5 space-y-3">
              {[
                { l: 'Activity', v: booking.activity },
                { l: 'Date',     v: booking.date
                    ? new Date(booking.date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })
                    : '—' },
                { l: 'Time',     v: booking.timeSlot || '—' },
                { l: 'Guests',   v: `${booking.participants} people` },
              ].map(({ l, v }) => (
                <div key={l} className="flex justify-between items-center">
                  <span className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase text-[#7a6a5a]/45">{l}</span>
                  <span className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027]">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 py-2.5 px-3 bg-amber-50/80 border border-amber-200/60 rounded-xl">
                <span className="text-amber-500 text-sm">◎</span>
                <p className="font-['Cormorant_Garamond',serif] italic text-xs text-amber-700/80">
                  Status: Awaiting admin confirmation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* What happens next */}
        <div className="fade-up mt-6 text-left space-y-3" style={{ animationDelay:'.28s' }}>
          {[
            { icon:'◎', step:'Admin reviews your request',           sub:'Usually within a few hours'                     },
            { icon:'◈', step:'You receive a confirmation notification', sub:'Check your profile notifications'              },
            { icon:'◇', step:'Proceed to payment',                   sub:'A payment link will appear in your booking'      },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 bg-white/40 border border-[#C87D87]/10 rounded-xl">
              <span className="text-[#C87D87]/50 text-base mt-0.5 flex-shrink-0">{s.icon}</span>
              <div>
                <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold">{s.step}</p>
                <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/50">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="fade-up mt-8 flex gap-3" style={{ animationDelay:'.35s' }}>
          <Link href="/"
            className="flex-1 font-['Cormorant_Garamond',serif] text-xs tracking-widest uppercase px-6 py-3.5 rounded-2xl border border-[#3a3027]/12 text-[#7a6a5a]/60 hover:bg-[#3a3027]/5 transition-all text-center">
            Back to Home
          </Link>
          <Link href="/account"
            className="flex-1 font-['Cormorant_Garamond',serif] text-xs tracking-[0.22em] uppercase text-[#FBEAD6] py-3.5 rounded-2xl transition-all text-center"
            style={{
              background: 'linear-gradient(135deg,#C87D87,#b36d77)',
              boxShadow:  '0 8px 24px rgba(200,125,135,0.3)',
            }}>
            View My Bookings
          </Link>
        </div>

      </div>
    </div>
  );
}
