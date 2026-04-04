'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ReviewCarousel from '@/components/ReviewCarousel';
import DraftBanner from '@/components/DraftBanner';
import { DEFAULT_REVIEWS } from '@/lib/defaultReviews';

// ─── Data ─────────────────────────────────────────────────────────
const activities = [
  { img: 'https://images.unsplash.com/photo-1612278675615-7b093b07772d', tag: '01', title: 'Crochet Circle',   desc: 'A slow, meditative craft that brings warmth to any setting.' },
  { img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b', tag: '02', title: 'Painting Session', desc: 'Express freely on canvas — no experience needed, only the desire to create.' },
  { img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261', tag: '03', title: 'Pottery Workshop', desc: 'Shape and sculpt in an intimate setting. Grounding and deeply satisfying.' },
];

const steps = [
  { num: '01', title: 'Choose Your Setting', desc: 'Select a sunlit garden, a cosy indoor space, or an open-air terrace. The mood is yours to set.' },
  { num: '02', title: 'Pick Your Craft',     desc: 'Crochet, painting, or pottery — we provide every material your group needs to create freely.' },
  { num: '03', title: 'Gather & Create',     desc: 'Arrive with up to 12 friends. We handle every detail so you can simply be present.' },
];

const stats = [
  { num: '12', label: 'Guests Maximum' },
  { num: '3',  label: 'Unique Crafts'  },
  { num: '3',  label: 'Venue Styles'   },
];

const footerLinks = [
  { label: 'Home',         href: '#hero'       },
  { label: 'Activities',   href: '#activities' },
  { label: 'How It Works', href: '#process'    },
  { label: 'Reviews',      href: '#reviews'    },
];

// ─── SVG Patterns ─────────────────────────────────────────────────
const CROSSHATCH_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cline x1='0' y1='1' x2='18' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='0' x2='1' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='1' x2='62' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='0' x2='79' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='0' y1='79' x2='18' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='80' x2='1' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='79' x2='62' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='80' x2='79' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Crect x='2' y='2' width='3.5' height='3.5' transform='rotate(45 3.75 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='2' width='3.5' height='3.5' transform='rotate(45 75.25 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='2' y='73.5' width='3.5' height='3.5' transform='rotate(45 3.75 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='73.5' width='3.5' height='3.5' transform='rotate(45 75.25 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Ccircle cx='3.75' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='3.75' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3C/svg%3E")`;

const SAGE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='0.7' fill='%23FBEAD6' fill-opacity='0.20'/%3E%3Crect x='27.5' y='27.5' width='5' height='5' transform='rotate(45 30 30)' fill='none' stroke='%23C87D87' stroke-width='0.45' stroke-opacity='0.32'/%3E%3Ccircle cx='10' cy='10' r='0.4' fill='%23FBEAD6' fill-opacity='0.09'/%3E%3Ccircle cx='50' cy='10' r='0.4' fill='%23FBEAD6' fill-opacity='0.09'/%3E%3Ccircle cx='10' cy='50' r='0.4' fill='%23FBEAD6' fill-opacity='0.09'/%3E%3Ccircle cx='50' cy='50' r='0.4' fill='%23FBEAD6' fill-opacity='0.09'/%3E%3C/svg%3E")`;

// ─── Global Styles ─────────────────────────────────────────────────
const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  @keyframes fadeUp      { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
  @keyframes shimmer     { from{background-position:-200% center} to{background-position:200% center} }
  @keyframes floatY      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes floatX      { 0%,100%{transform:translateX(0)} 50%{transform:translateX(6px)} }
  @keyframes scaleIn     { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes cardGlow    { 0%{box-shadow:0 0 0 rgba(200,125,135,0)} 60%{box-shadow:0 8px 28px rgba(200,125,135,0.18)} 100%{box-shadow:0 8px 28px rgba(200,125,135,0)} }
  @keyframes rotateSlow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes auraPulse   { 0%,100%{opacity:.18;transform:scale(1)} 50%{opacity:.32;transform:scale(1.08)} }
  @keyframes lacePulse   { 0%,100%{opacity:.35} 50%{opacity:.75} }
  @keyframes carouselFade{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes countUp     { from{opacity:0;transform:translateY(8px) scale(.9)} to{opacity:1;transform:none} }

  .reveal       { opacity:0; transform:translateY(28px);  transition:opacity .8s cubic-bezier(.4,0,.2,1), transform .8s cubic-bezier(.4,0,.2,1); }
  .reveal-left  { opacity:0; transform:translateX(-28px); transition:opacity .8s cubic-bezier(.4,0,.2,1), transform .8s cubic-bezier(.4,0,.2,1); }
  .reveal-right { opacity:0; transform:translateX(28px);  transition:opacity .8s cubic-bezier(.4,0,.2,1), transform .8s cubic-bezier(.4,0,.2,1); }
  .in-view { opacity:1 !important; transform:none !important; }

  .d1{transition-delay:.08s} .d2{transition-delay:.18s} .d3{transition-delay:.28s}
  .d4{transition-delay:.38s} .d5{transition-delay:.48s} .d6{transition-delay:.58s}

  .inora-panel {
    background: #fef6ec;
    border: 1px solid rgba(200,125,135,0.20);
    border-radius: 18px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(58,48,39,0.06);
    transition: border-color .22s, box-shadow .22s, transform .22s;
  }
  .inora-panel::before {
    content:'';
    position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,transparent,rgba(200,125,135,0.5),transparent);
  }
  .inora-panel:hover {
    border-color:rgba(200,125,135,0.38);
    transform:translateY(-2px);
    box-shadow:0 8px 32px rgba(58,48,39,0.10);
  }

  .sage-panel {
    background-color: #6B7556;
    background-image: ${SAGE_SVG};
    position: relative;
    overflow: hidden;
  }
  .sage-panel::before {
    content:'';
    position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,transparent,rgba(200,125,135,0.45),transparent);
    z-index:1;
  }

  .dash-bg {
    background-color: #FBEAD6;
    background-image: ${CROSSHATCH_SVG};
  }

  .pink-gradient {
    background: linear-gradient(160deg, #C87D87 0%, #b56b76 55%, #a55e6a 100%);
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: #FBEAD6; }
  ::-webkit-scrollbar-thumb { background: rgba(200,125,135,0.40); border-radius: 8px; }
`;

// ─── Hook ─────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── NavCorner SVG ────────────────────────────────────────────────
function NavCorner({ flip = false, bottom = false, light = false }) {
  const s  = light ? '#FBEAD6' : '#C87D87';
  const o1 = light ? 0.40 : 0.55;
  const o2 = light ? 0.30 : 0.38;
  const rot = flip && bottom ? 'rotate(180deg)' : flip ? 'rotate(90deg)' : bottom ? 'rotate(-90deg)' : 'rotate(0deg)';
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      style={{ position:'absolute', top: bottom ? undefined : 0, bottom: bottom ? 0 : undefined,
               [flip?'right':'left']: 0, transform: rot, pointerEvents:'none', userSelect:'none', zIndex:2 }}>
      <line x1="0" y1="1"  x2="18" y2="1"  stroke={s} strokeWidth="0.9" strokeOpacity={o1}/>
      <line x1="1" y1="0"  x2="1"  y2="18" stroke={s} strokeWidth="0.9" strokeOpacity={o1}/>
      <line x1="4" y1="6"  x2="14" y2="6"  stroke={s} strokeWidth="0.55" strokeOpacity={o2}/>
      <line x1="6" y1="4"  x2="6"  y2="14" stroke={s} strokeWidth="0.55" strokeOpacity={o2}/>
      <rect x="2.5" y="2.5" width="5.5" height="5.5" transform="rotate(45 5.25 5.25)" fill="none" stroke={s} strokeWidth="0.7" strokeOpacity={light ? 0.65 : 0.85}/>
      <circle cx="5.25" cy="5.25" r="0.85" fill={s} fillOpacity={light ? 0.38 : 0.45}/>
      <circle cx="9"  cy="5.5" r="0.7" fill={s} fillOpacity="0.20"/>
      <circle cx="5.5" cy="9"  r="0.7" fill={s} fillOpacity="0.20"/>
      {[7,11,15].map((x,j) => <line key={`h${x}`} x1={x} y1="1" x2={x} y2={j===2?4:3} stroke={s} strokeWidth="0.4" strokeOpacity="0.25"/>)}
      {[7,11,15].map((y,j) => <line key={`v${y}`} x1="1" y1={y} x2={j===2?4:3} y2={y} stroke={s} strokeWidth="0.4" strokeOpacity="0.25"/>)}
    </svg>
  );
}

// ─── Hero Activity Panel ──────────────────────────────────────────
function HeroActivityPanel({ imgIndex, imgFading, setImgIndex }) {
  const a = activities[imgIndex];
  return (
    <div className="sage-panel" style={{ borderRadius:'20px', overflow:'hidden', height:'100%', minHeight:'480px',
        boxShadow:'0 12px 48px rgba(58,48,39,0.18)', border:'1px solid rgba(200,125,135,0.20)' }}>
      <div style={{ position:'relative', zIndex:3, display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0.9rem 1.25rem', borderBottom:'1px solid rgba(251,234,214,0.10)',
          background:'rgba(107,117,86,0.6)', backdropFilter:'blur(8px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#C87D87' }}/>
          <span style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic', fontSize:'0.72rem',
              letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(251,234,214,0.85)' }}>Available Activities</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          {activities.map((_,i) => (
            <button key={i} onClick={() => setImgIndex(i)}
              style={{ width: i===imgIndex ? '1.5rem' : '0.4rem', height:'0.4rem', borderRadius:'4px',
                  background: i===imgIndex ? '#C87D87' : 'rgba(251,234,214,0.25)', border:'none',
                  cursor:'pointer', transition:'all .3s ease', padding:0 }}/>
          ))}
        </div>
      </div>

      <div style={{ position:'relative', height:'260px', overflow:'hidden' }}>
        <img key={imgIndex} src={a.img} alt={a.title}
          style={{ width:'100%', height:'100%', objectFit:'cover', opacity: imgFading ? 0 : 1, transition:'opacity .6s ease' }}/>
        <div style={{ position:'absolute', inset:0,
            background:'linear-gradient(to top, #6B7556 0%, rgba(107,117,86,0.3) 50%, transparent 100%)' }}/>
        <div style={{ position:'absolute', top:'1rem', left:'1rem', zIndex:2,
            background:'rgba(107,117,86,0.88)', backdropFilter:'blur(6px)',
            border:'1px solid rgba(200,125,135,0.30)', borderRadius:'8px',
            padding:'0.3rem 0.7rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
          <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#C87D87' }}/>
          <span style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic', fontWeight:700,
              fontSize:'0.72rem', letterSpacing:'0.12em', color:'#C87D87' }}>{a.tag}</span>
        </div>
      </div>

      <div style={{ padding:'1.25rem 1.5rem 1.5rem', position:'relative', zIndex:2 }}>
        <NavCorner light/>
        <NavCorner flip light/>
        <h3 style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontSize:'1.45rem',
            color:'#FBEAD6', margin:'0 0 0.5rem 0', lineHeight:1.2 }}>{a.title}</h3>
        <div style={{ width:'2rem', height:'2px', background:'#C87D87', borderRadius:'2px', marginBottom:'0.65rem' }}/>
        <p style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic', fontSize:'0.92rem',
            color:'rgba(251,234,214,0.75)', lineHeight:1.7, margin:'0 0 1.1rem 0' }}>{a.desc}</p>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          {['Garden', 'Indoor', 'Terrace'].map(v => (
            <span key={v} style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'0.7rem',
                letterSpacing:'0.1em', textTransform:'uppercase',
                color:'rgba(251,234,214,0.75)', background:'rgba(251,234,214,0.07)',
                border:'1px solid rgba(251,234,214,0.18)', borderRadius:'6px', padding:'0.25rem 0.6rem' }}>
              {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function Home() {
  const router   = useRouter();
  const { user } = useAuth();
  const [reviews,   setReviews]   = useState([]);
  const [imgIndex,  setImgIndex]  = useState(0);
  const [imgFading, setImgFading] = useState(false);

  const [heroRef,       heroIn]       = useInView(0.05);
  const [activitiesRef, activitiesIn] = useInView();
  const [processRef,    processIn]    = useInView();
  const [reviewsRef,    reviewsIn]    = useInView();
  const [footerRef,     footerIn]     = useInView();

  const allReviews = [...DEFAULT_REVIEWS, ...reviews];

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/approved`, { credentials: 'include' })
      .then(r => r.json()).then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setImgFading(true);
      setTimeout(() => { setImgIndex(i => (i + 1) % activities.length); setImgFading(false); }, 600);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const handleActivityClick = (activity) => {
    if (!user) { router.push('/sign-up'); return; }
    router.push(`/book?activity=${encodeURIComponent(activity.title)}`);
  };

  return (
    <main className="dash-bg" style={{ margin:0, padding:0, color:'#3a3027', overflowX:'hidden',
        fontFamily:"'Cormorant Garamond', serif", minHeight:'100vh' }}>
      <style>{globalStyles}</style>
      <Navbar/>
      <DraftBanner/>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section id="hero" ref={heroRef} style={{ minHeight:'100vh', paddingTop:'68px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'20%', left:'8%', width:'420px', height:'420px',
            borderRadius:'50%', background:'radial-gradient(ellipse, rgba(200,125,135,0.10) 0%, transparent 70%)',
            animation:'auraPulse 7s ease-in-out infinite', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'15%', right:'35%', width:'280px', height:'280px',
            borderRadius:'50%', background:'radial-gradient(ellipse, rgba(107,117,86,0.08) 0%, transparent 70%)',
            animation:'auraPulse 9s ease-in-out infinite 2s', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'50%', left:'30%', width:'500px', height:'500px',
            borderRadius:'50%', border:'1px solid rgba(200,125,135,0.06)',
            transform:'translate(-50%,-50%)', animation:'rotateSlow 50s linear infinite', pointerEvents:'none' }}/>

        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'3rem 4rem 3rem 4.5rem',
            minHeight:'calc(100vh - 68px)', display:'grid',
            gridTemplateColumns:'1.1fr 0.9fr', gap:'2.5rem', alignItems:'center' }}>

          <div style={{ display:'flex', flexDirection:'column' }}>
            <div className={`reveal d1 ${heroIn?'in-view':''}`}
              style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', marginBottom:'2rem',
                  alignSelf:'flex-start', background:'rgba(200,125,135,0.10)',
                  border:'1px solid rgba(200,125,135,0.22)', borderRadius:'999px',
                  padding:'0.35rem 1rem 0.35rem 0.7rem' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#C87D87' }}/>
              <span style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic',
                  fontSize:'0.72rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'#C87D87' }}>
                Private Gatherings · Est. 2026
              </span>
            </div>

            <h1 className={`reveal d2 ${heroIn?'in-view':''}`}
              style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(2.8rem,4.5vw,5rem)',
                  fontWeight:700, fontStyle:'italic', lineHeight:1.05, color:'#3a3027', margin:'0 0 0.25rem' }}>
              Where Small
            </h1>
            <h1 className={`reveal d3 ${heroIn?'in-view':''}`}
              style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(2.8rem,4.5vw,5rem)',
                  fontWeight:700, fontStyle:'italic', lineHeight:1.05, margin:'0 0 0.25rem',
                  background:'linear-gradient(135deg,#C87D87,#a85e6a,#C87D87)', backgroundSize:'200%',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                  animation: heroIn ? 'shimmer 6s linear 1s infinite' : 'none' }}>
              Circles Create
            </h1>
            <h1 className={`reveal d4 ${heroIn?'in-view':''}`}
              style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(2.8rem,4.5vw,5rem)',
                  fontWeight:700, fontStyle:'italic', lineHeight:1.05, color:'#3a3027', margin:'0 0 1.75rem' }}>
              Big Memories.
            </h1>

            <p className={`reveal d4 ${heroIn?'in-view':''}`}
              style={{ fontSize:'1.1rem', lineHeight:1.9, color:'#5a4a3a', maxWidth:'380px', margin:'0 0 2rem' }}>
              Inora designs intimate gatherings for up to{' '}
              <strong style={{ color:'#C87D87', fontWeight:600 }}>12 friends</strong> —
              choose your setting, pick your craft, and let us handle everything else.
            </p>

            <div className={`reveal d5 ${heroIn?'in-view':''}`}
              style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'2.5rem' }}>
              <Link href="/book"
                style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'0.75rem', letterSpacing:'0.22em',
                    textTransform:'uppercase', color:'#FBEAD6', padding:'0.9rem 2.25rem',
                    background:'linear-gradient(160deg,#C87D87,#b56b76)', borderRadius:'10px',
                    textDecoration:'none', boxShadow:'0 6px 20px rgba(200,125,135,0.35)',
                    transition:'all .3s ease', display:'inline-block' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 30px rgba(200,125,135,0.45)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 6px 20px rgba(200,125,135,0.35)'}}>
                Plan a Gathering
              </Link>
              <Link href="#activities"
                style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'0.75rem', letterSpacing:'0.2em',
                    textTransform:'uppercase', color:'#6B7556', textDecoration:'none',
                    display:'flex', alignItems:'center', gap:'0.5rem',
                    borderBottom:'1px solid rgba(107,117,86,0.5)', paddingBottom:'2px', transition:'all .3s ease' }}
                onMouseEnter={e=>e.currentTarget.style.gap='0.8rem'}
                onMouseLeave={e=>e.currentTarget.style.gap='0.5rem'}>
                Explore Activities →
              </Link>
            </div>

            <div className={`reveal d6 ${heroIn?'in-view':''}`}
              style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem' }}>
              {stats.map((s, i) => (
                <div key={i} className="inora-panel"
                  style={{ padding:'1rem 1.1rem', cursor:'default',
                      animation: heroIn ? `countUp .5s cubic-bezier(.4,0,.2,1) ${.6+i*.12}s both` : 'none' }}>
                  <NavCorner/>
                  <div style={{ fontFamily:"'Playfair Display', serif", fontSize:'1.8rem', fontStyle:'italic',
                      fontWeight:700, color:'#C87D87', lineHeight:1 }}>{s.num}</div>
                  <div style={{ fontSize:'0.68rem', letterSpacing:'0.14em', textTransform:'uppercase',
                      color:'rgba(122,106,90,0.75)', marginTop:'0.35rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`reveal d3 ${heroIn?'in-view':''}`} style={{ position:'relative' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-30px', width:'180px', height:'180px',
                borderRadius:'50%', background:'radial-gradient(ellipse, rgba(200,125,135,0.12) 0%, transparent 70%)',
                animation:'floatY 6s ease-in-out infinite', pointerEvents:'none', zIndex:0 }}/>
            <div style={{ position:'relative', zIndex:1 }}>
              <HeroActivityPanel imgIndex={imgIndex} imgFading={imgFading} setImgIndex={setImgIndex}/>
            </div>
          </div>
        </div>

        <div style={{ position:'absolute', bottom:'2rem', left:'50%', transform:'translateX(-50%)',
            display:'flex', flexDirection:'column', alignItems:'center', gap:'0.4rem',
            animation:'fadeIn 1s ease 2.5s both', opacity:0, zIndex:5 }}>
          <span style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic', fontSize:'0.62rem',
              letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(58,48,39,0.50)' }}>Scroll</span>
          <div style={{ width:'1px', height:'2.5rem',
              background:'linear-gradient(to bottom, rgba(200,125,135,0.5), transparent)',
              animation:'floatY 2s ease-in-out infinite' }}/>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          ACTIVITIES
      ══════════════════════════════════════════ */}
      <section id="activities" ref={activitiesRef} style={{ padding:'5rem 5rem 6rem' }}>
        <div className="pink-gradient" style={{ borderRadius:'16px', padding:'2.5rem 3rem', marginBottom:'3rem',
            display:'flex', alignItems:'flex-end', justifyContent:'space-between',
            boxShadow:'0 4px 24px rgba(200,125,135,0.30)', position:'relative', overflow:'hidden' }}>
          <NavCorner light/> <NavCorner flip light/>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'rgba(255,255,255,0.15)' }}/>
          <div className={`reveal-left ${activitiesIn?'in-view':''}`}>
            <span style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic', fontSize:'0.72rem',
                letterSpacing:'0.32em', textTransform:'uppercase', color:'rgba(251,234,214,0.85)',
                display:'block', marginBottom:'0.5rem' }}>Craft Your Experience</span>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic',
                fontSize:'clamp(1.8rem,3vw,2.8rem)', color:'#FBEAD6', margin:0, lineHeight:1.15 }}>
              Choose Your Activity
            </h2>
          </div>
          <p className={`reveal-right d2 ${activitiesIn?'in-view':''}`}
            style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'1rem',
                color:'rgba(251,234,214,0.80)', maxWidth:'280px', textAlign:'right', lineHeight:1.8, margin:0 }}>
            Every gathering is anchored by a shared creative activity that sparks real connection.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.25rem' }}>
          {activities.map((a, i) => (
            <div key={i} onClick={() => handleActivityClick(a)}
              className={`inora-panel reveal d${i+1} ${activitiesIn?'in-view':''}`}
              style={{ cursor:'pointer', ...(activitiesIn ? { animation:`cardGlow .9s ease ${0.1+i*.15}s` } : {}) }}>
              <div style={{ height:'230px', overflow:'hidden', position:'relative' }}>
                <img src={a.img} alt={a.title}
                  style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .6s ease' }}
                  onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                  onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(58,48,39,0.5) 0%, transparent 55%)' }}/>
                <div style={{ position:'absolute', top:'1rem', left:'1rem', background:'rgba(254,246,236,0.92)',
                    border:'1px solid rgba(200,125,135,0.25)', borderRadius:'8px',
                    padding:'0.25rem 0.65rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#C87D87' }}/>
                  <span style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic', fontWeight:700,
                      fontSize:'0.72rem', letterSpacing:'0.12em', color:'#C87D87' }}>{a.tag}</span>
                </div>
              </div>
              <div style={{ padding:'1.5rem 1.75rem 1.75rem' }}>
                <h3 style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontSize:'1.3rem',
                    color:'#3a3027', margin:'0 0 0.6rem', lineHeight:1.2 }}>{a.title}</h3>
                <div style={{ width:'1.75rem', height:'2px', background:'#C87D87', borderRadius:'2px', marginBottom:'0.65rem' }}/>
                <p style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'0.95rem',
                    color:'rgba(90,74,58,0.80)', lineHeight:1.85, margin:'0 0 1.25rem' }}>{a.desc}</p>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:"'Cormorant Garamond', serif",
                    fontStyle:'italic', fontSize:'0.8rem', letterSpacing:'0.12em', textTransform:'uppercase',
                    color:'#C87D87', borderTop:'1px solid rgba(200,125,135,0.12)', paddingTop:'1rem' }}>
                  <span>Book this activity</span><span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="process" ref={processRef} className="sage-panel"
        style={{ padding:'3.5rem 5rem 3.5rem', position:'relative', overflow:'hidden' }}>

        <div style={{ position:'absolute', top:'-80px', left:'-60px', width:'380px', height:'380px',
            borderRadius:'50%', background:'radial-gradient(ellipse, rgba(200,125,135,0.08) 0%, transparent 70%)',
            animation:'auraPulse 8s ease-in-out infinite', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-60px', right:'-40px', width:'300px', height:'300px',
            borderRadius:'50%', background:'radial-gradient(ellipse, rgba(251,234,214,0.05) 0%, transparent 70%)',
            animation:'auraPulse 11s ease-in-out infinite 3s', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'50%', left:'50%', width:'600px', height:'600px',
            borderRadius:'50%', border:'1px solid rgba(251,234,214,0.04)',
            transform:'translate(-50%,-50%)', animation:'rotateSlow 60s linear infinite', pointerEvents:'none' }}/>

        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between',
            marginBottom:'2.5rem', position:'relative', zIndex:2 }}>
          <div className={`reveal-left ${processIn?'in-view':''}`}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.6rem',
                background:'rgba(251,234,214,0.07)', border:'1px solid rgba(251,234,214,0.15)',
                borderRadius:'999px', padding:'0.3rem 0.9rem 0.3rem 0.6rem' }}>
              <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#C87D87' }}/>
              <span style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic', fontSize:'0.70rem',
                  letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(200,125,135,0.90)' }}>
                Simple by Design
              </span>
            </div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic',
                fontSize:'clamp(1.8rem,3vw,2.8rem)', color:'#FBEAD6', margin:0, lineHeight:1.15 }}>
              How Inora Works
            </h2>
          </div>
          <Link href="/book"
            className={`reveal-right d2 ${processIn?'in-view':''}`}
            style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'0.72rem', letterSpacing:'0.2em',
                textTransform:'uppercase', color:'#6B7556', padding:'0.75rem 1.75rem',
                background:'#FBEAD6', borderRadius:'10px', textDecoration:'none',
                transition:'all .3s ease', display:'inline-block', flexShrink:0,
                boxShadow:'0 4px 16px rgba(58,48,39,0.20)' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(58,48,39,0.30)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 16px rgba(58,48,39,0.20)'}}>
            Book Your Gathering
          </Link>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.25rem',
            position:'relative', zIndex:2 }}>
          <div style={{ position:'absolute', top:'3rem', left:'calc(33.33% - 0px)', right:'calc(33.33% - 0px)',
              height:'1px', borderTop:'1px dashed rgba(200,125,135,0.25)', zIndex:0, pointerEvents:'none' }}/>

          {steps.map((step, i) => {
            const icons = ['◈', '✦', '◉'];
            const isMiddle = i === 1;
            return (
              <div key={i}
                className={`reveal d${i+1} ${processIn?'in-view':''}`}
                style={{ position:'relative', zIndex:1,
                    animation: processIn ? `countUp .6s cubic-bezier(.4,0,.2,1) ${i*.15}s both` : 'none' }}>
                <div style={{
                  background: isMiddle ? 'rgba(200,125,135,0.12)' : 'rgba(251,234,214,0.05)',
                  border:`1px solid ${isMiddle ? 'rgba(200,125,135,0.35)' : 'rgba(251,234,214,0.10)'}`,
                  borderRadius:'20px', padding:'1.5rem 1.75rem 1.75rem', height:'100%',
                  position:'relative', overflow:'hidden',
                  transition:'transform .3s ease, box-shadow .3s ease', cursor:'default',
                }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 16px 40px rgba(58,48,39,0.25)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px',
                      background: isMiddle ? 'linear-gradient(90deg,transparent,#C87D87,transparent)'
                        : 'linear-gradient(90deg,transparent,rgba(251,234,214,0.20),transparent)' }}/>
                  <div style={{ position:'absolute', bottom:'-0.75rem', right:'0.75rem',
                      fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontWeight:700,
                      fontSize:'6rem', lineHeight:1, userSelect:'none', pointerEvents:'none',
                      color: isMiddle ? 'rgba(200,125,135,0.10)' : 'rgba(251,234,214,0.06)' }}>{step.num}</div>
                  <div style={{ width:'38px', height:'38px', borderRadius:'50%',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background: isMiddle ? 'rgba(200,125,135,0.20)' : 'rgba(251,234,214,0.08)',
                      border:`1px solid ${isMiddle ? 'rgba(200,125,135,0.40)' : 'rgba(251,234,214,0.14)'}`,
                      marginBottom:'1.1rem', fontSize:'0.9rem',
                      color: isMiddle ? '#C87D87' : 'rgba(251,234,214,0.65)' }}>{icons[i]}</div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.7rem',
                      background: isMiddle ? 'rgba(200,125,135,0.15)' : 'rgba(251,234,214,0.06)',
                      border:`1px solid ${isMiddle ? 'rgba(200,125,135,0.30)' : 'rgba(251,234,214,0.10)'}`,
                      borderRadius:'6px', padding:'0.18rem 0.55rem' }}>
                    <span style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic',
                        fontSize:'0.68rem', letterSpacing:'0.20em', textTransform:'uppercase',
                        color: isMiddle ? '#C87D87' : 'rgba(251,234,214,0.65)' }}>Step {step.num}</span>
                  </div>
                  <h3 style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic',
                      fontSize:'1.2rem', color:'#FBEAD6', margin:'0 0 0.5rem', lineHeight:1.25, position:'relative', zIndex:1 }}>
                    {step.title}
                  </h3>
                  <div style={{ width:'1.75rem', height:'2px', borderRadius:'2px', marginBottom:'0.7rem',
                      background: isMiddle ? '#C87D87' : 'rgba(251,234,214,0.30)' }}/>
                  <p style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic',
                      fontSize:'0.92rem', color:'rgba(251,234,214,0.72)', lineHeight:1.8,
                      margin:0, position:'relative', zIndex:1 }}>{step.desc}</p>
                  {i < 2 && (
                    <div style={{ position:'absolute', top:'2.8rem', right:'-1.6rem',
                        zIndex:10, color:'rgba(200,125,135,0.40)', fontSize:'0.55rem' }}>──→</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={`reveal d4 ${processIn?'in-view':''}`}
          style={{ marginTop:'2rem', textAlign:'center', position:'relative', zIndex:2 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
            <div style={{ width:'3rem', height:'1px', background:'rgba(200,125,135,0.30)' }}/>
            <span style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic',
                fontSize:'0.85rem', letterSpacing:'0.18em', textTransform:'uppercase',
                color:'rgba(251,234,214,0.45)' }}>
              Everything taken care of — just arrive and create
            </span>
            <div style={{ width:'3rem', height:'1px', background:'rgba(200,125,135,0.30)' }}/>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════════ */}
      <section id="reviews" ref={reviewsRef} style={{ padding:'2rem 5rem 6rem' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'2.5rem' }}>
          <div className={`reveal-left ${reviewsIn?'in-view':''}`}>
            <span style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic', fontSize:'0.72rem',
                letterSpacing:'0.32em', textTransform:'uppercase', color:'#C87D87', display:'block', marginBottom:'0.6rem' }}>
              Voices from Our Circles
            </span>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic',
                fontSize:'clamp(1.8rem,3vw,2.8rem)', color:'#3a3027', margin:0, lineHeight:1.15 }}>
              What Our <span style={{ color:'#C87D87' }}>Guests Say</span>
            </h2>
          </div>
          <p className={`reveal-right d2 ${reviewsIn?'in-view':''}`}
            style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic', fontSize:'1rem',
                color:'rgba(90,74,58,0.70)', maxWidth:'240px', textAlign:'right', lineHeight:1.8, margin:0 }}>
            Every gathering tells a story.<br/>Here are a few of theirs.
          </p>
        </div>
        <div className={`reveal d2 ${reviewsIn?'in-view':''}`}>
          <ReviewCarousel reviews={allReviews} reviewsIn={reviewsIn}/>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          CTA BAND
      ══════════════════════════════════════════ */}
      <section className="pink-gradient"
        style={{ margin:'0 5rem 5rem', borderRadius:'16px', padding:'3.5rem 4rem',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:'2rem',
            boxShadow:'0 8px 32px rgba(200,125,135,0.35)', position:'relative', overflow:'hidden' }}>
        <NavCorner light/> <NavCorner flip light/>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'rgba(255,255,255,0.18)' }}/>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic',
              fontSize:'clamp(1.6rem,2.8vw,2.5rem)', color:'#FBEAD6', margin:'0 0 0.6rem', lineHeight:1.2 }}>
            Ready to Gather?
          </h2>
          <p style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'1.05rem',
              color:'rgba(251,234,214,0.85)', margin:0, lineHeight:1.8, maxWidth:'400px' }}>
            Plan your next intimate creative experience — everything is taken care of, from setting to craft.
          </p>
        </div>
        <Link href="/book"
          style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'0.75rem', letterSpacing:'0.22em',
              textTransform:'uppercase', color:'#C87D87', padding:'1rem 2.5rem', background:'#fef6ec',
              borderRadius:'10px', textDecoration:'none', whiteSpace:'nowrap', flexShrink:0,
              boxShadow:'0 4px 16px rgba(58,48,39,0.15)', transition:'all .3s ease',
              border:'1px solid rgba(200,125,135,0.2)' }}
          onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(58,48,39,0.22)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 16px rgba(58,48,39,0.15)'}}>
          Book Your Gathering
        </Link>
      </section>


      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer ref={footerRef} className="sage-panel"
        style={{ padding:'2rem 5rem', position:'relative' }}>

        <NavCorner light/> <NavCorner flip light/>

        <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* ── Main row ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr', gap:'4rem', alignItems:'start' }}>

            {/* Col 1 — Brand + tagline */}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
              <span style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic',
                  fontSize:'1.8rem', color:'#FBEAD6', fontWeight:400, letterSpacing:'0.04em' }}>
                Inora
              </span>
              <div style={{ width:'2.5rem', height:'1.5px',
                  background:'linear-gradient(to right, #C87D87, transparent)', borderRadius:'2px' }}/>
              <p style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic',
                  fontSize:'0.92rem', color:'rgba(251,234,214,0.60)', lineHeight:1.8,
                  margin:0, maxWidth:'220px' }}>
                Intimate gatherings for up to 12 friends — curated settings, shared crafts, lasting memories.
              </p>
            </div>

            {/* Col 2 — Navigation */}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.55rem' }}>
              <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'0.65rem',
                  letterSpacing:'0.30em', textTransform:'uppercase',
                  color:'rgba(200,125,135,0.80)', marginBottom:'0.4rem' }}>
                Navigation
              </span>
              {footerLinks.map((link, i) => (
                <Link key={i} href={link.href}
                  style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'0.92rem',
                      color:'rgba(251,234,214,0.65)', textDecoration:'none',
                      transition:'color .2s ease', display:'flex', alignItems:'center', gap:'0.5rem' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#C87D87';
                    e.currentTarget.querySelector('span').style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(251,234,214,0.65)';
                    e.currentTarget.querySelector('span').style.opacity = '0';
                  }}>
                  <span style={{ fontSize:'0.4rem', color:'#C87D87', opacity:0, transition:'opacity .2s ease' }}>✦</span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Col 3 — Contact */}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.55rem' }}>
              <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'0.65rem',
                  letterSpacing:'0.30em', textTransform:'uppercase',
                  color:'rgba(200,125,135,0.80)', marginBottom:'0.4rem' }}>
                Contact Us
              </span>
              <a href="mailto:hello@inora.co"
                style={{ display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none',
                    fontFamily:"'Cormorant Garamond', serif", fontSize:'0.92rem',
                    color:'rgba(251,234,214,0.65)', transition:'color .2s ease' }}
                onMouseEnter={e => e.currentTarget.style.color = '#C87D87'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(251,234,214,0.65)'}>
                <span style={{ fontSize:'0.7rem', color:'rgba(200,125,135,0.65)' }}>✉</span>
                hello@inora.co
              </a>
              <a href="tel:+12345678900"
                style={{ display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none',
                    fontFamily:"'Cormorant Garamond', serif", fontSize:'0.92rem',
                    color:'rgba(251,234,214,0.65)', transition:'color .2s ease' }}
                onMouseEnter={e => e.currentTarget.style.color = '#C87D87'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(251,234,214,0.65)'}>
                <span style={{ fontSize:'0.7rem', color:'rgba(200,125,135,0.65)' }}>✆</span>
                +1 234 567 890
              </a>
              <span style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic',
                  fontSize:'0.80rem', color:'rgba(251,234,214,0.38)', marginTop:'0.15rem' }}>
                Available by appointment
              </span>
            </div>

          </div>

          {/* ── Divider ── */}
          <div style={{ height:'1px',
              background:'linear-gradient(to right, transparent, rgba(251,234,214,0.12), transparent)' }}/>

          {/* ── Copyright ── */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'1.5rem' }}>
            <div style={{ width:'2.5rem', height:'1px', background:'rgba(200,125,135,0.22)' }}/>
            <p style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:'italic',
                fontSize:'0.82rem', color:'rgba(251,234,214,0.35)', margin:0, textAlign:'center' }}>
              © {new Date().getFullYear()} Inora · All rights reserved · Crafted with intention.
            </p>
            <div style={{ width:'2.5rem', height:'1px', background:'rgba(200,125,135,0.22)' }}/>
          </div>

        </div>
      </footer>

    </main>
  );
}
