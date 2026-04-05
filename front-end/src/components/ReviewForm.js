'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReviewForm() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    setError('');
    if (comment.trim().length < 10)
      return setError('Please write at least 10 characters.');

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, comment, bookingId }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || 'Something went wrong.');
      setSubmitted(true);
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white/70 border border-[#C87D87]/20 p-6 sm:p-8 md:p-10 text-center max-w-md mx-auto">
        {/* Ornamental top */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 sm:w-12 h-px bg-[#C87D87]/30" />
          <span className="text-[#C87D87]/50 text-xs sm:text-sm">✦</span>
          <div className="w-8 sm:w-12 h-px bg-[#C87D87]/30" />
        </div>

        {/* Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 border border-[#6B7556]/30 flex items-center justify-center mx-auto mb-4 sm:mb-5">
          <span className="text-[#6B7556] text-base sm:text-lg md:text-xl">✓</span>
        </div>

        <h3 className="font-['Playfair_Display',serif] italic text-xl sm:text-2xl text-[#6B7556] mb-2 sm:mb-3">
          Thank You
        </h3>
        <div className="w-8 h-px bg-[#C87D87] mx-auto mb-3 sm:mb-4" />
        <p className="font-['Cormorant_Garamond',serif] italic text-base sm:text-lg text-[#7a6a5a] leading-relaxed px-2">
          Your review has been submitted and is pending approval.
          It will appear on our homepage soon.
        </p>

        {/* Ornamental bottom */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
          <div className="w-8 sm:w-12 h-px bg-[#C87D87]/30" />
          <span className="text-[#C87D87]/50 text-xs sm:text-sm">✦</span>
          <div className="w-8 sm:w-12 h-px bg-[#C87D87]/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 border border-[#C87D87]/20 p-5 sm:p-6 md:p-8 lg:p-10 max-w-md mx-auto hover:shadow-[0_8px_30px_rgba(200,125,135,0.1)] transition-shadow duration-300">

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-[0.6rem] sm:text-xs tracking-[0.28em] uppercase mb-1 sm:mb-2">
          Share Your Story
        </p>
        <h3 className="font-['Playfair_Display',serif] italic text-xl sm:text-2xl text-[#6B7556]">
          How Was Your Experience?
        </h3>
        <div className="w-10 h-px bg-[#C87D87] mx-auto mt-2 sm:mt-3" />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-['Cormorant_Garamond',serif] text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p className="font-['Cormorant_Garamond',serif] text-[#6B7556]">Submitting...</p>
          </div>
        </div>
      )}

      {/* STAR RATING */}
      <div className="mb-6 sm:mb-8">
        <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-xs tracking-[0.2em] uppercase text-[#7a6a5a] text-center mb-3 sm:mb-4">
          Your Rating
        </p>
        <div className="flex gap-1.5 sm:gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              className="transition-all duration-200 text-xl sm:text-2xl focus:outline-none focus:ring-2 focus:ring-[#C87D87]/50 rounded-full p-1"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
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

      {/* COMMENT */}
      <div className="mb-5 sm:mb-6">
        <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-xs tracking-[0.2em] uppercase text-[#7a6a5a] mb-1.5 sm:mb-2">
          Your Words
        </p>
        <textarea
          placeholder="Tell us about your gathering..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full p-3 sm:p-4 bg-[#FBEAD6]/40 border border-[#C87D87]/20 focus:border-[#C87D87]/50 focus:outline-none resize-none font-['Cormorant_Garamond',serif] italic text-sm sm:text-base text-[#3a3027] placeholder:text-[#7a6a5a]/40 transition-colors duration-300"
        />
        {/* Character counter */}
        <p className="text-right text-[0.6rem] sm:text-xs text-[#7a6a5a]/50 mt-1">
          {comment.trim().length}/500
        </p>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={submitReview}
        disabled={loading}
        className={`w-full font-['Cormorant_Garamond',serif] text-xs sm:text-sm tracking-[0.22em] uppercase text-white bg-[#6B7556] border border-[#6B7556] py-2.5 sm:py-3 hover:bg-[#C87D87] hover:border-[#C87D87] transition-all duration-300 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>

      {/* Footer note */}
      <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] sm:text-xs text-[#C87D87]/50 text-center mt-4">
        — Pending admin approval before publishing —
      </p>
    </div>
  );
}