'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

const ACTIVITIES = [
  {
    id:    'crochet-circle',
    title: 'Crochet Circle',
    desc:  'A slow, meditative craft that brings warmth to any setting.',
    img:   'https://images.unsplash.com/photo-1612278675615-7b093b07772d',
    icon:  '◎',
  },
  {
    id:    'painting-session',
    title: 'Painting Session',
    desc:  'Express freely on canvas surrounded by curated ambience.',
    img:   'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
    icon:  '◈',
  },
  {
    id:    'pottery-workshop',
    title: 'Pottery Workshop',
    desc:  'Shape and sculpt in an intimate setting.',
    img:   'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261',
    icon:  '◇',
  },
];

// ✅ Now matches admin TIME_SLOTS exactly
const TIME_SLOTS = [
  { id: 'morning',   label: 'Morning',   hours: '09:30 – 12:30', icon: '◎', sub: 'Soft light & fresh starts' },
  { id: 'afternoon', label: 'Afternoon', hours: '14:30 – 17:30', icon: '◈', sub: 'Golden hour creativity'    },
  { id: 'evening',   label: 'Evening',   hours: '19:30 – 22:30', icon: '◇', sub: 'Candlelit & intimate'      },
];

// ✅ Now stores lowercase keys to match admin SETTINGS_MAP
const SETTINGS = [
  { key: 'garden',   label: 'Sunlit Garden',    icon: '❧' },
  { key: 'indoor',   label: 'Cosy Indoor',       icon: '⌂' },
  { key: 'terrace',  label: 'Open-Air Terrace',  icon: '◻' },
  { key: 'surprise', label: 'Surprise me',       icon: '✦' },
];

const CONTACT_PREFS = ['telephone', 'email', 'whatsapp'];

const EMPTY_FORM = {
  activity:         '',
  participants:     1,
  date:             '',
  timeSlot:         '',   // stores hours string e.g. "09:30 – 12:30"
  setting:          '',   // stores key e.g. "garden"
  fullName:         '',
  email:            '',
  phone:            '',
  allergies:        '',
  specialRequests:  '',
  additionalNotes:  '',
  preferredContact: 'telephone',
  activityTheme:    '',
};

const STEPS = ['Activity', 'Details', 'Preferences', 'Review'];


