'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const CROSSHATCH_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cline x1='0' y1='1' x2='18' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='0' x2='1' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='1' x2='62' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='0' x2='79' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='0' y1='79' x2='18' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='80' x2='1' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='79' x2='62' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='80' x2='79' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Crect x='2' y='2' width='3.5' height='3.5' transform='rotate(45 3.75 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='2' width='3.5' height='3.5' transform='rotate(45 75.25 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='2' y='73.5' width='3.5' height='3.5' transform='rotate(45 3.75 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='73.5' width='3.5' height='3.5' transform='rotate(45 75.25 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Ccircle cx='3.75' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='3.75' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Cline x1='8' y1='1' x2='8' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='12' y1='1' x2='12' y2='3' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='16' y1='1' x2='16' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='64' y1='1' x2='64' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='68' y1='1' x2='68' y2='3' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='72' y1='1' x2='72' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='8' x2='4' y2='8' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='12' x2='3' y2='12' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='16' x2='4' y2='16' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='64' x2='4' y2='64' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='68' x2='3' y2='68' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='72' x2='4' y2='72' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3C/svg%3E")`;

export default function NewReview() {
  const router       = useRouter();
  const { user }     = useAuth();

  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [comment,   setComment]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (user === null) router.push('/login');
  }, [user]);

  const submit = async () => {
    setError('');
    if (!rating) return setError('Please select a rating.');
    if (comment.trim().length < 10) return setError('Comment must be at least 10 characters.');

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || 'Something went wrong.');
      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──
  if (submitted) return (
    <>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div
        className="min-h-screen bg-[#FBEAD6] flex items-center justify-center p-6"
        style={{ backgroundImage: CROSSHATCH_SVG }}
      >
        <div className="text-center max-w-sm" style={{animation:'fadeUp .5s ease both'}}>
          <div className="w-16 h-16 rounded-full bg-[#6B7556]/15 border border-[#6B7556]/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">✨</span>
          </div>
          {/* was text-[0.6rem] text-[#C87D87]/60 → text-sm text-[#C87D87] */}
          <p className="font-['Cormorant_Garamond',serif] italic text-sm tracking-[0.35em] uppercase text-[#C87D87] mb-2">
            Inora · Review
          </p>
          {/* was text-2xl → text-3xl */}
          <h2 className="font-['Playfair_Display',serif] italic text-3xl text-[#3a3027] mb-2">
            Thank you!
          </h2>
          {/* was text-[#7a6a5a]/70 → text-[#5a4a3a], was default size → text-base */}
          <p className="font-['Cormorant_Garamond',serif] italic text-base text-[#5a4a3a] mb-1">
            Your review has been submitted successfully.
          </p>
          {/* was text-sm text-[#7a6a5a]/45 → text-base text-[#7a6a5a]/65 */}
          <p className="font-['Cormorant_Garamond',serif] italic text-base text-[#7a6a5a]/65 mb-8">
            It will appear on our homepage once approved by our team.
          </p>
          <button onClick={() => router.push('/')}
            className="font-['Cormorant_Garamond',serif] tracking-widest uppercase text-sm text-white bg-[#6B7556] px-8 py-3 rounded-xl hover:bg-[#5a6347] transition-all hover:-translate-y-0.5 shadow-sm">
            Back to homepage
          </button>
        </div>
      </div>
    </>
  );

  // ── Form ──
  return (
    <>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div
        className="min-h-screen bg-[#FBEAD6] flex items-center justify-center p-6"
        style={{ backgroundImage: CROSSHATCH_SVG }}
      >
        <div className="w-full max-w-md" style={{animation:'fadeUp .4s ease both'}}>

          <div className="bg-white/70 border border-[#C87D87]/15 rounded-2xl overflow-hidden shadow-sm relative">

            {/* top accent line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/60 to-transparent"/>

            <div className="p-8">
              {/* was text-[0.6rem] text-[#C87D87]/60 → text-sm text-[#C87D87] */}
              <p className="font-['Cormorant_Garamond',serif] italic text-sm tracking-[0.35em] uppercase text-[#C87D87] mb-1">
                Inora · Feedback
              </p>
              {/* was text-2xl → text-3xl */}
              <h1 className="font-['Playfair_Display',serif] italic text-3xl text-[#3a3027] mb-1">
                Share your experience
              </h1>
              {/* was text-sm text-[#7a6a5a]/60 → text-base text-[#7a6a5a] */}
              <p className="font-['Cormorant_Garamond',serif] italic text-base text-[#7a6a5a] mb-8">
                Your words help our community grow and inspire future gatherings.
              </p>

              {/* Stars */}
              <div className="mb-7">
                {/* was text-[0.6rem] text-[#7a6a5a]/50 → text-xs text-[#7a6a5a] font-semibold */}
                <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase text-[#7a6a5a] font-semibold mb-3">
                  Your rating
                </p>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(n)}
                      className="text-4xl transition-all duration-150 hover:scale-125 focus:outline-none leading-none">
                      <span style={{color: n <= (hovered || rating) ? '#C87D87' : '#ddd0c8'}}>
                        {n <= (hovered || rating) ? '★' : '☆'}
                      </span>
                    </button>
                  ))}
                  {/* was text-sm text-[#7a6a5a]/60 → text-base text-[#7a6a5a] */}
                  {(hovered || rating) > 0 && (
                    <span className="font-['Cormorant_Garamond',serif] italic text-base text-[#7a6a5a] ml-1">
                      {['','Poor','Fair','Good','Very good','Excellent'][hovered || rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                {/* was text-[0.6rem] text-[#7a6a5a]/50 → text-xs text-[#7a6a5a] font-semibold */}
                <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase text-[#7a6a5a] font-semibold mb-2">
                  Your comment
                </p>
                {/* textarea: was text-sm → text-base, placeholder opacity /35 → /50 */}
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={5}
                  maxLength={500}
                  placeholder="Describe your experience — the atmosphere, the activity, the people…"
                  className="w-full bg-white/60 border border-[#C87D87]/20 rounded-xl px-4 py-3 font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/50 focus:outline-none focus:border-[#C87D87] transition-all resize-none leading-relaxed"
                />
                <div className="flex justify-between mt-1.5 px-1">
                  {/* was text-[0.58rem] /35 → text-xs /60 */}
                  <span className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/60">
                    Min. 10 characters
                  </span>
                  {/* was text-[0.58rem] /35 → text-xs /60 */}
                  <span className={`font-['Cormorant_Garamond',serif] italic text-xs transition-colors ${
                    comment.length > 450 ? 'text-[#C87D87]' : 'text-[#7a6a5a]/60'
                  }`}>
                    {comment.length}/500
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 px-4 py-3 bg-[#C87D87]/8 border border-[#C87D87]/20 rounded-xl">
                  {/* was text-sm → text-base */}
                  <p className="font-['Cormorant_Garamond',serif] italic text-base text-[#C87D87]">
                    ⚠ {error}
                  </p>
                </div>
              )}

              {/* Submit: was text-sm → text-base */}
              <button
                onClick={submit}
                disabled={!rating || comment.trim().length < 10 || loading}
                className="w-full font-['Cormorant_Garamond',serif] tracking-widest uppercase text-base text-white bg-[#6B7556] py-3.5 rounded-xl hover:bg-[#5a6347] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-sm">
                {loading ? 'Submitting…' : 'Submit my review'}
              </button>
            </div>

            {/* bottom ornament */}
            <div className="flex items-center justify-center gap-2 py-3 border-t border-[#C87D87]/10">
              <div className="w-8 h-px bg-[#C87D87]/20"/>
              <span className="text-[#C87D87]/30 text-[0.5rem]">✦</span>
              <div className="w-8 h-px bg-[#C87D87]/20"/>
            </div>
          </div>

          {/* Back link: was text-sm /45 → text-base /70 */}
          <button onClick={() => router.back()}
            className="mt-4 w-full font-['Cormorant_Garamond',serif] italic text-base text-[#7a6a5a]/70 hover:text-[#7a6a5a] transition-colors text-center">
            ← Go back
          </button>
        </div>
      </div>
    </>
  );
}