'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

const ACTIVITIES = [
  { id: 'crochet-circle',   title: 'Crochet Circle',   desc: 'A slow, meditative craft that brings warmth to any setting.',    img: '/crochet.jpeg', icon: '◎' },
  { id: 'painting-session', title: 'Painting Session', desc: 'Express freely on canvas surrounded by curated ambience.',        img: '/peinture.jpeg', icon: '◈' },
  { id: 'pottery-workshop', title: 'Pottery Workshop', desc: 'Shape and sculpt in an intimate setting.',                        img: '/potterie.jpeg', icon: '◇' },
];
const TIME_SLOTS = [
  { id: 'morning',   label: 'Morning',   hours: '09:30 – 12:30', icon: '◎', sub: 'Soft light & fresh starts' },
  { id: 'afternoon', label: 'Afternoon', hours: '14:30 – 17:30', icon: '◈', sub: 'Golden hour creativity'    },
  { id: 'evening',   label: 'Evening',   hours: '19:30 – 22:30', icon: '◇', sub: 'Candlelit & intimate'      },
];

const SETTINGS = [
  { key: 'wildflowers',      label: 'Wild Flowers',     desc: 'Fresh stems & scattered petals', icon: '✿' },
  { key: 'candlelight',      label: 'Candlelight Only', desc: 'Warm glow, no harsh lighting',   icon: '◍' },
  { key: 'minimal',          label: 'Clean & Minimal',  desc: 'Neutral tones, no fuss',         icon: '❦' },
];

const CONTACT_PREFS = ['telephone', 'email', 'whatsapp'];

// Minimum and maximum participants for group gatherings
const MIN_PARTICIPANTS = 2;
const MAX_PARTICIPANTS = 12;

const EMPTY_FORM = {
  activity: '', participants: MIN_PARTICIPANTS, date: '', timeSlot: '', setting: '',
  location: '', fullName: '', email: '', phone: '', allergies: '',
  specialRequests: '', additionalNotes: '', preferredContact: 'telephone', activityTheme: '',
};

const STEPS = ['Activity', 'Details', 'Preferences', 'Review'];

