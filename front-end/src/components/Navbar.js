'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function Navbar() {
  const { user, logout, loading, refreshUser, authFetch } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const displayName = user?.fullName ?? user?.full_name ?? user?.name ?? user?.email ?? '?';
  const avatarUrl = user?.avatarUrl ?? null;
  const unreadNotifs = notifications.filter(n => !n.read);

  // ── REST polling using authFetch ──────────────────────────────────────────
  useEffect(() => {
    if (!user || isAdmin) return;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token, skipping notifications fetch');
          return;
        }
        const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`);
        if (res.ok) {
          setNotifications(await res.json());
        } else if (res.status === 401) {
          console.log('Token expired, clearing...');
          localStorage.removeItem('token');
        } else {
          console.error('[Notif] Fetch failed:', res.status);
        }
      } catch (e) {
        console.error('[Notif] Fetch error:', e.message);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id, authFetch, isAdmin]);

  // ── Socket.io — real-time notifications ──────────────────────────────────
  useEffect(() => {
    if (!user || isAdmin) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] ✅ Connected:', socket.id);
      socket.emit('join', user.id);
      console.log('[Socket] Emitted join for user:', user.id);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] ❌ Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    socket.on('notification', (notif) => {
      console.log('[Socket] 📬 Notification received:', notif);
      setNotifications(prev => [
        {
          ...notif,
          id: notif.id ?? Date.now().toString(),
          read: false,
          createdAt: notif.createdAt ?? new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    return () => {
      console.log('[Socket] Disconnecting');
      socket.disconnect();
    };
  }, [user?.id, isAdmin]);

  // ── Scroll handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Outside click handler ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    console.log('1. handleLogout called');
    console.log('2. logout type:', typeof logout);
    console.log('3. logout value:', logout);
    setDropdownOpen(false);
    try {
      console.log('4. calling logout...');
      await logout();
      console.log('5. logout completed');
    } catch (err) {
      console.error('6. Logout error:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error('[Notif] markAsRead error:', e.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
        method: 'PATCH',
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error('[Notif] markAllAsRead error:', e.message);
    }
  };

  const handleCheckout = async (notif) => {
    await markAsRead(notif.id);
    setNotifOpen(false);
    setDropdownOpen(false);
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    router.push(`/checkout?bookingId=${notif.bookingId}`);
  };

  const handleReview = async (notif) => {
    await markAsRead(notif.id);
    setNotifOpen(false);
    let url = notif.actionUrl || `/reviews/new?bookingId=${notif.bookingId}`;
    url = url.replace(/^\/review\?/, '/reviews/new?');
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
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

                  {/* NOTIFICATION DROPDOWN */}
                  {notifOpen && (
                    <div className="dropdown-anim absolute right-0 mt-2.5 w-[22rem] z-[100] rounded-2xl overflow-hidden border border-[#C87D87]/20 shadow-[0_16px_48px_rgba(58,48,39,0.18)]"
                      style={{ background:'#FBEAD6' }}>
                      
                      <div className="flex justify-between items-center px-4 py-3 border-b border-[#C87D87]/10">
                        <h3 className="font-['Playfair_Display',serif] italic text-[#3a3027] text-sm">Notifications</h3>
                        {notifications.length > 0 && (
                          <button onClick={markAllAsRead}
                            className="font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-[0.12em] uppercase text-[#C87D87] hover:text-[#b36d77] transition-colors">
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto text-[#C87D87]/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
                            </svg>
                            <p className="font-['Cormorant_Garamond',serif] italic text-[0.7rem] text-[#7a6a5a]/50">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} 
                              className={`px-4 py-3 border-b border-[#C87D87]/5 transition-all hover:bg-[#C87D87]/5 cursor-pointer ${!notif.read ? 'bg-[#C87D87]/5' : ''}`}
                              onClick={() => {
                                if (notif.type === 'payment_reminder' || notif.type === 'payment_confirmation') {
                                  handleCheckout(notif);
                                } else if (notif.type === 'review_request') {
                                  handleReview(notif);
                                } else {
                                  markAsRead(notif.id);
                                }
                              }}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read ? 'bg-[#C87D87]' : 'bg-[#C87D87]/30'}`}/>
                                <div className="flex-1 min-w-0">
                                  <p className="font-['Cormorant_Garamond',serif] text-[0.75rem] text-[#3a3027]">{notif.message}</p>
                                  <p className="font-['Cormorant_Garamond',serif] text-[0.55rem] text-[#7a6a5a]/50 mt-1">
                                    {new Date(notif.createdAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* USER AVATAR + DROPDOWN */}
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

                {/* DROPDOWN MENU */}
                {dropdownOpen && (
                  <div className="dropdown-anim absolute top-full right-0 mt-2.5 w-60 z-[100] rounded-2xl overflow-hidden border border-[#C87D87]/20 shadow-[0_16px_48px_rgba(58,48,39,0.18)]"
                    style={{ background:'#FBEAD6' }}>
                    
                    <div className="p-3 border-b border-[#C87D87]/10">
                      <div className="flex items-center gap-3">
                        <Avatar size={10} textSize="text-base"/>
                        <div className="flex-1 min-w-0">
                          <p className="font-['Playfair_Display',serif] italic text-[#3a3027] text-sm truncate">{displayName}</p>
                          <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] text-[#7a6a5a] truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <Link href="/account" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#C87D87]/10 transition-all duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#C87D87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.12em] uppercase text-[#3a3027]">My Account</span>
                    </Link>

                    <Link href="/account#bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#C87D87]/10 transition-all duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#C87D87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.12em] uppercase text-[#3a3027]">My Bookings</span>
                    </Link>

                    {isAdmin && (
                      <Link href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#C87D87]/10 transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#C87D87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"/>
                        </svg>
                        <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.12em] uppercase text-[#3a3027]">Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-[#C87D87]/10 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
                        </svg>
                        <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.12em] uppercase text-red-500">Log Out</span>
                      </button>
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