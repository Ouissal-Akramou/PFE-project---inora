'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const ACTIVITIES = {
  'crochet-circle': {
    title: 'Crochet Circle',
    tag: '01',
    img: 'https://images.unsplash.com/photo-1612278675615-7b093b07772d',
    accent: '#C87D87',
    desc: 'Gather around yarn and quiet conversation. A slow, meditative craft that brings warmth to any setting.',
    duration: '3 hours',
    maxGuests: 12,
  },
  'painting-session': {
    title: 'Painting Session',
    tag: '02',
    img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
    accent: '#6B7556',
    desc: 'Express freely on canvas surrounded by curated ambience. No experience needed — only the desire to create together.',
    duration: '3 hours',
    maxGuests: 12,
  },
  'pottery-workshop': {
    title: 'Pottery Workshop',
    tag: '03',
    img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261',
    accent: '#C87D87',
    desc: 'Shape and sculpt in an intimate setting. Grounding, joyful, and deeply satisfying when shared with people you love.',
    duration: '3 hours',
    maxGuests: 12,
  },
};

const PRICE_PER_PERSON = 150;

const TIME_SLOTS = [
  { id: 'morning',   label: 'Morning',   hours: '09:30 – 12:30', icon: '◎', sub: 'Soft light & fresh starts'  },
  { id: 'afternoon', label: 'Afternoon', hours: '14:30 – 17:30', icon: '◈', sub: 'Golden hour creativity'      },
  { id: 'evening',   label: 'Evening',   hours: '19:30 – 22:30', icon: '◇', sub: 'Candlelit & intimate'        },
];

const SETTINGS = [
  { id: 'garden',  label: 'Sunlit Garden',    icon: '❧' },
  { id: 'indoor',  label: 'Cosy Indoor',      icon: '⌂' },
  { id: 'terrace', label: 'Open-Air Terrace', icon: '◻' },
];