// ─── Draft hook ────────────────────────────────────────────────────
function useDraft() {
  const [draftId,   setDraftId]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timer = useRef(null);

  const loadDraft = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/api/drafts`, { credentials: 'include' });
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
        const res  = await fetch(`${API}/api/drafts`, {
          method:      'POST',
          credentials: 'include',
          headers:     { 'Content-Type': 'application/json' },
          body:        JSON.stringify({ formData }),
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


// ─── UI helpers ────────────────────────────────────────────────────
const inputClass = `w-full font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027]
  placeholder-[#3a3027]/25 bg-white/60 border border-[#3a3027]/10 rounded-xl px-4 py-3
  outline-none focus:border-[#C87D87]/50 focus:bg-white
  focus:shadow-[0_0_0_3px_rgba(200,125,135,0.07)] transition-all duration-200`;

function FormField({ label, children }) {
  return (
    <div>
      <label className="block font-['Cormorant_Garamond',serif] text-[0.57rem] uppercase tracking-[0.18em] text-[#7a6a5a]/50 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function StepHeader({ step, total, title, subtitle }) {
  return (
    <div className="mb-8 text-center">
      <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/60 text-[0.58rem] tracking-[0.4em] uppercase mb-2">
        ✦ Step {step} of {total} ✦
      </p>
      <h1 className="font-['Playfair_Display',serif] italic text-[clamp(1.8rem,4vw,2.8rem)] text-[#3a3027] mb-1">
        {title}<span className="text-[#C87D87]">.</span>
      </h1>
      <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/55 text-sm">{subtitle}</p>
      <div className="w-8 h-px bg-[#C87D87]/40 mx-auto mt-3"/>
    </div>
  );
}

function StepNav({ onBack, onNext, nextDisabled }) {
  return (
    <div className="flex gap-3 mt-8">
      {onBack && (
        <button onClick={onBack}
          className="font-['Cormorant_Garamond',serif] text-xs tracking-widest uppercase px-6 py-3.5
            rounded-2xl border border-[#3a3027]/12 text-[#7a6a5a]/60 hover:bg-[#3a3027]/5 transition-all">
          ← Back
        </button>
      )}
      <button onClick={onNext} disabled={nextDisabled}
        className="flex-1 font-['Cormorant_Garamond',serif] text-xs tracking-[0.22em] uppercase
          text-[#FBEAD6] py-3.5 rounded-2xl transition-all duration-300
          disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg,#6B7556,#4a5240)',
          boxShadow:  '0 8px 24px rgba(107,117,86,0.3)',
        }}>
        Continue →
      </button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBEAD6]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border border-[#C87D87]/20"/>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C87D87] animate-spin"/>
        </div>
        <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/50 tracking-[0.35em] text-xs uppercase">
          Loading…
        </p>
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

  const [form,        setForm]        = useState({ ...EMPTY_FORM, activity: preselectedActivity });
  const [step,        setStep]        = useState(preselectedActivity ? 1 : 0);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const { draftId, saving, lastSaved, loadDraft, saveDraft, submitBooking, deleteDraft } = useDraft();

  useEffect(() => {
    if (!loading && !user) router.push('/sign-up');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    loadDraft().then(saved => {
      if (saved) {
        setForm(prev => ({
          ...saved,
          activity: preselectedActivity || saved.activity || '',
        }));
        if (!preselectedActivity && saved.activity) setStep(1);
      }
      setDraftLoaded(true);
    });
  }, [user]);

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    saveDraft(updated);
  };

  // ✅ Fixed submit flow
 const handleSubmit = async () => {
  setError(null);
  setSubmitting(true);
  try {
    const res = await fetch(`${API}/api/bookings`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ ...form, isDraft: true }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Booking failed');

    // ✅ unwrap { message, booking } shape
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
    <div className="min-h-screen bg-[#FBEAD6] relative overflow-x-hidden">

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .step-enter { animation: fadeInUp .35s ease both; }
      `}</style>

      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #3a3027 1px, transparent 0)',
          backgroundSize:  '22px 22px',
        }}
      />
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent z-50"/>


      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#FBEAD6]/90 backdrop-blur-md border-b border-[#C87D87]/12 px-6 py-3.5 flex items-center justify-between"
        style={{ boxShadow: '0 1px 12px rgba(58,48,39,0.05)' }}>
        <Link href="/"
          className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/60 hover:text-[#C87D87] transition-colors flex items-center gap-2 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          Back
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <span className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/40 text-[0.5rem] tracking-[0.5em] uppercase block">✦</span>
          <span className="font-['Playfair_Display',serif] italic text-[#3a3027] text-lg leading-none">Inora</span>
        </div>

        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.42rem] font-bold transition-all duration-300 ${
                i < step   ? 'bg-[#6B7556] text-[#FBEAD6]'  :
                i === step ? 'bg-[#C87D87] text-[#FBEAD6]'  :
                             'bg-[#3a3027]/8 text-[#3a3027]/25'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-[0.1em] uppercase hidden sm:block transition-colors ${
                i === step ? 'text-[#3a3027]/55' : 'text-[#3a3027]/20'
              }`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-3 h-px bg-[#3a3027]/10 mx-0.5"/>}
            </div>
          ))}
        </div>
      </header>


      {/* ── Main ── */}
      <main className="max-w-2xl mx-auto px-6 py-10 relative z-10">


        {/* ══ STEP 0 — Choose Activity ══ */}
        {step === 0 && (
          <div className="step-enter">
            <StepHeader step={1} total={4} title="Choose Your Activity" subtitle="Select the craft that will anchor your gathering." />
            <div className="grid gap-4">
              {ACTIVITIES.map(a => (
                <button key={a.id}
                  onClick={() => { handleChange('activity', a.title); setStep(1); }}
                  className={`group w-full flex items-center gap-5 p-5 rounded-2xl border text-left transition-all duration-300 ${
                    form.activity === a.title
                      ? 'bg-white border-[#C87D87]/40 shadow-[0_8px_32px_rgba(200,125,135,0.12)]'
                      : 'bg-white/50 border-[#3a3027]/8 hover:bg-white hover:border-[#C87D87]/25 hover:shadow-md'
                  }`}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={a.img} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['Playfair_Display',serif] italic text-[#3a3027] text-lg leading-tight">{a.title}</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/55 text-sm mt-0.5">{a.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                    form.activity === a.title ? 'border-[#C87D87] bg-[#C87D87]' : 'border-[#3a3027]/15'
                  }`}>
                    {form.activity === a.title && (
                      <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}


        {/* ══ STEP 1 — Booking Details ══ */}
        {step === 1 && (
          <div className="step-enter">
            <StepHeader step={2} total={4} title="Booking Details" subtitle="When, how many, and where." />
            <div className="space-y-4">

              {/* Selected activity summary */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 border border-[#C87D87]/15">
                <span className="text-[#C87D87] text-lg">
                  {ACTIVITIES.find(a => a.title === form.activity)?.icon || '◈'}
                </span>
                <div className="flex-1">
                  <p className="font-['Playfair_Display',serif] italic text-[#3a3027] text-base">{form.activity}</p>
                </div>
                <button onClick={() => setStep(0)}
                  className="font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase text-[#C87D87]/60 hover:text-[#C87D87] transition-colors">
                  Change
                </button>
              </div>

              {/* Participants */}
              <FormField label="Number of Guests">
                <div className="flex items-center gap-4">
                  <button type="button"
                    onClick={() => handleChange('participants', Math.max(1, form.participants - 1))}
                    className="w-9 h-9 rounded-xl border border-[#3a3027]/10 bg-white/60 flex items-center justify-center text-[#3a3027]/50 hover:border-[#C87D87]/40 hover:text-[#C87D87] transition-all text-lg">−</button>
                  <span className="font-['Playfair_Display',serif] italic text-[#3a3027] text-xl w-8 text-center">{form.participants}</span>
                  <button type="button"
                    onClick={() => handleChange('participants', Math.min(12, form.participants + 1))}
                    className="w-9 h-9 rounded-xl border border-[#3a3027]/10 bg-white/60 flex items-center justify-center text-[#3a3027]/50 hover:border-[#C87D87]/40 hover:text-[#C87D87] transition-all text-lg">+</button>
                  <span className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/50 text-sm">max 12</span>
                </div>
              </FormField>

              {/* Date */}
              <FormField label="Preferred Date">
                <input type="date"
                  value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => handleChange('date', e.target.value)}
                  className={inputClass}/>
              </FormField>

              {/* ✅ Fixed time slots — stores hours string */}
              <FormField label="Preferred Time">
                <div className="flex flex-col gap-2">
                  {TIME_SLOTS.map(t => (
                    <button key={t.id} type="button"
                      onClick={() => handleChange('timeSlot', t.hours)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all text-left ${
                        form.timeSlot === t.hours
                          ? 'bg-[#C87D87]/10 border-[#C87D87]/50 text-[#C87D87]'
                          : 'bg-white/60 border-[#3a3027]/10 text-[#5a4a3a] hover:border-[#C87D87]/30'
                      }`}>
                      <span className="text-base w-5 text-center">{t.icon}</span>
                      <div className="flex-1">
                        <p className="font-['Cormorant_Garamond',serif] italic text-sm font-semibold">{t.label}</p>
                        <p className="font-['Cormorant_Garamond',serif] italic text-xs opacity-60">{t.hours} · {t.sub}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        form.timeSlot === t.hours ? 'border-[#C87D87] bg-[#C87D87]' : 'border-[#3a3027]/15'
                      }`}/>
                    </button>
                  ))}
                </div>
              </FormField>

              {/* ✅ Fixed settings — stores lowercase key */}
              <FormField label="Setting Preference">
                <div className="grid grid-cols-2 gap-2">
                  {SETTINGS.map(s => (
                    <button key={s.key} type="button"
                      onClick={() => handleChange('setting', s.key)}
                      className={`flex items-center gap-2 font-['Cormorant_Garamond',serif] italic text-sm px-4 py-2.5 rounded-xl border transition-all text-left ${
                        form.setting === s.key
                          ? 'bg-[#C87D87]/10 border-[#C87D87]/50 text-[#C87D87]'
                          : 'bg-white/60 border-[#3a3027]/10 text-[#5a4a3a] hover:border-[#C87D87]/25'
                      }`}>
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </FormField>

            </div>
            <StepNav
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
              nextDisabled={!form.date || !form.timeSlot || !form.setting}
            />
          </div>
        )}


        {/* ══ STEP 2 — Personal Info ══ */}
        {step === 2 && (
          <div className="step-enter">
            <StepHeader step={3} total={4} title="Your Details" subtitle="So we can prepare everything perfectly." />
            <div className="space-y-4">

              <FormField label="Full Name">
                <input type="text" value={form.fullName} placeholder="Your full name"
                  onChange={e => handleChange('fullName', e.target.value)}
                  className={inputClass}/>
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Email">
                  <input type="email" value={form.email} placeholder="you@example.com"
                    onChange={e => handleChange('email', e.target.value)}
                    className={inputClass}/>
                </FormField>
                <FormField label="Phone">
                  <input type="tel" value={form.phone} placeholder="+212 6XX XXX XXX"
                    onChange={e => handleChange('phone', e.target.value)}
                    className={inputClass}/>
                </FormField>
              </div>

              <FormField label="Allergies or Dietary Needs">
                <input type="text" value={form.allergies} placeholder="None, gluten-free, etc."
                  onChange={e => handleChange('allergies', e.target.value)}
                  className={inputClass}/>
              </FormField>

              <FormField label="Special Requests">
                <textarea value={form.specialRequests} placeholder="Anything you'd like us to know…"
                  rows={3}
                  onChange={e => handleChange('specialRequests', e.target.value)}
                  className={inputClass + ' resize-none'}/>
              </FormField>

              <FormField label="Activity Theme (optional)">
                <input type="text" value={form.activityTheme} placeholder="e.g. Birthday, Bachelorette…"
                  onChange={e => handleChange('activityTheme', e.target.value)}
                  className={inputClass}/>
              </FormField>

              <FormField label="Preferred Contact Method">
                <div className="flex gap-2">
                  {CONTACT_PREFS.map(c => (
                    <button key={c} type="button"
                      onClick={() => handleChange('preferredContact', c)}
                      className={`font-['Cormorant_Garamond',serif] italic text-sm px-4 py-2 rounded-xl border capitalize transition-all ${
                        form.preferredContact === c
                          ? 'bg-[#6B7556] border-[#6B7556] text-[#FBEAD6]'
                          : 'bg-white/60 border-[#3a3027]/10 text-[#5a4a3a] hover:border-[#6B7556]/30'
                      }`}>{c}</button>
                  ))}
                </div>
              </FormField>

            </div>
            <StepNav
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              nextDisabled={!form.fullName || !form.email || !form.phone}
            />
          </div>
        )}


        {/* ══ STEP 3 — Review & Submit ══ */}
        {step === 3 && (
          <div className="step-enter">
            <StepHeader step={4} total={4} title="Review & Confirm" subtitle="Everything look right? Let's make it official." />

            <div className="rounded-2xl border border-[#3a3027]/8 bg-white/60 overflow-hidden divide-y divide-[#3a3027]/5 mb-6">
              {[
                { l: 'Activity',         v: form.activity },
                { l: 'Date',             v: form.date ? new Date(form.date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : '—' },
                { l: 'Time',             v: (() => { const t = TIME_SLOTS.find(t => t.hours === form.timeSlot); return t ? `${t.icon} ${t.label} · ${t.hours}` : form.timeSlot || '—'; })() },
                { l: 'Guests',           v: `${form.participants} people` },
                { l: 'Setting',          v: (() => { const s = SETTINGS.find(s => s.key === form.setting); return s ? `${s.icon} ${s.label}` : form.setting || '—'; })() },
                { l: 'Name',             v: form.fullName },
                { l: 'Email',            v: form.email },
                { l: 'Phone',            v: form.phone },
                { l: 'Allergies',        v: form.allergies       || 'None' },
                { l: 'Special Requests', v: form.specialRequests || 'None' },
                { l: 'Theme',            v: form.activityTheme   || 'None' },
                { l: 'Contact via',      v: form.preferredContact },
              ].map(({ l, v }) => (
                <div key={l} className="flex justify-between items-start px-5 py-3 hover:bg-white/30 transition-colors">
                  <span className="font-['Cormorant_Garamond',serif] text-[0.6rem] uppercase tracking-[0.15em] text-[#7a6a5a]/45 pt-0.5">{l}</span>
                  <span className="font-['Cormorant_Garamond',serif] italic text-[#3a3027] text-sm text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>

            {/* Price estimate */}
            <div className="mb-5 px-5 py-4 rounded-2xl bg-[#6B7556]/8 border border-[#6B7556]/18 flex items-center justify-between">
              <div>
                <p className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase text-[#7a6a5a]/50 mb-0.5">Estimated Total</p>
                <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/60">{form.participants} guests × 150 MAD</p>
              </div>
              <p className="font-['Playfair_Display',serif] italic text-2xl text-[#6B7556]">{form.participants * 150} MAD</p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-[#C87D87]/8 border border-[#C87D87]/22 flex items-center gap-2">
                <span className="text-[#C87D87]">⚠</span>
                <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="font-['Cormorant_Garamond',serif] text-xs tracking-widest uppercase px-6 py-3.5
                  rounded-2xl border border-[#3a3027]/12 text-[#7a6a5a]/60 hover:bg-[#3a3027]/5 transition-all">
                ← Edit
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 relative overflow-hidden group font-['Cormorant_Garamond',serif] text-sm tracking-[0.25em] uppercase text-[#FBEAD6] py-3.5 rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg,#C87D87 0%,#b36d77 40%,#C87D87 100%)',
                  boxShadow:  '0 10px 32px rgba(200,125,135,0.35)',
                }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"/>
                {submitting ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-[#FBEAD6]/30 border-t-[#FBEAD6] animate-spin"/> Processing…</>
                ) : (
                  <>Confirm Booking →</>
                )}
              </button>
            </div>

          </div>
        )}

      </main>


      {/* ── Draft indicator ── */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2
        bg-[#FBEAD6]/90 border border-[#C87D87]/18 rounded-xl px-4 py-2
        shadow-sm backdrop-blur-sm font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]
        transition-all duration-300">
        {saving ? (
          <>
            <div className="w-3 h-3 rounded-full border border-[#C87D87]/30 border-t-[#C87D87] animate-spin"/>
            Saving draft…
          </>
        ) : lastSaved ? (
          <>
            <span className="text-[#6B7556]">✓</span>
            Draft saved · {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </>
        ) : (
          <>
            <span className="text-[#C87D87]/40">◎</span>
            Draft saves automatically
          </>
        )}
      </div>

    </div>
  );
}
