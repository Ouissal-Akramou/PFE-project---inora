'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LaceCorner = ({ flip = false, danger = false }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
    className="pointer-events-none select-none"
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
    <line x1="0"  y1="1"  x2="22" y2="1"  stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.8" strokeOpacity="0.50"/>
    <line x1="1"  y1="0"  x2="1"  y2="22" stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.8" strokeOpacity="0.50"/>
    <rect x="2" y="2" width="4.5" height="4.5" transform="rotate(45 4.25 4.25)" fill="none"
          stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.7" strokeOpacity="0.80"/>
    <circle cx="4.25" cy="4.25" r="0.8" fill={danger ? '#ef4444' : '#C87D87'} fillOpacity="0.45"/>
    <rect x="8"  y="1.5" width="3" height="3" transform="rotate(45 9.5 3)" fill="none"
          stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.5" strokeOpacity="0.30"/>
    <rect x="1.5" y="8" width="3" height="3" transform="rotate(45 3 9.5)" fill="none"
          stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.5" strokeOpacity="0.30"/>
    {[8,12,16,20].map((x,j) => (
      <line key={x} x1={x} y1="1" x2={x} y2={j%2===0?4:3}
            stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.4" strokeOpacity="0.25"/>
    ))}
    {[8,12,16,20].map((y,j) => (
      <line key={y} x1="1" y1={y} x2={j%2===0?4:3} y2={y}
            stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.4" strokeOpacity="0.25"/>
    ))}
  </svg>
);

const Card = ({ children, danger = false }) => (
  <div className={`bg-[#fef6ec] rounded-2xl overflow-hidden border shadow-[0_2px_12px_rgba(58,48,39,0.06)] transition-all hover:shadow-[0_8px_32px_rgba(58,48,39,0.10)] relative ${danger?'border-red-200/60':'border-[#C87D87]/20'}`}>
    <div className={`h-0.5 ${danger?'bg-gradient-to-r from-transparent via-red-400 to-transparent':'bg-gradient-to-r from-transparent via-[#C87D87]/50 to-transparent'}`}/>
    <div className="absolute top-0 left-0"><LaceCorner danger={danger}/></div>
    <div className="absolute top-0 right-0"><LaceCorner flip danger={danger}/></div>
    {children}
  </div>
);

