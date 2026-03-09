'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ActivityBookingModal from '@/components/ActivityBookingModal';

const defaultReviews = [
  { id: 'default-1', user: { fullName: 'Sophie Laurent' },  rating: 5, comment: 'Inora turned a simple afternoon into the most meaningful gathering I have ever attended. Every detail was thoughtful and beautiful.' },
  { id: 'default-2', user: { fullName: 'Isabella Moreau' }, rating: 5, comment: 'From the ambience to the pottery session — it felt entirely curated for us. A truly rare and intimate experience.' },
  { id: 'default-3', user: { fullName: 'Charlotte Dubois' },rating: 4, comment: 'Our crochet circle in the garden was nothing short of magical. Inora understood exactly the mood we wanted.' },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [reviews, setReviews] = useState(defaultReviews);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [activitiesRef, activitiesIn] = useInView(0.1);
  const [processRef,    processIn]    = useInView(0.1);
  const [reviewsRef,    reviewsIn]    = useInView(0.1);
  const [footerRef,     footerIn]     = useInView(0.1);

  useEffect(() => {
    fetch('http://localhost:4000/api/reviews/approved', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) && data.length > 0 ? data : defaultReviews))
      .catch(() => setReviews(defaultReviews));
  }, []);

  const handleActivityClick = (activity) => {
    if (!user) {
      router.push('/sign-up');
      return;
    }
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  return (
    <main className="text-[#3a3027] overflow-x-hidden relative bg-[#FBEAD6]">

      <style>{`
        /* ── entrance ── */
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes slideInLeft  { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(40px)}  to{opacity:1;transform:translateX(0)} }
        @keyframes scaleIn    { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes countUp    { from{opacity:0;transform:translateY(12px) scale(.85)} to{opacity:1;transform:translateY(0) scale(1)} }

        /* ── ambient ── */
        @keyframes float      { 0%,100%{transform:translateY(0)}     50%{transform:translateY(-16px)} }
        @keyframes scrollLine { 0%,100%{opacity:0;transform:scaleY(0)} 50%{opacity:1;transform:scaleY(1)} }
        @keyframes shimmer    { from{background-position:-200% center} to{background-position:200% center} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes auraPulse  { 0%,100%{opacity:.72;transform:translate(-50%,-50%) scale(1);filter:blur(6px)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.13);filter:blur(10px)} }
        @keyframes lacePulse  { 0%,100%{opacity:.5} 50%{opacity:.95} }
        @keyframes floatOrb   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }

        /* ── section divider line draw ── */
        @keyframes drawLine   { from{width:0;opacity:0} to{width:3rem;opacity:1} }

        /* ── card shimmer on enter ── */
        @keyframes cardGlow   { 0%{box-shadow:0 0 0 rgba(200,125,135,0)} 60%{box-shadow:0 8px 32px rgba(200,125,135,0.18)} 100%{box-shadow:0 8px 32px rgba(200,125,135,0)} }

        /* ── stagger reveal helpers ── */
        .reveal-left  { opacity:0; transform:translateX(-36px); transition:opacity .75s ease, transform .75s ease; }
        .reveal-right { opacity:0; transform:translateX(36px);  transition:opacity .75s ease, transform .75s ease; }
        .reveal-up    { opacity:0; transform:translateY(30px);  transition:opacity .7s ease,  transform .7s ease; }
        .reveal-fade  { opacity:0;                              transition:opacity .9s ease; }
        .reveal-scale { opacity:0; transform:scale(0.93);       transition:opacity .7s ease,  transform .7s ease; }
        .in-view      { opacity:1 !important; transform:none !important; }

        .delay-1{transition-delay:.08s} .delay-2{transition-delay:.18s} .delay-3{transition-delay:.28s}
        .delay-4{transition-delay:.38s} .delay-5{transition-delay:.48s} .delay-6{transition-delay:.58s}

        /* ── hover lift ── */
        .card-hover { transition:transform .35s ease, box-shadow .35s ease; }
        .card-hover:hover { transform:translateY(-6px); box-shadow:0 28px 56px rgba(58,48,39,0.13); }

        /* ── process card hover accent ── */
        .step-card { transition:transform .35s ease, box-shadow .35s ease, background .35s ease; }
        .step-card:hover { transform:translateY(-6px); box-shadow:0 24px 48px rgba(58,48,39,0.18); }

        /* ── img zoom ── */
        .img-zoom img { transition:transform .8s cubic-bezier(.4,0,.2,1); }
        .img-zoom:hover img { transform:scale(1.07); }

        /* ── underline link ── */
        .link-line { position:relative; }
        .link-line::after { content:''; position:absolute; left:0; bottom:-1px; width:0; height:1px; background:#C87D87; transition:width .3s ease; }
        .link-line:hover::after { width:100%; }
      `}</style>

      {/* ══ FIXED LACE FRAME ══ */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <div className="absolute inset-3 border border-[#C87D87]/25"/>
        <div className="absolute inset-[13px] border border-[#C87D87]/12"/>
        <div className="absolute inset-[21px] border border-[#C87D87]/7"/>
        <div className="absolute inset-[28px] border border-[#C87D87]/4"/>

        {[{pos:'top-3 left-3',rot:'rotate-0'},{pos:'top-3 right-3',rot:'rotate-90'},{pos:'bottom-3 right-3',rot:'rotate-180'},{pos:'bottom-3 left-3',rot:'-rotate-90'}].map(({pos,rot},i)=>(
          <div key={i} className={`absolute ${pos} w-28 h-28`}>
            <svg width="112" height="112" viewBox="0 0 112 112" fill="none" className={rot}>
              <line x1="0"  y1="1"  x2="56" y2="1"  stroke="#C87D87" strokeWidth="0.9" strokeOpacity="0.55"/>
              <line x1="1"  y1="0"  x2="1"  y2="56" stroke="#C87D87" strokeWidth="0.9" strokeOpacity="0.55"/>
              <line x1="7"  y1="9"  x2="38" y2="9"  stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.4"/>
              <line x1="9"  y1="7"  x2="9"  y2="38" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.4"/>
              <line x1="14" y1="16" x2="30" y2="16" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.22"/>
              <line x1="16" y1="14" x2="16" y2="30" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.22"/>
              <rect x="2.5" y="2.5" width="9" height="9" transform="rotate(45 7 7)" fill="none" stroke="#C87D87" strokeWidth="0.75" strokeOpacity="0.85"/>
              <circle cx="7" cy="7" r="1.3" fill="#C87D87" fillOpacity="0.45"/>
              <rect x="22" y="2.5" width="5" height="5" transform="rotate(45 24.5 5)" fill="none" stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.38"/>
              <rect x="38" y="2.5" width="5" height="5" transform="rotate(45 40.5 5)" fill="none" stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.28"/>
              <rect x="2.5" y="22" width="5" height="5" transform="rotate(45 5 24.5)" fill="none" stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.38"/>
              <rect x="2.5" y="38" width="5" height="5" transform="rotate(45 5 40.5)" fill="none" stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.28"/>
              {[18,24,30,36,44,52].map((cx,j)=><circle key={j} cx={cx} cy="9" r={j===2?1.6:j===0||j===4?1.2:0.8} fill="#C87D87" fillOpacity={0.12+j*0.03}/>)}
              {[18,24,30,36,44,52].map((cy,j)=><circle key={j} cx="9" cy={cy} r={j===2?1.6:j===0||j===4?1.2:0.8} fill="#C87D87" fillOpacity={0.12+j*0.03}/>)}
              <line x1="13" y1="9" x2="9" y2="13" stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.4"/>
              <line x1="18" y1="9" x2="9" y2="18" stroke="#C87D87" strokeWidth="0.35" strokeOpacity="0.22"/>
              <line x1="9" y1="9" x2="26" y2="26" stroke="#C87D87" strokeWidth="0.3" strokeOpacity="0.1" strokeDasharray="2 3.5"/>
              {[14,20,26,32,38,44,50].map((x,j)=><line key={j} x1={x} y1="1" x2={x} y2={j%2===0?6:4} stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.3"/>)}
              {[14,20,26,32,38,44,50].map((y,j)=><line key={j} x1="1" y1={y} x2={j%2===0?6:4} y2={y} stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.3"/>)}
              {[10,16,22,28,34,40,48].map((x,j)=><circle key={j} cx={x} cy="5" r="0.55" fill="#C87D87" fillOpacity={0.08+j*0.032}/>)}
              {[10,16,22,28,34,40,48].map((y,j)=><circle key={j} cx="5" cy={y} r="0.55" fill="#C87D87" fillOpacity={0.08+j*0.032}/>)}
            </svg>
          </div>
        ))}

        {/* top centre ornament */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center animate-[lacePulse_4s_ease-in-out_infinite]">
          <div className="w-28 h-px bg-gradient-to-r from-transparent to-[#C87D87]/30"/>
          <svg width="88" height="16" viewBox="0 0 88 16" fill="none">
            <circle cx="5"  cy="8" r="1"   fill="#C87D87" fillOpacity="0.3"/>
            <circle cx="12" cy="8" r="1.5" fill="#C87D87" fillOpacity="0.45"/>
            <circle cx="19" cy="8" r="1"   fill="#C87D87" fillOpacity="0.28"/>
            <circle cx="25" cy="8" r="0.7" fill="#C87D87" fillOpacity="0.18"/>
            <g transform="translate(44 8)">
              <line x1="-5" y1="0" x2="5" y2="0" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5"/>
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5"/>
              <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.35"/>
              <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.35"/>
              <circle cx="0" cy="0" r="1.2" fill="#C87D87" fillOpacity="0.55"/>
            </g>
            <circle cx="63" cy="8" r="0.7" fill="#C87D87" fillOpacity="0.18"/>
            <circle cx="69" cy="8" r="1"   fill="#C87D87" fillOpacity="0.28"/>
            <circle cx="76" cy="8" r="1.5" fill="#C87D87" fillOpacity="0.45"/>
            <circle cx="83" cy="8" r="1"   fill="#C87D87" fillOpacity="0.3"/>
          </svg>
          <div className="w-28 h-px bg-gradient-to-l from-transparent to-[#C87D87]/30"/>
        </div>

        {/* bottom centre ornament */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center animate-[lacePulse_4s_ease-in-out_infinite_.9s]">
          <div className="w-28 h-px bg-gradient-to-r from-transparent to-[#C87D87]/30"/>
          <svg width="88" height="16" viewBox="0 0 88 16" fill="none">
            <circle cx="5"  cy="8" r="1"   fill="#C87D87" fillOpacity="0.3"/>
            <circle cx="12" cy="8" r="1.5" fill="#C87D87" fillOpacity="0.45"/>
            <circle cx="76" cy="8" r="1.5" fill="#C87D87" fillOpacity="0.45"/>
            <circle cx="83" cy="8" r="1"   fill="#C87D87" fillOpacity="0.3"/>
            <g transform="translate(44 8)">
              <line x1="-5" y1="0" x2="5" y2="0" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5"/>
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5"/>
              <circle cx="0" cy="0" r="1.2" fill="#C87D87" fillOpacity="0.55"/>
            </g>
          </svg>
          <div className="w-28 h-px bg-gradient-to-l from-transparent to-[#C87D87]/30"/>
        </div>

        {/* left + right ornaments */}
        {['left-3','right-3'].map((side,si)=>(
          <div key={si} className={`absolute ${side} top-1/2 -translate-y-1/2 flex flex-col items-center animate-[lacePulse_4s_ease-in-out_infinite_${1.8+si*0.9}s]`}>
            <div className="h-24 w-px bg-gradient-to-b from-transparent to-[#C87D87]/25"/>
            <svg width="16" height="64" viewBox="0 0 16 64" fill="none">
              <circle cx="8" cy="4"  r="1"   fill="#C87D87" fillOpacity="0.3"/>
              <circle cx="8" cy="11" r="1.5" fill="#C87D87" fillOpacity="0.45"/>
              <circle cx="8" cy="53" r="1.5" fill="#C87D87" fillOpacity="0.45"/>
              <circle cx="8" cy="60" r="1"   fill="#C87D87" fillOpacity="0.3"/>
              <g transform="translate(8 32)">
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5"/>
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5"/>
                <circle cx="0" cy="0" r="1.2" fill="#C87D87" fillOpacity="0.55"/>
              </g>
            </svg>
            <div className="h-24 w-px bg-gradient-to-t from-transparent to-[#C87D87]/25"/>
          </div>
        ))}
      </div>

      {/* ══ HERO ══ */}
      <section className="relative w-full overflow-hidden bg-[#FBEAD6]" style={{ minHeight:'92vh', paddingTop:'80px' }}>
        <div className="absolute top-1/2 left-1/2 pointer-events-none" style={{ width:'700px', height:'700px', borderRadius:'50%', background:'radial-gradient(ellipse at center,rgba(200,125,135,0.28) 0%,rgba(200,125,135,0.07) 40%,transparent 68%)', animation:'auraPulse 5s ease-in-out infinite', filter:'blur(8px)', transform:'translate(-50%,-50%)' }}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full border border-[#C87D87]/6 animate-[rotateSlow_55s_linear_infinite] pointer-events-none"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-[#6B7556]/5 animate-[rotateSlow_35s_linear_infinite_reverse] pointer-events-none"/>
        <div className="absolute top-24 right-24 w-24 h-24 rounded-full bg-[#C87D87]/6 blur-2xl animate-[float_7s_ease-in-out_infinite] pointer-events-none"/>
        <div className="absolute bottom-16 left-20 w-32 h-32 rounded-full bg-[#6B7556]/5 blur-3xl animate-[float_9s_ease-in-out_infinite_2s] pointer-events-none"/>

        <div className="relative z-10 max-w-7xl mx-auto px-10 md:px-20 h-full flex flex-col md:flex-row items-center gap-16 py-16">

          {/* LEFT */}
          <div className="flex-1 flex flex-col items-start text-left">
            <div className="flex items-center gap-3 mb-6 opacity-0 animate-[fadeIn_.8s_ease_.2s_forwards]">
              <div className="w-8 h-px bg-[#C87D87]"/>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] tracking-[.35em] uppercase text-xs">Private Gatherings</p>
            </div>
            <h1 className="font-['Playfair_Display',serif] italic font-bold text-[clamp(2.6rem,5vw,4.6rem)] text-[#3a3027] leading-[1.1] mb-2 opacity-0 animate-[fadeInUp_1s_ease_.4s_forwards]">
              Where Small
            </h1>
            <h1 className="font-['Playfair_Display',serif] italic font-bold text-[clamp(2.6rem,5vw,4.6rem)] leading-[1.1] mb-2 opacity-0"
              style={{ background:'linear-gradient(135deg,#C87D87 0%,#a85e6a 50%,#C87D87 100%)', backgroundSize:'200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'fadeInUp 1s ease .55s forwards, shimmer 5s linear 1.5s infinite' }}>
              Circles Create
            </h1>
            <h1 className="font-['Playfair_Display',serif] italic font-bold text-[clamp(2.6rem,5vw,4.6rem)] text-[#3a3027] leading-[1.1] mb-8 opacity-0 animate-[fadeInUp_1s_ease_.7s_forwards]">
              Big Memories.
            </h1>
            <p className="font-['Cormorant_Garamond',serif] text-[1.15rem] text-[#5a4a3a] leading-[1.85] mb-9 max-w-md opacity-0 animate-[fadeIn_1s_ease_.9s_forwards]">
              Inora designs intimate gatherings for up to{' '}
              <span className="text-[#C87D87] font-semibold">12 friends</span> —
              choose your setting, pick your craft, and let us handle the rest.
            </p>
            <div className="flex items-center gap-5 mb-10 opacity-0 animate-[fadeInUp_1s_ease_1.1s_forwards]">
              <Link href="/gatherings"
                className="font-['Cormorant_Garamond',serif] text-sm tracking-[.22em] uppercase bg-[#C87D87] text-[#FBEAD6] px-8 py-3 rounded-xl hover:bg-[#6B7556] transition-all duration-300 shadow-[0_8px_24px_rgba(200,125,135,0.25)] hover:shadow-[0_12px_32px_rgba(107,117,86,0.25)] hover:-translate-y-0.5">
                Plan a Gathering
              </Link>
              <Link href="#activities"
                className="font-['Cormorant_Garamond',serif] text-sm tracking-[.2em] uppercase text-[#6B7556] flex items-center gap-2 border-b border-[#6B7556]/30 pb-0.5 hover:border-[#6B7556] hover:gap-3 transition-all duration-300">
                See Activities <span>→</span>
              </Link>
            </div>

            {/* stats — staggered countUp */}
            <div className="flex items-center gap-8 opacity-0 animate-[fadeIn_1s_ease_1.3s_forwards]">
              {[{num:'12',label:'Guests Max'},{num:'3',label:'Crafts Available'},{num:'∞',label:'Memories Made'}].map((s,i)=>(
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <div className="w-px h-8 bg-[#C87D87]/20"/>}
                  <div style={{ animation:`countUp .6s cubic-bezier(.4,0,.2,1) ${1.4+i*0.12}s both` }}>
                    <p className="font-['Playfair_Display',serif] italic text-xl text-[#C87D87] font-bold leading-none">{s.num}</p>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[.18em] uppercase text-[#7a6a5a] mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 relative hidden md:flex justify-center items-center opacity-0 animate-[scaleIn_1.1s_cubic-bezier(.4,0,.2,1)_.6s_forwards]">
            <div className="relative w-[360px] h-[460px] overflow-hidden rounded-2xl shadow-[0_32px_64px_rgba(58,48,39,0.18)] border border-[#C87D87]/18 img-zoom">
              <img src="https://images.unsplash.com/photo-1505236738411-6d0a1e5b00c5" alt="Inora gathering" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#3a3027]/25 to-transparent"/>
              <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/12 pointer-events-none"/>
              <div className="absolute inset-[6px] rounded-xl border border-[#C87D87]/6 pointer-events-none"/>
            </div>
            <div className="absolute -bottom-4 -left-8 bg-[#FBEAD6]/92 backdrop-blur-xl border border-[#C87D87]/22 rounded-2xl px-5 py-4 shadow-[0_16px_48px_rgba(58,48,39,0.14)]"
              style={{ animation:'slideInLeft 0.8s cubic-bezier(.4,0,.2,1) 1s both' }}>
              <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/10 pointer-events-none"/>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[.25em] uppercase mb-0.5">Est. 2026</p>
              <p className="font-['Playfair_Display',serif] italic text-[#3a3027] text-lg leading-tight">Inora</p>
              <p className="font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a] mt-0.5">Gather. Create. Remember.</p>
            </div>
            <div className="absolute -top-6 -right-6 w-[130px] h-[150px] overflow-hidden rounded-xl border-4 border-[#FBEAD6] shadow-[0_16px_40px_rgba(58,48,39,0.16)] img-zoom"
              style={{ animation:'slideInRight 0.8s cubic-bezier(.4,0,.2,1) 1.1s both' }}>
              <img src="https://images.unsplash.com/photo-1612278675615-7b093b07772d" alt="Crochet activity" className="w-full h-full object-cover"/>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-0 animate-[fadeIn_1s_ease_2s_forwards]">
          <span className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[.3em] uppercase text-[#C87D87]/50">Scroll</span>
          <div className="w-px h-6 bg-gradient-to-b from-[#C87D87]/50 to-transparent animate-[scrollLine_2s_ease-in-out_infinite]"/>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative py-5 flex items-center justify-center bg-[#FBEAD6]">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#C87D87]/25 to-transparent"/>
        <div className="relative bg-[#FBEAD6] px-6 flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#C87D87]/50"/>
          <span className="text-[#C87D87]/50 text-xs tracking-[.8em]">✦ ✦ ✦</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#C87D87]/50"/>
        </div>
      </div>

      {/* ══ ACTIVITIES ══ */}
      <section id="activities" ref={activitiesRef} className="py-20 px-8 md:px-24 bg-[#FBEAD6]">
        <div className="max-w-6xl mx-auto">

          {/* section header */}
          <div className="grid md:grid-cols-2 gap-8 items-end mb-12">
            <div className={`reveal-left ${activitiesIn ? 'in-view' : ''}`}>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-sm tracking-[.35em] uppercase mb-2">Craft Your Experience</p>
              <h2 className="font-['Playfair_Display',serif] italic text-[clamp(2.2rem,3.8vw,3.4rem)] text-[#3a3027] leading-[1.15]">
                Choose Your<br/><span className="text-[#6B7556]">Activity</span>
              </h2>
              {/* animated underline */}
              <div className="flex items-center gap-3 mt-4">
                <div className="h-px bg-[#C87D87]"
                  style={{ width: activitiesIn ? '3rem' : '0', opacity: activitiesIn ? 1 : 0, transition:'width .7s ease .3s, opacity .7s ease .3s' }}/>
                <div className={`w-2 h-2 rotate-45 bg-[#C87D87]/50 transition-opacity duration-700 delay-500 ${activitiesIn?'opacity-100':'opacity-0'}`}/>
              </div>
            </div>
            <p className={`font-['Cormorant_Garamond',serif] text-lg text-[#5a4a3a] leading-relaxed md:text-right reveal-right delay-2 ${activitiesIn ? 'in-view' : ''}`}>
              Each gathering is anchored by a shared creative activity — a hands-on experience that sparks connection and leaves something beautiful behind.
            </p>
          </div>

          {/* cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { img:'https://images.unsplash.com/photo-1612278675615-7b093b07772d', tag:'01', title:'Crochet Circle',   desc:'Gather around yarn and quiet conversation. A slow, meditative craft that brings warmth to any setting.',                   accent:'#C87D87', delay:'delay-1' },
              { img:'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b', tag:'02', title:'Painting Session', desc:'Express freely on canvas surrounded by curated ambience. No experience needed — only the desire to create together.',  accent:'#6B7556', delay:'delay-3' },
              { img:'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261', tag:'03', title:'Pottery Workshop', desc:'Shape and sculpt in an intimate setting. Grounding, joyful, and deeply satisfying when shared with people you love.',    accent:'#C87D87', delay:'delay-5' },
            ].map((a, i) => (
              <div key={i}
                onClick={() => handleActivityClick(a)}
                className={`group relative bg-white/80 backdrop-blur-sm border border-[#C87D87]/14 rounded-2xl overflow-hidden card-hover reveal-scale ${a.delay} ${activitiesIn ? 'in-view' : ''} cursor-pointer`}
                style={activitiesIn ? { animation:`cardGlow .9s ease ${0.1+i*0.15}s` } : {}}>
                <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/8 pointer-events-none"/>
                <div className="absolute inset-[4px] rounded-xl border border-[#C87D87]/5 pointer-events-none"/>
                <div className="absolute top-0 left-0 w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-2xl" style={{ background:`linear-gradient(90deg,${a.accent},transparent)` }}/>
                <div className="overflow-hidden h-52 relative rounded-t-2xl img-zoom">
                  <img src={a.img} alt={a.title} className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3a3027]/30 to-transparent"/>
                  {/* tag badge slides in */}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-[#FBEAD6]/90 backdrop-blur-sm flex items-center justify-center border border-[#C87D87]/20 rounded-lg"
                    style={{ animation: activitiesIn ? `slideInRight .5s ease ${0.3+i*0.15}s both` : 'none' }}>
                    <span className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs font-bold">{a.tag}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-['Playfair_Display',serif] italic text-[1.15rem] text-[#3a3027] mb-1.5 group-hover:text-[#C87D87] transition-colors duration-300">{a.title}</h3>
                  <div className="h-px mb-3 transition-all duration-500 group-hover:w-12" style={{ background: a.accent, width: activitiesIn ? '1.75rem' : '0', transition:'width .6s ease .4s' }}/>
                  <p className="text-sm text-[#5a4a3a] leading-relaxed font-['Cormorant_Garamond',serif]">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section ref={processRef} className="py-20 px-8 md:px-24 overflow-hidden" style={{ background:'linear-gradient(135deg,#6B7556 0%,#5a6347 100%)' }}>
        <div className="max-w-5xl mx-auto">

          {/* heading — scale in */}
          <div className={`text-center mb-12 reveal-scale ${processIn ? 'in-view' : ''}`}>
            <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/70 text-sm tracking-[.35em] uppercase mb-2">Simple by Design</p>
            <h2 className="font-['Playfair_Display',serif] italic text-[clamp(2.2rem,3.8vw,3.4rem)] text-[#FBEAD6] leading-tight">How Inora Works</h2>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="h-px bg-[#FBEAD6]/25"
                style={{ width: processIn ? '4rem' : '0', opacity: processIn ? 1 : 0, transition:'width .7s ease .4s, opacity .7s ease .4s' }}/>
              <div className={`w-2 h-2 rotate-45 border border-[#FBEAD6]/40 transition-all duration-700 delay-500 ${processIn?'opacity-100 scale-100':'opacity-0 scale-0'}`}/>
              <div className="h-px bg-[#FBEAD6]/25"
                style={{ width: processIn ? '4rem' : '0', opacity: processIn ? 1 : 0, transition:'width .7s ease .4s, opacity .7s ease .4s' }}/>
            </div>
          </div>

          {/* connector line draws across */}
          <div className="relative grid md:grid-cols-3 gap-6">
            <div className="hidden md:block absolute top-[2.75rem] h-px bg-[#FBEAD6]/15 overflow-hidden"
              style={{ left:'calc(16.66% + 1.75rem)', right:'calc(16.66% + 1.75rem)' }}>
              <div className="h-full bg-[#FBEAD6]/40"
                style={{ width: processIn ? '100%' : '0', transition:'width 1s ease .6s' }}/>
            </div>

            {[
              { num:'01', title:'Choose Your Setting', desc:'Select the environment that speaks to your group — a sunlit garden, a cosy indoor space, or an open-air terrace.', icon:'◎', delay:'delay-1' },
              { num:'02', title:'Pick Your Craft',     desc:'Choose from crochet, painting, or pottery. We provide everything your group needs to create freely and beautifully.', icon:'◈', delay:'delay-3' },
              { num:'03', title:'Gather & Create',     desc:'Arrive with up to 12 friends. We handle every detail so you can simply be present, connect, and enjoy.', icon:'◇', delay:'delay-5' },
            ].map((step, i) => (
              <div key={i}
                className={`relative bg-[#FBEAD6]/8 backdrop-blur-sm border border-[#FBEAD6]/14 rounded-2xl p-8 step-card reveal-up ${step.delay} ${processIn ? 'in-view' : ''}`}>
                <div className="absolute inset-0 rounded-2xl border border-[#FBEAD6]/8 pointer-events-none"/>
                <div className="absolute inset-[4px] rounded-xl border border-[#FBEAD6]/5 pointer-events-none"/>
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C87D87]/35 to-transparent"/>
                <div className="relative mb-5 flex justify-center">
                  <div className="w-14 h-14 rounded-full border border-[#FBEAD6]/25 flex items-center justify-center bg-[#FBEAD6]/6 group-hover:bg-[#C87D87]/22 transition-all duration-300"
                    style={{ animation: processIn ? `scaleIn .5s cubic-bezier(.4,0,.2,1) ${.3+i*.18}s both` : 'none' }}>
                    <span className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/80 text-lg">{step.num}</span>
                  </div>
                  <div className="absolute -top-1 right-[calc(50%-2rem)] text-[#C87D87]/60 text-xs">{step.icon}</div>
                </div>
                <h3 className="font-['Playfair_Display',serif] italic text-[1.1rem] text-[#FBEAD6] mb-2 text-center">{step.title}</h3>
                <div className="h-px bg-[#C87D87]/50 mb-3 mx-auto transition-all duration-500"
                  style={{ width: processIn ? '2rem' : '0', transition:'width .6s ease .5s' }}/>
                <p className="text-sm text-[#FBEAD6]/65 leading-relaxed font-['Cormorant_Garamond',serif] text-center">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className={`text-center mt-12 reveal-up delay-6 ${processIn ? 'in-view' : ''}`}>
            <Link href="/gatherings"
              className="font-['Cormorant_Garamond',serif] text-sm tracking-[.25em] uppercase text-[#6B7556] bg-[#FBEAD6] px-10 py-3.5 rounded-xl hover:bg-[#C87D87] hover:text-white transition-all duration-300 inline-block shadow-sm hover:shadow-md hover:-translate-y-0.5">
              Book Your Gathering
            </Link>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative py-5 flex items-center justify-center bg-[#FBEAD6]">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#C87D87]/25 to-transparent"/>
        <div className="relative bg-[#FBEAD6] px-6 flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#C87D87]/50"/>
          <span className="text-[#C87D87]/50 text-xs tracking-[.8em]">✦ ✦ ✦</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#C87D87]/50"/>
        </div>
      </div>

      {/* ══ REVIEWS ══ */}
      <section ref={reviewsRef} className="py-20 px-8 md:px-24 bg-[#FBEAD6]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div className={`reveal-left ${reviewsIn ? 'in-view' : ''}`}>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-sm tracking-[.35em] uppercase mb-2">Voices from Our Circles</p>
              <h2 className="font-['Playfair_Display',serif] italic text-[clamp(2.2rem,3.8vw,3.4rem)] text-[#3a3027] leading-tight">
                What Our <span className="text-[#6B7556]">Guests Say</span>
              </h2>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-px bg-[#C87D87]"
                  style={{ width: reviewsIn ? '3rem' : '0', opacity: reviewsIn ? 1 : 0, transition:'width .7s ease .3s, opacity .7s ease .3s' }}/>
                <div className={`w-2 h-2 rotate-45 bg-[#C87D87]/50 transition-all duration-700 delay-500 ${reviewsIn?'opacity-100':'opacity-0'}`}/>
              </div>
            </div>
            <p className={`font-['Cormorant_Garamond',serif] italic text-[#7a6a5a] text-lg max-w-xs md:text-right leading-relaxed reveal-right delay-2 ${reviewsIn ? 'in-view' : ''}`}>
              Every gathering tells a story.<br/>Here are a few of theirs.
            </p>
          </div>

          {reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <div key={review.id}
                  className={`relative bg-white/80 backdrop-blur-sm border border-[#C87D87]/14 rounded-2xl p-7 card-hover reveal-scale delay-${i+1} ${reviewsIn ? 'in-view' : ''} ${i === 1 ? 'md:mt-6' : ''}`}
                  style={reviewsIn ? { animation:`cardGlow .9s ease ${0.1+i*0.15}s` } : {}}>
                  <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/8 pointer-events-none"/>
                  <div className="absolute inset-[4px] rounded-xl border border-[#C87D87]/5 pointer-events-none"/>
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent"/>
                  {/* quote mark drops in */}
                  <div className="font-['Playfair_Display',serif] text-[4rem] text-[#C87D87]/15 leading-none mb-1 -mt-2 select-none"
                    style={{ animation: reviewsIn ? `fadeInUp .5s ease ${0.2+i*0.12}s both` : 'none' }}>"</div>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[1.05rem] text-[#5a4a3a] leading-[1.75] mb-5">{review.comment}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#C87D87]/12">
                    <div className="flex items-center gap-3">
                      {/* avatar pops in */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6B7556] to-[#C87D87] flex items-center justify-center text-white font-['Playfair_Display',serif] text-sm shadow-sm"
                        style={{ animation: reviewsIn ? `scaleIn .4s cubic-bezier(.4,0,.2,1) ${0.35+i*0.12}s both` : 'none' }}>
                        {review.user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027] tracking-wide leading-none">{review.user.fullName}</p>
                        <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/70 mt-0.5">Inora Guest</p>
                      </div>
                    </div>
                    {/* stars slide in from right */}
                    <span className="text-[#C87D87] text-xs tracking-widest"
                      style={{ animation: reviewsIn ? `slideInRight .5s ease ${0.4+i*0.12}s both` : 'none' }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-['Cormorant_Garamond',serif] italic text-xl text-[#C87D87]/60 text-center py-12">
              No reviews yet. Be the first to share your experience.
            </p>
          )}
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer ref={footerRef} className="relative text-white overflow-hidden" style={{ background:'linear-gradient(135deg,#6B7556 0%,#5a6347 100%)' }}>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/60 to-transparent"/>

        <div className="max-w-7xl mx-auto px-10 pt-14 pb-6">
          <div className="grid md:grid-cols-4 gap-10 pb-10 border-b border-[#FBEAD6]/10">

            {/* brand — slides up */}
            <div className={`md:col-span-2 reveal-up ${footerIn ? 'in-view' : ''}`}>
              <h3 className="font-['Playfair_Display',serif] italic text-[2rem] text-[#FBEAD6] tracking-wide leading-none mb-1">Inora</h3>
              <div className="h-px bg-gradient-to-r from-[#FBEAD6]/50 via-[#FBEAD6]/20 to-transparent mb-4"
                style={{ width: footerIn ? '100%' : '0', transition:'width .9s ease .3s' }}/>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/80 text-sm tracking-[.3em] mb-4">Gather. Create. Remember.</p>
              <p className="text-sm leading-[1.85] text-[#FBEAD6]/55 max-w-xs font-['Cormorant_Garamond',serif]">
                Private gatherings for up to 12 friends — curated by ambience, setting, and the craft you choose to share.
              </p>
            </div>

            {/* nav — stagger up */}
            <div className={`reveal-up delay-2 ${footerIn ? 'in-view' : ''}`}>
              <h4 className="font-['Cormorant_Garamond',serif] text-xs tracking-[.35em] uppercase mb-5 text-[#FBEAD6]/50">Explore</h4>
              <ul className="flex flex-col gap-2.5">
                {[{label:'Home',href:'/'},{label:'Gatherings',href:'/gatherings'},{label:'Activities',href:'#activities'},{label:'About Us',href:'#about'}].map(item=>(
                  <li key={item.label} className="relative group">
                    <Link href={item.href} className="font-['Cormorant_Garamond',serif] text-sm text-[#FBEAD6]/60 hover:text-[#C87D87] transition-colors duration-200 tracking-wide flex items-center gap-2 link-line">
                      <span className="w-0 group-hover:w-2 h-px bg-[#C87D87] transition-all duration-200 inline-block"/>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* contact — stagger up */}
            <div className={`reveal-up delay-3 ${footerIn ? 'in-view' : ''}`}>
              <h4 className="font-['Cormorant_Garamond',serif] text-xs tracking-[.35em] uppercase mb-5 text-[#FBEAD6]/50">Get in Touch</h4>
              <div className="flex flex-col gap-3">
                <p className="font-['Cormorant_Garamond',serif] text-sm text-[#FBEAD6]/60 hover:text-[#C87D87] transition-colors cursor-pointer tracking-wide">hello@inora.co</p>
                <p className="font-['Cormorant_Garamond',serif] text-sm text-[#FBEAD6]/60 tracking-wide">+1 234 567 890</p>
                <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/70 tracking-wide mt-1">Available by appointment</p>
              </div>
            </div>
          </div>

          <div className={`flex flex-col md:flex-row items-center justify-between gap-4 pt-6 reveal-fade delay-4 ${footerIn ? 'in-view' : ''}`}>
            <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/30 text-sm">© {new Date().getFullYear()} Inora. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <div className="w-10 h-px bg-[#C87D87]/30"/>
              <span className="text-[#C87D87]/40 text-[0.5rem]">✦</span>
              <div className="w-10 h-px bg-[#C87D87]/30"/>
            </div>
            <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/30 text-sm">Crafted with intention.</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent"/>
      </footer>

      {/* Modal de réservation */}
      <ActivityBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        activity={selectedActivity} 
      />

    </main>
  );
}