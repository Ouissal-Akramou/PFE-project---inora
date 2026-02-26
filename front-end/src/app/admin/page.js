'use client';
import { useState, useEffect } from 'react';

export default function Admin() {
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReviews(); }, []);

const fetchReviews = async () => {
  try {
    const [approvedRes, pendingRes] = await Promise.all([
      fetch('http://localhost:4000/api/reviews/approved', { credentials: 'include' }),
      fetch('http://localhost:4000/api/reviews/pending', { credentials: 'include' }),
    ]);

    const approved = await approvedRes.json();
    const pending = await pendingRes.json();

    // ✅ Safety check - always set arrays
    setApprovedReviews(Array.isArray(approved) ? approved : []);
    setPendingReviews(Array.isArray(pending) ? pending : []);

  } catch (err) {
    alert('Failed to load');
    setApprovedReviews([]);  // ✅ fallback
    setPendingReviews([]);   // ✅ fallback
  } finally {
    setLoading(false);
  }
};
  const approveReview = async (id) => {
    await fetch(`http://localhost:4000/api/reviews/${id}/approve`, {
      method: 'PATCH', credentials: 'include'
    });
    fetchReviews();
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    await fetch(`http://localhost:4000/api/reviews/${id}`, {
      method: 'DELETE', credentials: 'include'
    });
    fetchReviews();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBEAD6]">
      <p className="font-['Cormorant_Garamond',serif] italic text-2xl text-[#C87D87] tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  );

  return (
    <main className="min-h-screen text-[#3a3027] overflow-x-hidden pt-28 pb-20 px-8 md:px-20">

      {/* ── PAGE HEADER ── */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-sm tracking-[0.3em] uppercase mb-3">
          — Management —
        </p>
        <h1 className="font-['Playfair_Display',serif] italic text-[clamp(2.5rem,5vw,4rem)] text-[#6B7556]">
          Admin Dashboard
        </h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-16 h-px bg-[#C87D87]/40" />
          <span className="text-[#C87D87]/50 text-xs">✦</span>
          <div className="w-16 h-px bg-[#C87D87]/40" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">

        {/* ── APPROVED / ON HOMEPAGE ── */}
        <section className="mb-16">

          {/* Section header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-8 bg-[#6B7556]" />
            <div>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.25em] uppercase">
                Currently Visible
              </p>
              <h2 className="font-['Playfair_Display',serif] italic text-2xl text-[#6B7556]">
                On Homepage ({approvedReviews.length})
              </h2>
            </div>
          </div>

          {approvedReviews.length === 0 ? (
            <div className="border border-[#C87D87]/20 p-10 text-center bg-white/40">
              <p className="font-['Cormorant_Garamond',serif] italic text-lg text-[#C87D87]/60">
                No approved reviews yet.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedReviews.map((review) => (
                <div key={review.id} className="bg-white/70 border border-[#C87D87]/20 p-7 hover:shadow-[0_8px_30px_rgba(200,125,135,0.12)] transition-all duration-300 group">
                  
                  {/* Quote mark */}
                  <div className="font-['Playfair_Display',serif] text-[4rem] text-[#C87D87]/15 leading-none -mt-2 mb-1">"</div>
                  
                  {/* Name + stars */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B7556] to-[#C87D87] flex items-center justify-center text-white font-['Playfair_Display',serif] text-xs flex-shrink-0">
                      {review.user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-['Playfair_Display',serif] text-sm text-[#3a3027] tracking-wide">
                        {review.user.fullName}
                      </h3>
                      <span className="text-[#C87D87] text-xs tracking-widest">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                  </div>

                  <div className="w-6 h-px bg-[#C87D87]/30 mb-3" />

                  <p className="font-['Cormorant_Garamond',serif] italic text-base text-[#5a4a3a] leading-relaxed mb-5">
                    "{review.comment}"
                  </p>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="w-full font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#C87D87] border border-[#C87D87]/40 py-2 hover:bg-[#C87D87] hover:text-white transition-all duration-300"
                  >
                    Remove from Homepage
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── ORNAMENTAL DIVIDER ── */}
        <div className="text-center py-6 text-[#C87D87] text-lg tracking-[0.6em] mb-10">
          ✦ ✦ ✦
        </div>

        {/* ── PENDING REVIEWS ── */}
        <section className="mb-16">

          {/* Section header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-8 bg-[#C87D87]" />
            <div>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.25em] uppercase">
                Awaiting Review
              </p>
              <h2 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027]">
                Pending Approval ({pendingReviews.length})
              </h2>
            </div>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="border border-[#C87D87]/20 p-10 text-center bg-white/40">
              <p className="font-['Cormorant_Garamond',serif] italic text-lg text-[#C87D87]/60">
                No pending reviews at the moment.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingReviews.map((review) => (
                <div key={review.id} className="bg-[#FBEAD6]/50 border border-[#C87D87]/20 p-7 hover:shadow-[0_8px_30px_rgba(200,125,135,0.12)] transition-all duration-300">

                  {/* Quote mark */}
                  <div className="font-['Playfair_Display',serif] text-[4rem] text-[#C87D87]/15 leading-none -mt-2 mb-1">"</div>

                  {/* Name + stars */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B7556] to-[#C87D87] flex items-center justify-center text-white font-['Playfair_Display',serif] text-xs flex-shrink-0">
                      {review.user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-['Playfair_Display',serif] text-sm text-[#3a3027] tracking-wide">
                        {review.user.fullName}
                      </h3>
                      <span className="text-[#C87D87] text-xs tracking-widest">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                  </div>

                  <div className="w-6 h-px bg-[#C87D87]/30 mb-3" />

                  <p className="font-['Cormorant_Garamond',serif] italic text-base text-[#5a4a3a] leading-relaxed mb-5">
                    "{review.comment}"
                  </p>

                  {/* Approve + Delete */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveReview(review.id)}
                      className="flex-1 font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#6B7556] border border-[#6B7556]/50 py-2 hover:bg-[#6B7556] hover:text-white transition-all duration-300"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="flex-1 font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#C87D87] border border-[#C87D87]/50 py-2 hover:bg-[#C87D87] hover:text-white transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── REFRESH BUTTON ── */}
        <div className="text-center">
          <button
            onClick={fetchReviews}
            className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.25em] uppercase text-[#6B7556] border border-[#6B7556]/50 px-10 py-3 hover:bg-[#6B7556] hover:text-white transition-all duration-300"
          >
            ✦ Refresh All ✦
          </button>
        </div>

      </div>
    </main>
  );
}