const CROSSHATCH_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cline x1='0' y1='1' x2='18' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='0' x2='1' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='1' x2='62' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='0' x2='79' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='0' y1='79' x2='18' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='80' x2='1' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='79' x2='62' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='80' x2='79' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Crect x='2' y='2' width='3.5' height='3.5' transform='rotate(45 3.75 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='2' width='3.5' height='3.5' transform='rotate(45 75.25 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='2' y='73.5' width='3.5' height='3.5' transform='rotate(45 3.75 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='73.5' width='3.5' height='3.5' transform='rotate(45 75.25 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Ccircle cx='3.75' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='3.75' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3C/svg%3E")`;

// ─── Pricing helper ────────────────────────────────────────────────
function getPricing(participants) {
  if (participants < MIN_PARTICIPANTS) return { rate: 150, label: null, error: true };
  if (participants <= 2) return { rate: 150, label: null, error: false };
  if (participants <= 6) return { rate: 120, label: 'small group rate', error: false };
  return { rate: 100, label: 'large group rate', error: false };
}

// ─── Draft hook ────────────────────────────────────────────────────
function useDraft() {
  const [draftId, setDraftId]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timer = useRef(null);

  const loadDraft = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/drafts`, { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.id) { setDraftId(data.id); return data.formData || null; }
    } catch {}
    return null;
  }, []);

  const saveDraft = useCallback((formData) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const res = await fetch(`${API}/api/drafts`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.id) { setDraftId(data.id); setLastSaved(new Date()); }
      } finally { setSaving(false); }
    }, 1200);
  }, []);

  const submitBooking = useCallback(async (bookingId) => {
    const res = await fetch(`${API}/api/bookings/${bookingId}/submit`, {
      method: 'PATCH', credentials: 'include',
    });
    if (!res.ok) throw new Error('Submit failed');
    return res.json();
  }, []);

  const deleteDraft = useCallback(async (id) => {
    if (!id) return;
    await fetch(`${API}/api/drafts/${id}`, { method: 'DELETE', credentials: 'include' });
  }, []);

  return { draftId, saving, lastSaved, loadDraft, saveDraft, submitBooking, deleteDraft };
}

// ─── Shared styles ─────────────────────────────────────────────────
const inputCls = `w-full font-['Cormorant_Garamond',serif] italic text-[#3a3027] text-[0.95rem] sm:text-[1rem]
  bg-white/65 border border-[#3a3027]/12 rounded-xl px-4 py-2.5
  outline-none focus:border-[#C87D87]/45 focus:bg-white/90
  focus:shadow-[0_0_0_3px_rgba(200,125,135,0.06)] transition-all duration-200`;

function Label({ children, className = '' }) {
  return (
    <p className={`font-['Cormorant_Garamond',serif] text-[0.65rem] sm:text-[0.72rem] uppercase tracking-[0.18em] text-[#4a3a2a]/65 mb-2 select-none font-semibold ${className}`}>
      {children}
    </p>
  );
}

function StepNav({ onBack, onNext, nextDisabled, nextLabel = 'Continue →' }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 mt-7 pt-5 border-t border-[#3a3027]/6">
      {onBack && (
        <button onClick={onBack}
          className="order-2 sm:order-1 font-['Cormorant_Garamond',serif] text-[0.75rem] sm:text-[0.82rem] tracking-[0.16em] uppercase px-4 sm:px-5 py-3
            rounded-xl border border-[#3a3027]/10 text-[#7a6a5a]/65
            hover:border-[#3a3027]/18 hover:text-[#7a6a5a]/90 hover:bg-white/40 transition-all duration-200">
          ← Back
        </button>
      )}
      <button onClick={onNext} disabled={nextDisabled}
        className={`flex-1 order-1 sm:order-2 font-['Cormorant_Garamond',serif] text-[0.75rem] sm:text-[0.82rem] tracking-[0.24em] uppercase
          text-[#FBEAD6] py-3 rounded-xl transition-all duration-300
          disabled:opacity-25 disabled:cursor-not-allowed`}
        style={{
          background: nextDisabled ? '#9aaa88' : 'linear-gradient(135deg,#6B7556 0%,#4a5240 100%)',
          boxShadow: nextDisabled ? 'none' : '0 5px 18px rgba(107,117,86,0.26)',
        }}>
        {nextLabel}
      </button>
    </div>
  );
}

// ─── Loading screen ───────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg,#4e5a3c 0%,#6B7556 45%,#5a6347 80%,#4a5535 100%)' }}>
      <style>{`
        @keyframes lacePulse  { 0%,100%{opacity:.45} 50%{opacity:1} }
        @keyframes laceRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes laceCounter{ from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes floatOrb   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      `}</style>
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(251,234,214,0.10) 0%,transparent 70%)', animation:'floatOrb 10s ease-in-out infinite', filter:'blur(18px)' }}/>
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(200,125,135,0.12) 0%,transparent 70%)', animation:'floatOrb 13s ease-in-out infinite 2s', filter:'blur(22px)' }}/>
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96" style={{animation:'laceRotate 8s linear infinite'}}>
            <circle cx="48" cy="48" r="44" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.35" strokeDasharray="3 5"/>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>{const r=a*Math.PI/180;return(<g key={i}><line x1={48+Math.cos(r)*20} y1={48+Math.sin(r)*20} x2={48+Math.cos(r)*44} y2={48+Math.sin(r)*44} stroke="#FBEAD6" strokeWidth="0.5" strokeOpacity="0.28"/><circle cx={48+Math.cos(r)*44} cy={48+Math.sin(r)*44} r="1.2" fill="#FBEAD6" fillOpacity="0.45"/></g>);})}
          </svg>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96" style={{animation:'laceCounter 6s linear infinite'}}>
            <circle cx="48" cy="48" r="30" fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.38"/>
            {[0,45,90,135,180,225,270,315].map((a,i)=>{const r=a*Math.PI/180;return(<g key={i}><circle cx={48+Math.cos(r)*30} cy={48+Math.sin(r)*30} r="2" fill="none" stroke="#FBEAD6" strokeWidth="0.5" strokeOpacity="0.50"/><line x1={48+Math.cos(r)*30} y1={48+Math.sin(r)*30} x2={48+Math.cos(r)*20} y2={48+Math.sin(r)*20} stroke="#FBEAD6" strokeWidth="0.4" strokeOpacity="0.28"/></g>);})}
          </svg>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96" style={{animation:'lacePulse 2s ease-in-out infinite'}}>
            <circle cx="48" cy="48" r="14" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.42"/>
            <rect x="43" y="43" width="10" height="10" transform="rotate(45 48 48)" fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.62"/>
            <circle cx="48" cy="48" r="2.5" fill="#FBEAD6" fillOpacity="0.52"/>
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-['Playfair_Display',serif] italic text-[#FBEAD6]/75 text-xl">Inora</p>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/40 text-[0.7rem] tracking-[0.4em] uppercase">Preparing your space…</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────
export default function BookPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const preselectedActivity = searchParams.get('activity') || '';

  const [form,        setForm]        = useState({ ...EMPTY_FORM, activity: preselectedActivity, participants: MIN_PARTICIPANTS });
  const [step,        setStep]        = useState(preselectedActivity ? 1 : 0);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const { draftId, saving, lastSaved, loadDraft, saveDraft, submitBooking, deleteDraft } = useDraft();

  useEffect(() => { if (!loading && !user) router.push('/sign-up'); }, [user, loading, router]);

  // ── Auto-fill from auth + merge draft ──────────────────────────
  useEffect(() => {
    if (!user) return;

    const userDefaults = {
      fullName: user.name || user.fullName || '',
      email:    user.email || '',
      phone:    user.phone || user.phoneNumber || '',
    };

    loadDraft().then(saved => {
      if (saved) {
        setForm({
          ...EMPTY_FORM,
          ...userDefaults,
          ...saved,
          participants: saved.participants || MIN_PARTICIPANTS,
          fullName: saved.fullName || userDefaults.fullName,
          email:    saved.email    || userDefaults.email,
          phone:    saved.phone    || userDefaults.phone,
          activity: preselectedActivity || saved.activity || '',
        });
        if (!preselectedActivity && saved.activity) setStep(1);
      } else {
        setForm({ ...EMPTY_FORM, ...userDefaults, activity: preselectedActivity, participants: MIN_PARTICIPANTS });
      }
      setDraftLoaded(true);
    });
  }, [user]);

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    saveDraft(updated);
  };

  const handleSubmit = async () => {
    if (form.participants < MIN_PARTICIPANTS) {
      setError(`At least ${MIN_PARTICIPANTS} participants are required for a gathering.`);
      return;
    }
    
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isDraft: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Booking failed');
      const booking = data.booking ?? data;
      if (!booking?.id) throw new Error('No booking ID returned from server');
      await submitBooking(booking.id);
      await deleteDraft(draftId);
      router.push(`/booking-confirmed?bookingId=${booking.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !draftLoaded) return <LoadingScreen />;
  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: '#FBEAD6', backgroundImage: CROSSHATCH_SVG }}>

      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .step-enter { animation: fadeInUp .3s cubic-bezier(.4,0,.2,1) both; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.35; cursor: pointer; }
        input::placeholder, textarea::placeholder { color: rgba(58,48,39,0.30); font-style: italic; }
      `}</style>

      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C87D87]/30 to-transparent z-50"/>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 px-3 sm:px-5 py-3 flex items-center justify-between"
        style={{
          backgroundColor: '#6B7556',
          boxShadow: '0 2px 20px rgba(40,50,30,0.18)',
          borderBottom: '1px solid rgba(251,234,214,0.10)',
        }}>

        <Link href="/"
          className="group flex items-center gap-1.5 font-['Cormorant_Garamond',serif] italic text-[0.75rem] sm:text-[0.85rem] text-[rgba(251,234,214,0.60)] hover:text-[#FBEAD6] transition-colors duration-200">
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          Back
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="font-['Playfair_Display',serif] italic text-[#FBEAD6] text-[1rem] sm:text-[1.1rem] leading-tight">Inora</span>
        </div>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-0.5 sm:gap-1">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  fontSize: '0.38rem', fontWeight: 700,
                  background: i < step ? 'rgba(251,234,214,0.20)' : i === step ? '#C87D87' : 'rgba(251,234,214,0.06)',
                  color: i <= step ? '#FBEAD6' : 'rgba(251,234,214,0.18)',
                  boxShadow: i === step ? '0 0 8px rgba(200,125,135,0.40)' : 'none',
                }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="font-['Cormorant_Garamond',serif] text-[0.45rem] sm:text-[0.54rem] tracking-[0.12em] uppercase hidden xs:inline-block"
                style={{ color: i === step ? 'rgba(251,234,214,0.75)' : 'rgba(251,234,214,0.22)' }}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="w-1.5 sm:w-2.5 h-px mx-0.5" style={{ background: 'rgba(251,234,214,0.10)' }}/>}
            </div>
          ))}
        </nav>
      </header>

      {/* ── Gap between header and content ── */}
      <div className="h-5" style={{ background: 'linear-gradient(to bottom, rgba(107,117,86,0.10), transparent)' }}/>

      {/* ── Main ── */}
      <main className="w-full px-3 sm:px-4 md:px-8 pb-16 relative z-10">

        {/* ══ STEP 0 — Activity ══ */}
        {step === 0 && (
          <div className="step-enter">
            <div className="flex items-start justify-between mb-6 sm:mb-8 px-1">
              <div className="flex-1">
                <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/60 text-[0.65rem] sm:text-[0.72rem] tracking-[0.38em] uppercase mb-2">Step 1 of 4</p>
                <h1 className="font-['Playfair_Display',serif] italic text-[1.8rem] sm:text-[2.4rem] text-[#3a3027] leading-none">
                  Choose your Activity<span className="text-[#C87D87]">.</span>
                </h1>
                <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/65 text-[0.85rem] sm:text-[1rem] mt-2">
                  Select the craft that will anchor your gathering.
                </p>
              </div>
              <span className="font-['Playfair_Display',serif] italic text-[3rem] sm:text-[5rem] text-[#C87D87]/8 leading-none select-none mt-1 hidden sm:block">01</span>
            </div>

            <div className="flex flex-col gap-3">
              {ACTIVITIES.map(a => (
                <button key={a.id}
                  onClick={() => { handleChange('activity', a.title); setStep(1); }}
                  className="group relative w-full flex items-center gap-3 sm:gap-5 px-3 sm:px-5 py-3 sm:py-4 rounded-2xl text-left transition-all duration-300"
                  style={{
                    background: form.activity === a.title ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.55)',
                    border: form.activity === a.title ? '1px solid rgba(200,125,135,0.35)' : '1px solid rgba(58,48,39,0.08)',
                    boxShadow: form.activity === a.title ? '0 4px 24px rgba(200,125,135,0.10)' : '0 1px 6px rgba(58,48,39,0.04)',
                  }}>
                  {form.activity === a.title && (
                    <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full"
                      style={{ background: 'linear-gradient(to bottom, rgba(200,125,135,0.60), #C87D87)' }}/>
                  )}
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={a.img} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['Playfair_Display',serif] italic text-[#3a3027] text-[0.95rem] sm:text-[1.15rem] leading-snug">{a.title}</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/60 text-[0.75rem] sm:text-[0.92rem] mt-0.5 hidden xs:block">{a.desc}</p>
                  </div>
                  <span className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] sm:text-[0.75rem] tracking-widest uppercase flex-shrink-0 transition-colors"
                    style={{ color: form.activity === a.title ? '#C87D87' : 'rgba(90,74,58,0.28)' }}>
                    {form.activity === a.title ? '✓' : '→'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ STEP 1 — Details ══ */}
        {step === 1 && (
          <div className="step-enter">
            <div className="flex items-start justify-between mb-6 sm:mb-8 px-1">
              <div className="flex-1">
                <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/60 text-[0.65rem] sm:text-[0.72rem] tracking-[0.38em] uppercase mb-2">Step 2 of 4</p>
                <h1 className="font-['Playfair_Display',serif] italic text-[1.8rem] sm:text-[2.4rem] text-[#3a3027] leading-none">
                  Booking Details<span className="text-[#C87D87]">.</span>
                </h1>
                <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/65 text-[0.85rem] sm:text-[1rem] mt-2">
                  When, how many, and where.
                </p>
              </div>
              <span className="font-['Playfair_Display',serif] italic text-[3rem] sm:text-[5rem] text-[#C87D87]/8 leading-none select-none mt-1 hidden sm:block">02</span>
            </div>

            {/* Activity pill */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-6 rounded-xl flex-wrap"
              style={{ background: 'rgba(107,117,86,0.09)', border: '1px solid rgba(107,117,86,0.18)' }}>
              <span className="text-[#6B7556] text-sm sm:text-base">{ACTIVITIES.find(a => a.title === form.activity)?.icon || '◈'}</span>
              <span className="font-['Cormorant_Garamond',serif] italic text-[#3a3027]/85 text-[0.85rem] sm:text-[1rem]">{form.activity}</span>
              <span className="w-px h-4" style={{ background: 'rgba(58,48,39,0.12)' }}/>
              <button onClick={() => setStep(0)}
                className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-[0.65rem] tracking-[0.2em] uppercase text-[#6B7556]/60 hover:text-[#6B7556] transition-colors">
                change
              </button>
            </div>

            <div className="space-y-5 sm:space-y-6">
              {/* Guests */}
              <div>
                <Label>Group Size</Label>
                <div className="flex items-center gap-2 sm:gap-3 mt-1">
                  <button type="button"
                    onClick={() => handleChange('participants', Math.max(MIN_PARTICIPANTS, form.participants - 1))}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#3a3027]/10 bg-white/70 flex items-center justify-center text-[#3a3027]/55 hover:border-[#C87D87]/40 hover:text-[#C87D87] transition-all text-base sm:text-lg leading-none">−</button>
                  <span className="font-['Playfair_Display',serif] italic text-[#3a3027] text-2xl sm:text-3xl w-6 sm:w-7 text-center leading-none">{form.participants}</span>
                  <button type="button"
                    onClick={() => handleChange('participants', Math.min(MAX_PARTICIPANTS, form.participants + 1))}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#3a3027]/10 bg-white/70 flex items-center justify-center text-[#3a3027]/55 hover:border-[#C87D87]/40 hover:text-[#C87D87] transition-all text-base sm:text-lg leading-none">+</button>
                  <span className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40 text-[0.65rem] sm:text-sm">min {MIN_PARTICIPANTS} · max {MAX_PARTICIPANTS}</span>
                </div>
                {form.participants < MIN_PARTICIPANTS && (
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.7rem] sm:text-[0.72rem] text-red-400 mt-2 flex items-center gap-1.5">
                    <span>⚠</span> At least {MIN_PARTICIPANTS} participants required for a gathering
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <Label>Preferred Date</Label>
                <input type="date" value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => handleChange('date', e.target.value)}
                  className={inputCls}/>
              </div>

              {/* Time slots - responsive grid */}
              <div>
                <Label>Preferred Time</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 mt-1">
                  {TIME_SLOTS.map(t => (
                    <button key={t.id} type="button"
                      onClick={() => handleChange('timeSlot', t.hours)}
                      className="flex flex-col gap-1 px-3 sm:px-3.5 py-2.5 sm:py-3.5 rounded-xl text-left transition-all duration-200"
                      style={{
                        background: form.timeSlot === t.hours ? 'rgba(200,125,135,0.09)' : 'rgba(255,255,255,0.55)',
                        border: form.timeSlot === t.hours ? '1px solid rgba(200,125,135,0.40)' : '1px solid rgba(58,48,39,0.08)',
                      }}>
                      <div className="flex items-center justify-between">
                        <span className="font-['Playfair_Display',serif] italic text-[0.9rem] sm:text-[1rem]"
                          style={{ color: form.timeSlot === t.hours ? '#C87D87' : '#3a3027' }}>{t.label}</span>
                        <span className="text-xs sm:text-sm" style={{ color: form.timeSlot === t.hours ? 'rgba(200,125,135,0.70)' : 'rgba(122,106,90,0.38)' }}>{t.icon}</span>
                      </div>
                      <span className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] sm:text-[0.72rem]"
                        style={{ color: form.timeSlot === t.hours ? 'rgba(200,125,135,0.70)' : 'rgba(122,106,90,0.55)' }}>{t.hours}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#3a3027]/6"/>
                <svg width="8" height="8" viewBox="0 0 8 8"><rect x="1" y="1" width="6" height="6" transform="rotate(45 4 4)" fill="none" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.38"/></svg>
                <div className="flex-1 h-px bg-[#3a3027]/6"/>
              </div>

              {/* Decoration + Location - responsive stack */}
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <Label>Decoration Style</Label>
                  <div className="flex flex-col gap-2 mt-1">
                    {SETTINGS.map(d => (
                      <button key={d.key} type="button"
                        onClick={() => handleChange('setting', d.key)}
                        className="flex items-start gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-left transition-all duration-200"
                        style={{
                          background: form.setting === d.key ? 'rgba(200,125,135,0.09)' : 'rgba(255,255,255,0.55)',
                          border: form.setting === d.key ? '1px solid rgba(200,125,135,0.38)' : '1px solid rgba(58,48,39,0.08)',
                        }}>
                        <span className="text-base sm:text-lg leading-none mt-0.5 flex-shrink-0"
                          style={{ color: form.setting === d.key ? '#C87D87' : 'rgba(122,106,90,0.60)' }}>{d.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-['Playfair_Display',serif] italic text-[0.85rem] sm:text-[0.95rem] leading-snug"
                            style={{ color: form.setting === d.key ? '#C87D87' : '#3a3027' }}>{d.label}</p>
                          <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] sm:text-[0.72rem] mt-0.5 hidden xs:block"
                            style={{ color: form.setting === d.key ? 'rgba(200,125,135,0.65)' : 'rgba(122,106,90,0.50)' }}>{d.desc}</p>
                        </div>
                        {form.setting === d.key && (
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#C87D87' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <Label>Gathering Location</Label>
                  <div className="relative mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none" style={{ color: 'rgba(200,125,135,0.45)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    <textarea rows={5} value={form.location}
                      placeholder={"Address, venue name,\nor description of the space…"}
                      onChange={e => handleChange('location', e.target.value)}
                      className={inputCls + ' pl-9 resize-none'}/>
                  </div>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] sm:text-[0.72rem] text-[#7a6a5a]/45 mt-1.5">
                    Your home, a rented space, café…
                  </p>
                </div>
              </div>
            </div>

            <StepNav 
              onBack={() => setStep(0)} 
              onNext={() => setStep(2)} 
              nextDisabled={!form.date || !form.timeSlot || !form.setting || form.participants < MIN_PARTICIPANTS}
            />
          </div>
        )}

        {/* ══ STEP 2 — Personal Info ══ */}
        {step === 2 && (
          <div className="step-enter">
            <div className="flex items-start justify-between mb-6 sm:mb-8 px-1">
              <div className="flex-1">
                <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/60 text-[0.65rem] sm:text-[0.72rem] tracking-[0.38em] uppercase mb-2">Step 3 of 4</p>
                <h1 className="font-['Playfair_Display',serif] italic text-[1.8rem] sm:text-[2.4rem] text-[#3a3027] leading-none">
                  Your Details<span className="text-[#C87D87]">.</span>
                </h1>
                <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/65 text-[0.85rem] sm:text-[1rem] mt-2">
                  So we can prepare everything perfectly.
                </p>
              </div>
              <span className="font-['Playfair_Display',serif] italic text-[3rem] sm:text-[5rem] text-[#C87D87]/8 leading-none select-none mt-1 hidden sm:block">03</span>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <Label>Full Name</Label>
                <div className="relative">
                  <input type="text" value={form.fullName} placeholder="Your full name"
                    onChange={e => handleChange('fullName', e.target.value)} className={inputCls}/>
                  {user?.name && form.fullName === (user.name || user.fullName) && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2
                      font-['Cormorant_Garamond',serif] italic text-[0.55rem] sm:text-[0.62rem] tracking-wide
                      text-[#6B7556]/45 pointer-events-none select-none hidden sm:block">
                      from account
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <input type="email" value={form.email} placeholder="you@example.com"
                      onChange={e => handleChange('email', e.target.value)} className={inputCls}/>
                    {user?.email && form.email === user.email && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2
                        font-['Cormorant_Garamond',serif] italic text-[0.55rem] sm:text-[0.62rem] tracking-wide
                        text-[#6B7556]/45 pointer-events-none select-none hidden sm:block">
                        from account
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Label>Phone</Label>
                  <input type="tel" value={form.phone} placeholder="+212 6XX XXX XXX"
                    onChange={e => handleChange('phone', e.target.value)} className={inputCls}/>
                </div>
              </div>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-[#3a3027]/6"/>
                <svg width="8" height="8" viewBox="0 0 8 8"><rect x="1" y="1" width="6" height="6" transform="rotate(45 4 4)" fill="none" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.38"/></svg>
                <div className="flex-1 h-px bg-[#3a3027]/6"/>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label>Allergies / Dietary</Label>
                  <input type="text" value={form.allergies} placeholder="None, gluten-free…"
                    onChange={e => handleChange('allergies', e.target.value)} className={inputCls}/>
                </div>
                <div className="flex-1">
                  <Label>Theme (optional)</Label>
                  <input type="text" value={form.activityTheme} placeholder="Birthday, Bachelorette…"
                    onChange={e => handleChange('activityTheme', e.target.value)} className={inputCls}/>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-[1.4]">
                  <Label>Special Requests</Label>
                  <textarea value={form.specialRequests} placeholder="Anything you'd like us to know…" rows={3}
                    onChange={e => handleChange('specialRequests', e.target.value)}
                    className={inputCls + ' resize-none'}/>
                </div>
                <div className="flex-1">
                  <Label>Preferred Contact</Label>
                  <div className="flex flex-row sm:flex-col gap-2 mt-0.5">
                    {CONTACT_PREFS.map(c => (
                      <button key={c} type="button"
                        onClick={() => handleChange('preferredContact', c)}
                        className="flex-1 sm:flex-none font-['Cormorant_Garamond',serif] italic text-[0.85rem] sm:text-[0.92rem] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl capitalize text-left transition-all"
                        style={{
                          background: form.preferredContact === c ? '#6B7556' : 'rgba(255,255,255,0.60)',
                          border: form.preferredContact === c ? '1px solid #6B7556' : '1px solid rgba(58,48,39,0.09)',
                          color: form.preferredContact === c ? '#FBEAD6' : '#5a4a3a',
                          boxShadow: form.preferredContact === c ? '0 2px 10px rgba(107,117,86,0.22)' : 'none',
                        }}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!form.fullName || !form.email || !form.phone}/>
          </div>
        )}

        {/* ══ STEP 3 — Review ══ */}
        {step === 3 && (
          <div className="step-enter">
            <div className="flex items-start justify-between mb-6 sm:mb-8 px-1">
              <div className="flex-1">
                <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/60 text-[0.65rem] sm:text-[0.72rem] tracking-[0.38em] uppercase mb-2">Step 4 of 4</p>
                <h1 className="font-['Playfair_Display',serif] italic text-[1.8rem] sm:text-[2.4rem] text-[#3a3027] leading-none">
                  Review & Confirm<span className="text-[#C87D87]">.</span>
                </h1>
                <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/65 text-[0.85rem] sm:text-[1rem] mt-2">
                  Everything look right? Let's make it official.
                </p>
              </div>
              <span className="font-['Playfair_Display',serif] italic text-[3rem] sm:text-[5rem] text-[#C87D87]/8 leading-none select-none mt-1 hidden sm:block">04</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-5">
              {/* Booking info */}
              <div className="flex-1 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(58,48,39,0.08)', boxShadow: '0 1px 8px rgba(58,48,39,0.04)' }}>
                <div className="px-4 sm:px-5 py-3" style={{ background: 'rgba(255,255,255,0.40)', borderBottom: '1px solid rgba(58,48,39,0.06)' }}>
                  <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.22em] font-semibold" style={{ color: 'rgba(90,74,58,0.60)' }}>Booking</p>
                </div>
                <div>
                  {[
                    { l: 'Activity',   v: form.activity },
                    { l: 'Group Size', v: `${form.participants} ${form.participants === 1 ? 'person' : 'people'}` },
                    { l: 'Date',       v: form.date ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—' },
                    { l: 'Time',       v: (() => { const t = TIME_SLOTS.find(t => t.hours === form.timeSlot); return t ? `${t.icon} ${t.label}` : '—'; })() },
                    { l: 'Decoration', v: (() => { const d = SETTINGS.find(d => d.key === form.setting); return d ? `${d.icon} ${d.label}` : '—'; })() },
                    { l: 'Location',   v: form.location?.substring(0, 50) + (form.location?.length > 50 ? '…' : '') || '—' },
                  ].map(({ l, v }, idx, arr) => (
                    <div key={l} className="flex justify-between items-baseline px-4 sm:px-5 py-2 sm:py-2.5"
                      style={{ borderBottom: idx < arr.length - 1 ? '1px solid rgba(58,48,39,0.05)' : 'none' }}>
                      <span className="font-['Cormorant_Garamond',serif] text-[0.55rem] sm:text-[0.63rem] uppercase tracking-[0.14em] flex-shrink-0 mr-2 font-semibold" style={{ color: 'rgba(90,74,58,0.50)' }}>{l}</span>
                      <span className="font-['Cormorant_Garamond',serif] italic text-[0.85rem] sm:text-[0.95rem] text-right" style={{ color: 'rgba(58,48,39,0.85)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact + Notes */}
              <div className="flex-1 flex flex-col gap-3">
                {[
                  { title: 'Contact', rows: [
                    { l: 'Name',  v: form.fullName },
                    { l: 'Email', v: form.email },
                    { l: 'Phone', v: form.phone },
                    { l: 'Via',   v: form.preferredContact },
                  ]},
                  { title: 'Notes', rows: [
                    { l: 'Allergies', v: form.allergies || '—' },
                    { l: 'Requests',  v: form.specialRequests?.substring(0, 50) + (form.specialRequests?.length > 50 ? '…' : '') || '—' },
                    { l: 'Theme',     v: form.activityTheme || '—' },
                  ]},
                ].map(({ title, rows }) => (
                  <div key={title} className="rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(58,48,39,0.08)', boxShadow: '0 1px 8px rgba(58,48,39,0.04)' }}>
                    <div className="px-4 sm:px-5 py-3" style={{ background: 'rgba(255,255,255,0.40)', borderBottom: '1px solid rgba(58,48,39,0.06)' }}>
                      <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.22em] font-semibold" style={{ color: 'rgba(90,74,58,0.60)' }}>{title}</p>
                    </div>
                    {rows.map(({ l, v }, idx) => (
                      <div key={l} className="flex justify-between items-baseline px-4 sm:px-5 py-2 sm:py-2.5"
                        style={{ borderBottom: idx < rows.length - 1 ? '1px solid rgba(58,48,39,0.05)' : 'none' }}>
                        <span className="font-['Cormorant_Garamond',serif] text-[0.55rem] sm:text-[0.62rem] uppercase tracking-[0.14em] flex-shrink-0 mr-2 font-semibold" style={{ color: 'rgba(90,74,58,0.48)' }}>{l}</span>
                        <span className="font-['Cormorant_Garamond',serif] italic text-[0.85rem] sm:text-[0.92rem] text-right truncate max-w-[65%]" style={{ color: 'rgba(58,48,39,0.82)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            {(() => {
              const { rate, label, error } = getPricing(form.participants);
              const total  = form.participants * rate;
              const saved  = form.participants > 2 ? form.participants * (150 - rate) : 0;
              
              if (error || form.participants < MIN_PARTICIPANTS) {
                return (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 mb-5 rounded-xl gap-3"
                    style={{ background: 'rgba(200,125,135,0.08)', border: '1px solid rgba(200,125,135,0.25)' }}>
                    <div>
                      <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-[0.65rem] tracking-[0.22em] uppercase font-semibold" style={{ color: '#C87D87' }}>
                        Invalid Group Size
                      </p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[0.85rem] sm:text-[0.9rem] mt-1" style={{ color: '#C87D87' }}>
                        Minimum {MIN_PARTICIPANTS} participants required for a gathering
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-['Playfair_Display',serif] italic text-[1.8rem] sm:text-[2rem] leading-none" style={{ color: '#C87D87' }}>—</p>
                    </div>
                  </div>
                );
              }
              
              return (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 mb-5 rounded-xl gap-3"
                  style={{ background: 'linear-gradient(135deg,rgba(107,117,86,0.09),rgba(107,117,86,0.05))', border: '1px solid rgba(107,117,86,0.14)' }}>
                  <div>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-[0.65rem] tracking-[0.22em] uppercase font-semibold" style={{ color: 'rgba(90,74,58,0.55)' }}>Estimated Total</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.85rem] sm:text-[0.9rem] mt-0.5" style={{ color: 'rgba(90,74,58,0.55)' }}>
                      {form.participants} × {rate} MAD per person
                    </p>
                    {label && (
                      <p className="font-['Cormorant_Garamond',serif] italic text-[0.7rem] sm:text-[0.75rem] mt-1 flex items-center gap-1.5 flex-wrap" style={{ color: '#6B7556' }}>
                        <span>✦</span>
                        <span>{label} applied · you save {saved} MAD</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {form.participants > 2 && (
                      <p className="font-['Cormorant_Garamond',serif] italic text-[0.75rem] sm:text-[0.8rem] line-through" style={{ color: 'rgba(90,74,58,0.30)' }}>
                        {form.participants * 150}
                      </p>
                    )}
                    <p className="font-['Playfair_Display',serif] italic text-[1.8rem] sm:text-[2rem] leading-none" style={{ color: '#6B7556' }}>{total}</p>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-[0.65rem] tracking-[0.15em] uppercase mt-0.5" style={{ color: 'rgba(107,117,86,0.65)' }}>MAD</p>
                  </div>
                </div>
              );
            })()}

            {error && (
              <div className="flex items-center gap-3 px-3 sm:px-4 py-3 mb-4 rounded-xl"
                style={{ background: 'rgba(200,125,135,0.07)', border: '1px solid rgba(200,125,135,0.22)' }}>
                <span className="text-[#C87D87] flex-shrink-0 text-sm sm:text-base">⚠</span>
                <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-[0.85rem] sm:text-[0.95rem]">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-5 border-t border-[#3a3027]/6">
              <button onClick={() => setStep(2)}
                className="font-['Cormorant_Garamond',serif] text-[0.7rem] sm:text-[0.82rem] tracking-[0.16em] uppercase px-4 sm:px-6 py-3
                  rounded-xl border border-[#3a3027]/10 text-[#7a6a5a]/65
                  hover:border-[#3a3027]/18 hover:text-[#7a6a5a]/90 hover:bg-white/40 transition-all duration-200">
                ← Edit
              </button>
              <button onClick={handleSubmit} disabled={submitting || form.participants < MIN_PARTICIPANTS}
                className="flex-1 relative overflow-hidden group font-['Cormorant_Garamond',serif] text-[0.7rem] sm:text-[0.82rem] tracking-[0.24em] uppercase text-[#FBEAD6] py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-35"
                style={{
                  background: 'linear-gradient(135deg,#C87D87 0%,#b36d77 50%,#C87D87 100%)',
                  boxShadow: submitting ? 'none' : '0 5px 20px rgba(200,125,135,0.28)',
                }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"/>
                {submitting ? (
                  <><div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-[#FBEAD6]/30 border-t-[#FBEAD6] animate-spin"/><span className="text-[0.7rem] sm:text-[0.82rem]">Processing…</span></>
                ) : (
                  <><span className="opacity-40 text-[0.4rem] sm:text-[0.45rem]">◆</span><span className="text-[0.7rem] sm:text-[0.82rem]">Confirm Booking</span><span className="opacity-40 text-[0.4rem] sm:text-[0.45rem]">◆</span></>
                )}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── Draft indicator ── */}
      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 flex items-center gap-1.5
        bg-[#FBEAD6]/92 border border-[#3a3027]/8 rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-4 sm:py-2.5
        shadow-[0_2px_12px_rgba(58,48,39,0.07)] backdrop-blur-sm
        font-['Cormorant_Garamond',serif] italic text-[0.65rem] sm:text-[0.78rem] text-[#7a6a5a]/60">
        {saving ? (
          <><div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-[#C87D87]/30 border-t-[#C87D87] animate-spin"/><span className="text-[0.6rem] sm:text-[0.78rem]">Saving…</span></>
        ) : lastSaved ? (
          <><span className="text-[#6B7556] text-xs sm:text-sm">✓</span><span className="text-[0.6rem] sm:text-[0.78rem]">Saved · {lastSaved.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}</span></>
        ) : (
          <><svg width="5" height="5" sm="7" height="7" viewBox="0 0 8 8"><rect x="1" y="1" width="6" height="6" transform="rotate(45 4 4)" fill="none" stroke="#C87D87" strokeWidth="0.8" strokeOpacity="0.45"/></svg><span className="text-[0.6rem] sm:text-[0.78rem]">Auto-saving draft</span></>
        )}
      </div>

    </div>
  );
}