export default function BookPage() {
  const { slug } = useParams();
  const router   = useRouter();
  const { user } = useAuth();

  const activity = ACTIVITIES[slug];

  const [step,    setStep]    = useState(0);
  const [ready,   setReady]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    fullName:     '',
    email:        '',
    phone:        '',
    date:         '',
    timeSlot:     '',
    participants: '',
    setting:      '',
    message:      '',
  });

  useEffect(() => {
    if (!user) { router.push('/sign-up'); return; }
    setForm(f => ({ ...f, fullName: user.fullName ?? '', email: user.email ?? '' }));
    setTimeout(() => setReady(true), 80);
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const guests   = Number(form.participants) || 0;
  const total    = guests * PRICE_PER_PERSON;

  const detailsValid =
    form.fullName.trim() && form.email.trim() && form.phone.trim() &&
    form.date && form.timeSlot && form.participants && form.setting;

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const slot = TIME_SLOTS.find(t => t.id === form.timeSlot);
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName:     form.fullName,
          email:        form.email,
          phone:        form.phone,
          activity:     activity.title,
          date:         form.date,
          timeSlot:     slot?.hours,
          participants: guests,
          setting:      form.setting,
          message:      form.message,
          totalPrice:   total,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Something went wrong.');
      setStep(2);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  if (!activity) return (
    <main className="min-h-screen bg-[#FBEAD6] flex items-center justify-center">
      <div className="text-center">
        <p className="font-['Playfair_Display',serif] italic text-3xl text-[#3a3027] mb-4">Activity not found.</p>
        <Link href="/#activities" className="font-['Cormorant_Garamond',serif] text-sm tracking-widest uppercase text-[#C87D87] border-b border-[#C87D87]/40 pb-0.5">← Back</Link>
      </div>
    </main>
  );

  return (
    <main className={`min-h-screen text-[#3a3027] transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'linear-gradient(160deg, #fdf4ee 0%, #f7e8d8 50%, #FBEAD6 100%)' }}>

      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes checkPop { 0%{transform:scale(0) rotate(-12deg)} 70%{transform:scale(1.18) rotate(4deg)} 100%{transform:scale(1) rotate(0)} }
        @keyframes lacePulse{ 0%,100%{opacity:.4} 50%{opacity:.85} }
        @keyframes lineGrow { from{width:0} to{width:100%} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        /* ── fields ── */
        .field {
          width:100%; background:rgba(255,255,255,0.65); border:1.5px solid rgba(200,125,135,0.18);
          border-radius:14px; padding:13px 16px;
          font-family:'Cormorant Garamond',serif; font-size:1rem; color:#3a3027;
          outline:none; transition:all .2s; backdrop-filter:blur(6px);
        }
        .field::placeholder { color:rgba(122,106,90,0.38); font-style:italic; }
        .field:focus { border-color:rgba(107,117,86,0.5); background:rgba(255,255,255,0.9); box-shadow:0 0 0 3px rgba(107,117,86,0.07); }

        /* ── selector cards ── */
        .sel-card {
          border:1.5px solid rgba(200,125,135,0.16); border-radius:16px;
          background:rgba(255,255,255,0.55); cursor:pointer;
          transition:all .22s; position:relative; overflow:hidden;
        }
        .sel-card:hover  { background:rgba(255,255,255,0.82); border-color:rgba(200,125,135,0.35); transform:translateY(-2px); }
        .sel-card.active { background:#fff; border-color:#C87D87; box-shadow:0 0 0 3px rgba(200,125,135,0.1); }
        .sel-card.active-green { background:#fff; border-color:#6B7556; box-shadow:0 0 0 3px rgba(107,117,86,0.1); }

        /* ── progress ── */
        .prog-track { height:3px; background:rgba(200,125,135,0.12); border-radius:3px; }
        .prog-fill  { height:100%; border-radius:3px; transition:width .5s cubic-bezier(.4,0,.2,1); background:linear-gradient(90deg,#C87D87 0%,#6B7556 100%); }

        /* ── lace ── */
        .lace-border { position:fixed; inset:0; pointer-events:none; z-index:40; }
        .lace-border::before { content:''; position:absolute; inset:10px; border:1px solid rgba(200,125,135,0.18); border-radius:2px; }
        .lace-border::after  { content:''; position:absolute; inset:18px; border:1px solid rgba(200,125,135,0.08); border-radius:2px; }

        /* ── review rows ── */
        .review-row { display:flex; align-items:flex-start; gap:16px; padding:14px 0; border-bottom:1px solid rgba(200,125,135,0.08); }
        .review-row:last-child { border-bottom:none; padding-bottom:0; }
      `}</style>

      {/* Lace border */}
      <div className="lace-border"/>
      {[{pos:'top-2.5 left-2.5',rot:'0'},{pos:'top-2.5 right-2.5',rot:'90'},{pos:'bottom-2.5 right-2.5',rot:'180'},{pos:'bottom-2.5 left-2.5',rot:'270'}].map(({pos,rot},i)=>(
        <div key={i} className={`fixed ${pos} w-16 h-16 pointer-events-none z-40 animate-[lacePulse_4.5s_ease-in-out_infinite_${i*.6}s]`}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ transform:`rotate(${rot}deg)` }}>
            <line x1="0" y1="1" x2="32" y2="1" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.55"/>
            <line x1="1" y1="0" x2="1" y2="32" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.55"/>
            <rect x="2" y="2" width="7" height="7" transform="rotate(45 5.5 5.5)" fill="none" stroke="#C87D87" strokeWidth="0.65" strokeOpacity="0.8"/>
            <circle cx="5.5" cy="5.5" r="1" fill="#C87D87" fillOpacity="0.4"/>
            {[10,16,22,28].map((x,j)=><circle key={j} cx={x} cy="5.5" r="0.6" fill="#C87D87" fillOpacity={0.1+j*0.04}/>)}
            {[10,16,22,28].map((y,j)=><circle key={j} cx="5.5" cy={y} r="0.6" fill="#C87D87" fillOpacity={0.1+j*0.04}/>)}
          </svg>
        </div>
      ))}

      {/* ── HERO STRIP (image + title) ── */}
      <div className="relative h-52 overflow-hidden">
        <img src={activity.img} alt={activity.title} className="w-full h-full object-cover scale-105"/>
        <div className="absolute inset-0" style={{ background:'linear-gradient(to bottom, rgba(58,48,39,0.15) 0%, rgba(58,48,39,0.65) 100%)' }}/>

        {/* back link */}
        <Link href="/#activities"
          className="absolute top-5 left-7 flex items-center gap-1.5 font-['Cormorant_Garamond',serif] italic text-sm text-white/75 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Activities
        </Link>

        {/* Inora wordmark */}
        <p className="absolute top-5 left-1/2 -translate-x-1/2 font-['Playfair_Display',serif] italic text-xl text-white/90">
          Inora<span style={{ color:'#C87D87' }}>.</span>
        </p>

        {/* title */}
        <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
          <div>
            <p className="font-['Cormorant_Garamond',serif] italic text-white/60 text-xs tracking-[.3em] uppercase mb-1">Activity {activity.tag}</p>
            <h1 className="font-['Playfair_Display',serif] italic text-white text-[clamp(1.8rem,4vw,2.8rem)] leading-tight drop-shadow-sm">
              {activity.title}
            </h1>
          </div>
          <div className="hidden md:block text-right">
            <p className="font-['Cormorant_Garamond',serif] italic text-white/50 text-xs tracking-widest uppercase mb-0.5">Price per person</p>
            <p className="font-['Playfair_Display',serif] italic text-white text-2xl">{PRICE_PER_PERSON} MAD</p>
          </div>
        </div>

        {/* progress bar overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 prog-track rounded-none">
          <div className="prog-fill" style={{ width: step === 0 ? '33%' : step === 1 ? '66%' : '100%' }}/>
        </div>
      </div>

      {/* ── Step indicator ── */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-[#C87D87]/10 px-8 py-3 flex items-center justify-center gap-6">
        {['Fill Details', 'Review', 'Confirmed'].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-[#C87D87]/20"/>}
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300
              ${step > i  ? 'bg-[#6B7556] border-[#6B7556]'    : ''}
              ${step === i ? 'bg-[#C87D87] border-[#C87D87]'   : ''}
              ${step < i  ? 'bg-transparent border-[#C87D87]/25' : ''}`}>
              {step > i
                ? <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                : <span className={`text-[0.48rem] font-bold ${step === i ? 'text-white' : 'text-[#C87D87]/30'}`}>{i+1}</span>}
            </div>
            <span className={`font-['Cormorant_Garamond',serif] text-[0.65rem] tracking-[.18em] uppercase transition-colors duration-300
              ${step === i ? 'text-[#3a3027]' : 'text-[#7a6a5a]/40'}`}>{s}</span>
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ════════════════════════
            STEP 0 — DETAILS
        ════════════════════════ */}
        {step === 0 && (
          <div className="grid md:grid-cols-[1fr_320px] gap-8 items-start" style={{ animation:'fadeUp .5s ease both' }}>

            {/* LEFT */}
            <div className="space-y-7">

              {/* ── Section: Who's coming ── */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-6 h-6 rounded-full bg-[#C87D87] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[0.5rem] font-bold">1</span>
                  </div>
                  <h2 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027]">Who's coming?</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#C87D87]/20 to-transparent"/>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[.2em] uppercase text-[#7a6a5a]/55 mb-1.5 block">Full Name</label>
                    <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your name…" className="field"/>
                  </div>
                  <div>
                    <label className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[.2em] uppercase text-[#7a6a5a]/55 mb-1.5 block">Email</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" className="field"/>
                  </div>
                  <div>
                    <label className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[.2em] uppercase text-[#7a6a5a]/55 mb-1.5 block">Phone</label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+212 6…" className="field"/>
                  </div>
                  <div>
                    <label className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[.2em] uppercase text-[#7a6a5a]/55 mb-1.5 block">
                      Number of Guests
                      <span className="text-[#C87D87]/50 ml-1 normal-case tracking-normal">(max {activity.maxGuests})</span>
                    </label>
                    <input type="number" min="1" max={activity.maxGuests} value={form.participants}
                      onChange={e => set('participants', e.target.value)} placeholder="How many?" className="field"/>
                  </div>
                </div>
              </div>

              {/* ── Section: When ── */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-6 h-6 rounded-full bg-[#C87D87] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[0.5rem] font-bold">2</span>
                  </div>
                  <h2 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027]">When?</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#C87D87]/20 to-transparent"/>
                </div>

                {/* Date picker */}
                <div className="mb-4">
                  <label className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[.2em] uppercase text-[#7a6a5a]/55 mb-1.5 block">Preferred Date</label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]} className="field"/>
                </div>

                {/* Time slots */}
                <label className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[.2em] uppercase text-[#7a6a5a]/55 mb-2.5 block">Choose a Time Slot</label>
                <div className="grid grid-cols-3 gap-3">
                  {TIME_SLOTS.map(slot => (
                    <div key={slot.id}
                      onClick={() => set('timeSlot', slot.id)}
                      className={`sel-card p-4 text-center ${form.timeSlot === slot.id ? 'active' : ''}`}>
                      {/* active tick */}
                      {form.timeSlot === slot.id && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#C87D87] rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      )}
                      <p className="text-[#C87D87]/70 text-base mb-2">{slot.icon}</p>
                      <p className="font-['Playfair_Display',serif] italic text-[#3a3027] text-sm leading-tight mb-1">{slot.label}</p>
                      <p className="font-['Cormorant_Garamond',serif] text-[#C87D87] text-sm font-semibold mb-1">{slot.hours}</p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[0.62rem] text-[#7a6a5a]/50">{slot.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Section: Setting ── */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-6 h-6 rounded-full bg-[#C87D87] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[0.5rem] font-bold">3</span>
                  </div>
                  <h2 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027]">Where?</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#C87D87]/20 to-transparent"/>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {SETTINGS.map(s => (
                    <div key={s.id}
                      onClick={() => set('setting', s.id)}
                      className={`sel-card p-4 text-center ${form.setting === s.id ? 'active-green' : ''}`}>
                      {form.setting === s.id && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#6B7556] rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      )}
                      <p className="text-[#6B7556]/70 text-lg mb-2">{s.icon}</p>
                      <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Section: Message ── */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#C87D87]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#C87D87] text-[0.5rem] font-bold">4</span>
                  </div>
                  <h2 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027]">
                    Any notes?
                    <span className="font-['Cormorant_Garamond',serif] not-italic text-[0.7rem] text-[#7a6a5a]/40 ml-2 tracking-normal">optional</span>
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#C87D87]/20 to-transparent"/>
                </div>
                <textarea rows={3} value={form.message} onChange={e => set('message', e.target.value)}
                  placeholder="Special requests, accessibility needs, anything you'd like us to know…"
                  className="field resize-none"/>
              </div>

              {/* CTA */}
              <button disabled={!detailsValid} onClick={() => setStep(1)}
                className="w-full py-4 rounded-2xl font-['Cormorant_Garamond',serif] text-sm tracking-[.28em] uppercase transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed"
                style={{
                  background: detailsValid ? 'linear-gradient(135deg, #C87D87 0%, #a06070 100%)' : 'rgba(200,125,135,0.4)',
                  color: '#FBEAD6',
                  boxShadow: detailsValid ? '0 10px 28px rgba(200,125,135,0.28)' : 'none',
                }}>
                Review My Booking →
              </button>
            </div>

            {/* RIGHT — sticky summary */}
            <div className="sticky top-6 space-y-4" style={{ animation:'scaleIn .55s ease .1s both' }}>

              {/* Activity info */}
              <div className="bg-white/75 backdrop-blur-sm border border-[#C87D87]/14 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(58,48,39,0.08)]">
                <div className="h-1 w-full" style={{ background:`linear-gradient(90deg,${activity.accent},transparent)` }}/>
                <div className="p-5 space-y-3.5">
                  <p className="font-['Playfair_Display',serif] italic text-[#3a3027] text-base">{activity.title}</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/70 leading-relaxed">{activity.desc}</p>
                  <div className="h-px bg-[#C87D87]/10"/>
                  {[
                    { icon:'◎', label:'Duration',    val: activity.duration   },
                    { icon:'◈', label:'Max guests',  val: `${activity.maxGuests} people` },
                    { icon:'◇', label:'Per person',  val: `${PRICE_PER_PERSON} MAD`      },
                  ].map(d=>(
                    <div key={d.label} className="flex items-center gap-3">
                      <span className="text-[#C87D87]/55 text-xs w-3">{d.icon}</span>
                      <span className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#7a6a5a]/45 w-18">{d.label}</span>
                      <span className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027]">{d.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live price calculator */}
              <div className="bg-white/75 backdrop-blur-sm border border-[#6B7556]/18 rounded-2xl p-5 shadow-[0_8px_32px_rgba(58,48,39,0.06)]">
                <div className="h-1 w-full mb-4 rounded-full" style={{ background:'linear-gradient(90deg,#6B7556,transparent)' }}/>
                <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[.22em] uppercase text-[#7a6a5a]/50 mb-3">Price Estimate</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/70">
                      {guests > 0 ? `${guests} × 150 MAD` : 'Add guests to calculate'}
                    </span>
                    {guests > 0 && (
                      <span className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027]">{total} MAD</span>
                    )}
                  </div>
                  {form.timeSlot && (
                    <div className="flex justify-between">
                      <span className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/70">
                        {TIME_SLOTS.find(t=>t.id===form.timeSlot)?.hours}
                      </span>
                      <span className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-wider uppercase text-[#6B7556]/70">Selected</span>
                    </div>
                  )}
                </div>
                {guests > 0 && (
                  <>
                    <div className="h-px bg-[#6B7556]/12 mb-3"/>
                    <div className="flex items-baseline justify-between">
                      <span className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-widest uppercase text-[#7a6a5a]/50">Total</span>
                      <p className="font-['Playfair_Display',serif] italic text-2xl text-[#6B7556]">{total} MAD</p>
                    </div>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-1 gap-2">
                {['✓  Free cancellation 48h before', '✓  All materials included', '✓  Intimate groups only (≤12)'].map((b,i)=>(
                  <div key={i} className="flex items-center gap-2 bg-white/50 border border-[#6B7556]/12 rounded-xl px-3 py-2">
                    <span className="font-['Cormorant_Garamond',serif] text-xs text-[#6B7556]/80">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════
            STEP 1 — REVIEW
        ════════════════════════ */}
        {step === 1 && (
          <div className="max-w-lg mx-auto" style={{ animation:'fadeUp .5s ease both' }}>
            <div className="text-center mb-8">
              <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-sm tracking-[.3em] uppercase mb-1">Almost There</p>
              <h2 className="font-['Playfair_Display',serif] italic text-[clamp(1.8rem,3.5vw,2.5rem)] text-[#3a3027]">Review & Confirm</h2>
            </div>

            <div className="bg-white/85 backdrop-blur-sm border border-[#C87D87]/14 rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(58,48,39,0.09)]">
              {/* coloured top bar */}
              <div className="h-1.5" style={{ background:'linear-gradient(90deg,#C87D87 0%,#6B7556 100%)' }}/>

              {/* mini activity hero */}
              <div className="relative h-24 overflow-hidden">
                <img src={activity.img} alt={activity.title} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-[#3a3027]/50"/>
                <p className="absolute bottom-3 left-5 font-['Playfair_Display',serif] italic text-white text-lg">{activity.title}</p>
                <p className="absolute bottom-3 right-5 font-['Cormorant_Garamond',serif] italic text-white/70 text-sm">
                  {TIME_SLOTS.find(t=>t.id===form.timeSlot)?.hours}
                </p>
              </div>

              <div className="p-6">
                {[
                  { label:'Name',     value: form.fullName },
                  { label:'Email',    value: form.email    },
                  { label:'Phone',    value: form.phone    },
                  { label:'Date',     value: form.date ? new Date(form.date).toLocaleDateString('en-GB',{ weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '—' },
                  { label:'Time',     value: TIME_SLOTS.find(t=>t.id===form.timeSlot)?.hours + ' (' + TIME_SLOTS.find(t=>t.id===form.timeSlot)?.label + ')' },
                  { label:'Guests',   value: `${form.participants} people` },
                  { label:'Setting',  value: SETTINGS.find(s=>s.id===form.setting)?.label },
                  ...(form.message ? [{ label:'Notes', value: form.message }] : []),
                ].map((row,i)=>(
                  <div key={i} className="review-row">
                    <span className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#7a6a5a]/45 w-16 flex-shrink-0 pt-0.5">{row.label}</span>
                    <span className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] flex-1">{row.value}</span>
                  </div>
                ))}

                {/* Total price highlight */}
                <div className="mt-5 bg-[#6B7556]/7 border border-[#6B7556]/18 rounded-xl px-4 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#7a6a5a]/50 mb-0.5">Total</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/70">{form.participants} guests × 150 MAD</p>
                  </div>
                  <p className="font-['Playfair_Display',serif] italic text-2xl text-[#6B7556]">{total} MAD</p>
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-center font-['Cormorant_Garamond',serif] italic text-red-400 text-sm">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(0)}
                className="flex-1 font-['Cormorant_Garamond',serif] text-sm tracking-[.2em] uppercase py-3.5 rounded-xl border border-[#C87D87]/28 text-[#C87D87] hover:bg-[#C87D87]/5 transition-all">
                ← Edit
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-[2] font-['Cormorant_Garamond',serif] text-sm tracking-[.2em] uppercase py-3.5 rounded-xl text-[#FBEAD6] transition-all duration-300 disabled:opacity-55"
                style={{ background:'linear-gradient(135deg,#6B7556,#4a5240)', boxShadow:'0 8px 24px rgba(107,117,86,0.28)' }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Confirming…
                  </span>
                ) : 'Confirm Booking ✓'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════
            STEP 2 — SUCCESS
        ════════════════════════ */}
        {step === 2 && (
          <div className="max-w-lg mx-auto text-center py-8" style={{ animation:'fadeUp .6s ease both' }}>

            {/* Check circle */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-[#6B7556]/30 bg-[#6B7556]/10 flex items-center justify-center"
              style={{ animation:'checkPop .65s cubic-bezier(.4,0,.2,1) both' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-[#6B7556]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>

            <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-sm tracking-[.35em] uppercase mb-2">Booking Received</p>
            <h2 className="font-['Playfair_Display',serif] italic text-[clamp(2rem,4vw,3rem)] text-[#3a3027] leading-tight mb-3">
              You're all set,<br/>{form.fullName.split(' ')[0]}.
            </h2>
            <p className="font-['Cormorant_Garamond',serif] text-[1.05rem] text-[#5a4a3a] leading-relaxed mb-8 max-w-sm mx-auto">
              We've received your{' '}
              <span className="text-[#C87D87] font-semibold">{activity.title}</span> request for{' '}
              <span className="font-semibold text-[#3a3027]">
                {new Date(form.date).toLocaleDateString('en-GB',{day:'numeric',month:'long'})}
              </span>
              {' '}at{' '}
              <span className="text-[#6B7556] font-semibold">{TIME_SLOTS.find(t=>t.id===form.timeSlot)?.hours}</span>.
              We'll be in touch shortly to confirm.
            </p>

            {/* Confirmation card */}
            <div className="bg-white/80 border border-[#C87D87]/12 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(58,48,39,0.07)] text-left mb-8">
              <div className="h-1" style={{ background:'linear-gradient(90deg,#C87D87,#6B7556)' }}/>
              <div className="p-5 space-y-3">
                {[
                  { label:'Activity', value: activity.title },
                  { label:'Date',     value: new Date(form.date).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}) },
                  { label:'Time',     value: `${TIME_SLOTS.find(t=>t.id===form.timeSlot)?.hours} · ${TIME_SLOTS.find(t=>t.id===form.timeSlot)?.label}` },
                  { label:'Guests',   value: `${form.participants} people` },
                  { label:'Setting',  value: SETTINGS.find(s=>s.id===form.setting)?.label },
                  { label:'Total',    value: `${total} MAD` },
                ].map((r,i)=>(
                  <div key={i} className="flex items-center gap-4">
                    <span className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase text-[#7a6a5a]/42 w-16 flex-shrink-0">{r.label}</span>
                    <span className={`font-['Cormorant_Garamond',serif] text-sm ${r.label==='Total' ? 'text-[#6B7556] font-semibold' : 'text-[#3a3027]'}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/"
                className="font-['Cormorant_Garamond',serif] text-sm tracking-[.22em] uppercase text-[#FBEAD6] px-8 py-3.5 rounded-xl transition-all duration-300 shadow-[0_8px_24px_rgba(200,125,135,0.22)]"
                style={{ background:'linear-gradient(135deg,#C87D87,#a06070)' }}>
                Back to Home
              </Link>
              <Link href="/#activities"
                className="font-['Cormorant_Garamond',serif] text-sm tracking-[.22em] uppercase border border-[#C87D87]/28 text-[#C87D87] px-8 py-3.5 rounded-xl hover:bg-[#C87D87]/6 transition-all">
                Browse Activities
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <div className="w-8 h-px bg-[#C87D87]/22"/>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40 text-sm">Gather. Create. Remember.</p>
              <div className="w-8 h-px bg-[#C87D87]/22"/>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
