'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.js';
import Link from 'next/link';

export default function AccountPage() {
  const { user, setUser } = useAuth();

  const [activeSection, setActiveSection] = useState('personal');
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

  useEffect(() => {
    fetch('http://localhost:4000/api/profile/me', { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error('Failed to load profile'); return res.json(); })
      .then(data => {
        setProfile(data);
        setNameForm({ fullName: data.fullName || '' });
        setEmailForm(f => ({ ...f, email: data.email || '' }));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res  = await fetch('http://localhost:4000/api/profile/me/avatar', { method: 'PATCH', credentials: 'include', body: formData });
      const data = await res.json();
      if (!res.ok) { setAvatarMsg({ type: 'error', text: data.message }); return; }
      setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      setUser(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      setAvatarMsg({ type: 'success', text: 'Photo updated!' });
      setTimeout(() => setAvatarMsg({ type: '', text: '' }), 4000);
    } finally { setAvatarLoading(false); }
  };

  const handleName = async (e) => {
    e.preventDefault(); setNameLoading(true);
    try {
      const res  = await fetch('http://localhost:4000/api/profile/me/name', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(nameForm) });
      const data = await res.json();
      if (!res.ok) { setNameMsg({ type: 'error', text: data.message }); return; }
      setProfile(prev => ({ ...prev, fullName: data.fullName }));
      setUser(prev => ({ ...prev, fullName: data.fullName }));
      setNameMsg({ type: 'success', text: 'Name updated successfully' });
      setTimeout(() => setNameMsg({ type: '', text: '' }), 4000);
    } finally { setNameLoading(false); }
  };

  const handleEmail = async (e) => {
    e.preventDefault(); setEmailLoading(true);
    try {
      const res  = await fetch('http://localhost:4000/api/profile/me/email', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(emailForm) });
      const data = await res.json();
      if (!res.ok) { setEmailMsg({ type: 'error', text: data.message }); return; }
      setProfile(prev => ({ ...prev, email: data.email }));
      setUser(prev => ({ ...prev, email: data.email }));
      setEmailMsg({ type: 'success', text: 'Email updated successfully' });
      setEmailForm(f => ({ ...f, currentPassword: '' }));
      setTimeout(() => setEmailMsg({ type: '', text: '' }), 4000);
    } finally { setEmailLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { setPassMsg({ type: 'error', text: 'Passwords do not match' }); return; }
    setPassLoading(true);
    try {
      const res  = await fetch('http://localhost:4000/api/profile/me/password', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(passForm) });
      const data = await res.json();
      if (!res.ok) { setPassMsg({ type: 'error', text: data.message }); return; }
      setPassMsg({ type: 'success', text: 'Password updated successfully' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassMsg({ type: '', text: '' }), 4000);
    } finally { setPassLoading(false); }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch('http://localhost:4000/api/profile/me', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(deleteForm) });
      const data = await res.json();
      if (!res.ok) { setDeleteMsg({ type: 'error', text: data.message }); return; }
      window.location.href = '/';
    } finally { setDeleteLoading(false); }
  };

  const displayName = profile?.fullName ?? user?.fullName ?? 'Member';
  const avatarUrl   = profile?.avatarUrl ?? user?.avatarUrl ?? null;

  // ── Style tokens ───────────────────────────────────────────────────────────
  const IC  = "w-full px-5 py-3.5 bg-white border border-[#C87D87]/40 focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/15 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/60 transition-all duration-300 rounded-sm";
  const LC  = "font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-[#5a4a3a] block mb-2 font-semibold";
  const BTN = "font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-[#FBEAD6] bg-[#6B7556] px-10 py-3.5 hover:bg-[#4a5240] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 inline-block cursor-pointer font-semibold shadow-sm";

  // ── Shared section header — keeps all 3 sections visually identical ────────
  const SectionHeader = ({ eyebrow, title, eyebrowColor = 'text-[#C87D87]', barColor = 'bg-[#C87D87]' }) => (
    <div className="mb-8">
      <p className={`font-['Cormorant_Garamond',serif] italic ${eyebrowColor} text-sm tracking-[0.35em] uppercase mb-2`}>
        {eyebrow}
      </p>
      <h2 className="font-['Playfair_Display',serif] italic text-[clamp(2rem,3.5vw,3rem)] text-[#FBEAD6]">
        {title}
      </h2>
      <div className={`w-14 h-[1.5px] ${barColor} mt-4`} />
    </div>
  );

  // ── Shared card corners ────────────────────────────────────────────────────
  const CardCorners = ({ color = '[#C87D87]' }) => (
    <>
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-${color} to-transparent`} />
      <div className={`absolute top-2 left-2  w-4 h-4 border-t border-l border-${color}/40 pointer-events-none`} />
      <div className={`absolute top-2 right-2 w-4 h-4 border-t border-r border-${color}/40 pointer-events-none`} />
    </>
  );

  const sideNav = [
    { id: 'personal', icon: '✦', label: 'Personal Details',    sub: 'Name & email address'      },
    { id: 'security', icon: '⚿', label: 'Password & Security', sub: 'Change your password'       },
    { id: 'danger',   icon: '✕', label: 'Delete Account',      sub: 'Permanently remove account' },
  ];

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{`.green-bg{background-color:#6B7556;background-image:radial-gradient(ellipse at 20% 20%,rgba(200,125,135,.12) 0%,transparent 50%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='1.5' fill='none' stroke='%23FBEAD6' stroke-width='.3' opacity='.2'/%3E%3C/svg%3E");}`}</style>
      <div className="green-bg min-h-screen flex items-center justify-center">
        <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6] text-lg tracking-[0.35em] animate-pulse">
          Loading your profile...
        </p>
      </div>
    </>
  );

  /* ── Error ── */
  if (error) return (
    <>
      <style>{`.green-bg{background-color:#6B7556;}`}</style>
      <div className="green-bg min-h-screen flex items-center justify-center">
        <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6] text-lg">{error}</p>
      </div>
    </>
  );

  /* ── Main ── */
  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .green-bg {
          background-color: #6B7556;
          background-image:
            radial-gradient(ellipse at 20% 20%, rgba(200,125,135,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(251,234,214,0.06) 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='1.5' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.2'/%3E%3Ccircle cx='40' cy='40' r='10' fill='none' stroke='%23FBEAD6' stroke-width='0.2' opacity='0.12'/%3E%3C/svg%3E");
        }

        .beige-card {
          background: #FBEAD6;
          border: 1px solid rgba(200,125,135,0.5);
          box-shadow: 0 4px 16px rgba(58,48,39,0.10);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .beige-card:hover {
          box-shadow: 0 20px 48px rgba(58,48,39,0.18);
          transform: translateY(-2px);
        }

        .beige-nav {
          background: #FBEAD6;
          border: 1px solid rgba(200,125,135,0.5);
          box-shadow: 0 4px 16px rgba(58,48,39,0.10);
        }
      `}</style>

      {/* ══ BACK HOME ══ */}
      <div className="fixed top-7 left-8 z-50">
        <Link href="/" aria-label="Back to home" className="group flex items-center gap-2.5">
          <div className="w-10 h-10 flex items-center justify-center transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-[#FBEAD6] group-hover:text-[#C87D87] group-hover:-translate-x-0.5 transition-all duration-300"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </div>
        </Link>
      </div>

      {/* ══ PAGE ══ */}
      <div className="green-bg min-h-screen pt-16 pb-24 relative overflow-x-hidden">

        {/* Corner frame */}
        <div className="fixed inset-0 pointer-events-none z-40" aria-hidden="true">
          <div className="absolute inset-3 border border-[#FBEAD6]/15" />
          <div className="absolute inset-5 border border-[#FBEAD6]/7" />
          {[
            { pos: 'top-3 left-3',     b: 'border-t border-l', i: 'top-2 left-2 border-t border-l'     },
            { pos: 'top-3 right-3',    b: 'border-t border-r', i: 'top-2 right-2 border-t border-r'    },
            { pos: 'bottom-3 left-3',  b: 'border-b border-l', i: 'bottom-2 left-2 border-b border-l'  },
            { pos: 'bottom-3 right-3', b: 'border-b border-r', i: 'bottom-2 right-2 border-b border-r' },
          ].map(({ pos, b, i }, idx) => (
            <div key={idx} className={`absolute ${pos} w-16 h-16`}>
              <div className={`absolute inset-0 ${b} border-[#FBEAD6]/25`} />
              <div className={`absolute w-3 h-3 ${i} border-[#C87D87]/50`} />
            </div>
          ))}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="w-16 h-px bg-[#FBEAD6]/15" /><span className="text-[#FBEAD6]/25 text-xs">✦</span><div className="w-16 h-px bg-[#FBEAD6]/15" />
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="w-16 h-px bg-[#FBEAD6]/15" /><span className="text-[#FBEAD6]/25 text-xs">✦</span><div className="w-16 h-px bg-[#FBEAD6]/15" />
          </div>
        </div>

        {/* ══ MAIN LAYOUT ══ */}
        <div className="max-w-7xl mx-auto px-3 relative z-20">
          <div className="flex gap-8 items-start">

            {/* ════ SIDEBAR ════ */}
            <aside className="w-80 flex-shrink-0 sticky top-8 space-y-5 animate-[fadeUp_0.5s_ease_forwards]">

              {/* Profile card */}
              <div className="beige-card overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C87D87] to-transparent" />
                <div className="absolute top-2 left-2   w-5 h-5 border-t border-l border-[#C87D87]/40 pointer-events-none" />
                <div className="absolute top-2 right-2  w-5 h-5 border-t border-r border-[#C87D87]/40 pointer-events-none" />
                <div className="absolute bottom-2 left-2  w-5 h-5 border-b border-l border-[#C87D87]/40 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b border-r border-[#C87D87]/40 pointer-events-none" />

                {/* Avatar section */}
                <div className="px-8 pt-10 pb-7 text-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,125,135,0.08)_0%,transparent_70%)] pointer-events-none" />

                  <div className="relative inline-block mb-3">
                    <label htmlFor="avatar-upload" className="cursor-pointer group/av block">
                      {avatarUrl ? (
                        <img src={`http://localhost:4000${avatarUrl}`} alt="avatar"
                          className="w-24 h-24 rounded-full object-cover ring-4 ring-[#C87D87]/30 shadow-xl mx-auto transition-all duration-300 group-hover/av:opacity-70" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C87D87] to-[#6B7556] flex items-center justify-center text-[#FBEAD6] font-['Playfair_Display',serif] font-bold text-4xl mx-auto ring-4 ring-[#C87D87]/20 shadow-xl transition-all duration-300 group-hover/av:opacity-70">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity duration-300">
                        <div className="w-24 h-24 rounded-full bg-[#3a3027]/50 flex items-center justify-center">
                          {avatarLoading ? (
                            <span className="text-white text-xs tracking-widest animate-pulse">···</span>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </label>
                    <input id="avatar-upload" type="file" accept="image/jpeg,image/png,image/webp"
                      className="hidden" onChange={handleAvatar} disabled={avatarLoading} />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#6B7556] border-2 border-[#FBEAD6] flex items-center justify-center shadow-md pointer-events-none">
                      <span className="text-[#FBEAD6] text-[0.45rem]">✦</span>
                    </div>
                  </div>

                  {avatarMsg.text ? (
                    <p className={`font-['Cormorant_Garamond',serif] italic text-sm mb-2 ${avatarMsg.type === 'success' ? 'text-[#6B7556]' : 'text-[#C87D87]'}`}>
                      {avatarMsg.type === 'success' ? '✓' : '✕'} {avatarMsg.text}
                    </p>
                  ) : (
                    <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a] mb-2">
                      Click photo to change
                    </p>
                  )}

                  <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.32em] uppercase mt-3 mb-1">
                    Welcome back
                  </p>
                  <h2 className="font-['Playfair_Display',serif] italic text-[1.6rem] text-[#3a3027] leading-tight">
                    {displayName}<span className="text-[#C87D87]">.</span>
                  </h2>
                  <div className="flex items-center justify-center gap-2 my-3">
                    <div className="w-10 h-px bg-[#C87D87]/40" />
                    <span className="text-[#C87D87]/60 text-[0.5rem]">✦</span>
                    <div className="w-10 h-px bg-[#C87D87]/40" />
                  </div>
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] break-all leading-relaxed">
                    {profile?.email}
                  </p>
                </div>

                {/* Info rows */}
                <div className="divide-y divide-[#C87D87]/15 border-t border-[#C87D87]/20">
                  {[
                    {
                      label: 'Role',
                      value: (
                        <span className={`font-['Cormorant_Garamond',serif] text-xs tracking-[0.15em] uppercase px-2.5 py-1 border font-semibold ${
                          profile?.role === 'admin'
                            ? 'text-[#6B7556] border-[#6B7556]/50 bg-[#6B7556]/12'
                            : 'text-[#C87D87] border-[#C87D87]/50 bg-[#C87D87]/10'
                        }`}>{profile?.role ?? 'member'}</span>
                      )
                    },
                    {
                      label: 'Since',
                      value: (
                        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] font-medium">
                          {profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                            : '—'}
                        </p>
                      )
                    },
                    {
                      label: 'ID',
                      value: (
                        <p className="font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a] tracking-widest">
                          #{String(profile?.id ?? 0).padStart(5, '0')}
                        </p>
                      )
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-6 py-3.5">
                      <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase text-[#7a6a5a] font-semibold">{label}</p>
                      {value}
                    </div>
                  ))}
                </div>

                <div className="text-center py-3 border-t border-[#C87D87]/15">
                  <span className="text-[#C87D87]/50 text-xs tracking-[0.5em]">✦ ✦ ✦</span>
                </div>
              </div>

              {/* Section nav */}
              <div className="beige-nav overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C87D87] to-transparent" />
                <div className="px-6 py-4 border-b border-[#C87D87]/20">
                  <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.3em] uppercase text-[#7a6a5a] font-semibold">
                    Settings
                  </p>
                </div>
                <div className="divide-y divide-[#C87D87]/10">
                  {sideNav.map(item => (
                    <button key={item.id} onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-4 px-6 py-[1.125rem] text-left transition-all duration-300 relative group ${
                        activeSection === item.id
                          ? item.id === 'danger' ? 'bg-red-50' : 'bg-[#6B7556]/10'
                          : 'hover:bg-[#C87D87]/5'
                      }`}>
                      {activeSection === item.id && (
                        <div className={`absolute left-0 top-0 h-full w-[3px] ${
                          item.id === 'danger' ? 'bg-red-400' : 'bg-gradient-to-b from-transparent via-[#6B7556] to-transparent'
                        }`} />
                      )}
                      <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border text-sm transition-all duration-300 ${
                        activeSection === item.id
                          ? item.id === 'danger' ? 'border-red-300 bg-red-50 text-red-500' : 'border-[#6B7556]/60 bg-[#6B7556]/12 text-[#6B7556]'
                          : item.id === 'danger'
                            ? 'border-red-200 text-red-300 group-hover:border-red-300 group-hover:text-red-400'
                            : 'border-[#C87D87]/30 text-[#C87D87]/60 group-hover:border-[#6B7556]/50 group-hover:text-[#6B7556]'
                      }`}>{item.icon}</div>
                      <div className="min-w-0">
                        <p className={`font-['Cormorant_Garamond',serif] text-sm tracking-[0.15em] uppercase font-semibold transition-colors duration-300 ${
                          activeSection === item.id
                            ? item.id === 'danger' ? 'text-red-500' : 'text-[#3a3027]'
                            : 'text-[#5a4a3a] group-hover:text-[#3a3027]'
                        }`}>{item.label}</p>
                        <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a] mt-0.5 truncate">{item.sub}</p>
                      </div>
                      {activeSection === item.id && (
                        <span className={`ml-auto text-base flex-shrink-0 ${item.id === 'danger' ? 'text-red-300' : 'text-[#6B7556]/70'}`}>›</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </aside>

            {/* ════ CENTER CONTENT ════ */}
            <div className="flex-1 min-w-0 animate-[fadeUp_0.6s_ease_forwards]">

              {/* ── PERSONAL DETAILS ── */}
              {activeSection === 'personal' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease_forwards]">

                  <SectionHeader
                    eyebrow="Account Settings"
                    title="Personal Details"
                  />

                  {/* Name form */}
                  <div className="beige-card overflow-hidden relative">
                    <CardCorners />
                    <form onSubmit={handleName} className="p-9">
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.3em] uppercase mb-1">Update</p>
                      <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-1">Full Name</h3>
                      <div className="w-8 h-[1.5px] bg-[#C87D87] mb-7" />
                      <label className={LC}>Name</label>
                      <input type="text" value={nameForm.fullName}
                        onChange={e => setNameForm({ fullName: e.target.value })}
                        placeholder="Your full name" className={`${IC} mb-6`} />
                      {nameMsg.text && (
                        <p className={`font-['Cormorant_Garamond',serif] italic text-base mb-5 ${nameMsg.type === 'success' ? 'text-[#6B7556]' : 'text-[#C87D87]'}`}>
                          {nameMsg.type === 'success' ? '✓' : '✕'} {nameMsg.text}
                        </p>
                      )}
                      <button type="submit" disabled={nameLoading} className={BTN}>
                        {nameLoading ? 'Saving…' : 'Save Name'}
                      </button>
                    </form>
                  </div>

                  {/* Email form */}
                  <div className="beige-card overflow-hidden relative">
                    <CardCorners />
                    <form onSubmit={handleEmail} className="p-9">
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.3em] uppercase mb-1">Update</p>
                      <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-1">Email Address</h3>
                      <div className="w-8 h-[1.5px] bg-[#C87D87] mb-7" />
                      <label className={LC}>New Email</label>
                      <input type="email" value={emailForm.email}
                        onChange={e => setEmailForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com" className={`${IC} mb-5`} />
                      <label className={LC}>Current Password</label>
                      <input type="password" value={emailForm.currentPassword}
                        onChange={e => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))}
                        placeholder="Confirm with your password" className={`${IC} mb-6`} />
                      {emailMsg.text && (
                        <p className={`font-['Cormorant_Garamond',serif] italic text-base mb-5 ${emailMsg.type === 'success' ? 'text-[#6B7556]' : 'text-[#C87D87]'}`}>
                          {emailMsg.type === 'success' ? '✓' : '✕'} {emailMsg.text}
                        </p>
                      )}
                      <button type="submit" disabled={emailLoading} className={BTN}>
                        {emailLoading ? 'Saving…' : 'Save Email'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── PASSWORD & SECURITY ── */}
              {activeSection === 'security' && (
                <div className="animate-[fadeIn_0.3s_ease_forwards]">

                  <SectionHeader
                    eyebrow="Account Settings"
                    title="Password & Security"
                  />

                  <div className="beige-card overflow-hidden relative">
                    <CardCorners />
                    <form onSubmit={handlePassword} className="p-9">
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.3em] uppercase mb-1">Update</p>
                      <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-1">Change Password</h3>
                      <div className="w-8 h-[1.5px] bg-[#C87D87] mb-7" />
                      <div className="space-y-5 mb-6">
                        {[
                          { lbl: 'Current Password', key: 'currentPassword', ph: 'Your current password' },
                          { lbl: 'New Password',      key: 'newPassword',     ph: 'At least 6 characters' },
                          { lbl: 'Confirm Password',  key: 'confirmPassword', ph: 'Repeat new password'    },
                        ].map(({ lbl, key, ph }) => (
                          <div key={key}>
                            <label className={LC}>{lbl}</label>
                            <input
                              type="password"
                              value={passForm[key]}
                              onChange={e => setPassForm(f => ({ ...f, [key]: e.target.value }))}
                              placeholder={ph}
                              className={IC}
                            />
                          </div>
                        ))}
                      </div>
                      {passMsg.text && (
                        <p className={`font-['Cormorant_Garamond',serif] italic text-base mb-5 ${passMsg.type === 'success' ? 'text-[#6B7556]' : 'text-[#C87D87]'}`}>
                          {passMsg.type === 'success' ? '✓' : '✕'} {passMsg.text}
                        </p>
                      )}
                      <button type="submit" disabled={passLoading} className={BTN}>
                        {passLoading ? 'Updating…' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── DELETE ACCOUNT ── */}
              {activeSection === 'danger' && (
                <div className="animate-[fadeIn_0.3s_ease_forwards]">

                  <SectionHeader
                    eyebrow="Danger Zone"
                    title="Delete Account"
                    eyebrowColor="text-red-300"
                    barColor="bg-red-400"
                  />

                  {/* Warning box */}
                  <div className="relative bg-[#FBEAD6] border border-red-300 p-7 mb-6 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent" />
                    <div className="absolute top-2 left-2  w-4 h-4 border-t border-l border-red-300/60 pointer-events-none" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-red-300/60 pointer-events-none" />
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-sm tracking-[0.2em] uppercase mb-3">
                      ⚠ Please read carefully
                    </p>
                    <p className="font-['Cormorant_Garamond',serif] text-base text-[#5a4a3a] leading-relaxed">
                      Deleting your account is{' '}
                      <span className="text-red-500 font-bold">permanent and irreversible</span>.
                      {' '}All your data will be permanently removed.
                    </p>
                  </div>

                  {/* Delete form */}
                  <div className="relative bg-[#FBEAD6] border border-red-300 overflow-hidden
                    hover:shadow-[0_20px_48px_rgba(58,48,39,0.15)] hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent" />
                    <div className="absolute top-2 left-2  w-4 h-4 border-t border-l border-red-300/50 pointer-events-none" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-red-300/50 pointer-events-none" />
                    <form onSubmit={handleDelete} className="p-9">
                      <h3 className="font-['Playfair_Display',serif] italic text-2xl text-red-500 mb-1">Confirm Deletion</h3>
                      <div className="w-8 h-[1.5px] bg-red-400 mb-7" />
                      <label className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-[#5a4a3a] block mb-2 font-semibold">
                        Enter your password to confirm
                      </label>
                      <input
                        type="password"
                        value={deleteForm.password}
                        onChange={e => setDeleteForm({ password: e.target.value })}
                        placeholder="Your password"
                        className="w-full px-5 py-3.5 bg-white border border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/55 transition-all duration-300 rounded-sm mb-6"
                      />
                      {deleteMsg.text && (
                        <p className="font-['Cormorant_Garamond',serif] italic text-base mb-5 text-red-500">
                          ✕ {deleteMsg.text}
                        </p>
                      )}
                      <button type="submit" disabled={deleteLoading}
                        className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-white bg-red-500 px-10 py-3.5 hover:bg-red-600 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 cursor-pointer font-semibold shadow-sm">
                        {deleteLoading ? 'Deleting…' : 'Delete My Account'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className="text-center py-10">
                <span className="text-[#FBEAD6]/20 text-xl tracking-[0.6em]">✦ ✦ ✦</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
