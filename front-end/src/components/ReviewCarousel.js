'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

// ✅ same helper used in admin page
const resolveAvatar = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API}${url}`;
};

export default function ReviewCarousel({ reviews = [], reviewsIn }) {
  const [idx, setIdx] = useState(0);
  const [perPage, setPerPage] = useState(3);
  
  // Responsive perPage based on screen width - FIXED for SSR
  useEffect(() => {
    const updatePerPage = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) setPerPage(1);
        else if (window.innerWidth < 1024) setPerPage(2);
        else setPerPage(3);
      }
    };
    
    // Set initial value
    updatePerPage();
    
    // Add resize listener
    window.addEventListener('resize', updatePerPage);
    return () => window.removeEventListener('resize', updatePerPage);
  }, []);

  const pages = Math.ceil(reviews.length / perPage);
  const visible = reviews.slice(idx * perPage, idx * perPage + perPage);

  const prev = () => setIdx(i => (i - 1 + pages) % pages);
  const next = () => setIdx(i => (i + 1) % pages);

  if (reviews.length === 0) return (
    <p className="font-['Cormorant_Garamond',serif] italic text-lg sm:text-xl text-[#C87D87]/60 text-center py-8 sm:py-12 px-4">
      No reviews yet. Be the first to share your experience.
    </p>
  );

  return (
    <div className={`reveal-scale ${reviewsIn ? 'in-view' : ''}`}>
      <style>{`
        @keyframes carouselSlide {
          from { opacity:0; transform:translateX(40px); }
          to   { opacity:1; transform:translateX(0);    }
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          .review-card {
            padding: 1.25rem !important;
          }
          .review-card p {
            font-size: 0.9rem !important;
            line-height: 1.6 !important;
            margin-bottom: 1rem !important;
          }
          .review-card .quote-mark {
            font-size: 2.5rem !important;
            margin-bottom: 0.25rem !important;
          }
          .review-card .avatar {
            width: 2rem !important;
            height: 2rem !important;
          }
          .review-card .name {
            font-size: 0.75rem !important;
          }
          .review-card .guest-badge {
            font-size: 0.6rem !important;
          }
          .review-card .rating {
            font-size: 0.65rem !important;
          }
          .review-controls button {
            width: 2rem !important;
            height: 2rem !important;
            font-size: 0.8rem !important;
          }
          .review-dots button {
            width: 0.35rem !important;
            height: 0.35rem !important;
          }
          .review-dots button.active {
            width: 1rem !important;
            height: 0.35rem !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 768px) {
          .review-card {
            padding: 1.5rem !important;
          }
          .review-card p {
            font-size: 0.95rem !important;
          }
        }
      `}</style>

      {/* Cards Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 min-h-[280px] sm:min-h-[260px]">
        {visible.map((review, i) => (
          <div
            key={`${review.id}-${idx}`}
            className="review-card relative bg-white/80 backdrop-blur-sm border border-[#C87D87]/14 rounded-2xl p-5 sm:p-6 lg:p-7 card-hover"
            style={{ animation: `carouselSlide .45s cubic-bezier(.4,0,.2,1) ${i * 80}ms both` }}
          >
            {/* Decorative borders */}
            <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/8 pointer-events-none" />
            <div className="absolute inset-[4px] rounded-xl border border-[#C87D87]/5 pointer-events-none" />
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent" />

            {/* Quote mark */}
            <div className="quote-mark font-['Playfair_Display',serif] text-3xl sm:text-4xl lg:text-[4rem] text-[#C87D87]/15 leading-none mb-0.5 sm:mb-1 -mt-1 sm:-mt-2 select-none">
              "
            </div>

            {/* Comment - Responsive line clamp */}
            <p className="font-['Cormorant_Garamond',serif] italic text-sm sm:text-base lg:text-[1.05rem] text-[#5a4a3a] leading-relaxed sm:leading-[1.75] mb-4 sm:mb-5 line-clamp-4">
              {review.comment}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#C87D87]/12">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Avatar */}
                <div className="avatar w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full overflow-hidden flex-shrink-0 shadow-sm border border-[#C87D87]/15">
                  {resolveAvatar(review.user?.avatarUrl) ? (
                    <img
                      src={resolveAvatar(review.user.avatarUrl)}
                      alt={review.user?.fullName ?? ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#6B7556] to-[#C87D87] flex items-center justify-center text-white font-['Playfair_Display',serif] text-xs sm:text-sm">
                      {review.user?.fullName?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                  )}
                </div>

                <div>
                  <p className="name font-['Playfair_Display',serif] text-xs sm:text-sm text-[#3a3027] tracking-wide leading-none">
                    {review.user?.fullName ?? 'Guest'}
                  </p>
                  <p className="guest-badge font-['Cormorant_Garamond',serif] italic text-[0.6rem] sm:text-xs text-[#C87D87]/70 mt-0.5">
                    {review.isDefault ? 'Inora Guest' : 'Verified Guest'}
                  </p>
                </div>
              </div>

              {/* Rating Stars - Responsive */}
              <span className="rating text-[#C87D87] text-[0.6rem] sm:text-xs lg:text-sm tracking-wider">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls - Responsive */}
      {pages > 1 && (
        <div className="review-controls flex items-center justify-center gap-4 sm:gap-5 lg:gap-6 mt-8 sm:mt-10">
          <button
            onClick={prev}
            className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-[#C87D87]/30 text-[#C87D87] hover:bg-[#C87D87] hover:text-white transition-all duration-300 flex items-center justify-center text-base sm:text-lg"
            aria-label="Previous reviews"
          >
            ←
          </button>
          
          <div className="review-dots flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: pages }).map((_, p) => (
              <button
                key={p}
                onClick={() => setIdx(p)}
                className={`rounded-full transition-all duration-300 ${
                  p === idx 
                    ? 'active w-4 sm:w-5 lg:w-6 h-1.5 sm:h-2 bg-[#C87D87]' 
                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#C87D87]/30 hover:bg-[#C87D87]/60'
                }`}
                aria-label={`Go to review page ${p + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={next}
            className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-[#C87D87]/30 text-[#C87D87] hover:bg-[#C87D87] hover:text-white transition-all duration-300 flex items-center justify-center text-base sm:text-lg"
            aria-label="Next reviews"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}