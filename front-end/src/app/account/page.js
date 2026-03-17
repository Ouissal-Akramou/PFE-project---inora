'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.js';
import Link from 'next/link';

export default function AccountPage() {
  const { user, setUser } = useAuth();

  const [activeSection, setActiveSection] = useState('personal');
  const [collapsed,     setCollapsed]     = useState(false);
  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg,     setAvatarMsg]     = useState({ type: '', text: '' });
  const [nameForm,      setNameForm]      = useState({ fullName: '' });
  const [nameMsg,       setNameMsg]       = useState({ type: '', text: '' });
  const [nameLoading,   setNameLoading]   = useState(false);
  const [emailForm,     setEmailForm]     = useState({ email: '', currentPassword: '' });
  const [emailMsg,      setEmailMsg]      = useState({ type: '', text: '' });
  const [emailLoading,  setEmailLoading]  = useState(false);
  const [passForm,      setPassForm]      = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passMsg,       setPassMsg]       = useState({ type: '', text: '' });
  const [passLoading,   setPassLoading]   = useState(false);
  const [deleteForm,    setDeleteForm]    = useState({ password: '' });
  const [deleteMsg,     setDeleteMsg]     = useState({ type: '', text: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bookings,        setBookings]        = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError,   setBookingsError]   = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('Failed to load profile'); return r.json(); })
      .then(d => { setProfile(d); setNameForm({ fullName: d.fullName || '' }); setEmailForm(f => ({ ...f, email: d.email || '' })); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeSection !== 'bookings') return;
    setBookingsLoading(true); setBookingsError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/my`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('Failed to load bookings'); return r.json(); })
      .then(d => setBookings(Array.isArray(d) ? d : []))
      .catch(e => setBookingsError(e.message))
      .finally(() => setBookingsLoading(false));
  }, [activeSection]);

  const handleAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setAvatarLoading(true);
    const fd = new FormData(); fd.append('avatar', file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/avatar`, { method: 'PATCH', credentials: 'include', body: fd });
      const data = await res.json();
      if (!res.ok) { setAvatarMsg({ type: 'error', text: data.message }); return; }
      setProfile(p => ({ ...p, avatarUrl: data.avatarUrl }));
      setUser(p => ({ ...p, avatarUrl: data.avatarUrl }));
      setAvatarMsg({ type: 'success', text: 'Photo updated!' });
      setTimeout(() => setAvatarMsg({ type: '', text: '' }), 4000);
    } finally { setAvatarLoading(false); }
  };

  const handleName = async (e) => {
    e.preventDefault(); setNameLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/name`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(nameForm) });
      const data = await res.json();
      if (!res.ok) { setNameMsg({ type: 'error', text: data.message }); return; }
      setProfile(p => ({ ...p, fullName: data.fullName }));
      setUser(p => ({ ...p, fullName: data.fullName }));
      setNameMsg({ type: 'success', text: 'Name updated successfully.' });
      setTimeout(() => setNameMsg({ type: '', text: '' }), 4000);
    } finally { setNameLoading(false); }
  };

  const handleEmail = async (e) => {
    e.preventDefault(); setEmailLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/email`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(emailForm) });
      const data = await res.json();
      if (!res.ok) { setEmailMsg({ type: 'error', text: data.message }); return; }
      setProfile(p => ({ ...p, email: data.email }));
      setUser(p => ({ ...p, email: data.email }));
      setEmailMsg({ type: 'success', text: 'Email updated successfully.' });
      setEmailForm(f => ({ ...f, currentPassword: '' }));
      setTimeout(() => setEmailMsg({ type: '', text: '' }), 4000);
    } finally { setEmailLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { setPassMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
    setPassLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/password`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(passForm) });
      const data = await res.json();
      if (!res.ok) { setPassMsg({ type: 'error', text: data.message }); return; }
      setPassMsg({ type: 'success', text: 'Password updated successfully.' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassMsg({ type: '', text: '' }), 4000);
    } finally { setPassLoading(false); }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(deleteForm) });
      const data = await res.json();
      if (!res.ok) { setDeleteMsg({ type: 'error', text: data.message }); return; }
      window.location.href = '/';
    } finally { setDeleteLoading(false); }
  };

  const displayName = profile?.fullName ?? user?.fullName ?? 'Member';
  const avatarUrl   = profile?.avatarUrl ?? user?.avatarUrl ?? null;
  const isAdmin     = profile?.role === 'admin';

  // ── Palette tokens ──
  const IC  = "w-full px-4 py-3.5 bg-[#FBEAD6]/60 border border-[#C87D87]/20 focus:border-[#C87D87]/70 focus:ring-2 focus:ring-[#C87D87]/10 focus:bg-[#FBEAD6]/80 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/40 transition-all rounded-xl";
  const LC  = "font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.22em] uppercase text-[#7a6a5a]/65 block mb-2 font-semibold";
  const BTN = "font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-[#FBEAD6] bg-[#6B7556] px-8 py-3 rounded-xl hover:bg-[#4a5240] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 inline-block cursor-pointer font-semibold shadow-[0_4px_20px_rgba(107,117,86,0.32)] hover:-translate-y-0.5";

  const sideNav = [
    { id: 'personal', label: 'Personal Details',    sub: 'Name & email address',       icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
    { id: 'bookings', label: 'My Bookings',         sub: 'Reservations & status',      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'security', label: 'Password & Security', sub: 'Change your password',       icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z' },
    { id: 'danger',   label: 'Delete Account',      sub: 'Permanently remove account', icon: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' },
  ];

  const statusConfig = {
    pending:   { label: 'Pending',   bg: 'bg-amber-50',      border: 'border-amber-200',    text: 'text-amber-600', dot: 'bg-amber-400' },
    confirmed: { label: 'Confirmed', bg: 'bg-[#6B7556]/8',   border: 'border-[#6B7556]/25', text: 'text-[#4a5240]', dot: 'bg-[#6B7556]' },
    done:      { label: 'Completed', bg: 'bg-[#6B7556]/8',   border: 'border-[#6B7556]/25', text: 'text-[#4a5240]', dot: 'bg-[#6B7556]' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50',        border: 'border-red-200',      text: 'text-red-500',   dot: 'bg-red-400'   },
    rejected:  { label: 'Rejected',  bg: 'bg-red-50',        border: 'border-red-200',      text: 'text-red-500',   dot: 'bg-red-400'   },
  };
  const getStatus = s => statusConfig[s?.toLowerCase()] ?? {
    label: s ?? 'Unknown', bg: 'bg-[#C87D87]/8', border: 'border-[#C87D87]/20', text: 'text-[#a05060]', dot: 'bg-[#C87D87]'
  };

  // ── Shared sub-components ──
  const SectionHeader = ({ eyebrow, title, danger = false }) => (
    <div className="mb-8">
      <p className={`font-['Cormorant_Garamond',serif] italic text-[0.58rem] tracking-[0.4em] uppercase mb-1 ${danger ? 'text-red-400/70' : 'text-[#C87D87]/65'}`}>
        {eyebrow}
      </p>
      <h2 className={`font-['Playfair_Display',serif] italic text-2xl leading-tight ${danger ? 'text-red-500' : 'text-[#3a3027]'}`}>
        {title}<span className={danger ? 'text-red-400' : 'text-[#C87D87]'}>.</span>
      </h2>
      <div className={`w-10 h-px mt-2 ${danger ? 'bg-gradient-to-r from-red-300/50 to-transparent' : 'bg-gradient-to-r from-[#C87D87]/45 to-transparent'}`}/>
    </div>
  );

  const Card = ({ children, danger = false, className = '' }) => (
    <div className={`bg-white rounded-2xl overflow-hidden border transition-all hover:shadow-[0_8px_32px_rgba(107,117,86,0.10)] ${danger ? 'border-red-200/50 shadow-[0_2px_14px_rgba(239,68,68,0.06)]' : 'border-[#C87D87]/12 shadow-[0_2px_14px_rgba(107,117,86,0.06)]'} ${className}`}>
      <div className={`h-0.5 ${danger ? 'bg-gradient-to-r from-transparent via-red-400/60 to-transparent' : 'bg-gradient-to-r from-transparent via-[#C87D87]/55 to-transparent'}`}/>
      {children}
    </div>
  );

  const Msg = ({ msg }) => !msg.text ? null : (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border mb-5 font-['Cormorant_Garamond',serif] italic text-sm
      ${msg.type === 'success'
        ? 'bg-[#6B7556]/6 border-[#6B7556]/20 text-[#4a5240]'
        : 'bg-[#C87D87]/8 border-[#C87D87]/20 text-[#a05060]'}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[0.55rem] flex-shrink-0
        ${msg.type === 'success' ? 'bg-[#6B7556]' : 'bg-[#C87D87]'}`}>
        {msg.type === 'success' ? '✓' : '✕'}
      </span>
      {msg.text}
    </div>
  );

  const sideW  = collapsed ? 'w-[72px]' : 'w-64';
  const mainML = collapsed ? 'ml-[72px]' : 'ml-64';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg,#6B7556 0%,#4a5240 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#C87D87]/40 border-t-[#C87D87] animate-spin"/>
        <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/60 text-sm tracking-[0.35em]">Loading your profile…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg,#6B7556 0%,#4a5240 100%)' }}>
      <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/80 text-lg">{error}</p>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shimmer { from{background-position:200% center} to{background-position:-200% center} }

        /* ── Sidebar: rich sage gradient ── */
        .inora-sidebar {
          background: linear-gradient(170deg, #6B7556 0%, #586246 55%, #47513a 100%);
        }

        /* ── Main area: warm parchment with subtle rose circle pattern ── */
        .inora-main-bg {
          background-color: #faf2eb;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(200,125,135,0.04) 0%, transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(107,117,86,0.04) 0%, transparent 60%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='12' fill='none' stroke='%23C87D87' stroke-width='0.18' opacity='0.12'/%3E%3C/svg%3E");
        }

        /* ── Sidebar active item shimmer ── */
        .nav-active-glow {
          background: linear-gradient(90deg, rgba(255,255,255,0.14) 0%, rgba(251,234,214,0.10) 50%, rgba(255,255,255,0.06) 100%);
        }

        /* ── Input focus: parchment warm glow ── */
        input:focus { box-shadow: 0 0 0 3px rgba(200,125,135,0.08), 0 2px 8px rgba(107,117,86,0.07); }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px rgba(251,234,214,0.5) inset;
          -webkit-text-fill-color: #3a3027;
        }

        /* ── Smooth section transitions ── */
        .section-fade { animation: fadeUp .3s cubic-bezier(.16,1,.3,1) both; }

        /* ── Top bar: frosted parchment ── */
        .inora-topbar {
          background: rgba(250,242,235,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* ── Booking card hover ── */
        .booking-card:hover { transform: translateY(-2px); }
      `}</style>

      <div className="min-h-screen flex" style={{ animation: 'fadeIn .35s ease both' }}>

        {/* ════════════════════════════════════
            SIDEBAR — rich sage green
        ════════════════════════════════════ */}
        <aside
          className={`inora-sidebar fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 ${sideW} overflow-hidden flex-shrink-0`}
          style={{ boxShadow: '6px 0 40px rgba(58,66,50,0.30)' }}
        >
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FBEAD6]/25 to-transparent pointer-events-none"/>

          {/* Subtle corner lace top-left */}
          <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none overflow-hidden opacity-30">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <line x1="0" y1="1" x2="24" y2="1" stroke="#C87D87" strokeWidth="0.8" strokeOpacity="0.7"/>
              <line x1="1" y1="0" x2="1" y2="24" stroke="#C87D87" strokeWidth="0.8" strokeOpacity="0.7"/>
              <rect x="3" y="3" width="7" height="7" transform="rotate(45 6.5 6.5)" fill="none" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.9"/>
              <circle cx="6.5" cy="6.5" r="1" fill="#C87D87" fillOpacity="0.5"/>
            </svg>
          </div>

          {/* Logo + collapse toggle */}
          <div className={`flex items-center border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center px-0 py-5' : 'justify-between px-5 py-5'}`}>
            {!collapsed && (
              <div>
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.46rem] tracking-[0.45em] uppercase text-[#FBEAD6]/40 mb-0.5">My Account</p>
                <h1 className="font-['Playfair_Display',serif] italic text-[1.6rem] text-[#FBEAD6] leading-none tracking-wide">Inora</h1>
              </div>
            )}
            <button
              onClick={() => setCollapsed(c => !c)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/18 border border-white/10 flex items-center justify-center transition-all flex-shrink-0 group"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#FBEAD6]/60 group-hover:text-[#FBEAD6]/90 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {collapsed
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>}
              </svg>
            </button>
          </div>

          {/* Avatar block */}
          {!collapsed ? (
            <div className="px-4 py-4 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center gap-3">
                <label htmlFor="avatar-upload" className="cursor-pointer group/av flex-shrink-0 relative">
                  {avatarUrl ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}`}
                      alt="avatar"
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#FBEAD6]/20 transition-all group-hover/av:brightness-85 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-['Playfair_Display',serif] font-bold text-base text-[#6B7556] transition-all group-hover/av:brightness-90 shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                      style={{ background: 'linear-gradient(135deg,#FBEAD6,#C87D87)' }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {avatarLoading && (
                    <div className="absolute inset-0 rounded-xl bg-black/30 flex items-center justify-center">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    </div>
                  )}
                  {/* Camera hover overlay */}
                  <div className="absolute inset-0 rounded-xl bg-black/0 group-hover/av:bg-black/20 flex items-center justify-center transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white opacity-0 group-hover/av:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                    </svg>
                  </div>
                </label>
                <input id="avatar-upload" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} disabled={avatarLoading}/>
                <div className="min-w-0 flex-1">
                  <p className="font-['Playfair_Display',serif] italic text-[0.95rem] text-[#FBEAD6] truncate leading-snug">{displayName}</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] text-[#FBEAD6]/45 truncate">{profile?.email}</p>
                  {isAdmin && (
                    <span className="font-['Cormorant_Garamond',serif] text-[0.46rem] tracking-[0.2em] uppercase text-[#C87D87]/80 bg-[#C87D87]/12 border border-[#C87D87]/20 px-1.5 py-0.5 rounded inline-block mt-0.5">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              {avatarMsg.text && (
                <p className={`font-['Cormorant_Garamond',serif] italic text-[0.6rem] mt-2 flex items-center gap-1.5
                  ${avatarMsg.type === 'success' ? 'text-[#FBEAD6]/70' : 'text-[#C87D87]/80'}`}>
                  <span className={`w-3 h-3 rounded-full text-white text-[0.42rem] flex items-center justify-center flex-shrink-0
                    ${avatarMsg.type === 'success' ? 'bg-[#FBEAD6]/50' : 'bg-[#C87D87]/60'}`}>
                    {avatarMsg.type === 'success' ? '✓' : '✕'}
                  </span>
                  {avatarMsg.text}
                </p>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-3.5 border-b border-white/8 flex-shrink-0">
              <label htmlFor="avatar-upload-c" className="cursor-pointer group/av relative">
                {avatarUrl
                  ? <img src={`${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}`} alt="avatar" className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#FBEAD6]/20"/>
                  : <div className="w-9 h-9 rounded-xl flex items-center justify-center font-['Playfair_Display',serif] font-bold text-sm text-[#6B7556]"
                      style={{ background: 'linear-gradient(135deg,#FBEAD6,#C87D87)' }}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                }
              </label>
              <input id="avatar-upload-c" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} disabled={avatarLoading}/>
            </div>
          )}

          {/* Nav items */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
            {sideNav.map(item => {
              const active   = activeSection === item.id;
              const isDanger = item.id === 'danger';
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  title={collapsed ? item.label : ''}
                  className={`w-full flex items-center rounded-xl text-left relative transition-all duration-200 group
                    ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'}
                    ${active
                      ? isDanger ? 'bg-red-500/18 nav-active-glow' : 'nav-active-glow'
                      : 'hover:bg-white/8'}`}
                >
                  {/* Active left accent bar */}
                  {active && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full transition-all
                      ${isDanger ? 'bg-red-300' : 'bg-[#FBEAD6]'}`}/>
                  )}

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`flex-shrink-0 w-[18px] h-[18px] transition-colors
                      ${active
                        ? isDanger ? 'text-red-300' : 'text-[#FBEAD6]'
                        : isDanger ? 'text-red-300/40 group-hover:text-red-300' : 'text-[#FBEAD6]/40 group-hover:text-[#FBEAD6]/80'}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                  </svg>

                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className={`font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.14em] uppercase transition-colors
                        ${active
                          ? isDanger ? 'text-red-200 font-semibold' : 'text-[#FBEAD6] font-semibold'
                          : isDanger ? 'text-red-300/50 group-hover:text-red-200' : 'text-[#FBEAD6]/50 group-hover:text-[#FBEAD6]/85'}`}>
                        {item.label}
                      </p>
                      <p className={`font-['Cormorant_Garamond',serif] italic text-[0.58rem] truncate
                        ${isDanger ? 'text-red-300/30' : 'text-[#FBEAD6]/28'}`}>
                        {item.sub}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-white/8 pt-0.5 pb-3 px-2 flex-shrink-0">
            {/* Ornament */}
            {!collapsed && (
              <div className="flex items-center gap-2 px-3 py-2 mb-1">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#FBEAD6]/12"/>
                <span className="text-[#C87D87]/30 text-[0.4rem]">✦</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#FBEAD6]/12"/>
              </div>
            )}
            <Link
              href="/"
              className={`w-full flex items-center rounded-xl text-[#FBEAD6]/35 hover:text-[#FBEAD6]/70 hover:bg-white/8 transition-all group
                ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'}`}
              title="Back to Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] flex-shrink-0 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
              {!collapsed && (
                <span className="font-['Cormorant_Garamond',serif] text-[0.68rem] tracking-[0.15em] uppercase">Back to Inora</span>
              )}
            </Link>
          </div>
        </aside>

        {/* ════════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════════ */}
        <main className={`${mainML} flex-1 min-h-screen inora-main-bg transition-all duration-300`}>

          {/* Sticky top bar */}
          <header
            className="inora-topbar sticky top-0 z-30 border-b border-[#C87D87]/10 px-8 py-4 flex items-center justify-between"
            style={{ boxShadow: '0 1px 24px rgba(107,117,86,0.08)' }}
          >
            <div>
              <p className="font-['Cormorant_Garamond',serif] italic text-[0.55rem] tracking-[0.35em] uppercase text-[#C87D87]/55">
                Inora › {sideNav.find(n => n.id === activeSection)?.label}
              </p>
              <h2 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] leading-snug mt-0.5">
                {sideNav.find(n => n.id === activeSection)?.label}
                <span className="text-[#C87D87]">.</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {profile?.role && (
                <span className={`font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-[0.18em] uppercase border px-2.5 py-1 rounded-full
                  ${isAdmin
                    ? 'bg-[#6B7556]/10 text-[#4a5240] border-[#6B7556]/25'
                    : 'bg-[#C87D87]/10 text-[#a05060] border-[#C87D87]/20'}`}>
                  {profile.role}
                </span>
              )}
              <div className="hidden md:flex items-center gap-2">
                <div className="w-px h-4 bg-[#C87D87]/20"/>
                <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/40">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </header>

          <div className="p-8 max-w-3xl" style={{ animation: 'fadeUp .4s cubic-bezier(.16,1,.3,1) both' }}>

            {/* ════ PERSONAL ════ */}
            {activeSection === 'personal' && (
              <div className="space-y-5 section-fade">
                <SectionHeader eyebrow="Account Settings" title="Personal Details"/>

                <Card>
                  <form onSubmit={handleName} className="p-7">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.56rem] tracking-[0.35em] uppercase text-[#C87D87]/55 mb-0.5">Update</p>
                    <h3 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027] mb-1">
                      Full Name
                    </h3>
                    <div className="w-6 h-px bg-gradient-to-r from-[#C87D87]/40 to-transparent mb-6"/>
                    <label className={LC}>Name</label>
                    <input type="text" value={nameForm.fullName}
                      onChange={e => setNameForm({ fullName: e.target.value })}
                      placeholder="Your full name" className={`${IC} mb-5`}/>
                    <Msg msg={nameMsg}/>
                    <button type="submit" disabled={nameLoading} className={BTN}>
                      {nameLoading ? 'Saving…' : 'Save Name'}
                    </button>
                  </form>
                </Card>

                <Card>
                  <form onSubmit={handleEmail} className="p-7">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.56rem] tracking-[0.35em] uppercase text-[#C87D87]/55 mb-0.5">Update</p>
                    <h3 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027] mb-1">
                      Email Address
                    </h3>
                    <div className="w-6 h-px bg-gradient-to-r from-[#C87D87]/40 to-transparent mb-6"/>
                    <label className={LC}>New Email</label>
                    <input type="email" value={emailForm.email}
                      onChange={e => setEmailForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com" className={`${IC} mb-4`}/>
                    <label className={LC}>Current Password</label>
                    <input type="password" value={emailForm.currentPassword}
                      onChange={e => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))}
                      placeholder="Confirm with your password" className={`${IC} mb-5`}/>
                    <Msg msg={emailMsg}/>
                    <button type="submit" disabled={emailLoading} className={BTN}>
                      {emailLoading ? 'Saving…' : 'Save Email'}
                    </button>
                  </form>
                </Card>
              </div>
            )}

            {/* ════ BOOKINGS ════ */}
            {activeSection === 'bookings' && (
              <div className="space-y-5 section-fade">
                <SectionHeader eyebrow="Your Reservations" title="My Bookings"/>

                {bookingsLoading && (
                  <div className="flex flex-col items-center gap-4 py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-[#C87D87]/25 border-t-[#C87D87] animate-spin"/>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/55 text-sm tracking-widest">Loading your bookings…</p>
                  </div>
                )}

                {bookingsError && (
                  <Card>
                    <div className="p-8 text-center">
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]">{bookingsError}</p>
                    </div>
                  </Card>
                )}

                {!bookingsLoading && !bookingsError && bookings.length === 0 && (
                  <Card>
                    <div className="p-14 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#C87D87]/8 border border-[#C87D87]/15 flex items-center justify-center mx-auto mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-[#C87D87]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-2">No bookings yet</h3>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/60 text-sm mb-7">You haven't made any reservations yet.</p>
                      <Link href="/gatherings" className={BTN}>Plan a Gathering</Link>
                    </div>
                  </Card>
                )}

                {!bookingsLoading && !bookingsError && bookings.length > 0 && (
                  <>
                    {/* Status summary pills */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        bookings.reduce((acc, b) => {
                          const k = b.status?.toLowerCase() ?? 'unknown';
                          acc[k] = (acc[k] ?? 0) + 1;
                          return acc;
                        }, {})
                      ).map(([status, count]) => {
                        const s = getStatus(status);
                        return (
                          <div key={status} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${s.bg} ${s.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
                            <span className={`font-['Cormorant_Garamond',serif] text-[0.68rem] font-semibold ${s.text}`}>{count} {s.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Booking cards */}
                    <div className="space-y-3">
                      {bookings.map((booking, i) => {
                        const s = getStatus(booking.status);
                        return (
                          <div key={booking.id}
                            className={`booking-card bg-white rounded-2xl overflow-hidden border ${s.border} shadow-[0_2px_14px_rgba(107,117,86,0.07)] transition-all`}
                            style={{ animation: `fadeIn .3s ease ${i * 0.06}s both` }}
                          >
                            <div className={`h-0.5 bg-gradient-to-r from-transparent to-transparent ${s.dot.replace('bg-', 'via-')}`}/>
                            <div className="p-5">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl border ${s.border} ${s.bg} flex items-center justify-center flex-shrink-0`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4.5 h-4.5 ${s.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                  </div>
                                  <div>
                                    <h3 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027]">
                                      {booking.activity || booking.activityType || 'Activity'}
                                    </h3>
                                    <p className="font-['Cormorant_Garamond',serif] text-[0.56rem] text-[#7a6a5a]/45 tracking-widest mt-0.5">
                                      #{String(booking.id).padStart(5, '0')}
                                    </p>
                                  </div>
                                </div>
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[0.57rem] font-semibold tracking-[0.14em] uppercase font-['Cormorant_Garamond',serif] flex-shrink-0 ${s.bg} ${s.border} ${s.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/> {s.label}
                                </span>
                              </div>

                              {/* Detail tiles — parchment bg */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                  { label: 'Date',    value: booking.date ? new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                                  { label: 'Time',    value: booking.timeSlot || '—' },
                                  { label: 'Guests',  value: `${booking.participants || 1} person${(booking.participants || 1) > 1 ? 's' : ''}` },
                                  { label: 'Contact', value: booking.preferredContact || '—' },
                                ].map(({ label, value }) => (
                                  <div key={label} className="bg-[#FBEAD6]/50 rounded-xl px-3 py-2.5 border border-[#C87D87]/8">
                                    <p className="font-['Cormorant_Garamond',serif] text-[0.52rem] tracking-[0.18em] uppercase text-[#7a6a5a]/50 mb-0.5">{label}</p>
                                    <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] font-semibold">{value}</p>
                                  </div>
                                ))}
                              </div>

                              {(booking.specialRequests || booking.allergies) && (
                                <div className="mt-3 px-4 py-3 bg-[#FBEAD6]/40 rounded-xl border border-[#C87D87]/8">
                                  {booking.specialRequests && (
                                    <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]">
                                      <span className="not-italic font-semibold text-[0.56rem] tracking-widest uppercase text-[#7a6a5a]/60">Requests: </span>
                                      {booking.specialRequests}
                                    </p>
                                  )}
                                  {booking.allergies && (
                                    <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] mt-1">
                                      <span className="not-italic font-semibold text-[0.56rem] tracking-widest uppercase text-[#7a6a5a]/60">Allergies: </span>
                                      {booking.allergies}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Card footer */}
                              <div className="mt-4 pt-3 border-t border-[#C87D87]/8 flex items-center justify-between">
                                <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/45">
                                  Booked {new Date(booking.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                {booking.status?.toLowerCase() === 'pending' && (
                                  <p className="font-['Cormorant_Garamond',serif] italic text-xs text-amber-500 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"/> Awaiting confirmation
                                  </p>
                                )}
                                {booking.status?.toLowerCase() === 'confirmed' && (
                                  booking.paymentStatus === 'PAID' ? (
                                    <div className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.16em] uppercase text-[#4a5240] bg-[#6B7556]/10 border border-[#6B7556]/25 px-3 py-1.5 rounded-lg">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                      </svg>
                                      Avance réglée · {booking.advancePaid} MAD
                                    </div>
                                  ) : (
                                    <Link href={`/checkout?bookingId=${booking.id}`}
                                      className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.16em] uppercase text-[#FBEAD6] bg-[#6B7556] px-3 py-1.5 rounded-lg hover:bg-[#4a5240] transition-all shadow-[0_3px_12px_rgba(107,117,86,0.28)]">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
                                      </svg>
                                      Complete Payment
                                    </Link>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ════ SECURITY ════ */}
            {activeSection === 'security' && (
              <div className="section-fade">
                <SectionHeader eyebrow="Account Settings" title="Password & Security"/>
                <Card>
                  <form onSubmit={handlePassword} className="p-7">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.56rem] tracking-[0.35em] uppercase text-[#C87D87]/55 mb-0.5">Update</p>
                    <h3 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027] mb-1">Change Password</h3>
                    <div className="w-6 h-px bg-gradient-to-r from-[#C87D87]/40 to-transparent mb-6"/>
                    <div className="space-y-4 mb-5">
                      {[
                        { lbl: 'Current Password', key: 'currentPassword', ph: 'Your current password' },
                        { lbl: 'New Password',      key: 'newPassword',    ph: 'At least 6 characters' },
                        { lbl: 'Confirm Password',  key: 'confirmPassword',ph: 'Repeat new password'   },
                      ].map(({ lbl, key, ph }) => (
                        <div key={key}>
                          <label className={LC}>{lbl}</label>
                          <input type="password" value={passForm[key]}
                            onChange={e => setPassForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder={ph} className={IC}/>
                        </div>
                      ))}
                    </div>
                    <Msg msg={passMsg}/>
                    <button type="submit" disabled={passLoading} className={BTN}>
                      {passLoading ? 'Updating…' : 'Update Password'}
                    </button>
                  </form>
                </Card>
              </div>
            )}

            {/* ════ DANGER ════ */}
            {activeSection === 'danger' && (
              <div className="space-y-5 section-fade">
                <SectionHeader eyebrow="Danger Zone" title="Delete Account" danger/>

                {/* Warning card */}
                <Card danger>
                  <div className="p-6 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl border border-red-200/60 bg-red-50 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/65 text-[0.56rem] tracking-[0.22em] uppercase mb-1.5">Please read carefully</p>
                      <p className="font-['Cormorant_Garamond',serif] text-sm text-[#5a4a3a] leading-relaxed">
                        Deleting your account is <span className="text-red-500 font-semibold">permanent and irreversible</span>. All your data, bookings, and profile will be permanently removed and cannot be recovered.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Delete form card */}
                <Card danger>
                  <form onSubmit={handleDelete} className="p-7">
                    <h3 className="font-['Playfair_Display',serif] italic text-lg text-red-500 mb-1">Confirm Deletion</h3>
                    <div className="w-6 h-px bg-gradient-to-r from-red-300/50 to-transparent mb-6"/>
                    <label className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.22em] uppercase text-[#7a6a5a]/65 block mb-2 font-semibold">
                      Enter your password to confirm
                    </label>
                    <input
                      type="password" value={deleteForm.password}
                      onChange={e => setDeleteForm({ password: e.target.value })}
                      placeholder="Your password"
                      className="w-full px-4 py-3.5 bg-[#FBEAD6]/60 border border-red-200/50 focus:border-red-300/70 focus:ring-2 focus:ring-red-100/50 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/40 transition-all rounded-xl mb-5"
                    />
                    {deleteMsg.text && (
                      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-red-200/60 bg-red-50/60 mb-5 font-['Cormorant_Garamond',serif] italic text-sm text-red-500">
                        <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[0.55rem] flex-shrink-0">✕</span>
                        {deleteMsg.text}
                      </div>
                    )}
                    <button
                      type="submit" disabled={deleteLoading}
                      className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-white bg-red-500/85 px-8 py-3 rounded-xl hover:bg-red-500 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer font-semibold shadow-[0_4px_20px_rgba(239,68,68,0.22)] hover:-translate-y-0.5"
                    >
                      {deleteLoading ? 'Deleting…' : 'Delete My Account'}
                    </button>
                  </form>
                </Card>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
