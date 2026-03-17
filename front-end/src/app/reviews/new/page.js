'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
      <div className="min-h-screen bg-[#FBEAD6] flex items-center justify-center p-6">
        <div className="text-center max-w-sm" style={{animation:'fadeUp .5s ease both'}}>
          <div className="w-16 h-16 rounded-full bg-[#6B7556]/15 border border-[#6B7556]/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">✨</span>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.35em] uppercase text-[#C87D87]/60 mb-2">
            Inora · Review
          </p>
          <h2 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-2">
            Thank you!
          </h2>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/70 mb-1">
            Your review has been submitted successfully.
          </p>
          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/45 mb-8">
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
      <div className="min-h-screen bg-[#FBEAD6] flex items-center justify-center p-6">
        <div className="w-full max-w-md" style={{animation:'fadeUp .4s ease both'}}>

          <div className="bg-white/70 border border-[#C87D87]/15 rounded-2xl overflow-hidden shadow-sm relative">

            {/* top accent line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/60 to-transparent"/>

            <div className="p-8">
              <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.35em] uppercase text-[#C87D87]/60 mb-1">
                Inora · Feedback
              </p>
              <h1 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-1">
                Share your experience
              </h1>
              <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/60 mb-8">
                Your words help our community grow and inspire future gatherings.
              </p>

              {/* Stars */}
              <div className="mb-7">
                <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/50 mb-3">
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
                  {(hovered || rating) > 0 && (
                    <span className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/60 ml-1">
                      {['','Poor','Fair','Good','Very good','Excellent'][hovered || rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/50 mb-2">
                  Your comment
                </p>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={5}
                  maxLength={500}
                  placeholder="Describe your experience — the atmosphere, the activity, the people…"
                  className="w-full bg-white/60 border border-[#C87D87]/20 rounded-xl px-4 py-3 font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] placeholder-[#7a6a5a]/35 focus:outline-none focus:border-[#C87D87] transition-all resize-none leading-relaxed"
                />
                <div className="flex justify-between mt-1.5 px-1">
                  <span className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/35">
                    Min. 10 characters
                  </span>
                  <span className={`font-['Cormorant_Garamond',serif] italic text-[0.58rem] transition-colors ${
                    comment.length > 450 ? 'text-[#C87D87]' : 'text-[#7a6a5a]/35'
                  }`}>
                    {comment.length}/500
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 px-4 py-3 bg-[#C87D87]/8 border border-[#C87D87]/20 rounded-xl">
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#C87D87]">
                    ⚠ {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={submit}
                disabled={!rating || comment.trim().length < 10 || loading}
                className="w-full font-['Cormorant_Garamond',serif] tracking-widest uppercase text-sm text-white bg-[#6B7556] py-3.5 rounded-xl hover:bg-[#5a6347] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-sm">
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

          {/* Back link */}
          <button onClick={() => router.back()}
            className="mt-4 w-full font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/45 hover:text-[#7a6a5a] transition-colors text-center">
            ← Go back
          </button>
        </div>
      </div>
    </>
  );
}
