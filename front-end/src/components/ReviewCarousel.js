'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

// ✅ same helper used in admin page
const resolveAvatar = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API}${url}`;
};

export default function ReviewCarousel({ reviews = [], reviewsIn }) {
  const [idx, setIdx] = useState(0);
  const perPage = 3;
  const pages   = Math.ceil(reviews.length / perPage);
  const visible = reviews.slice(idx * perPage, idx * perPage + perPage);

  const prev = () => setIdx(i => (i - 1 + pages) % pages);
  const next = () => setIdx(i => (i + 1) % pages);

  if (reviews.length === 0) return (
    <p className="font-['Cormorant_Garamond',serif] italic text-xl text-[#C87D87]/60 text-center py-12">
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
      `}</style>

      {/* ── Cards ── */}
      <div className="grid md:grid-cols-3 gap-6 min-h-[260px]">
        {visible.map((review, i) => (
          <div
            key={`${review.id}-${idx}`}
            className="relative bg-white/80 backdrop-blur-sm border border-[#C87D87]/14 rounded-2xl p-7 card-hover"
            style={{ animation:`carouselSlide .45s cubic-bezier(.4,0,.2,1) ${i * 80}ms both` }}
          >
            <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/8 pointer-events-none"/>
            <div className="absolute inset-[4px] rounded-xl border border-[#C87D87]/5 pointer-events-none"/>
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent"/>

            {/* Quote mark */}
            <div className="font-['Playfair_Display',serif] text-[4rem] text-[#C87D87]/15 leading-none mb-1 -mt-2 select-none">"</div>

            {/* Comment */}
            <p className="font-['Cormorant_Garamond',serif] italic text-[1.05rem] text-[#5a4a3a] leading-[1.75] mb-5 line-clamp-4">
              {review.comment}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#C87D87]/12">
              <div className="flex items-center gap-3">

                {/* ✅ Avatar with resolveAvatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-sm border border-[#C87D87]/15">
                  {resolveAvatar(review.user?.avatarUrl)
                    ? (
                      <img
                        src={resolveAvatar(review.user.avatarUrl)}
                        alt={review.user?.fullName ?? ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#6B7556] to-[#C87D87] flex items-center justify-center text-white font-['Playfair_Display',serif] text-sm">
                        {review.user?.fullName?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                    )
                  }
                </div>

                <div>
                  <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027] tracking-wide leading-none">
                    {review.user?.fullName ?? 'Guest'}
                  </p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/70 mt-0.5">
                    {review.isDefault ? 'Inora Guest' : 'Verified Guest'}
                  </p>
                </div>
              </div>

              <span className="text-[#C87D87] text-xs tracking-widest">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Controls ── */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-10">
          <button onClick={prev}
            className="w-10 h-10 rounded-full border border-[#C87D87]/30 text-[#C87D87] hover:bg-[#C87D87] hover:text-white transition-all duration-300 flex items-center justify-center text-lg">
            ←
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: pages }).map((_, p) => (
              <button key={p} onClick={() => setIdx(p)}
                className={`rounded-full transition-all duration-300 ${
                  p === idx ? 'w-6 h-2 bg-[#C87D87]' : 'w-2 h-2 bg-[#C87D87]/30 hover:bg-[#C87D87]/60'
                }`}/>
            ))}
          </div>
          <button onClick={next}
            className="w-10 h-10 rounded-full border border-[#C87D87]/30 text-[#C87D87] hover:bg-[#C87D87] hover:text-white transition-all duration-300 flex items-center justify-center text-lg">
            →
          </button>
        </div>
      )}
    </div>
  );
}
