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
        className="min-h-screen bg-[#FBEAD6] flex items-center justify-center p-4 sm:p-6"
        style={{ backgroundImage: CROSSHATCH_SVG }}
      >
        <div className="text-center max-w-sm mx-auto px-4" style={{animation:'fadeUp .5s ease both'}}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#6B7556]/15 border border-[#6B7556]/20 flex items-center justify-center mx-auto mb-4 sm:mb-5">
            <span className="text-2xl sm:text-3xl">✨</span>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-xs sm:text-sm tracking-[0.35em] uppercase text-[#C87D87] mb-2">
            Inora · Review
          </p>
          <h2 className="font-['Playfair_Display',serif] italic text-2xl sm:text-3xl text-[#3a3027] mb-2">
            Thank you!
          </h2>
          <p className="font-['Cormorant_Garamond',serif] italic text-sm sm:text-base text-[#5a4a3a] mb-1">
            Your review has been submitted successfully.
          </p>
          <p className="font-['Cormorant_Garamond',serif] italic text-sm sm:text-base text-[#7a6a5a]/65 mb-6 sm:mb-8">
            It will appear on our homepage once approved by our team.
          </p>
          <button onClick={() => router.push('/')}
            className="font-['Cormorant_Garamond',serif] tracking-widest uppercase text-xs sm:text-sm text-white bg-[#6B7556] px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-[#5a6347] transition-all hover:-translate-y-0.5 shadow-sm w-full sm:w-auto">
            Back to homepage
          </button>
        </div>
      </div>
    </>
  );

  // ── Form ──
  return (
    <>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        
        /* Mobile-specific styles */
        @media (max-width: 640px) {
          .stars-container {
            gap: 0.5rem !important;
          }
          .star-button {
            font-size: 1.75rem !important;
          }
          .rating-label {
            font-size: 0.75rem !important;
          }
        }
      `}</style>
      <div
        className="min-h-screen bg-[#FBEAD6] flex items-center justify-center p-4 sm:p-6"
        style={{ backgroundImage: CROSSHATCH_SVG }}
      >
        <div className="w-full max-w-md mx-auto px-2 sm:px-0" style={{animation:'fadeUp .4s ease both'}}>

          <div className="bg-white/70 border border-[#C87D87]/15 rounded-2xl overflow-hidden shadow-sm relative">

            {/* top accent line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/60 to-transparent"/>

            <div className="p-5 sm:p-6 md:p-8">
              <p className="font-['Cormorant_Garamond',serif] italic text-xs sm:text-sm tracking-[0.35em] uppercase text-[#C87D87] mb-1">
                Inora · Feedback
              </p>
              <h1 className="font-['Playfair_Display',serif] italic text-2xl sm:text-3xl text-[#3a3027] mb-1">
                Share your experience
              </h1>
              <p className="font-['Cormorant_Garamond',serif] italic text-sm sm:text-base text-[#7a6a5a] mb-6 sm:mb-8">
                Your words help our community grow and inspire future gatherings.
              </p>

              {/* Stars */}
              <div className="mb-6 sm:mb-7">
                <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase text-[#7a6a5a] font-semibold mb-2 sm:mb-3">
                  Your rating
                </p>
                <div className="stars-container flex items-center gap-2 sm:gap-3 flex-wrap">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(n)}
                      className="star-button text-3xl sm:text-4xl transition-all duration-150 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-[#C87D87]/50 rounded-full p-1 leading-none"
                      aria-label={`Rate ${n} star${n !== 1 ? 's' : ''}`}>
                      <span style={{color: n <= (hovered || rating) ? '#C87D87' : '#ddd0c8'}}>
                        {n <= (hovered || rating) ? '★' : '☆'}
                      </span>
                    </button>
                  ))}
                  {(hovered || rating) > 0 && (
                    <span className="rating-label font-['Cormorant_Garamond',serif] italic text-sm sm:text-base text-[#7a6a5a] ml-0 sm:ml-1">
                      {['','Poor','Fair','Good','Very good','Excellent'][hovered || rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-5 sm:mb-6">
                <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase text-[#7a6a5a] font-semibold mb-2">
                  Your comment
                </p>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={5}
                  maxLength={500}
                  placeholder="Describe your experience — the atmosphere, the activity, the people…"
                  className="w-full bg-white/60 border border-[#C87D87]/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 font-['Cormorant_Garamond',serif] italic text-sm sm:text-base text-[#3a3027] placeholder:text-[#7a6a5a]/50 focus:outline-none focus:border-[#C87D87] transition-all resize-none leading-relaxed"
                />
                <div className="flex justify-between mt-1.5 px-1">
                  <span className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] sm:text-xs text-[#7a6a5a]/60">
                    Min. 10 characters
                  </span>
                  <span className={`font-['Cormorant_Garamond',serif] italic text-[0.65rem] sm:text-xs transition-colors ${
                    comment.length > 450 ? 'text-[#C87D87]' : 'text-[#7a6a5a]/60'
                  }`}>
                    {comment.length}/500
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#C87D87]/8 border border-[#C87D87]/20 rounded-xl">
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm sm:text-base text-[#C87D87]">
                    ⚠ {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={submit}
                disabled={!rating || comment.trim().length < 10 || loading}
                className="w-full font-['Cormorant_Garamond',serif] tracking-widest uppercase text-sm sm:text-base text-white bg-[#6B7556] py-3 sm:py-3.5 rounded-xl hover:bg-[#5a6347] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-sm">
                {loading ? 'Submitting…' : 'Submit my review'}
              </button>
            </div>

            {/* bottom ornament */}
            <div className="flex items-center justify-center gap-2 py-2.5 sm:py-3 border-t border-[#C87D87]/10">
              <div className="w-6 sm:w-8 h-px bg-[#C87D87]/20"/>
              <span className="text-[#C87D87]/30 text-[0.4rem] sm:text-[0.5rem]">✦</span>
              <div className="w-6 sm:w-8 h-px bg-[#C87D87]/20"/>
            </div>
          </div>

          {/* Back link */}
          <button onClick={() => router.back()}
            className="mt-4 w-full font-['Cormorant_Garamond',serif] italic text-sm sm:text-base text-[#7a6a5a]/70 hover:text-[#7a6a5a] transition-colors text-center py-2">
            ← Go back
          </button>
        </div>
      </div>
    </>
  );
}