// ── Delete Confirmation Modal ──
const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{background:'rgba(58,48,39,0.55)', backdropFilter:'blur(4px)', animation:'fadeIn .2s ease both'}}>
    <div className="bg-[#fef6ec] rounded-2xl border border-red-200/60 shadow-[0_24px_64px_rgba(58,48,39,0.25)] w-full max-w-md relative overflow-hidden"
      style={{animation:'fadeUp .25s ease both'}}>
      <div className="h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent"/>
      <div className="absolute top-0 left-0"><LaceCorner danger/></div>
      <div className="absolute top-0 right-0"><LaceCorner flip danger/></div>
      <div className="p-8">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>
        <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] text-center mb-2">Are you sure?</h3>
        <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-red-400/70 text-center mb-4">This action cannot be undone</p>
        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#5a4a3a] text-center leading-relaxed mb-8">
          Your account will be <span className="text-red-500 font-semibold">permanently deleted</span>. Your bookings and payment history will be preserved but your account will no longer be accessible.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-[#7a6a5a] bg-[#fdf3e7] border border-[#C87D87]/20 px-6 py-3 rounded-xl hover:bg-[#f5e8d4] transition-all">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-white bg-red-500 px-6 py-3 rounded-xl hover:bg-red-600 transition-all shadow-[0_4px_16px_rgba(239,68,68,0.25)] active:scale-[0.98]">
            Yes, delete my account
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Cancel Booking Modal ──
const CancelBookingModal = ({ booking, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{background:'rgba(58,48,39,0.55)', backdropFilter:'blur(4px)', animation:'fadeIn .2s ease both'}}>
    <div className="bg-[#fef6ec] rounded-2xl border border-[#C87D87]/30 shadow-[0_24px_64px_rgba(58,48,39,0.25)] w-full max-w-md relative overflow-hidden"
      style={{animation:'fadeUp .25s ease both'}}>
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C87D87]/50 to-transparent"/>
      <div className="absolute top-0 left-0"><LaceCorner/></div>
      <div className="absolute top-0 right-0"><LaceCorner flip/></div>
      <div className="p-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] text-center mb-2">Cancel Booking?</h3>
        <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-[#C87D87]/70 text-center mb-4">This cannot be undone</p>
        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#5a4a3a] text-center leading-relaxed mb-2">You are about to cancel:</p>
        <p className="font-['Playfair_Display',serif] italic text-base text-[#3a3027] text-center mb-8">
          {booking?.activity || booking?.activityType || 'this booking'}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-[#7a6a5a] bg-[#fdf3e7] border border-[#C87D87]/20 px-6 py-3 rounded-xl hover:bg-[#f5e8d4] transition-all">
            Keep Booking
          </button>
          <button onClick={onConfirm}
            className="flex-1 font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-white bg-amber-500 px-6 py-3 rounded-xl hover:bg-amber-600 transition-all shadow-[0_4px_16px_rgba(245,158,11,0.25)] active:scale-[0.98]">
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function AccountPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [bookings,        setBookings]        = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError,   setBookingsError]   = useState(null);
  const [bookingFilter,   setBookingFilter]   = useState('all');
  const [cancelTarget,    setCancelTarget]    = useState(null);
  const [cancellingId,    setCancellingId]    = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error('Failed to load profile'); return res.json(); })
      .then(data => {
        setProfile(data);
        setNameForm({ fullName: data.fullName || '' });
        setEmailForm(f => ({ ...f, email: data.email || '' }));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeSection !== 'bookings') return;
    setBookingsLoading(true);
    setBookingsError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/my`, { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error('Failed to load bookings'); return res.json(); })
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(err => setBookingsError(err.message))
      .finally(() => setBookingsLoading(false));
  }, [activeSection]);

  const handleAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setAvatarLoading(true);
    const formData = new FormData(); formData.append('avatar', file);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/avatar`, { method:'PATCH', credentials:'include', body:formData });
      const data = await res.json();
      if (!res.ok) { setAvatarMsg({ type:'error', text:data.message }); return; }
      setProfile(prev => ({ ...prev, avatarUrl:data.avatarUrl }));
      setUser(prev => ({ ...prev, avatarUrl:data.avatarUrl }));
      setAvatarMsg({ type:'success', text:'Photo updated!' });
      setTimeout(() => setAvatarMsg({ type:'', text:'' }), 4000);
    } finally { setAvatarLoading(false); }
  };

  const handleName = async (e) => {
    e.preventDefault(); setNameLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/name`, { method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify(nameForm) });
      const data = await res.json();
      if (!res.ok) { setNameMsg({ type:'error', text:data.message }); return; }
      setProfile(prev => ({ ...prev, fullName:data.fullName }));
      setUser(prev => ({ ...prev, fullName:data.fullName }));
      setNameMsg({ type:'success', text:'Name updated successfully' });
      setTimeout(() => setNameMsg({ type:'', text:'' }), 4000);
    } finally { setNameLoading(false); }
  };

  const handleEmail = async (e) => {
    e.preventDefault(); setEmailLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/email`, { method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify(emailForm) });
      const data = await res.json();
      if (!res.ok) { setEmailMsg({ type:'error', text:data.message }); return; }
      setProfile(prev => ({ ...prev, email:data.email }));
      setUser(prev => ({ ...prev, email:data.email }));
      setEmailMsg({ type:'success', text:'Email updated successfully' });
      setEmailForm(f => ({ ...f, currentPassword:'' }));
      setTimeout(() => setEmailMsg({ type:'', text:'' }), 4000);
    } finally { setEmailLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { setPassMsg({ type:'error', text:'Passwords do not match' }); return; }
    setPassLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/password`, { method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify(passForm) });
      const data = await res.json();
      if (!res.ok) { setPassMsg({ type:'error', text:data.message }); return; }
      setPassMsg({ type:'success', text:'Password updated successfully' });
      setPassForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
      setTimeout(() => setPassMsg({ type:'', text:'' }), 4000);
    } finally { setPassLoading(false); }
  };

  // Step 1: verify password → show modal
  const handleDelete = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: deleteForm.password }),
      });
      const data = await res.json();
      if (!res.ok) { setDeleteMsg({ type:'error', text: data.message || 'Incorrect password' }); return; }
      setShowDeleteModal(true);
    } finally { setDeleteLoading(false); }
  };

  // Step 2: confirmed in modal → actually delete
  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setDeleteLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: deleteForm.password }),
      });
      const data = await res.json();
      if (!res.ok) { setDeleteMsg({ type:'error', text: data.message }); return; }
      setUser(null);
      router.push('/');
    } finally { setDeleteLoading(false); }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (_) {}
    setUser(null);
    router.push('/');
  };

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    setCancellingId(cancelTarget.id);
    setCancelTarget(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/bookings/${cancelTarget.id}/cancel`,
        { method: 'PATCH', credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setBookings(prev => prev.map(b => b.id === cancelTarget.id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  const exportSinglePDF = (booking) => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      const s = getStatus(booking.status);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(58, 48, 39);
      doc.text('Inora', 20, 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(200, 125, 135);
      doc.text('Booking Confirmation', 20, 30);

      doc.setDrawColor(200, 125, 135);
      doc.setLineWidth(0.4);
      doc.line(20, 35, 190, 35);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(58, 48, 39);
      doc.text(booking.activity || booking.activityType || 'Activity', 20, 46);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 100, 90);
      doc.text(`Booking ID: #${String(booking.id).padStart(5,'0')}`, 20, 54);
      doc.text(`Status: ${s.label}`, 20, 61);

      doc.setDrawColor(230, 215, 200);
      doc.setLineWidth(0.2);
      doc.line(20, 66, 190, 66);

      const rows = [
        ['Activity',          booking.activity || booking.activityType || '—'],
        ['Activity Theme',    booking.activityTheme || '—'],
        ['Setting',           booking.setting || '—'],
        ['Date',              booking.date ? new Date(booking.date).toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : '—'],
        ['Time Slot',         booking.timeSlot || '—'],
        ['Guests',            `${booking.participants || 1} person${(booking.participants||1)>1?'s':''}`],
        ['Full Name',         booking.fullName || '—'],
        ['Email',             booking.email || '—'],
        ['Phone',             booking.phone || '—'],
        ['Preferred Contact', booking.preferredContact || '—'],
        ['Payment',           booking.paymentStatus || '—'],
        ...(booking.advancePaid     ? [['Advance Paid',     `${booking.advancePaid} MAD`]] : []),
        ...(booking.allergies       ? [['Allergies',        booking.allergies]]             : []),
        ...(booking.specialRequests ? [['Special Requests', booking.specialRequests]]       : []),
        ...(booking.additionalNotes ? [['Additional Notes', booking.additionalNotes]]       : []),
      ];

      let y = 76;
      rows.forEach(([label, value]) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(150, 120, 100);
        doc.text(label.toUpperCase(), 20, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(58, 48, 39);
        const lines = doc.splitTextToSize(String(value), 125);
        doc.text(lines, 72, y);
        y += lines.length > 1 ? lines.length * 6 + 4 : 10;
      });

      doc.setDrawColor(200, 125, 135);
      doc.setLineWidth(0.3);
      doc.line(20, 270, 190, 270);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(160, 130, 110);
      doc.text(`Booked on ${new Date(booking.createdAt).toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'})}`, 20, 276);
      doc.text(`Generated by Inora · ${new Date().toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'})}`, 190, 276, { align: 'right' });

      doc.save(`inora-booking-${String(booking.id).padStart(5,'0')}.pdf`);
    });
  };

  const displayName = profile?.fullName ?? user?.fullName ?? 'Member';
  const avatarUrl   = profile?.avatarUrl ?? user?.avatarUrl ?? null;

  const IC  = "w-full px-4 py-3 bg-[#fdf3e7] border border-[#C87D87]/20 focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/10 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/45 transition-all rounded-xl";
  const LC  = "font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/60 block mb-2 font-semibold";
  const BTN = "font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-white bg-[#6B7556] px-8 py-3 rounded-xl hover:bg-[#4a5240] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 inline-block cursor-pointer font-semibold shadow-[0_4px_16px_rgba(107,117,86,0.30)] hover:-translate-y-0.5";

  const sideNav = [
    { id:'personal', label:'Personal Details',    sub:'Name & email address',       icon:'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
    { id:'bookings', label:'My Bookings',         sub:'Reservations & status',      icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id:'security', label:'Password & Security', sub:'Change your password',       icon:'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z' },
    { id:'danger',   label:'Delete Account',      sub:'Permanently remove account', icon:'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' },
  ];

  const statusConfig = {
    pending:   { label:'Pending',   bg:'bg-amber-50',    border:'border-amber-200',    text:'text-amber-600', dot:'bg-amber-400' },
    confirmed: { label:'Confirmed', bg:'bg-green-50',    border:'border-green-200',    text:'text-green-600', dot:'bg-green-400' },
    done:      { label:'Completed', bg:'bg-[#6B7556]/8', border:'border-[#6B7556]/30', text:'text-[#6B7556]', dot:'bg-[#6B7556]' },
    cancelled: { label:'Cancelled', bg:'bg-red-50',      border:'border-red-200',      text:'text-red-500',   dot:'bg-red-400'   },
    rejected:  { label:'Rejected',  bg:'bg-red-50',      border:'border-red-200',      text:'text-red-500',   dot:'bg-red-400'   },
  };
  const getStatus = s => statusConfig[s?.toLowerCase()] ?? { label:s??'Unknown', bg:'bg-gray-50', border:'border-gray-200', text:'text-gray-500', dot:'bg-gray-400' };

  const Msg = ({ msg }) => msg.text ? (
    <p className={`font-['Cormorant_Garamond',serif] italic text-sm mb-5 flex items-center gap-2 ${msg.type==='success'?'text-[#6B7556]':'text-[#C87D87]'}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[0.6rem] flex-shrink-0 ${msg.type==='success'?'bg-[#6B7556]':'bg-[#C87D87]'}`}>
        {msg.type==='success'?'✓':'✕'}
      </span>
      {msg.text}
    </p>
  ) : null;

  const sideW  = collapsed ? 'w-[72px]' : 'w-64';
  const mainML = collapsed ? 'ml-[72px]' : 'ml-64';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'linear-gradient(160deg,#6B7556 0%,#5a6347 100%)'}}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#C87D87]/40 border-t-[#C87D87] animate-spin"/>
        <p className="font-['Cormorant_Garamond',serif] italic text-white/60 text-sm tracking-[0.3em]">Loading your profile…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'linear-gradient(160deg,#6B7556 0%,#5a6347 100%)'}}>
      <p className="font-['Cormorant_Garamond',serif] italic text-white/80 text-lg">{error}</p>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .green-sidebar { background: linear-gradient(160deg, #6B7556 0%, #5a6347 60%, #4a5240 100%); }
        .dash-bg {
          background-color: #FBEAD6;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cline x1='0' y1='1' x2='18' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='0' x2='1' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='1' x2='62' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='0' x2='79' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='0' y1='79' x2='18' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='80' x2='1' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='79' x2='62' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='80' x2='79' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Crect x='2' y='2' width='3.5' height='3.5' transform='rotate(45 3.75 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='2' width='3.5' height='3.5' transform='rotate(45 75.25 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='2' y='73.5' width='3.5' height='3.5' transform='rotate(45 3.75 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='73.5' width='3.5' height='3.5' transform='rotate(45 75.25 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Ccircle cx='3.75' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='3.75' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Cline x1='8' y1='1' x2='8' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='12' y1='1' x2='12' y2='3' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='16' y1='1' x2='16' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='64' y1='1' x2='64' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='68' y1='1' x2='68' y2='3' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='72' y1='1' x2='72' y2='4' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='8' x2='4' y2='8' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='12' x2='3' y2='12' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='16' x2='4' y2='16' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='64' x2='4' y2='64' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='68' x2='3' y2='68' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3Cline x1='1' y1='72' x2='4' y2='72' stroke='%23C87D87' stroke-width='0.4' stroke-opacity='0.15'/%3E%3C/svg%3E");
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #fdf3e7 inset;
          -webkit-text-fill-color: #3a3027;
        }
      `}</style>

      {/* ── MODALS ── */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          onConfirm={handleCancelBooking}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      <div className="min-h-screen flex" style={{animation:'fadeIn .4s ease both'}}>

        {/* ── SIDEBAR ── */}
        <aside className={`green-sidebar fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 ${sideW} overflow-hidden flex-shrink-0`}
          style={{boxShadow:'6px 0 32px rgba(107,117,86,0.30)'}}>

          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#C87D87]/50 to-transparent"/>

          <div className={`flex items-center border-b border-white/10 flex-shrink-0 ${collapsed?'justify-center px-0 py-5':'justify-between px-6 py-5'}`}>
            {!collapsed && (
              <Link href="/" className="group/logo">
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.5rem] tracking-[0.4em] uppercase text-white/50">My Account</p>
                <h1 className="font-['Playfair_Display',serif] italic text-2xl text-white leading-tight group-hover/logo:text-[#FBEAD6] transition-colors">Inora</h1>
                <div className="mt-1 w-8 h-px bg-gradient-to-r from-[#C87D87]/50 to-transparent"/>
              </Link>
            )}
            <button onClick={() => setCollapsed(c => !c)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all flex-shrink-0"
              title={collapsed?'Expand':'Collapse'}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {collapsed
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>}
              </svg>
            </button>
          </div>

          {!collapsed ? (
            <div className="px-5 py-4 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center gap-3">
                <label htmlFor="avatar-upload" className="cursor-pointer group/av flex-shrink-0 relative">
                  {avatarUrl ? (
                    <img src={`${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}`} alt="avatar"
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20 transition-opacity group-hover/av:opacity-70"/>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm transition-opacity group-hover/av:opacity-70">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {avatarLoading && <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center"><span className="text-white text-[0.5rem] animate-pulse">···</span></div>}
                </label>
                <input id="avatar-upload" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} disabled={avatarLoading}/>
                <div className="min-w-0">
                  <p className="font-['Cormorant_Garamond',serif] text-sm text-white font-semibold truncate">{displayName}</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-white/50 truncate">{profile?.email}</p>
                </div>
              </div>
              {avatarMsg.text && (
                <p className={`font-['Cormorant_Garamond',serif] italic text-[0.6rem] mt-2 flex items-center gap-1 ${avatarMsg.type==='success'?'text-[#FBEAD6]/80':'text-[#C87D87]/80'}`}>
                  <span className={`w-3 h-3 rounded-full text-white text-[0.45rem] flex items-center justify-center flex-shrink-0 ${avatarMsg.type==='success'?'bg-[#FBEAD6]/60':'bg-[#C87D87]/60'}`}>{avatarMsg.type==='success'?'✓':'✕'}</span>
                  {avatarMsg.text}
                </p>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-3 border-b border-white/8 flex-shrink-0">
              <label htmlFor="avatar-upload-c" className="cursor-pointer" title="Change photo">
                {avatarUrl
                  ? <img src={`${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}`} alt="avatar" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20 hover:opacity-70 transition-opacity"/>
                  : <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm hover:opacity-70 transition-opacity">{displayName.charAt(0).toUpperCase()}</div>
                }
              </label>
              <input id="avatar-upload-c" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} disabled={avatarLoading}/>
            </div>
          )}

          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
            {sideNav.map(item => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                title={collapsed ? item.label : ''}
                className={`w-full flex items-center rounded-xl text-left relative transition-all duration-200 group
                  ${collapsed?'justify-center px-0 py-3':'gap-3 px-3 py-2.5'}
                  ${activeSection===item.id
                    ? item.id==='danger' ? 'bg-red-500/20' : 'bg-white/18'
                    : 'hover:bg-white/10'}`}>
                {activeSection===item.id && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full ${item.id==='danger'?'bg-red-400':'bg-[#C87D87]'}`}/>
                )}
                <svg xmlns="http://www.w3.org/2000/svg"
                  className={`flex-shrink-0 w-5 h-5 transition-colors
                    ${activeSection===item.id
                      ? item.id==='danger' ? 'text-red-300' : 'text-white'
                      : item.id==='danger' ? 'text-red-300/50 group-hover:text-red-300' : 'text-white/50 group-hover:text-white/80'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                </svg>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className={`font-['Cormorant_Garamond',serif] text-[0.72rem] tracking-[0.15em] uppercase transition-colors
                      ${activeSection===item.id
                        ? item.id==='danger' ? 'text-red-200' : 'text-white'
                        : item.id==='danger' ? 'text-red-300/60 group-hover:text-red-200' : 'text-white/55 group-hover:text-white/85'}`}>
                      {item.label}
                    </p>
                    <p className={`font-['Cormorant_Garamond',serif] italic text-[0.6rem] truncate ${item.id==='danger'?'text-red-300/40':'text-white/30'}`}>{item.sub}</p>
                  </div>
                )}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/8 py-3 px-2 flex-shrink-0">
            <button onClick={handleLogout} title="Log out"
              className={`w-full flex items-center rounded-xl text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all group
                ${collapsed?'justify-center px-0 py-3':'gap-3 px-3 py-2.5'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
              </svg>
              {!collapsed && <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.15em] uppercase">Log Out</span>}
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className={`${mainML} flex-1 min-h-screen dash-bg transition-all duration-300`}>

          <header className="sticky top-0 z-30 bg-[#6B7556] backdrop-blur-xl border-b border-[#b5606a]/30 px-6 py-2 flex items-center justify-between relative"
            style={{boxShadow:'0 2px 24px rgba(200,125,135,0.22)'}}>
            <div className="absolute top-0 left-0 pointer-events-none"><LaceCorner/></div>
            <div className="absolute top-0 right-0 pointer-events-none"><LaceCorner flip/></div>
            <div>
              <p className="font-['Cormorant_Garamond',serif] italic text-xs tracking-[0.3em] uppercase text-white/60">
                Inora › {sideNav.find(n=>n.id===activeSection)?.label}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {profile?.role && (
                <span className={`font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase border px-2.5 py-1 rounded-full ${profile.role==='admin'?'bg-white/20 text-white border-white/30':'bg-white/15 text-white border-white/25'}`}>
                  {profile.role}
                </span>
              )}
              <p className="font-['Cormorant_Garamond',serif] italic text-sm text-white/60 hidden md:block">
                {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
              </p>
            </div>
          </header>

          <div className="p-8" style={{animation:'fadeUp .4s ease both'}}>

            {/* ── PERSONAL ── */}
            {activeSection === 'personal' && (
              <div className="space-y-4" style={{animation:'fadeIn .3s ease forwards'}}>
                <Card>
                  <form onSubmit={handleName} className="p-7">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-0.5">Update</p>
                    <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-1">Full Name</h3>
                    <div className="w-6 h-px bg-[#C87D87]/40 mb-5"/>
                    <label className={LC}>Name</label>
                    <input type="text" value={nameForm.fullName} onChange={e=>setNameForm({fullName:e.target.value})} placeholder="Your full name" className={`${IC} mb-5`}/>
                    <Msg msg={nameMsg}/>
                    <button type="submit" disabled={nameLoading} className={BTN}>{nameLoading?'Saving…':'Save Name'}</button>
                  </form>
                </Card>
                <Card>
                  <form onSubmit={handleEmail} className="p-7">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-0.5">Update</p>
                    <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-1">Email Address</h3>
                    <div className="w-6 h-px bg-[#C87D87]/40 mb-5"/>
                    <label className={LC}>New Email</label>
                    <input type="email" value={emailForm.email} onChange={e=>setEmailForm(f=>({...f,email:e.target.value}))} placeholder="your@email.com" className={`${IC} mb-4`}/>
                    <label className={LC}>Current Password</label>
                    <input type="password" value={emailForm.currentPassword} onChange={e=>setEmailForm(f=>({...f,currentPassword:e.target.value}))} placeholder="Confirm with your password" className={`${IC} mb-5`}/>
                    <Msg msg={emailMsg}/>
                    <button type="submit" disabled={emailLoading} className={BTN}>{emailLoading?'Saving…':'Save Email'}</button>
                  </form>
                </Card>
              </div>
            )}

            {/* ── BOOKINGS ── */}
            {activeSection === 'bookings' && (
              <div className="space-y-4" style={{animation:'fadeIn .3s ease forwards'}}>
                {bookingsLoading && (
                  <div className="flex flex-col items-center gap-4 py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-[#C87D87]/20 border-t-[#C87D87] animate-spin"/>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/60 text-sm tracking-widest">Loading your bookings…</p>
                  </div>
                )}
                {bookingsError && (
                  <Card><div className="p-8 text-center"><p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]">{bookingsError}</p></div></Card>
                )}
                {!bookingsLoading && !bookingsError && bookings.length === 0 && (
                  <Card>
                    <div className="p-12 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#C87D87]/8 border border-[#C87D87]/15 flex items-center justify-center mx-auto mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-[#C87D87]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-2">No bookings yet</h3>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a] text-sm mb-6">You haven't made any reservations yet.</p>
                      <Link href="/gatherings" className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.2em] uppercase text-white bg-[#6B7556] px-7 py-2.5 rounded-xl hover:bg-[#4a5240] transition-all inline-block shadow-[0_4px_16px_rgba(107,117,86,0.28)]">
                        Plan a Gathering
                      </Link>
                    </div>
                  </Card>
                )}
                {!bookingsLoading && !bookingsError && bookings.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {['all', ...Object.keys(bookings.reduce((acc,b)=>{ acc[b.status?.toLowerCase()?? 'unknown']=1; return acc; },{}))].map(status => {
                        const s = status === 'all'
                          ? { label:'All', dot:'bg-[#C87D87]', text:'text-[#C87D87]', bg:'bg-[#C87D87]/10', border:'border-[#C87D87]/25' }
                          : getStatus(status);
                        const count = status === 'all' ? bookings.length : bookings.filter(b=>b.status?.toLowerCase()===status).length;
                        return (
                          <button key={status} onClick={() => setBookingFilter(status)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-['Cormorant_Garamond',serif] text-xs font-semibold ${s.bg} ${s.border} ${s.text} ${bookingFilter===status ? 'ring-2 ring-offset-1 ring-[#C87D87]/30 scale-[1.03]' : 'opacity-70 hover:opacity-100'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
                            {count} {s.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-3">
                      {bookings
                        .filter(b => bookingFilter === 'all' || b.status?.toLowerCase() === bookingFilter)
                        .map((booking, i) => {
                          const s = getStatus(booking.status);
                          return (
                            <div key={booking.id}
                              className="bg-[#fef6ec] rounded-2xl overflow-hidden border border-[#e8ddd8] shadow-[0_2px_12px_rgba(58,48,39,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(58,48,39,0.10)] relative"
                              style={{animation:`fadeIn .3s ease ${i*0.06}s both`}}>
                              <div className={`h-0.5 bg-gradient-to-r from-transparent to-transparent ${s.dot.replace('bg-','via-')}`}/>
                              <div className="absolute top-0 left-0"><LaceCorner/></div>
                              <div className="absolute top-0 right-0"><LaceCorner flip/></div>
                              <div className="p-6">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl border ${s.border} ${s.bg} flex items-center justify-center flex-shrink-0`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${s.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                      </svg>
                                    </div>
                                    <div>
                                      <h3 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027]">{booking.activity||booking.activityType||'Activity'}</h3>
                                      <p className="font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a]/50 tracking-widest mt-0.5">#{String(booking.id).padStart(5,'0')}</p>
                                    </div>
                                  </div>
                                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold tracking-[0.15em] uppercase font-['Cormorant_Garamond',serif] flex-shrink-0 ${s.bg} ${s.border} ${s.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {[
                                    { label:'Date',    value: booking.date?new Date(booking.date).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'}):'—' },
                                    { label:'Time',    value: booking.timeSlot||'—' },
                                    { label:'Guests',  value: `${booking.participants||1} person${(booking.participants||1)>1?'s':''}` },
                                    { label:'Contact', value: booking.preferredContact||'—' },
                                  ].map(({label,value})=>(
                                    <div key={label} className="bg-[#fdf3e7] rounded-xl px-3 py-2.5 border border-[#C87D87]/8">
                                      <p className="font-['Cormorant_Garamond',serif] text-[0.65rem] tracking-[0.18em] uppercase text-[#7a6a5a]/50 mb-0.5">{label}</p>
                                      <p className="font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] font-semibold">{value}</p>
                                    </div>
                                  ))}
                                </div>

                                {(booking.specialRequests||booking.allergies)&&(
                                  <div className="mt-3 px-4 py-3 bg-[#fdf3e7] rounded-xl border border-[#C87D87]/8">
                                    {booking.specialRequests&&<p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]"><span className="not-italic font-semibold text-[0.6rem] tracking-widest uppercase text-[#7a6a5a]">Requests: </span>{booking.specialRequests}</p>}
                                    {booking.allergies&&<p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] mt-1"><span className="not-italic font-semibold text-[0.6rem] tracking-widest uppercase text-[#7a6a5a]">Allergies: </span>{booking.allergies}</p>}
                                  </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-[#C87D87]/8 flex items-center justify-between">
                                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/50">
                                    Booked on {new Date(booking.createdAt).toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'})}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    {/* PDF */}
                                    <button onClick={() => exportSinglePDF(booking)}
                                      className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.15em] uppercase text-[#C87D87] border border-[#C87D87]/25 bg-[#C87D87]/8 px-3 py-1.5 rounded-lg hover:bg-[#C87D87]/15 transition-all">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                                      </svg>
                                      PDF
                                    </button>

                                    {/* Cancel button — only for pending or confirmed+unpaid */}
                                    {(booking.status?.toLowerCase() === 'pending' ||
                                      (booking.status?.toLowerCase() === 'confirmed' && booking.paymentStatus !== 'PAID')) && (
                                      <button
                                        onClick={() => setCancelTarget(booking)}
                                        disabled={cancellingId === booking.id}
                                        className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.15em] uppercase text-amber-600 border border-amber-200 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-all disabled:opacity-40">
                                        {cancellingId === booking.id ? (
                                          <span className="w-3 h-3 rounded-full border border-amber-400 border-t-transparent animate-spin"/>
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                          </svg>
                                        )}
                                        {cancellingId === booking.id ? 'Cancelling…' : 'Cancel'}
                                      </button>
                                    )}

                                    {/* Pending notice */}
                                    {booking.status?.toLowerCase()==='pending'&&(
                                      <p className="font-['Cormorant_Garamond',serif] italic text-sm text-amber-500 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"/>
                                        Awaiting confirmation
                                      </p>
                                    )}

                                    {/* Payment */}
                                    {booking.status?.toLowerCase()==='confirmed'&&(
                                      booking.paymentStatus==='PAID' ? (
                                        <div className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.18em] uppercase text-[#6B7556] bg-[#6B7556]/10 border border-[#6B7556]/25 px-3 py-1.5 rounded-lg">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                          Avance réglée · {booking.advancePaid} MAD
                                        </div>
                                      ) : (
                                        <Link href={`/checkout?bookingId=${booking.id}`}
                                          className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.18em] uppercase text-white bg-[#6B7556] px-3 py-1.5 rounded-lg hover:bg-[#4a5240] transition-all shadow-[0_3px_10px_rgba(107,117,86,0.28)]">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
                                          Procéder au paiement
                                        </Link>
                                      )
                                    )}
                                  </div>
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

            {/* ── SECURITY ── */}
            {activeSection === 'security' && (
              <div style={{animation:'fadeIn .3s ease forwards'}}>
                <Card>
                  <form onSubmit={handlePassword} className="p-7">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-0.5">Update</p>
                    <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-1">Change Password</h3>
                    <div className="w-6 h-px bg-[#C87D87]/40 mb-5"/>
                    <div className="space-y-4 mb-5">
                      {[
                        {lbl:'Current Password',key:'currentPassword',ph:'Your current password'},
                        {lbl:'New Password',     key:'newPassword',    ph:'At least 6 characters'},
                        {lbl:'Confirm Password', key:'confirmPassword',ph:'Repeat new password'},
                      ].map(({lbl,key,ph})=>(
                        <div key={key}>
                          <label className={LC}>{lbl}</label>
                          <input type="password" value={passForm[key]} onChange={e=>setPassForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} className={IC}/>
                        </div>
                      ))}
                    </div>
                    <Msg msg={passMsg}/>
                    <button type="submit" disabled={passLoading} className={BTN}>{passLoading?'Updating…':'Update Password'}</button>
                  </form>
                </Card>
              </div>
            )}

            {/* ── DANGER ── */}
            {activeSection === 'danger' && (
              <div className="space-y-4" style={{animation:'fadeIn .3s ease forwards'}}>
                <Card danger>
                  <div className="p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/70 text-[0.58rem] tracking-[0.2em] uppercase mb-1.5">Please read carefully</p>
                      <p className="font-['Cormorant_Garamond',serif] text-sm text-[#5a4a3a] leading-relaxed">
                        Deleting your account is <span className="text-red-500 font-semibold">permanent and irreversible</span>. You will be logged out immediately. Your bookings and payment history will be preserved but your account will no longer be accessible.
                      </p>
                    </div>
                  </div>
                </Card>
                <Card danger>
                  <form onSubmit={handleDelete} className="p-7">
                    <h3 className="font-['Playfair_Display',serif] italic text-xl text-red-500 mb-1">Confirm Deletion</h3>
                    <div className="w-6 h-px bg-red-300 mb-5"/>
                    <label className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/60 block mb-2 font-semibold">Enter your password to continue</label>
                    <input type="password" value={deleteForm.password} onChange={e=>setDeleteForm({password:e.target.value})} placeholder="Your password"
                      className="w-full px-4 py-3 bg-[#fdf3e7] border border-red-200/60 focus:border-red-400 focus:ring-2 focus:ring-red-100 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/45 transition-all rounded-xl mb-5"/>
                    {deleteMsg.text&&(
                      <p className="font-['Cormorant_Garamond',serif] italic text-sm mb-5 text-red-500 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[0.6rem]">✕</span>
                        {deleteMsg.text}
                      </p>
                    )}
                    <button type="submit" disabled={deleteLoading||!deleteForm.password}
                      className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-white bg-red-500 px-8 py-3 rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer font-semibold shadow-[0_4px_16px_rgba(239,68,68,0.25)] hover:-translate-y-0.5">
                      {deleteLoading?'Verifying…':'Delete My Account'}
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
