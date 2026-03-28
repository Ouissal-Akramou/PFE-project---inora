'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function Navbar() {
  const { user, logout, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [scrolled,     setScrolled]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const notifRef = useRef(null);

  const isAdmin      = user?.role === 'admin';
  const displayName  = user?.fullName ?? user?.full_name ?? user?.name ?? user?.email ?? '?';
  const avatarUrl    = user?.avatarUrl ?? null;
  const unreadNotifs = notifications.filter(n => !n.read);

  const fetchNotifications = async () => {
    if (!user || isAdmin) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, { credentials: 'include' });
      if (res.ok) setNotifications(await res.json());
    } catch {}
  };

  useEffect(() => {
    if (user && !isAdmin) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Socket.io — real-time notifications from cron
  useEffect(() => {
    if (!user || isAdmin) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL, { withCredentials: true });
    socket.emit('join', user.id);

    socket.on('notification', (notif) => {
      setNotifications(prev => [
        { ...notif, id: notif.id ?? Date.now().toString(), read: false, createdAt: new Date().toISOString() },
        ...prev,
      ]);
    });

    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current  && !notifRef.current.contains(e.target))      setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push('/');
  };

  const markAsRead = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`, {
      method: 'PATCH', credentials: 'include',
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
      method: 'PATCH', credentials: 'include',
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleCheckout = async (notif) => {
    await markAsRead(notif.id);
    setNotifOpen(false);
    setDropdownOpen(false);
    router.push(`/checkout?bookingId=${notif.bookingId}`);
  };

  // ← handles both REVIEW_REQUEST (manual) and FEEDBACK_REQUEST (cron)
  const handleReview = async (notif) => {
    await markAsRead(notif.id);
    setNotifOpen(false);
    const url = notif.actionUrl || `/reviews/new?bookingId=${notif.bookingId}`;
    router.push(url);
  };

  if (loading) return null;

  const Avatar = ({ size = 8, textSize = 'text-sm' }) =>
    avatarUrl ? (
      <img
        src={avatarUrl.startsWith('http')
          ? avatarUrl
          : `${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}`
        }
        alt="avatar"
        className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0 shadow-sm transition-all duration-300 ${
          dropdownOpen ? 'ring-2 ring-[#C87D87]' : 'ring-2 ring-[#C87D87]/30 group-hover:ring-[#C87D87]'
        }`}
      />
    ) : (
      <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-[#C87D87] to-[#FBEAD6] flex items-center justify-center text-[#6B7556] font-['Playfair_Display',serif] font-bold ${textSize} flex-shrink-0 shadow-sm transition-all duration-300 ${
        dropdownOpen ? 'ring-2 ring-[#C87D87]' : 'ring-2 ring-[#C87D87]/30 group-hover:ring-[#C87D87]'
      }`}>
        {displayName.charAt(0).toUpperCase()}
      </div>
    );

  return (
    <>
      <style>{`
        @keyframes fadeInDown {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .dropdown-anim { animation: fadeInDown 0.18s ease forwards; }
      `}</style>

      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#6B7556] border-b border-[#C87D87]/20 shadow-[0_2px_24px_rgba(107,117,86,0.18)] py-2.5'
          : 'bg-[#6B7556]/90 backdrop-blur-sm border-b border-[#C87D87]/10 py-4'
      }`}>

        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/60 to-transparent pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent pointer-events-none"/>

        {[
          { pos:'top-0 left-0',     rot:'rotate-0'   },
          { pos:'top-0 right-0',    rot:'rotate-90'  },
          { pos:'bottom-0 right-0', rot:'rotate-180' },
          { pos:'bottom-0 left-0',  rot:'-rotate-90' },
        ].map(({ pos, rot }, i) => (
          <div key={i} className={`absolute ${pos} w-10 h-10 pointer-events-none overflow-hidden`}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={rot}>
              <line x1="0"  y1="1"  x2="20" y2="1"  stroke="#C87D87" strokeWidth="0.9"  strokeOpacity="0.55"/>
              <line x1="1"  y1="0"  x2="1"  y2="20" stroke="#C87D87" strokeWidth="0.9"  strokeOpacity="0.55"/>
              <line x1="4"  y1="6"  x2="15" y2="6"  stroke="#C87D87" strokeWidth="0.55" strokeOpacity="0.38"/>
              <line x1="6"  y1="4"  x2="6"  y2="15" stroke="#C87D87" strokeWidth="0.55" strokeOpacity="0.38"/>
              <rect x="2.5" y="2.5" width="6" height="6" transform="rotate(45 5.5 5.5)"
                fill="none" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.85"/>
              <circle cx="5.5" cy="5.5" r="0.9" fill="#C87D87" fillOpacity="0.45"/>
              <rect x="11" y="2" width="3.5" height="3.5" transform="rotate(45 12.75 3.75)"
                fill="none" stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.35"/>
              <rect x="2" y="11" width="3.5" height="3.5" transform="rotate(45 3.75 12.75)"
                fill="none" stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.35"/>
              <circle cx="10" cy="6"  r="0.8" fill="#C87D87" fillOpacity="0.22"/>
              <circle cx="14" cy="6"  r="0.6" fill="#C87D87" fillOpacity="0.16"/>
              <circle cx="6"  cy="10" r="0.8" fill="#C87D87" fillOpacity="0.22"/>
              <circle cx="6"  cy="14" r="0.6" fill="#C87D87" fillOpacity="0.16"/>
              {[8,12,16].map((x,j) => (
                <line key={j} x1={x} y1="1" x2={x} y2={j%2===0?4:3} stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.28"/>
              ))}
              {[8,12,16].map((y,j) => (
                <line key={j} x1="1" y1={y} x2={j%2===0?4:3} y2={y} stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.28"/>
              ))}
              {[7,10,13,16].map((x,j) => (
                <circle key={j} cx={x} cy="3.5" r="0.4" fill="#C87D87" fillOpacity={0.08+j*0.03}/>
              ))}
              {[7,10,13,16].map((y,j) => (
                <circle key={j} cx="3.5" cy={y} r="0.4" fill="#C87D87" fillOpacity={0.08+j*0.03}/>
              ))}
            </svg>
          </div>
        ))}

        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center pointer-events-none">
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#C87D87]/30"/>
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
            <g transform="translate(10 6)">
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5"/>
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5"/>
              <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.35"/>
              <line x1="2.8" y1="-2.8" x2="-2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.35"/>
              <circle cx="0" cy="0" r="1" fill="#C87D87" fillOpacity="0.5"/>
            </g>
          </svg>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#C87D87]/30"/>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center pointer-events-none">
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#C87D87]/25"/>
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
            <g transform="translate(10 6)">
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.4"/>
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.4"/>
              <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.35" strokeOpacity="0.28"/>
              <line x1="2.8" y1="-2.8" x2="-2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.35" strokeOpacity="0.28"/>
              <circle cx="0" cy="0" r="0.9" fill="#C87D87" fillOpacity="0.4"/>
            </g>
          </svg>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#C87D87]/25"/>
        </div>

        {/* ── NAV CONTENT ── */}
        <div className="max-w-7xl mx-auto flex justify-between items-center px-10">

          {/* LOGO */}
          <Link href="/" className="flex flex-col items-start group">
            <h1 className="font-['Playfair_Display',serif] italic text-[1.55rem] text-[#FBEAD6] tracking-wide leading-none group-hover:text-[#C87D87] transition-colors duration-300">
              Inora
            </h1>
            <div className="w-full h-px bg-gradient-to-r from-[#FBEAD6]/40 via-[#FBEAD6]/15 to-transparent mt-0.5"/>
          </Link>

          {/* CENTER LINKS */}
          <ul className="hidden md:flex gap-10 list-none absolute left-1/2 -translate-x-1/2">
            {['Home','About','Services','Contact'].map(item => (
              <li key={item} className="relative group">
                <Link
                  href={item === 'Home' ? '/' : `#${item.toLowerCase()}`}
                  className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.22em] uppercase text-[#FBEAD6]/80 hover:text-[#C87D87] transition-colors duration-300">
                  {item}
                </Link>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-[#C87D87] group-hover:w-full transition-all duration-300"/>
              </li>
            ))}
            {isAdmin && (
              <li className="relative group">
                <Link href="/admin"
                  className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.22em] uppercase text-[#C87D87] hover:text-[#FBEAD6] transition-colors duration-300">
                  Admin
                </Link>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-[#FBEAD6] group-hover:w-full transition-all duration-300"/>
              </li>
            )}
          </ul>

          {/* AUTH AREA */}
          {user ? (
            <div className="flex items-center gap-2">

              {/* ── NOTIFICATION BELL ── */}
              {!isAdmin && (
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => { setNotifOpen(o => !o); setDropdownOpen(false); }}
                    className={`relative w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 ${
                      notifOpen
                        ? 'border-[#C87D87]/60 bg-[#C87D87]/15'
                        : 'border-white/15 hover:border-[#C87D87]/40 hover:bg-[#C87D87]/10'
                    }`}>
                    <svg xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 transition-colors duration-300 ${notifOpen?'text-[#C87D87]':'text-[#FBEAD6]/70'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
                    </svg>
                    {unreadNotifs.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C87D87] rounded-full flex items-center justify-center text-white text-[0.48rem] font-bold">
                        {unreadNotifs.length > 9 ? '9+' : unreadNotifs.length}
                      </span>
                    )}
                  </button>

                  {/* ── NOTIFICATION DROPDOWN ── */}
                  {notifOpen && (
                    <div className="dropdown-anim absolute right-0 mt-2.5 w-[22rem] z-[100] rounded-2xl overflow-hidden border border-[#C87D87]/20 shadow-[0_16px_48px_rgba(58,48,39,0.18)]"
                      style={{ background:'#FBEAD6' }}>

                      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C87D87]/60 to-transparent"/>

                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#C87D87]/15"
                        style={{ background:'linear-gradient(135deg,#FBEAD6 0%,rgba(200,125,135,0.06) 100%)' }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#C87D87]/12 border border-[#C87D87]/25 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#C87D87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.18em] uppercase text-[#3a3027] font-semibold">Notifications</p>
                            {unreadNotifs.length > 0 && (
                              <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] text-[#C87D87]">
                                {unreadNotifs.length} unread
                              </p>
                            )}
                          </div>
                        </div>
                        {unreadNotifs.length > 0 && (
                          <button onClick={markAllAsRead}
                            className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.15em] uppercase text-[#6B7556] border border-[#6B7556]/35 bg-[#6B7556]/8 px-2.5 py-1 rounded-lg hover:bg-[#6B7556] hover:text-[#FBEAD6] transition-all duration-300">
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="max-h-[380px] overflow-y-auto divide-y divide-[#C87D87]/10">
                        {notifications.length === 0 ? (
                          <div className="px-5 py-10 text-center">
                            <div className="w-10 h-10 rounded-full bg-[#C87D87]/10 border border-[#C87D87]/20 flex items-center justify-center mx-auto mb-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#C87D87]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
                              </svg>
                            </div>
                            <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/60 text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div key={notif.id}
                              className={`px-4 py-3.5 transition-colors duration-200 ${
                                !notif.read ? 'bg-[#C87D87]/8' : 'hover:bg-[#C87D87]/5'
                              }`}>
                              <div className="flex items-start gap-3">

                                {/* Icon badge */}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                                  notif.type === 'REVIEW_REQUEST' || notif.type === 'FEEDBACK_REQUEST'
                                    ? 'bg-amber-50/80 border-amber-300/50'
                                    : !notif.read
                                      ? 'bg-[#6B7556]/12 border-[#6B7556]/30'
                                      : 'bg-[#C87D87]/10 border-[#C87D87]/20'
                                }`}>
                                  <svg xmlns="http://www.w3.org/2000/svg"
                                    className={`w-4 h-4 ${
                                      notif.type === 'REVIEW_REQUEST' || notif.type === 'FEEDBACK_REQUEST'
                                        ? 'text-amber-500'
                                        : !notif.read ? 'text-[#6B7556]' : 'text-[#C87D87]/60'
                                    }`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    {notif.type === 'REVIEW_REQUEST' || notif.type === 'FEEDBACK_REQUEST'
                                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                                      : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    }
                                  </svg>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`font-['Cormorant_Garamond',serif] text-[0.72rem] tracking-wide leading-snug font-semibold ${!notif.read?'text-[#3a3027]':'text-[#5a4a3a]'}`}>
                                      {notif.title}
                                    </p>
                                    {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#C87D87] flex-shrink-0 mt-1.5"/>}
                                  </div>
                                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] text-[#7a6a5a]/70 mt-0.5 leading-relaxed line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="font-['Cormorant_Garamond',serif] text-[0.57rem] text-[#C87D87]/50 mt-1 tracking-wide">
                                    {new Date(notif.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                                  </p>

                                  {/* Checkout button — BOOKING_CONFIRMED */}
                                  {notif.type === 'BOOKING_CONFIRMED' && (
                                    <button onClick={() => handleCheckout(notif)}
                                      className="mt-2.5 w-full font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.15em] uppercase text-[#FBEAD6] bg-[#6B7556] px-3 py-2 rounded-xl hover:bg-[#4a5240] transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(107,117,86,0.22)]">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
                                      </svg>
                                      Proceed to Payment →
                                    </button>
                                  )}

                                  {/* Review button — REVIEW_REQUEST (manual) + FEEDBACK_REQUEST (cron) */}
                                  {(notif.type === 'REVIEW_REQUEST' || notif.type === 'FEEDBACK_REQUEST') && (
                                    <button onClick={() => handleReview(notif)}
                                      className="mt-2.5 w-full font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.15em] uppercase text-[#FBEAD6] bg-[#C87D87] px-3 py-2 rounded-xl hover:bg-[#a85e6a] transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(200,125,135,0.22)]">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                                      </svg>
                                      Leave a Review →
                                    </button>
                                  )}

                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer ornament */}
                      <div className="flex items-center justify-center gap-2 py-2 border-t border-[#C87D87]/12"
                        style={{ background:'linear-gradient(135deg,#FBEAD6 0%,rgba(200,125,135,0.04) 100%)' }}>
                        <div className="w-5 h-px bg-[#C87D87]/25"/>
                        <span className="text-[#C87D87]/40 text-[0.45rem]">✦</span>
                        <div className="w-5 h-px bg-[#C87D87]/25"/>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── USER AVATAR + DROPDOWN ── */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 group cursor-pointer">
                  <Avatar size={8} textSize="text-sm"/>
                  <div className="hidden lg:flex items-center gap-1.5">
                    <span className={`font-['Cormorant_Garamond',serif] text-sm italic tracking-wide transition-colors duration-300 ${dropdownOpen?'text-[#C87D87]':'text-[#FBEAD6]/80 group-hover:text-[#C87D87]'}`}>
                      {displayName}
                    </span>
                    {isAdmin && (
                      <span className="font-['Cormorant_Garamond',serif] text-[0.48rem] tracking-[0.15em] uppercase text-[#6B7556] bg-[#FBEAD6]/80 px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className={`hidden lg:block w-3 h-3 transition-all duration-300 ${dropdownOpen?'rotate-180 text-[#C87D87]':'text-[#FBEAD6]/40'}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {/* ── DROPDOWN ── */}
                {dropdownOpen && (
                  <div className="dropdown-anim absolute top-full right-0 mt-2.5 w-60 z-[100] rounded-2xl overflow-hidden border border-[#C87D87]/20 shadow-[0_16px_48px_rgba(58,48,39,0.18)]"
                    style={{ background:'#FBEAD6' }}>

                    <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C87D87]/60 to-transparent"/>

                    {/* User info */}
                    <div className="px-4 py-3.5 border-b border-[#C87D87]/15 flex items-center gap-3"
                      style={{ background:'linear-gradient(135deg,#FBEAD6 0%,rgba(200,125,135,0.06) 100%)' }}>
                      {avatarUrl ? (
                        <img
                          src={avatarUrl.startsWith('http') ? avatarUrl : `${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}`}
                          alt="avatar"
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-[#C87D87]/25 flex-shrink-0"/>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C87D87] to-[#FBEAD6] flex items-center justify-center text-[#6B7556] font-['Playfair_Display',serif] font-bold text-sm flex-shrink-0 ring-2 ring-[#C87D87]/20">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-['Playfair_Display',serif] italic text-sm text-[#3a3027] leading-tight truncate">{displayName}</p>
                          <span className={`font-['Cormorant_Garamond',serif] text-[0.48rem] tracking-[0.12em] uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                            isAdmin ? 'text-[#FBEAD6] bg-[#6B7556]' : 'text-[#C87D87] bg-[#C87D87]/15'
                          }`}>
                            {isAdmin ? 'Admin' : 'Member'}
                          </span>
                        </div>
                        <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] text-[#7a6a5a]/70 tracking-wide truncate">{user?.email}</p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5 space-y-0.5">
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-[#6B7556]/10 transition-colors group">
                          <div className="w-7 h-7 rounded-lg bg-[#6B7556]/10 border border-[#6B7556]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#6B7556]/18 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#6B7556]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-['Cormorant_Garamond',serif] text-[0.68rem] tracking-[0.15em] uppercase text-[#3a3027] font-semibold group-hover:text-[#6B7556] transition-colors">Admin Panel</p>
                            <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/60">Manage the platform</p>
                          </div>
                        </Link>
                      )}

                      {!isAdmin && (
                        <Link href="/account" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-[#C87D87]/10 transition-colors group">
                          <div className="w-7 h-7 rounded-lg bg-[#C87D87]/10 border border-[#C87D87]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C87D87]/18 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#C87D87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-['Cormorant_Garamond',serif] text-[0.68rem] tracking-[0.15em] uppercase text-[#3a3027] font-semibold group-hover:text-[#C87D87] transition-colors">My Account</p>
                            <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/60">Profile & settings</p>
                          </div>
                        </Link>
                      )}

                      <div className="mx-3 h-px bg-[#C87D87]/12"/>

                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-[#C87D87]/8 transition-colors group">
                        <div className="w-7 h-7 rounded-lg bg-[#C87D87]/8 border border-[#C87D87]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100/60 group-hover:border-red-200 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#C87D87]/70 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-['Cormorant_Garamond',serif] text-[0.68rem] tracking-[0.15em] uppercase text-[#3a3027] font-semibold group-hover:text-red-500 transition-colors">Sign Out</p>
                          <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/60">See you soon</p>
                        </div>
                      </button>
                    </div>

                    {/* Footer ornament */}
                    <div className="flex items-center justify-center gap-2 py-2 border-t border-[#C87D87]/12"
                      style={{ background:'linear-gradient(135deg,#FBEAD6 0%,rgba(200,125,135,0.04) 100%)' }}>
                      <div className="w-5 h-px bg-[#C87D87]/25"/>
                      <span className="text-[#C87D87]/40 text-[0.45rem]">✦</span>
                      <div className="w-5 h-px bg-[#C87D87]/25"/>
                    </div>
                  </div>
                )}
              </div>

            </div>

          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[#C87D87]/40 text-xs hidden lg:block">✦</span>
              <Link href="/login"
                className="font-['Cormorant_Garamond',serif] text-[0.65rem] tracking-[0.22em] uppercase text-[#FBEAD6] border border-[#FBEAD6]/35 px-5 py-2 rounded-full hover:bg-[#C87D87] hover:text-white hover:border-[#C87D87] transition-all duration-300">
                Sign In
              </Link>
              <span className="text-[#C87D87]/40 text-xs hidden lg:block">✦</span>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
