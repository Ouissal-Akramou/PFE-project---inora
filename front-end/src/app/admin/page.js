'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('reviews');
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    fetchReviews();
    setTimeout(() => setPageReady(true), 100);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const fetchReviews = async () => {
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        fetch('http://localhost:4000/api/reviews/approved', { credentials: 'include' }),
        fetch('http://localhost:4000/api/reviews/pending', { credentials: 'include' }),
      ]);
      const approved = await approvedRes.json();
      const pending = await pendingRes.json();
      setApprovedReviews(Array.isArray(approved) ? approved : []);
      setPendingReviews(Array.isArray(pending) ? pending : []);
    } catch {
      setApprovedReviews([]);
      setPendingReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id) => {
    await fetch(`http://localhost:4000/api/reviews/${id}/approve`, { method: 'PATCH', credentials: 'include' });
    fetchReviews();
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    await fetch(`http://localhost:4000/api/reviews/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchReviews();
  };

  const displayName = user?.fullName ?? user?.name ?? 'Admin';

  const navItems = [
    {
      id: 'reviews', label: 'Reviews', sub: 'Testimonials',
      badge: pendingReviews.length,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    },
    {
      id: 'users', label: 'Members', sub: 'Users & admins',
      badge: null,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
      id: 'payments', label: 'Payments', sub: 'Transactions',
      badge: null,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    },
    {
      id: 'settings', label: 'Profile', sub: 'Your account',
      badge: null,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── LACE SVG PATTERN ── */
        .lace-bg {
          background-color: #FBEAD6;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='2' fill='none' stroke='%23C87D87' stroke-width='0.4' opacity='0.25'/%3E%3Ccircle cx='40' cy='40' r='8' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.15'/%3E%3Ccircle cx='40' cy='40' r='16' fill='none' stroke='%23C87D87' stroke-width='0.2' opacity='0.10'/%3E%3Cpath d='M40 24 L44 32 L40 40 L36 32 Z' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.12'/%3E%3Cpath d='M56 40 L48 44 L40 40 L48 36 Z' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.12'/%3E%3Cpath d='M40 56 L36 48 L40 40 L44 48 Z' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.12'/%3E%3Cpath d='M24 40 L32 36 L40 40 L32 44 Z' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.12'/%3E%3Ccircle cx='0' cy='0' r='3' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.15'/%3E%3Ccircle cx='80' cy='0' r='3' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.15'/%3E%3Ccircle cx='0' cy='80' r='3' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.15'/%3E%3Ccircle cx='80' cy='80' r='3' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.15'/%3E%3Cline x1='40' y1='0' x2='40' y2='24' stroke='%23C87D87' stroke-width='0.2' opacity='0.10'/%3E%3Cline x1='40' y1='56' x2='40' y2='80' stroke='%23C87D87' stroke-width='0.2' opacity='0.10'/%3E%3Cline x1='0' y1='40' x2='24' y2='40' stroke='%23C87D87' stroke-width='0.2' opacity='0.10'/%3E%3Cline x1='56' y1='40' x2='80' y2='40' stroke='%23C87D87' stroke-width='0.2' opacity='0.10'/%3E%3C/svg%3E");
        }

        .lace-sidebar {
          background-color: #6B7556;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='2' fill='none' stroke='%23FBEAD6' stroke-width='0.4' opacity='0.12'/%3E%3Ccircle cx='30' cy='30' r='10' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.07'/%3E%3Cpath d='M30 18 L33 24 L30 30 L27 24 Z' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.08'/%3E%3Cpath d='M42 30 L36 33 L30 30 L36 27 Z' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.08'/%3E%3Cpath d='M30 42 L27 36 L30 30 L33 36 Z' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.08'/%3E%3Cpath d='M18 30 L24 27 L30 30 L24 33 Z' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.08'/%3E%3Ccircle cx='0' cy='0' r='2' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.10'/%3E%3Ccircle cx='60' cy='0' r='2' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.10'/%3E%3Ccircle cx='0' cy='60' r='2' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.10'/%3E%3Ccircle cx='60' cy='60' r='2' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.10'/%3E%3C/svg%3E");
        }

        .card-hover {
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(200,125,135,0.16);
        }
      `}</style>

      <div className={`min-h-screen flex transition-opacity duration-700 ${pageReady ? 'opacity-100' : 'opacity-0'}`}>

        {/* ══════════════════════════════
            SIDEBAR
        ══════════════════════════════ */}
        <aside className="lace-sidebar fixed top-0 left-0 h-full w-72 z-40 flex flex-col"
          style={{ boxShadow: '6px 0 50px rgba(107,117,86,0.3)' }}>

          {/* Ornamental top line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/80 to-transparent" />

          {/* Right fade */}
          <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-[#C87D87]/25 to-transparent" />

          {/* ── LOGO AREA ── */}
          <div className="relative px-10 pt-12 pb-8">
            {/* Lace corner frame */}
            <div className="absolute top-4 left-4 w-12 h-12 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-px bg-[#C87D87]/50" />
              <div className="absolute top-0 left-0 w-px h-full bg-[#C87D87]/50" />
              <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#C87D87]/60" />
            </div>
            <div className="absolute top-4 right-4 w-12 h-12 pointer-events-none">
              <div className="absolute top-0 right-0 w-full h-px bg-[#C87D87]/50" />
              <div className="absolute top-0 right-0 w-px h-full bg-[#C87D87]/50" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#C87D87]/60" />
            </div>

            <div className="text-center">
              <p className="font-['Cormorant_Garamond',serif] italic text-[0.55rem] tracking-[0.35em] uppercase text-[#C87D87]/60 mb-1">
                — Admin Panel —
              </p>
              <h1 className="font-['Playfair_Display',serif] italic text-4xl text-[#FBEAD6] tracking-wide">
                Inora
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-8 h-px bg-[#C87D87]/40" />
                <span className="text-[#C87D87]/40 text-[0.45rem]">✦</span>
                <div className="w-8 h-px bg-[#C87D87]/40" />
              </div>
            </div>
          </div>

          {/* ── PROFILE CARD ── */}
          <div className="mx-6 mb-6 p-4 border border-[#FBEAD6]/15 bg-[#FBEAD6]/6 relative">
            {/* Mini lace corners */}
            <div className="absolute top-1 left-1 w-3 h-3 pointer-events-none border-t border-l border-[#C87D87]/40" />
            <div className="absolute top-1 right-1 w-3 h-3 pointer-events-none border-t border-r border-[#C87D87]/40" />
            <div className="absolute bottom-1 left-1 w-3 h-3 pointer-events-none border-b border-l border-[#C87D87]/40" />
            <div className="absolute bottom-1 right-1 w-3 h-3 pointer-events-none border-b border-r border-[#C87D87]/40" />

            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C87D87] to-[#FBEAD6]/90 flex items-center justify-center text-[#6B7556] font-['Playfair_Display',serif] font-bold text-base shadow-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#FBEAD6] rounded-full border-2 border-[#6B7556] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6B7556]" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-['Playfair_Display',serif] italic text-sm text-[#FBEAD6] truncate">{displayName}</p>
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] text-[#C87D87]/60 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* ── NAV ── */}
          <nav className="flex-1 px-4 space-y-1">
            <p className="px-4 mb-3 font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-[0.35em] uppercase text-[#FBEAD6]/20">
              Menu
            </p>
            {navItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`w-full flex items-center gap-3 px-5 py-3.5 transition-all duration-400 relative group ${
                  activeTab === item.id
                    ? 'bg-[#FBEAD6]/12 border border-[#C87D87]/30'
                    : 'border border-transparent hover:border-[#FBEAD6]/10 hover:bg-[#FBEAD6]/6'
                }`}
              >
                {/* Active shimmer */}
                {activeTab === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C87D87]/8 via-transparent to-transparent" />
                )}
                {/* Mini corner on active */}
                {activeTab === item.id && <>
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-[#C87D87]/60" />
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-[#C87D87]/60" />
                </>}

                <span className={`relative z-10 flex-shrink-0 transition-colors duration-300 ${
                  activeTab === item.id ? 'text-[#C87D87]' : 'text-[#FBEAD6]/30 group-hover:text-[#C87D87]/50'
                }`}>
                  {item.icon}
                </span>
                <div className="relative z-10 text-left flex-1 min-w-0">
                  <p className={`font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase leading-tight transition-colors duration-300 ${
                    activeTab === item.id ? 'text-[#FBEAD6]' : 'text-[#FBEAD6]/50 group-hover:text-[#FBEAD6]/80'
                  }`}>{item.label}</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#FBEAD6]/20 mt-0.5">{item.sub}</p>
                </div>
                {item.badge > 0 && (
                  <span className="relative z-10 min-w-[1.3rem] h-5 px-1.5 bg-[#C87D87] flex items-center justify-center font-['Cormorant_Garamond',serif] text-[0.55rem] text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Ornamental divider */}
          <div className="flex items-center gap-2 mx-6 my-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C87D87]/20" />
            <span className="text-[#C87D87]/25 text-[0.4rem]">✦</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C87D87]/20" />
          </div>

          {/* ── LOGOUT ── */}
          <div className="px-4 pb-3">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3.5 border border-transparent hover:border-[#C87D87]/25 hover:bg-[#C87D87]/10 transition-all duration-300 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#FBEAD6]/25 group-hover:text-[#C87D87] transition-colors duration-300 group-hover:translate-x-0.5 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <div className="text-left">
                <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase text-[#FBEAD6]/30 group-hover:text-[#FBEAD6]/70 transition-colors">
                  Sign Out
                </p>
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#FBEAD6]/15 group-hover:text-[#FBEAD6]/30 transition-colors">
                  End your session
                </p>
              </div>
            </button>
          </div>

          {/* Bottom ornament */}
          <div className="px-10 pb-8 text-center">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-[#C87D87]/20" />
              <span className="text-[#C87D87]/25 text-[0.4rem]">✦</span>
              <div className="flex-1 h-px bg-[#C87D87]/20" />
            </div>
          </div>

          {/* Bottom lace corners */}
          <div className="absolute bottom-4 left-4 w-12 h-12 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-full h-px bg-[#C87D87]/40" />
            <div className="absolute bottom-0 left-0 w-px h-full bg-[#C87D87]/40" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#C87D87]/50" />
          </div>
          <div className="absolute bottom-4 right-4 w-12 h-12 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-full h-px bg-[#C87D87]/40" />
            <div className="absolute bottom-0 right-0 w-px h-full bg-[#C87D87]/40" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#C87D87]/50" />
          </div>

          {/* Bottom ornamental line */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/60 to-transparent" />
        </aside>

        {/* ══════════════════════════════
            MAIN
        ══════════════════════════════ */}
        <main className="lace-bg ml-72 flex-1 min-h-screen flex flex-col">

          {/* ── TOP BAR ── */}
          <header className="sticky top-0 z-30 bg-[#FBEAD6]/96 backdrop-blur-sm border-b border-[#C87D87]/15 px-12 py-5 flex items-center justify-between"
            style={{ boxShadow: '0 2px 30px rgba(200,125,135,0.07)' }}>

            {/* Ornamental top */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/50 to-transparent" />

            {/* Corner accents */}
            <div className="absolute top-2 left-2 w-8 h-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-px bg-[#C87D87]/30" />
              <div className="absolute top-0 left-0 w-px h-full bg-[#C87D87]/30" />
            </div>
            <div className="absolute top-2 right-2 w-8 h-8 pointer-events-none">
              <div className="absolute top-0 right-0 w-full h-px bg-[#C87D87]/30" />
              <div className="absolute top-0 right-0 w-px h-full bg-[#C87D87]/30" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.25em] text-[#C87D87]/40">Inora</span>
                <span className="text-[#C87D87]/30">›</span>
                <span className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.25em] text-[#C87D87]/60 capitalize">
                  {navItems.find(n => n.id === activeTab)?.label}
                </span>
              </div>
              <h2 className="font-['Playfair_Display',serif] italic text-2xl text-[#6B7556]">
                {navItems.find(n => n.id === activeTab)?.label}
                <span className="text-[#C87D87]">.</span>
              </h2>
            </div>

            <div className="flex items-center gap-6">
              {/* Stats */}
              <div className="hidden lg:flex items-center gap-4">
                <div className="relative px-5 py-2 border border-[#6B7556]/20 bg-[#6B7556]/5">
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-[#6B7556]/30" />
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-[#6B7556]/30" />
                  <p className="font-['Playfair_Display',serif] italic text-lg text-[#6B7556] leading-none text-center">{approvedReviews.length}</p>
                  <p className="font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-[0.2em] uppercase text-[#6B7556]/50 text-center">Live</p>
                </div>
                <div className="relative px-5 py-2 border border-[#C87D87]/20 bg-[#C87D87]/5">
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-[#C87D87]/40" />
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-[#C87D87]/40" />
                  <p className="font-['Playfair_Display',serif] italic text-lg text-[#C87D87] leading-none text-center">{pendingReviews.length}</p>
                  <p className="font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-[0.2em] uppercase text-[#C87D87]/50 text-center">Pending</p>
                </div>
              </div>

              <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#C87D87]/20 to-transparent" />

              <button onClick={fetchReviews}
                className="relative font-['Cormorant_Garamond',serif] text-[0.65rem] tracking-[0.22em] uppercase text-[#6B7556] border border-[#6B7556]/30 px-5 py-2 hover:bg-[#6B7556] hover:text-white transition-all duration-500 group overflow-hidden">
                <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-[#6B7556]/40 group-hover:border-white/30 transition-colors" />
                <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-[#6B7556]/40 group-hover:border-white/30 transition-colors" />
                <span className="inline-block group-hover:rotate-180 transition-transform duration-500 mr-1">✦</span>
                Refresh
              </button>
            </div>
          </header>

          {/* ── CONTENT AREA ── */}
          <div className="flex-1 p-12">

            {/* ══ REVIEWS TAB ══ */}
            {activeTab === 'reviews' && (
              <div className="space-y-14 animate-[fadeUp_0.5s_ease_forwards]">

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-5">
                  {[
                    { label: 'Total', value: approvedReviews.length + pendingReviews.length, color: '#3a3027', border: 'border-[#C87D87]/15', bg: 'bg-white/50' },
                    { label: 'Live on Site', value: approvedReviews.length, color: '#6B7556', border: 'border-[#6B7556]/20', bg: 'bg-[#6B7556]/5' },
                    { label: 'Pending', value: pendingReviews.length, color: '#C87D87', border: 'border-[#C87D87]/20', bg: 'bg-[#C87D87]/5' },
                  ].map((stat, i) => (
                    <div key={stat.label}
                      style={{ animationDelay: `${i * 80}ms` }}
                      className={`relative ${stat.bg} border ${stat.border} p-6 card-hover animate-[fadeUp_0.5s_ease_forwards]`}>
                      {/* Lace corners */}
                      <div className="absolute top-1.5 left-1.5 w-4 h-4 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-px" style={{ backgroundColor: stat.color, opacity: 0.3 }} />
                        <div className="absolute top-0 left-0 w-px h-full" style={{ backgroundColor: stat.color, opacity: 0.3 }} />
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 w-4 h-4 pointer-events-none">
                        <div className="absolute bottom-0 right-0 w-full h-px" style={{ backgroundColor: stat.color, opacity: 0.3 }} />
                        <div className="absolute bottom-0 right-0 w-px h-full" style={{ backgroundColor: stat.color, opacity: 0.3 }} />
                      </div>

                      <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] tracking-[0.22em] uppercase text-[#7a6a5a] mb-2">{stat.label}</p>
                      <p className="font-['Playfair_Display',serif] italic text-5xl leading-none" style={{ color: stat.color }}>{stat.value}</p>
                      <div className="mt-4 h-px" style={{ background: `linear-gradient(to right, ${stat.color}40, transparent)` }} />
                    </div>
                  ))}
                </div>

                {/* ── PENDING ── */}
                {pendingReviews.length > 0 && (
                  <section>
                    <div className="flex items-center gap-5 mb-8">
                      <div className="relative">
                        <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#C87D87] to-transparent" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#C87D87] rotate-45" />
                      </div>
                      <div>
                        <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/50 text-[0.6rem] tracking-[0.3em] uppercase">Awaiting your decision</p>
                        <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027]">
                          Pending Approval
                          <span className="ml-2 text-[#C87D87] font-['Cormorant_Garamond',serif] text-base not-italic">({pendingReviews.length})</span>
                        </h3>
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 h-px bg-gradient-to-r from-[#C87D87]/20 to-transparent" />
                        <span className="text-[#C87D87]/20 text-[0.4rem]">✦</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pendingReviews.map((review, i) => (
                        <div key={review.id}
                          style={{ animationDelay: `${i * 70}ms` }}
                          className="relative bg-white/65 border border-[#C87D87]/20 p-7 card-hover animate-[fadeUp_0.5s_ease_forwards] group overflow-hidden">

                          {/* Lace full corners */}
                          <div className="absolute top-2 left-2 w-5 h-5 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-px bg-[#C87D87]/40" />
                            <div className="absolute top-0 left-0 w-px h-full bg-[#C87D87]/40" />
                            <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-[#C87D87]/50" />
                          </div>
                          <div className="absolute top-2 right-2 w-5 h-5 pointer-events-none">
                            <div className="absolute top-0 right-0 w-full h-px bg-[#C87D87]/40" />
                            <div className="absolute top-0 right-0 w-px h-full bg-[#C87D87]/40" />
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-[#C87D87]/50" />
                          </div>
                          <div className="absolute bottom-2 left-2 w-5 h-5 pointer-events-none">
                            <div className="absolute bottom-0 left-0 w-full h-px bg-[#C87D87]/30" />
                            <div className="absolute bottom-0 left-0 w-px h-full bg-[#C87D87]/30" />
                          </div>
                          <div className="absolute bottom-2 right-2 w-5 h-5 pointer-events-none">
                            <div className="absolute bottom-0 right-0 w-full h-px bg-[#C87D87]/30" />
                            <div className="absolute bottom-0 right-0 w-px h-full bg-[#C87D87]/30" />
                          </div>

                          {/* Top line */}
                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#C87D87]/40 via-[#C87D87]/20 to-transparent" />

                          <div className="font-['Playfair_Display',serif] text-[4.5rem] text-[#C87D87]/8 leading-none -mt-4 -mb-3 select-none">"</div>

                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C87D87] to-[#FBEAD6] flex items-center justify-center text-[#6B7556] font-['Playfair_Display',serif] font-bold text-sm flex-shrink-0">
                              {review.user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027]">{review.user.fullName}</p>
                              <span className="text-[#C87D87] text-xs tracking-widest">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-px bg-[#C87D87]/30" />
                            <div className="w-1 h-1 bg-[#C87D87]/20 rotate-45" />
                          </div>

                          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/80 leading-relaxed mb-6 line-clamp-3">
                            "{review.comment}"
                          </p>

                          <div className="flex gap-2">
                            <button onClick={() => approveReview(review.id)}
                              className="relative flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#6B7556] border border-[#6B7556]/40 py-2.5 hover:bg-[#6B7556] hover:text-white transition-all duration-300 overflow-hidden group/btn">
                              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#6B7556]/40 group-hover/btn:border-white/30" />
                              ✓ Approve
                            </button>
                            <button onClick={() => deleteReview(review.id)}
                              className="relative flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#C87D87] border border-[#C87D87]/40 py-2.5 hover:bg-[#C87D87] hover:text-white transition-all duration-300 overflow-hidden group/btn">
                              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-[#C87D87]/40 group-hover/btn:border-white/30" />
                              ✕ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Lace ornament divider */}
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C87D87]/20" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 border border-[#C87D87]/30 rotate-45" />
                    <span className="text-[#C87D87]/30 text-[0.5rem] tracking-[0.4em]">✦ ✦ ✦</span>
                    <div className="w-2 h-2 border border-[#C87D87]/30 rotate-45" />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C87D87]/20" />
                </div>

                {/* ── APPROVED ── */}
                <section>
                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative">
                      <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#6B7556] to-transparent" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#6B7556] rotate-45" />
                    </div>
                    <div>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#6B7556]/50 text-[0.6rem] tracking-[0.3em] uppercase">Currently visible</p>
                      <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027]">
                        Live on Homepage
                        <span className="ml-2 text-[#6B7556] font-['Cormorant_Garamond',serif] text-base not-italic">({approvedReviews.length})</span>
                      </h3>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-[#6B7556]/20 to-transparent" />
                      <span className="text-[#6B7556]/20 text-[0.4rem]">✦</span>
                    </div>
                  </div>

                  {approvedReviews.length === 0 ? (
                    <div className="relative border border-dashed border-[#C87D87]/20 p-16 text-center bg-white/30">
                      <div className="absolute top-2 left-2 w-4 h-4 pointer-events-none border-t border-l border-[#C87D87]/20" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 pointer-events-none border-b border-r border-[#C87D87]/20" />
                      <p className="font-['Cormorant_Garamond',serif] italic text-xl text-[#C87D87]/30">
                        — No approved reviews yet —
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {approvedReviews.map((review, i) => (
                        <div key={review.id}
                          style={{ animationDelay: `${i * 60}ms` }}
                          className="relative bg-white/75 border border-[#6B7556]/15 p-7 card-hover animate-[fadeUp_0.5s_ease_forwards] group overflow-hidden">

                          {/* Lace corners */}
                          <div className="absolute top-2 left-2 w-5 h-5 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-px bg-[#6B7556]/30" />
                            <div className="absolute top-0 left-0 w-px h-full bg-[#6B7556]/30" />
                            <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-[#6B7556]/40" />
                          </div>
                          <div className="absolute top-2 right-2 w-5 h-5 pointer-events-none">
                            <div className="absolute top-0 right-0 w-full h-px bg-[#6B7556]/30" />
                            <div className="absolute top-0 right-0 w-px h-full bg-[#6B7556]/30" />
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-[#6B7556]/40" />
                          </div>

                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#6B7556]/30 via-[#6B7556]/15 to-transparent" />

                          <div className="font-['Playfair_Display',serif] text-[4.5rem] text-[#6B7556]/8 leading-none -mt-4 -mb-3 select-none">"</div>

                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6B7556] to-[#C87D87] flex items-center justify-center text-white font-['Playfair_Display',serif] font-bold text-sm flex-shrink-0">
                              {review.user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027]">{review.user.fullName}</p>
                              <span className="text-[#C87D87] text-xs tracking-widest">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-px bg-[#6B7556]/30" />
                            <div className="w-1 h-1 bg-[#6B7556]/20 rotate-45" />
                          </div>

                          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/80 leading-relaxed mb-6 line-clamp-3">
                            "{review.comment}"
                          </p>

                          {/* Hidden remove button — reveals on hover */}
                          <button onClick={() => deleteReview(review.id)}
                            className="w-full font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#C87D87]/50 border border-[#C87D87]/15 py-2.5 hover:bg-[#C87D87] hover:text-white hover:border-[#C87D87] transition-all duration-300 opacity-0 group-hover:opacity-100">
                            Remove from Homepage
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ══ COMING SOON TABS ══ */}
            {['users', 'payments'].includes(activeTab) && (
              <div className="animate-[fadeIn_0.4s_ease_forwards] flex items-center justify-center min-h-[65vh]">
                <div className="text-center relative p-16">
                  {/* Lace frame around coming soon */}
                  <div className="absolute top-0 left-0 w-8 h-8"><div className="absolute top-0 left-0 w-full h-px bg-[#C87D87]/25" /><div className="absolute top-0 left-0 w-px h-full bg-[#C87D87]/25" /></div>
                  <div className="absolute top-0 right-0 w-8 h-8"><div className="absolute top-0 right-0 w-full h-px bg-[#C87D87]/25" /><div className="absolute top-0 right-0 w-px h-full bg-[#C87D87]/25" /></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8"><div className="absolute bottom-0 left-0 w-full h-px bg-[#C87D87]/25" /><div className="absolute bottom-0 left-0 w-px h-full bg-[#C87D87]/25" /></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8"><div className="absolute bottom-0 right-0 w-full h-px bg-[#C87D87]/25" /><div className="absolute bottom-0 right-0 w-px h-full bg-[#C87D87]/25" /></div>

                  <div className="w-16 h-16 border border-[#C87D87]/20 rotate-45 flex items-center justify-center mx-auto mb-8 bg-white/40">
                    <div className="-rotate-45 text-[#C87D87]/40">
                      {navItems.find(n => n.id === activeTab)?.icon}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-2 h-px bg-[#C87D87]/20" />
                    <div className="w-1 h-1 bg-[#C87D87]/20 rotate-45" />
                    <div className="w-8 h-px bg-[#C87D87]/20" />
                    <span className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.35em] uppercase text-[#C87D87]/35">
                      Coming Soon
                    </span>
                    <div className="w-8 h-px bg-[#C87D87]/20" />
                    <div className="w-1 h-1 bg-[#C87D87]/20 rotate-45" />
                    <div className="w-2 h-px bg-[#C87D87]/20" />
                  </div>
                  <p className="font-['Playfair_Display',serif] italic text-3xl text-[#6B7556] mb-3">
                    {navItems.find(n => n.id === activeTab)?.label}
                  </p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/40">
                    This section is being prepared with care.
                  </p>
                </div>
              </div>
            )}

            {/* ══ PROFILE TAB ══ */}
            {activeTab === 'settings' && (
              <div className="animate-[fadeUp_0.5s_ease_forwards] max-w-lg">
                <div className="relative bg-white/65 border border-[#C87D87]/15 overflow-hidden"
                  style={{ boxShadow: '0 8px 40px rgba(200,125,135,0.1)' }}>

                  {/* All four lace corners */}
                  {[['top-2 left-2','top-0 left-0','top','left'],['top-2 right-2','top-0 right-0','top','right'],
                    ['bottom-2 left-2','bottom-0 left-0','bottom','left'],['bottom-2 right-2','bottom-0 right-0','bottom','right']
                  ].map(([pos,,v,h], i) => (
                    <div key={i} className={`absolute ${pos} w-6 h-6 pointer-events-none`}>
                      <div className={`absolute ${v}-0 ${h}-0 w-full h-px bg-[#C87D87]/35`} />
                      <div className={`absolute ${v}-0 ${h}-0 w-px h-full bg-[#C87D87]/35`} />
                    </div>
                  ))}

                  {/* Header */}
                  <div className="relative h-24 bg-gradient-to-r from-[#6B7556]/25 via-[#C87D87]/15 to-[#6B7556]/10">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/30 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-px bg-[#FBEAD6]/20" />
                        <span className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.35em] uppercase text-[#FBEAD6]/35">
                          Admin Profile
                        </span>
                        <div className="w-12 h-px bg-[#FBEAD6]/20" />
                      </div>
                    </div>
                  </div>

                  <div className="px-10 pb-10 -mt-8">
                    <div className="flex items-end gap-5 mb-7">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C87D87] to-[#FBEAD6] flex items-center justify-center text-[#6B7556] font-['Playfair_Display',serif] font-bold text-2xl border-2 border-white"
                        style={{ boxShadow: '0 4px 20px rgba(200,125,135,0.25)' }}>
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="pb-1 flex-1">
                        <p className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] leading-tight">{displayName}</p>
                        <p className="font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a]/50 tracking-wide">{user?.email}</p>
                      </div>
                      <span className="pb-1 font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-[0.2em] uppercase text-white bg-[#6B7556] px-2.5 py-1">
                        Admin
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                      <div className="flex-1 h-px bg-gradient-to-r from-[#C87D87]/25 to-transparent" />
                      <div className="w-1.5 h-1.5 bg-[#C87D87]/30 rotate-45" />
                      <div className="flex-1 h-px bg-gradient-to-l from-[#C87D87]/25 to-transparent" />
                    </div>

                    <div className="text-center py-4">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-2 h-px bg-[#C87D87]/20" />
                        <div className="w-1 h-1 bg-[#C87D87]/25 rotate-45" />
                        <div className="w-8 h-px bg-[#C87D87]/20" />
                        <span className="text-[#C87D87]/25 text-[0.4rem]">✦</span>
                        <div className="w-8 h-px bg-[#C87D87]/20" />
                        <div className="w-1 h-1 bg-[#C87D87]/25 rotate-45" />
                        <div className="w-2 h-px bg-[#C87D87]/20" />
                      </div>
                      <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#C87D87]/40">
                        Profile settings coming soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
