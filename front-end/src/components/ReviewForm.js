'use client';
import { useState } from 'react';

export default function ReviewForm({ gatheringId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(null);

  const submitReview = async () => {
    await fetch('http://localhost:4000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rating, comment, gatheringId }),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white/70 border border-[#C87D87]/20 p-10 text-center max-w-md mx-auto">
        {/* Ornamental top */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-px bg-[#C87D87]/30" />
          <span className="text-[#C87D87]/50 text-sm">✦</span>
          <div className="w-12 h-px bg-[#C87D87]/30" />
        </div>

        {/* Icon */}
        <div className="w-14 h-14 border border-[#6B7556]/30 flex items-center justify-center mx-auto mb-5">
          <span className="text-[#6B7556] text-xl">✓</span>
        </div>

        <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#6B7556] mb-3">
          Thank You
        </h3>
        <div className="w-8 h-px bg-[#C87D87] mx-auto mb-4" />
        <p className="font-['Cormorant_Garamond',serif] italic text-lg text-[#7a6a5a] leading-relaxed">
          Your review has been submitted and is pending approval.
          It will appear on our homepage soon.
        </p>

        {/* Ornamental bottom */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="w-12 h-px bg-[#C87D87]/30" />
          <span className="text-[#C87D87]/50 text-sm">✦</span>
          <div className="w-12 h-px bg-[#C87D87]/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 border border-[#C87D87]/20 p-10 max-w-md mx-auto hover:shadow-[0_8px_30px_rgba(200,125,135,0.1)] transition-shadow duration-300">

      {/* Header */}
      <div className="text-center mb-8">
        <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.28em] uppercase mb-2">
          Share Your Story
        </p>
        <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#6B7556]">
          How Was Your Experience?
        </h3>
        <div className="w-10 h-px bg-[#C87D87] mx-auto mt-3" />
      </div>

      {/* ── STAR RATING ── */}
      <div className="mb-8">
        <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase text-[#7a6a5a] text-center mb-4">
          Your Rating
        </p>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              className="transition-all duration-200 text-2xl"
            >
              <span className={`transition-all duration-200 ${
                (hoveredStar ? star <= hoveredStar : star <= rating)
                  ? 'text-[#C87D87]'
                  : 'text-[#C87D87]/20'
              }`}>
                ★
              </span>
            </button>
          ))}
        </div>
        {/* Rating label */}
        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#C87D87] text-center mt-2">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Exceptional'][hoveredStar || rating]}
        </p>
      </div>

      {/* ── COMMENT ── */}
      <div className="mb-6">
        <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase text-[#7a6a5a] mb-2">
          Your Words
        </p>
        <textarea
          placeholder="Tell us about your gathering..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full p-4 bg-[#FBEAD6]/40 border border-[#C87D87]/20 focus:border-[#C87D87]/50 focus:outline-none resize-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/40 transition-colors duration-300"
        />
      </div>

      {/* ── SUBMIT ── */}
      <button
        onClick={submitReview}
        className="w-full font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-white bg-[#6B7556] border border-[#6B7556] py-3 hover:bg-[#C87D87] hover:border-[#C87D87] transition-all duration-300"
      >
        Submit Review
      </button>

      {/* Footer note */}
      <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/50 text-center mt-4">
        — Pending admin approval before publishing —
      </p>
    </div>
  );
}
