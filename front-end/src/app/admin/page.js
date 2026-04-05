
'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { DEFAULT_REVIEWS } from '@/lib/defaultReviews';
import jsPDF from 'jspdf';

const API = process.env.NEXT_PUBLIC_API_URL;

const resolveAvatar = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API}${url}`;
};

const ACTIVITY_IMGS = {
  'Crochet Circle':   'https://images.unsplash.com/photo-1612278675615-7b093b07772d',
  'Painting Session': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
  'Pottery Workshop': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261',
};
const TIME_SLOTS = [
  { id:'morning',   label:'Morning',   hours:'09:30 – 12:30', icon:'◎', sub:'Soft light & fresh starts' },
  { id:'afternoon', label:'Afternoon', hours:'14:30 – 17:30', icon:'◈', sub:'Golden hour creativity'    },
  { id:'evening',   label:'Evening',   hours:'19:30 – 22:30', icon:'◇', sub:'Candlelit & intimate'      },
];
const SETTINGS_MAP = {
  garden:  { label:'Sunlit Garden',    icon:'❧' },
  indoor:  { label:'Cosy Indoor',      icon:'⌂' },
  terrace: { label:'Open-Air Terrace', icon:'◻' },
};

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

const Panel = ({ children, className = '' }) => (
  <div className={`bg-[#fef6ec] rounded-2xl overflow-hidden border border-[#C87D87]/20 shadow-[0_2px_12px_rgba(58,48,39,0.06)] relative ${className}`}>
    <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C87D87]/50 to-transparent"/>
    <div className="absolute top-0 left-0"><LaceCorner/></div>
    <div className="absolute top-0 right-0"><LaceCorner flip/></div>
    {children}
  </div>
);

const DeletedBadge = () => (
  <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-400 font-['Cormorant_Garamond',serif] text-[0.52rem] tracking-widest uppercase flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
    </svg>
    Deleted
  </span>
);

const Field = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-4 border-b border-[#C87D87]/10 last:border-0">
    <span className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#7a6a5a]/50 sm:w-24 flex-shrink-0 sm:pt-2">{label}</span>
    <div className="flex-1">{children}</div>
  </div>
);

const Inp = ({ ...props }) => (
  <input {...props}
    className="w-full bg-[#fdf3e7] border border-[#C87D87]/22 rounded-xl px-4 py-2.5 font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] outline-none focus:border-[#C87D87]/55 focus:bg-[#fef6ec] focus:shadow-[0_0_0_3px_rgba(200,125,135,0.08)] transition-all placeholder:text-[#7a6a5a]/30"/>
);

const Msg = ({ msg }) => !msg?.text ? null : (
  <p className={`font-['Cormorant_Garamond',serif] italic text-xs mt-2 ${msg.type==='success'?'text-[#6B7556]':'text-red-400'}`}>{msg.text}</p>
);

// ── PDF Export ────────────────────────────────────────
const exportBookingPDF = (b) => {
  const doc  = new jsPDF();
  const line = (label, value, y) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(label, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value ?? '—'), 70, y);
  };

  doc.setFillColor(107, 117, 86);
  doc.rect(0, 0, 210, 22, 'F');
  doc.setTextColor(251, 234, 214);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Inora — Booking Details', 14, 14);

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exported on ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`, 14, 28);

  doc.setDrawColor(200, 125, 135);
  doc.setLineWidth(0.4);
  doc.line(14, 31, 196, 31);

  let y = 40;
  const fields = [
    ['Booking ID',        `#${b.id}`],
    ['Client Name',       b.fullName || b.user?.fullName],
    ['Email',             b.email],
    ['Phone',             b.phone],
    ['Activity',          b.activity],
    ['Theme',             b.activityTheme],
    ['Date',              b.date ? new Date(b.date).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : null],
    ['Time Slot',         b.timeSlot],
    ['Guests',            b.participants],
    ['Setting',           b.setting],
    ['Location', b.location],
    ['Preferred Contact', b.preferredContact],
    ['Allergies',         b.allergies],
    ['Special Requests',  b.specialRequests],
    ['Additional Notes',  b.additionalNotes],
    ['Booking Status',    b.status?.toUpperCase()],
    ['Payment Status',    b.paymentStatus],
    ['Advance Paid',      b.advancePaid ? `${b.advancePaid} MAD` : null],
    ['Paid At',           b.paidAt ? new Date(b.paidAt).toLocaleDateString('en-GB') : null],
    ['Submitted At',      new Date(b.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})],
  ];

  fields.forEach(([label, value]) => {
    if (y > 270) { doc.addPage(); y = 20; }
    line(label, value ?? '—', y);
    y += 8;
  });

  doc.setDrawColor(200, 125, 135);
  doc.line(14, 282, 196, 282);
  doc.setFontSize(7);
  doc.setTextColor(150, 130, 110);
  doc.text('Inora · Confidential booking record', 14, 288);

  doc.save(`booking-${b.id}-${(b.fullName || 'client').replace(/\s+/g,'_')}.pdf`);
};


// ── Loading Screen (matches booking page) ────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg, #C87D87 0%, #b36d77 45%, #a55e6a 80%, #9a5060 100%)' }}>
      <style>{`
        @keyframes lacePulse { 0%,100%{opacity:.45} 50%{opacity:1} }
        @keyframes laceRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes laceCounter { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes floatOrb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      `}</style>
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(251,234,214,0.10) 0%,transparent 70%)', animation: 'floatOrb 10s ease-in-out infinite', filter: 'blur(18px)' }} />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(58,48,39,0.15) 0%,transparent 70%)', animation: 'floatOrb 13s ease-in-out infinite 2s', filter: 'blur(22px)' }} />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96"
            style={{ animation: 'laceRotate 8s linear infinite' }}>
            <circle cx="48" cy="48" r="44" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.35" strokeDasharray="3 5"/>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => {
              const rad = a * Math.PI / 180;
              return (
                <g key={i}>
                  <line
                    x1={48+Math.cos(rad)*20} y1={48+Math.sin(rad)*20}
                    x2={48+Math.cos(rad)*44} y2={48+Math.sin(rad)*44}
                    stroke="#FBEAD6" strokeWidth="0.5" strokeOpacity="0.28"/>
                  <circle
                    cx={48+Math.cos(rad)*44} cy={48+Math.sin(rad)*44}
                    r="1.2" fill="#FBEAD6" fillOpacity="0.45"/>
                </g>
              );
            })}
          </svg>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96"
            style={{ animation: 'laceCounter 6s linear infinite' }}>
            <circle cx="48" cy="48" r="30" fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.38"/>
            {[0,45,90,135,180,225,270,315].map((a,i) => {
              const rad = a * Math.PI / 180;
              return (
                <g key={i}>
                  <circle
                    cx={48+Math.cos(rad)*30} cy={48+Math.sin(rad)*30}
                    r="2" fill="none" stroke="#FBEAD6" strokeWidth="0.5" strokeOpacity="0.50"/>
                  <line
                    x1={48+Math.cos(rad)*30} y1={48+Math.sin(rad)*30}
                    x2={48+Math.cos(rad)*20} y2={48+Math.sin(rad)*20}
                    stroke="#FBEAD6" strokeWidth="0.4" strokeOpacity="0.28"/>
                </g>
              );
            })}
          </svg>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96"
            style={{ animation: 'lacePulse 2s ease-in-out infinite' }}>
            <circle cx="48" cy="48" r="14" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.42"/>
            <rect x="43" y="43" width="10" height="10" transform="rotate(45 48 48)"
              fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.62"/>
            <circle cx="48" cy="48" r="2.5" fill="#FBEAD6" fillOpacity="0.52"/>
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-['Playfair_Display',serif] italic text-[#FBEAD6]/75 text-xl">Inora</p>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/40 text-[0.7rem] tracking-[0.4em] uppercase">
            Loading admin panel
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();

  const [activeTab,          setActiveTab]          = useState('overview');
  const [pageReady,          setPageReady]          = useState(null);
  const [collapsed,          setCollapsed]          = useState(false);
  const [isMobileMenuOpen,   setIsMobileMenuOpen]   = useState(false);
  const [approvedReviews,    setApprovedReviews]    = useState([]);
  const [pendingReviews,     setPendingReviews]     = useState([]);
  const [users,              setUsers]              = useState([]);
  const [usersLoading,       setUsersLoading]       = useState(false);
  const [userSearch,         setUserSearch]         = useState('');
  const [selectedUser,       setSelectedUser]       = useState(null);
  const [bookings,           setBookings]           = useState([]);
  const [bookingsLoading,    setBookingsLoading]    = useState(true);
  const [allBookings,        setAllBookings]        = useState([]);
  const [allBookingsLoading, setAllBookingsLoading] = useState(true);
  const [payments,           setPayments]           = useState([]);
  const [paymentsLoading,    setPaymentsLoading]    = useState(false);
  const [selectedBooking,    setSelectedBooking]    = useState(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const allPublished    = [...DEFAULT_REVIEWS, ...approvedReviews];
  const visibleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;
  const carouselMax  = Math.max(0, allPublished.length - visibleCount);
  const visibleReviews = allPublished.slice(carouselIdx, carouselIdx + visibleCount);
  const carouselNext = () => setCarouselIdx(i => Math.min(i + visibleCount, carouselMax));
  const carouselPrev = () => setCarouselIdx(i => Math.max(i - visibleCount, 0));
  // ── Profile state ──
  const avatarRef    = useRef(null);
  const [profile,    setProfile]    = useState(null);
  const [avatarMsg,  setAvatarMsg]  = useState({ type:'', text:'' });
  const [avatarLoad, setAvatarLoad] = useState(false);
  const [nameForm,   setNameForm]   = useState({ fullName:'' });
  const [nameMsg,    setNameMsg]    = useState({ type:'', text:'' });
  const [nameLoad,   setNameLoad]   = useState(false);
  const [emailForm,  setEmailForm]  = useState({ email:'', currentPassword:'' });
  const [emailMsg,   setEmailMsg]   = useState({ type:'', text:'' });
  const [emailLoad,  setEmailLoad]  = useState(false);
  const [passForm,   setPassForm]   = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [passMsg,    setPassMsg]    = useState({ type:'', text:'' });
  const [passLoad,   setPassLoad]   = useState(false);
  const [deleteForm, setDeleteForm] = useState({ password:'', adminCode:'' });
  const [deleteMsg,  setDeleteMsg]  = useState({ type:'', text:'' });
  const [deleteLoad, setDeleteLoad] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  // Close mobile menu when window resizes above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayName  = profile?.fullName ?? user?.fullName ?? user?.name ?? 'Admin';
  const displayEmail = profile?.email    ?? user?.email ?? '';
  const avatarUrl    = resolveAvatar(profile?.avatarUrl ?? user?.avatarUrl ?? null);

  useEffect(() => {
    fetchAll();
    fetchProfile();
    setTimeout(() => setPageReady(true), 100);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/api/auth/me`, { credentials:'include' });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setNameForm({ fullName: data.user.fullName || '' });
        setEmailForm(f => ({ ...f, email: data.user.email || '' }));
      }
    } catch {}
  };

  const fetchAll = () => {
    fetchReviews();
    fetchUsers();
    fetchBookings();
    fetchAllBookings();
    fetchPayments();
  };

  const fetchReviews = async () => {
    try {
      const [aRes, pRes] = await Promise.all([
        fetch(`${API}/api/reviews/approved`, { credentials:'include' }),
        fetch(`${API}/api/reviews/pending`,  { credentials:'include' }),
      ]);
      const aData = await aRes.json(); const pData = await pRes.json();
      setApprovedReviews(Array.isArray(aData) ? aData : []);
      setPendingReviews(Array.isArray(pData)  ? pData : []);
    } catch { setApprovedReviews([]); setPendingReviews([]); }
  };

  const fetchUsers = async () => {
  setUsersLoading(true);
  try {
    console.log('Fetching users from bookings as fallback...');
    
    // Get all bookings to extract users
    const bookingsRes = await fetch(`${API}/api/bookings/all`, { credentials: 'include' });
    
    if (bookingsRes.ok) {
      const bookings = await bookingsRes.json();
      const uniqueUsers = new Map();
      
      bookings.forEach(booking => {
        // Extract from booking.user object
        if (booking.user && booking.user.id && !uniqueUsers.has(booking.user.id)) {
          uniqueUsers.set(booking.user.id, {
            id: booking.user.id,
            fullName: booking.user.fullName || 'Unknown',
            email: booking.user.email,
            role: booking.user.role || 'user',
            avatarUrl: booking.user.avatarUrl || null,
            createdAt: booking.user.createdAt || booking.createdAt || new Date().toISOString(),
            isDeleted: booking.user.isDeleted || false,
            suspended: booking.user.suspended || false,
            bookingsCount: 1
          });
        } 
        // Also extract from booking direct fields (for guest bookings without user account)
        else if (booking.email && !uniqueUsers.has(booking.email)) {
          uniqueUsers.set(booking.email, {
            id: booking.email,
            fullName: booking.fullName || 'Guest',
            email: booking.email,
            role: 'user',
            avatarUrl: null,
            createdAt: booking.createdAt || new Date().toISOString(),
            isDeleted: false,
            suspended: false,
            bookingsCount: 1
          });
        } else if (booking.email && uniqueUsers.has(booking.email)) {
          // Increment booking count for existing user
          const existing = uniqueUsers.get(booking.email);
          existing.bookingsCount = (existing.bookingsCount || 0) + 1;
          uniqueUsers.set(booking.email, existing);
        }
      });
      
      const usersList = Array.from(uniqueUsers.values());
      console.log(`Extracted ${usersList.length} unique users from ${bookings.length} bookings`);
      setUsers(usersList);
    } else {
      console.error('Failed to fetch bookings');
      setUsers([]);
    }
  } catch (err) {
    console.error('Error in fetchUsers fallback:', err);
    setUsers([]);
  } finally { 
    setUsersLoading(false); 
  }
};
  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch(`${API}/api/bookings`, { credentials:'include' });
      const d   = await res.json();
      setBookings(Array.isArray(d) ? d : []);
    } catch { setBookings([]); } finally { setBookingsLoading(false); }
  };

  const fetchAllBookings = async () => {
    setAllBookingsLoading(true);
    try {
      const res = await fetch(`${API}/api/bookings/all`, { credentials:'include' });
      const d   = await res.json();
      setAllBookings(Array.isArray(d) ? d : []);
    } catch { setAllBookings([]); } finally { setAllBookingsLoading(false); }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch(`${API}/api/bookings/paid`, { credentials:'include' });
      const d   = await res.json();
      setPayments(Array.isArray(d) ? d : []);
    } catch { setPayments([]); } finally { setPaymentsLoading(false); }
  };

  const approveReview = async (id) => {
    await fetch(`${API}/api/reviews/${id}/approve`, { method:'PATCH', credentials:'include' });
    fetchReviews();
  };
  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    await fetch(`${API}/api/reviews/${id}`, { method:'DELETE', credentials:'include' });
    fetchReviews();
  };
  const toggleSuspend = async (id, suspended) => {
  try {
    const res = await fetch(`${API}/api/auth/admin/users/${id}/suspend`, {
      method:'PATCH', 
      credentials:'include',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ suspended: !suspended }),
    });
    
    if (res.ok) {
      fetchUsers(); // Refresh the users list
    } else {
      console.error('Failed to toggle suspend status');
      // Optionally show an error message to the user
    }
  } catch (err) {
    console.error('Error toggling suspend:', err);
  }
};
  const updateBookingStatus = async (id, status) => {
    await fetch(`${API}/api/bookings/${id}/status`, {
      method:'PATCH', credentials:'include',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchBookings();
    fetchAllBookings();
    if (selectedBooking?.id === id) setSelectedBooking(b => ({ ...b, status }));
  };
 // Show confirmation modal instead of direct delete
const confirmDeleteBooking = (booking) => {
  setShowDeleteConfirm(booking);
};

// Actual delete function
const deleteBooking = async (id) => {
  try {
    const res = await fetch(`${API}/api/bookings/${id}`, { 
      method: 'DELETE', 
      credentials: 'include' 
    });
    
    if (res.ok) {
      fetchBookings();
      fetchAllBookings();
      fetchPayments();
      if (selectedBooking?.id === id) setSelectedBooking(null);
      setShowDeleteConfirm(null); // Close modal after successful delete
    }
  } catch (err) {
    console.error('Error deleting booking:', err);
  }
};
  // ── Profile handlers ──
  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoad(true); setAvatarMsg({ type:'', text:'' });
    const fd = new FormData(); fd.append('avatar', file);
    try {
      const res = await fetch(`${API}/api/auth/avatar`, {
        method:'POST', credentials:'include', body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setAvatarMsg({ type:'success', text:'Avatar updated.' });
        const freshUrl = `${resolveAvatar(data.avatarUrl)}?t=${Date.now()}`;
        setProfile(p => ({ ...p, avatarUrl: freshUrl }));
        if (setUser) setUser(u => ({ ...u, avatarUrl: freshUrl }));
      } else setAvatarMsg({ type:'error', text: data.message || 'Upload failed.' });
    } catch { setAvatarMsg({ type:'error', text:'Something went wrong.' }); }
    finally { setAvatarLoad(false); }
  };

  const handleName = async (e) => {
    e.preventDefault(); setNameLoad(true); setNameMsg({ type:'', text:'' });
    try {
      const res = await fetch(`${API}/api/auth/update-name`, {
        method:'PATCH', credentials:'include',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ fullName: nameForm.fullName }),
      });
      const data = await res.json();
      if (res.ok) {
        setNameMsg({ type:'success', text:'Name updated.' });
        setProfile(p => ({ ...p, fullName: nameForm.fullName }));
        if (setUser) setUser(u => ({ ...u, fullName: nameForm.fullName }));
      } else setNameMsg({ type:'error', text: data.message || 'Failed.' });
    } catch { setNameMsg({ type:'error', text:'Something went wrong.' }); }
    finally { setNameLoad(false); }
  };

  const handleEmail = async (e) => {
    e.preventDefault(); setEmailLoad(true); setEmailMsg({ type:'', text:'' });
    try {
      const res = await fetch(`${API}/api/auth/update-email`, {
        method:'PATCH', credentials:'include',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(emailForm),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailMsg({ type:'success', text:'Email updated.' });
        setProfile(p => ({ ...p, email: emailForm.email }));
        if (setUser) setUser(u => ({ ...u, email: emailForm.email }));
        setEmailForm(f => ({ ...f, currentPassword:'' }));
      } else setEmailMsg({ type:'error', text: data.message || 'Failed.' });
    } catch { setEmailMsg({ type:'error', text:'Something went wrong.' }); }
    finally { setEmailLoad(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword)
      return setPassMsg({ type:'error', text:'Passwords do not match.' });
    setPassLoad(true); setPassMsg({ type:'', text:'' });
    try {
      const res = await fetch(`${API}/api/auth/update-password`, {
        method:'PATCH', credentials:'include',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg({ type:'success', text:'Password updated.' });
        setPassForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
      } else setPassMsg({ type:'error', text: data.message || 'Failed.' });
    } catch { setPassMsg({ type:'error', text:'Something went wrong.' }); }
    finally { setPassLoad(false); }
  };

  const handleDelete = async (e) => {
    e.preventDefault(); setDeleteLoad(true); setDeleteMsg({ type:'', text:'' });
    try {
      const res = await fetch(`${API}/api/auth/delete-account`, {
        method:'DELETE', credentials:'include',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(deleteForm),
      });
      const data = await res.json();
      if (res.ok) { await logout(); router.push('/'); }
      else setDeleteMsg({ type:'error', text: data.message || 'Failed.' });
    } catch { setDeleteMsg({ type:'error', text:'Something went wrong.' }); }
    finally { setDeleteLoad(false); }
  };

  const statusCfg = {
    pending:   { label:'Pending',   dot:'bg-amber-400', text:'text-amber-600', bg:'bg-amber-50',     border:'border-amber-200'    },
    confirmed: { label:'Confirmed', dot:'bg-[#6B7556]', text:'text-[#4a5240]', bg:'bg-[#6B7556]/10', border:'border-[#6B7556]/30' },
    completed: { label:'Completed', dot:'bg-[#6B7556]', text:'text-[#4a5240]', bg:'bg-[#6B7556]/10', border:'border-[#6B7556]/30' },
    cancelled: { label:'Cancelled', dot:'bg-red-400',   text:'text-red-500',   bg:'bg-red-50',       border:'border-red-200'      },
  };
  const getStatus        = s => statusCfg[s?.toLowerCase()] ?? { label: s ?? '—', dot:'bg-[#C87D87]', text:'text-[#C87D87]', bg:'bg-[#C87D87]/8', border:'border-[#C87D87]/20' };
  const settingFromBooking = b => SETTINGS_MAP[b?.setting] ?? null;

  const userBookings  = u => allBookings.filter(b => b.email?.toLowerCase() === u.email?.toLowerCase());
  const userPayments  = u => payments.filter(p => p.email?.toLowerCase() === u.email?.toLowerCase());
  const userReviews   = u => [...approvedReviews, ...pendingReviews].filter(r => r.user?.id === u.id);
  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const navItems = [
    { id:'overview', label:'Overview',    icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id:'bookings', label:'Bookings',    icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      badge: bookings.filter(b=>b.status==='pending').length },
    { id:'members',  label:'Members',     icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id:'payments', label:'Payments',    icon:'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { id:'reviews',  label:'Reviews',     icon:'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      badge: pendingReviews.length },
    { id:'profile',  label:'My Profile',  icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  const sideW  = collapsed ? 'w-[72px]' : 'w-64';
  const mainML = collapsed ? 'ml-[72px]' : 'ml-64';

  if (!pageReady) return <LoadingScreen />;

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes slideInMobile { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes fadeInScale { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .pink-sidebar { background: linear-gradient(160deg,#C87D87 0%,#b56b76 55%,#a55e6a 100%); }
        .nav-item { transition:background .18s; border-radius:12px; }
        .nav-item:hover { background:rgba(255,255,255,0.10); }
        .nav-item-active { background:rgba(255,255,255,0.18); }
        .dash-bg {
          background-color: #FBEAD6;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cline x1='0' y1='1' x2='18' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='0' x2='1' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='1' x2='62' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='0' x2='79' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='0' y1='79' x2='18' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='80' x2='1' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='79' x2='62' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='80' x2='79' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Crect x='2' y='2' width='3.5' height='3.5' transform='rotate(45 3.75 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='2' width='3.5' height='3.5' transform='rotate(45 75.25 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='2' y='73.5' width='3.5' height='3.5' transform='rotate(45 3.75 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='73.5' width='3.5' height='3.5' transform='rotate(45 75.25 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Ccircle cx='3.75' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='3.75' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3C/svg%3E");
        }
        .admin-topbar {
          background: linear-gradient(160deg,#C87D87 0%,#b56b76 100%);
          border-bottom: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 2px 24px rgba(200,125,135,0.28);
        }
        .stat-card { background:#fef6ec; border:1px solid rgba(200,125,135,0.20); border-radius:18px; padding:20px; transition:all .22s; position:relative; overflow:hidden; }
        .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(200,125,135,0.5),transparent); }
        .stat-card:hover { border-color:rgba(200,125,135,0.40); transform:translateY(-2px); box-shadow:0 8px 32px rgba(58,48,39,0.10); }
        .trow { transition:background .15s; }
        .trow:hover { background:rgba(200,125,135,0.05); cursor:pointer; }
        .search-input { background:#fdf3e7; border:1.5px solid rgba(200,125,135,0.25); border-radius:12px; padding:10px 14px; font-family:'Cormorant Garamond',serif; font-size:.9rem; color:#3a3027; outline:none; width:100%; transition:all .18s; }
        .search-input:focus { border-color:rgba(200,125,135,0.55); background:#fef6ec; box-shadow:0 0 0 3px rgba(200,125,135,0.08); }
        .rev-card { background:#fef6ec; border:1px solid rgba(200,125,135,0.18); border-radius:16px; padding:20px; transition:transform .2s, box-shadow .2s; position:relative; overflow:hidden; }
        .rev-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(200,125,135,0.4),transparent); }
        .rev-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(58,48,39,0.08); }
        .bmodal-bg { background:rgba(58,48,39,0.55); backdrop-filter:blur(8px); }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#FBEAD6; }
        ::-webkit-scrollbar-thumb { background:rgba(200,125,135,0.30); border-radius:8px; }
        @media (max-width: 768px) {
          .stat-card { padding: 14px; }
          .rev-card { padding: 14px; }
        }
      `}</style>

      <div className="min-h-screen flex font-['Cormorant_Garamond',serif]">

        {/* ═══════════ SIDEBAR — DESKTOP (hidden on mobile if menu closed) ═══════════ */}
        <aside className={`pink-sidebar fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300
          ${collapsed ? 'w-[72px]' : 'w-64'}
          ${!isMobileMenuOpen ? 'hidden md:flex' : 'flex w-64'}
          `}
          style={{ boxShadow:'6px 0 32px rgba(200,125,135,0.30)' }}>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent"/>

          <div className={`flex items-center border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center px-0 py-5' : 'justify-between px-6 py-5'}`}>
  {!collapsed && (
    <button onClick={() => router.push('/')} className="text-left group">
      <p className="font-['Cormorant_Garamond',serif] italic text-[0.5rem] tracking-[0.4em] uppercase text-white/50">Admin Panel</p>
      <h1 className="font-['Playfair_Display',serif] italic text-2xl text-white leading-tight group-hover:text-white/80 transition-colors">Inora</h1>
      <div className="mt-1 w-8 h-px bg-gradient-to-r from-white/30 to-transparent"/>
    </button>
  )}
  {/* Remove the collapsed logo - just keep the collapse button */}
  <button onClick={() => setCollapsed(c=>!c)}
    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {collapsed ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/> : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>}
    </svg>
  </button>
</div>

          {!collapsed ? (
            <div className="px-5 py-4 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border-2 border-white/30 flex-shrink-0 overflow-hidden bg-white/20">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">{displayName.charAt(0).toUpperCase()}</div>
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-['Cormorant_Garamond',serif] text-sm text-white font-semibold truncate">{displayName}</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-white/50 truncate">{displayEmail}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-3 border-b border-white/8 flex-shrink-0">
              <div className="w-9 h-9 rounded-full border-2 border-white/30 overflow-hidden bg-white/20">
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">{displayName.charAt(0).toUpperCase()}</div>
                }
              </div>
            </div>
          )}

          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                title={collapsed ? item.label : ''}
                className={`nav-item w-full flex items-center text-left relative group
                  ${collapsed?'justify-center px-0 py-3':'gap-3 px-3 py-2.5'}
                  ${activeTab===item.id?'nav-item-active':''}`}>
                {activeTab===item.id && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r-full"/>}
                <svg xmlns="http://www.w3.org/2000/svg"
                  className={`flex-shrink-0 w-5 h-5 transition-colors ${activeTab===item.id?'text-white':'text-white/50 group-hover:text-white/80'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                </svg>
                {!collapsed && (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className={`font-['Cormorant_Garamond',serif] text-[0.72rem] tracking-[0.15em] uppercase transition-colors ${activeTab===item.id?'text-white':'text-white/55 group-hover:text-white/85'}`}>
                        {item.label}
                      </p>
                    </div>
                    {item.badge > 0 && (
                      <span className="bg-white text-[#C87D87] text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center leading-none">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full"/>}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/8 py-3 px-2 space-y-0.5 flex-shrink-0">
            <button onClick={fetchAll} title="Refresh"
              className={`nav-item w-full flex items-center text-white/40 hover:text-white/70 ${collapsed?'justify-center px-0 py-3':'gap-3 px-3 py-2.5'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {!collapsed && <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.15em] uppercase">Refresh</span>}
            </button>
            <button onClick={async () => { await logout(); router.push('/'); }} title="Sign Out"
              className={`nav-item w-full flex items-center text-white/40 hover:text-white hover:bg-white/10 ${collapsed?'justify-center px-0 py-3':'gap-3 px-3 py-2.5'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              {!collapsed && <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.15em] uppercase">Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* ═══════════ MAIN ═══════════ */}
        <main className={`flex-1 min-h-screen dash-bg transition-all duration-300 ${!collapsed ? 'md:ml-64' : 'md:ml-[72px]'} w-full`}>

          {/* ── TOPBAR ── */}
          <header className="admin-topbar sticky top-0 z-30 px-4 md:px-6 py-2 flex items-center justify-between relative">
            <div className="absolute top-0 left-0 pointer-events-none hidden md:block"><LaceCorner/></div>
            <div className="absolute top-0 right-0 pointer-events-none hidden md:block"><LaceCorner flip/></div>
            <div className="flex items-center gap-3">
              <button className="md:hidden w-8 h-8 flex items-center justify-center text-white/70"
                onClick={() => setIsMobileMenuOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.55rem] tracking-[0.32em] uppercase text-white/55">
                  Inora › {navItems.find(n=>n.id===activeTab)?.label}
                </p>
                <h2 className="font-['Playfair_Display',serif] italic text-xl text-white leading-tight">
                  {navItems.find(n=>n.id===activeTab)?.label}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {bookings.filter(b=>b.status==='pending').length > 0 && (
                <span className="hidden sm:inline-block font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-widest uppercase px-3 py-1 rounded-full bg-white/15 text-white border border-white/25">
                  {bookings.filter(b=>b.status==='pending').length} pending
                </span>
              )}
              {pendingReviews.length > 0 && (
                <span className="hidden sm:inline-block font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-widest uppercase px-3 py-1 rounded-full bg-white/15 text-white border border-white/25">
                  {pendingReviews.length} reviews
                </span>
              )}
              <p className="font-['Cormorant_Garamond',serif] italic text-sm text-white/60 hidden lg:block">
                {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}
              </p>
            </div>
          </header>

          <div className="p-4 md:p-7" style={{ animation:'fadeUp .4s ease both' }}>

  {/* ════════════ OVERVIEW ════════════ */}
  {activeTab === 'overview' && (
    <div className="space-y-6" style={{ animation:'fadeIn .3s ease both' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Bookings',        n: bookings.length,       sub:`${bookings.filter(b=>b.status==='pending').length} pending`,   c:'#C87D87', icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { label:'Members',         n: users.length,          sub:`${users.filter(u=>u.role==='admin').length} admins`,            c:'#6B7556', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
          { label:'MAD Collected',   n:`${payments.reduce((s,p)=>s+(p.totalPrice||p.advancePaid||0),0).toLocaleString()}`, sub:`${payments.length} payments`, c:'#3a3027', icon:'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
          { label:'Pending Reviews', n: pendingReviews.length, sub:`${approvedReviews.length} published`,                         c:'#C87D87', icon:'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
        ].map((s, i) => (
          <div key={s.label} className="stat-card" style={{ animation:`fadeUp .3s ease ${i*60}ms both` }}>
            <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background:`${s.c}18` }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={s.c} strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon}/>
              </svg>
            </div>
            <p className="font-['Playfair_Display',serif] italic text-3xl leading-none mb-1" style={{ color:s.c }}>{s.n}</p>
            <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/55 mb-0.5">{s.label}</p>
            <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/35">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <Panel>
        <div className="flex items-center justify-between px-4 md:px-6 pt-5 pb-3 border-b border-[#C87D87]/10">
          <h3 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027]">Recent Bookings</h3>
          <button onClick={() => setActiveTab('bookings')} className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/60 hover:text-[#C87D87] transition-colors">View all →</button>
        </div>
        {bookings.slice(0, 6).map(b => {
          const s = getStatus(b.status);
          return (
            <div key={b.id} onClick={() => setSelectedBooking(b)}
              className="trow flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 border-b border-[#C87D87]/6 last:border-0">
              <div className="w-8 h-8 rounded-full bg-[#C87D87]/15 flex items-center justify-center text-[#C87D87] font-bold text-xs flex-shrink-0 overflow-hidden">
                {b.user?.avatarUrl
                  ? <img src={resolveAvatar(b.user.avatarUrl)} alt="" className="w-full h-full object-cover"/>
                  : (b.fullName || b.user?.fullName || '?').charAt(0).toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{b.fullName || b.user?.fullName}</p>
                  {b.user?.isDeleted && <DeletedBadge/>}
                </div>
                <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55 truncate">
                  {b.activity}{b.activityTheme ? ` · ${b.activityTheme}` : ''}{b.timeSlot ? ` · ${b.timeSlot}` : ''}
                </p>
              </div>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase flex-shrink-0 ${s.bg} ${s.border} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
              </span>
              {b.totalPrice > 0 && (
                <p className="font-['Playfair_Display',serif] italic text-sm text-[#6B7556] flex-shrink-0 hidden lg:block">{b.totalPrice} MAD</p>
              )}
            </div>
          );
        })}
      </Panel>

      {/* Pending Reviews preview */}
      {pendingReviews.length > 0 && (
        <Panel>
          <div className="flex items-center justify-between px-4 md:px-6 pt-5 pb-3 border-b border-[#C87D87]/10">
            <h3 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027]">
              Pending Reviews <span className="text-[#C87D87] not-italic text-sm font-['Cormorant_Garamond',serif]">{pendingReviews.length}</span>
            </h3>
            <button onClick={() => setActiveTab('reviews')} className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/60 hover:text-[#C87D87] transition-colors">Manage →</button>
          </div>
          {pendingReviews.slice(0, 3).map(r => (
            <div key={r.id} className="trow flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3.5 border-b border-[#C87D87]/6 last:border-0">
              <div className="w-8 h-8 rounded-full bg-[#C87D87]/15 flex items-center justify-center font-bold text-xs text-[#C87D87] flex-shrink-0 overflow-hidden">
                {r.user.avatarUrl
                  ? <img src={resolveAvatar(r.user.avatarUrl)} alt="" className="w-full h-full object-cover"/>
                  : r.user.fullName.charAt(0).toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold">{r.user.fullName}</p>
                <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55 truncate">{r.comment}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={e => { e.stopPropagation(); approveReview(r.id); }} className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase px-3 py-1.5 border border-[#6B7556]/40 text-[#6B7556] hover:bg-[#6B7556] hover:text-white transition-all rounded-lg">✓</button>
                <button onClick={e => { e.stopPropagation(); deleteReview(r.id); }}  className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase px-3 py-1.5 border border-[#C87D87]/40 text-[#C87D87] hover:bg-[#C87D87] hover:text-white transition-all rounded-lg">✕</button>
              </div>
            </div>
          ))}
        </Panel>
      )}
    </div>
  )}

  {/* ════════════ BOOKINGS ════════════ */}
  {activeTab === 'bookings' && (
    <div style={{ animation:'fadeIn .3s ease both' }}>
      <Panel>
        <div className="flex items-center justify-between px-4 md:px-6 pt-5 pb-3 border-b border-[#C87D87]/10">
          <h3 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027]">
            All Bookings{' '}
            <span className="text-[#C87D87] not-italic text-sm font-['Cormorant_Garamond',serif]">
              {allBookings.length}
            </span>
          </h3>
          <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/40 hidden sm:block">
            Click a row to view details
          </p>
        </div>

        {/* Header - hidden on mobile, shown as grid on larger screens */}
        <div className="hidden lg:grid grid-cols-[2fr_1.6fr_0.8fr_1fr_1fr_0.8fr_0.6fr] gap-4 px-6 py-3 border-b border-[#C87D87]/8"
          style={{ background:'rgba(200,125,135,0.04)' }}>
          {['Client','Activity · Setting','Guests','Date · Time','Status','Payment','Export'].map(h => (
            <p key={h} className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.22em] uppercase text-[#7a6a5a]/45">{h}</p>
          ))}
        </div>

        {allBookingsLoading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-8 h-8 border-2 border-[#C87D87]/20 border-t-[#C87D87] rounded-full animate-spin"/>
            <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/50 tracking-widest">Loading…</p>
          </div>
        ) : allBookings.length === 0 ? (
          <p className="font-['Cormorant_Garamond',serif] italic text-center py-16 text-[#7a6a5a]/35">No bookings found</p>
        ) : allBookings.map((b, i) => {
          const s       = getStatus(b.status);
          const setting = settingFromBooking(b);
          const isPaid    = b.paymentStatus === 'PAID';
          const isPending = b.paymentStatus === 'PENDING';
          const payBadge  = isPaid
            ? { label:'Paid',    bg:'bg-emerald-50',  border:'border-emerald-200',  text:'text-emerald-600', dot:'bg-emerald-400'  }
            : isPending
            ? { label:'Pending', bg:'bg-amber-50',    border:'border-amber-200',    text:'text-amber-600',   dot:'bg-amber-400'   }
            : { label:'Unpaid',  bg:'bg-[#C87D87]/8', border:'border-[#C87D87]/20', text:'text-[#C87D87]/70',dot:'bg-[#C87D87]/40' };

          return (
            <div key={b.id} onClick={() => setSelectedBooking(b)}
              className="trow p-4 border-b border-[#C87D87]/6 last:border-0"
              style={{ animation:`fadeUp .22s ease ${i*25}ms both` }}>
              {/* Mobile layout */}
              <div className="lg:hidden">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#C87D87]/15 flex items-center justify-center text-[#C87D87] font-bold text-xs flex-shrink-0 overflow-hidden">
                      {b.user?.avatarUrl
                        ? <img src={resolveAvatar(b.user.avatarUrl)} alt="" className="w-full h-full object-cover"/>
                        : (b.fullName || b.user?.fullName || '?').charAt(0).toUpperCase()
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">
                          {b.fullName || b.user?.fullName}
                        </p>
                        {b.user?.isDeleted && <DeletedBadge/>}
                      </div>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/45 truncate">{b.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); exportBookingPDF(b); }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#6B7556]/25 bg-[#6B7556]/8 text-[#6B7556]/60 hover:bg-[#6B7556] hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.55rem] text-[#7a6a5a]/50">Activity</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]">{b.activity}</p>
                  </div>
                  <div>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.55rem] text-[#7a6a5a]/50">Guests</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]">{b.participants}</p>
                  </div>
                  <div>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.55rem] text-[#7a6a5a]/50">Date</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]">
                      {b.date ? new Date(b.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.55rem] text-[#7a6a5a]/50">Time</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#C87D87]/60">{b.timeSlot || '—'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase ${s.bg} ${s.border} ${s.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase ${payBadge.bg} ${payBadge.border} ${payBadge.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${payBadge.dot}`}/>{payBadge.label}
                  </span>
                </div>
              </div>
              {/* Desktop layout */}
              <div className="hidden lg:grid grid-cols-[2fr_1.6fr_0.8fr_1fr_1fr_0.8fr_0.6fr] gap-4 items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#C87D87]/15 flex items-center justify-center text-[#C87D87] font-bold text-xs flex-shrink-0 overflow-hidden">
                    {b.user?.avatarUrl
                      ? <img src={resolveAvatar(b.user.avatarUrl)} alt="" className="w-full h-full object-cover"/>
                      : (b.fullName || b.user?.fullName || '?').charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">
                        {b.fullName || b.user?.fullName}
                      </p>
                      {b.user?.isDeleted && <DeletedBadge/>}
                    </div>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/45 truncate">{b.email}</p>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] truncate">{b.activity}</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#C87D87]/55 truncate mt-0.5">
                    {[setting ? `${setting.icon} ${setting.label}` : b.setting, b.activityTheme].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] text-center">{b.participants}</p>
                <div>
                  <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#5a4a3a]">
                    {b.date ? new Date(b.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : '—'}
                  </p>
                  {b.timeSlot && (
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#C87D87]/60 mt-0.5">{b.timeSlot}</p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase w-fit ${s.bg} ${s.border} ${s.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase w-fit ${payBadge.bg} ${payBadge.border} ${payBadge.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${payBadge.dot}`}/>{payBadge.label}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); exportBookingPDF(b); }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#6B7556]/25 bg-[#6B7556]/8 text-[#6B7556]/60 hover:bg-[#6B7556] hover:text-white hover:border-[#6B7556] transition-all duration-300 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  )}

  {/* ════════════ MEMBERS ════════════ */}
  {activeTab === 'members' && (
    <div style={{ animation:'fadeIn .3s ease both' }}>
      <div className="relative mb-5 max-w-xs">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#C87D87]/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
        </svg>
        <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search members…" className="search-input pl-9"/>
      </div>
      <Panel>
        <div className="hidden lg:grid grid-cols-[2fr_2fr_80px_55px_55px_55px] gap-4 px-6 py-3 border-b border-[#C87D87]/8" style={{ background:'rgba(200,125,135,0.04)' }}>
          {['Member','Email','Role','Book.','Pay.','Rev.'].map(h => (
            <p key={h} className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.22em] uppercase text-[#7a6a5a]/45">{h}</p>
          ))}
        </div>
        {usersLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#C87D87]/20 border-t-[#C87D87] rounded-full animate-spin"/></div>
        ) : filteredUsers.map((u, i) => {
          const ub = userBookings(u), up = userPayments(u), ur = userReviews(u);
          return (
            <div key={u.id} onClick={() => setSelectedUser(u)}
              className={`trow p-4 border-b border-[#C87D87]/6 last:border-0 ${u.suspended ? 'opacity-40' : ''}`}
              style={{ animation:`fadeUp .22s ease ${i*22}ms both` }}>
              {/* Mobile layout */}
              <div className="lg:hidden">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${u.role==='admin' ? 'bg-[#6B7556]' : 'bg-[#C87D87]'}`}>
                    {u.avatarUrl
                      ? <img src={resolveAvatar(u.avatarUrl)} alt={u.fullName} className="w-full h-full object-cover rounded-full"/>
                      : u.fullName?.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{u.fullName}</p>
                      {u.isDeleted && <DeletedBadge/>}
                    </div>
                    <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55 truncate">{u.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase ${u.role==='admin' ? 'bg-[#6B7556]/12 text-[#4a5240] border border-[#6B7556]/25' : 'bg-[#C87D87]/10 text-[#C87D87] border border-[#C87D87]/22'}`}>
                        {u.role}
                      </span>
                      <span className="inline-flex items-center gap-1 font-['Cormorant_Garamond',serif] text-xs text-[#3a3027]">
                        <span className="font-semibold">{ub.length}</span> bookings
                      </span>
                      <span className="inline-flex items-center gap-1 font-['Cormorant_Garamond',serif] text-xs text-[#6B7556]">
                        <span className="font-semibold">{up.length}</span> payments
                      </span>
                      <span className="inline-flex items-center gap-1 font-['Cormorant_Garamond',serif] text-xs text-[#C87D87]">
                        <span className="font-semibold">{ur.length}</span> reviews
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Desktop layout */}
              <div className="hidden lg:grid grid-cols-[2fr_2fr_80px_55px_55px_55px] gap-4 items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${u.role==='admin' ? 'bg-[#6B7556]' : 'bg-[#C87D87]'}`}>
                    {u.avatarUrl
                      ? <img src={resolveAvatar(u.avatarUrl)} alt={u.fullName} className="w-full h-full object-cover rounded-full"/>
                      : u.fullName?.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{u.fullName}</p>
                      {u.isDeleted && <DeletedBadge/>}
                    </div>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/45">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { month:'short', year:'numeric' })}
                    </p>
                  </div>
                </div>
                <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55 truncate">{u.email}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase w-fit ${u.role==='admin' ? 'bg-[#6B7556]/12 text-[#4a5240] border border-[#6B7556]/25' : 'bg-[#C87D87]/10 text-[#C87D87] border border-[#C87D87]/22'}`}>
                  {u.role}
                </span>
                <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] text-center font-semibold">{ub.length}</p>
                <p className="font-['Cormorant_Garamond',serif] text-sm text-[#6B7556] text-center font-semibold">{up.length}</p>
                <p className="font-['Cormorant_Garamond',serif] text-sm text-[#C87D87] text-center font-semibold">{ur.length}</p>
              </div>
            </div>
          );
        })}
        {filteredUsers.length === 0 && <p className="font-['Cormorant_Garamond',serif] italic text-center py-12 text-[#7a6a5a]/35">No members found</p>}
      </Panel>
    </div>
  )}

  {/* ════════════ PAYMENTS ════════════ */}
  {activeTab === 'payments' && (
    <div className="space-y-5" style={{ animation:'fadeIn .3s ease both' }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label:'Total Collected', n:`${payments.reduce((s,p)=>s+(p.totalPrice||p.advancePaid||0),0).toLocaleString()} MAD`, c:'#6B7556' },
          { label:'Payments',        n: payments.length,                                                                       c:'#C87D87' },
          { label:'Unique Clients',  n: new Set(payments.map(p=>p.email)).size,                                                c:'#3a3027' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.22em] uppercase text-[#7a6a5a]/45 mb-1">{s.label}</p>
            <p className="font-['Playfair_Display',serif] italic text-3xl" style={{ color:s.c }}>{s.n}</p>
          </div>
        ))}
      </div>
      <Panel>
        <div className="hidden lg:grid grid-cols-[2fr_1.4fr_0.5fr_0.9fr_0.8fr_0.7fr_0.8fr] gap-3 px-6 py-3 border-b border-[#C87D87]/8" style={{ background:'rgba(200,125,135,0.04)' }}>
          {['Client','Activity','Guests','Date','Time Slot','Setting','Total'].map(h => (
            <p key={h} className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.22em] uppercase text-[#7a6a5a]/45">{h}</p>
          ))}
        </div>
        {paymentsLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#C87D87]/20 border-t-[#C87D87] rounded-full animate-spin"/></div>
        ) : payments.length === 0 ? (
          <p className="font-['Cormorant_Garamond',serif] italic text-center py-16 text-[#7a6a5a]/35">No payments received yet</p>
        ) : payments.map((p, i) => (
          <div key={p.id}
            className="trow p-4 border-b border-[#C87D87]/6 last:border-0"
            style={{ animation:`fadeUp .22s ease ${i*28}ms both` }}>
            {/* Mobile layout */}
            <div className="lg:hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C87D87]/15 flex items-center justify-center text-[#C87D87] font-bold text-xs flex-shrink-0 overflow-hidden">
                    {p.user?.avatarUrl
                      ? <img src={resolveAvatar(p.user.avatarUrl)} alt="" className="w-full h-full object-cover"/>
                      : (p.user?.fullName || p.fullName || '?').charAt(0).toUpperCase()
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{p.user?.fullName || p.fullName}</p>
                      {p.user?.isDeleted && <DeletedBadge/>}
                    </div>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/45 truncate">{p.email}</p>
                  </div>
                </div>
                <p className="font-['Playfair_Display',serif] italic text-base text-[#6B7556]">{(p.totalPrice || p.advancePaid || 0)} MAD</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div>
                  <p className="font-['Cormorant_Garamond',serif] text-[0.55rem] text-[#7a6a5a]/50">Activity</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] truncate">{p.activity}</p>
                </div>
                <div>
                  <p className="font-['Cormorant_Garamond',serif] text-[0.55rem] text-[#7a6a5a]/50">Guests</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]">{p.participants}</p>
                </div>
                <div>
                  <p className="font-['Cormorant_Garamond',serif] text-[0.55rem] text-[#7a6a5a]/50">Date</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/55">
                    {p.date ? new Date(p.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : '—'}
                  </p>
                </div>
                <div>
                  <p className="font-['Cormorant_Garamond',serif] text-[0.55rem] text-[#7a6a5a]/50">Setting</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/55 capitalize truncate">
                    {SETTINGS_MAP[p.setting]?.label || p.setting}
                  </p>
                </div>
              </div>
            </div>
            {/* Desktop layout */}
            <div className="hidden lg:grid grid-cols-[2fr_1.4fr_0.5fr_0.9fr_0.8fr_0.7fr_0.8fr] gap-3 items-center">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#C87D87]/15 flex items-center justify-center text-[#C87D87] font-bold text-xs flex-shrink-0 overflow-hidden">
                  {p.user?.avatarUrl
                    ? <img src={resolveAvatar(p.user.avatarUrl)} alt="" className="w-full h-full object-cover"/>
                    : (p.user?.fullName || p.fullName || '?').charAt(0).toUpperCase()
                  }
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{p.user?.fullName || p.fullName}</p>
                    {p.user?.isDeleted && <DeletedBadge/>}
                  </div>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/45 truncate">{p.email}</p>
                </div>
              </div>
              <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] truncate">{p.activity}</p>
              <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] text-center">{p.participants}</p>
              <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55">
                {p.date ? new Date(p.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : '—'}
              </p>
              <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/65 truncate">{p.timeSlot}</p>
              <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55 capitalize truncate">
                {SETTINGS_MAP[p.setting]?.label || p.setting}
              </p>
              <p className="font-['Playfair_Display',serif] italic text-base text-[#6B7556]">{(p.totalPrice || p.advancePaid || 0)} MAD</p>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  )}

  {/* ════════════ REVIEWS ════════════ */}
  {activeTab === 'reviews' && (() => {
    const responsiveVisibleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;
    const responsiveCarouselMax = Math.max(0, allPublished.length - responsiveVisibleCount);
    const responsiveVisibleReviews = allPublished.slice(carouselIdx, carouselIdx + responsiveVisibleCount);
    return (
      <div className="space-y-6" style={{ animation: 'fadeIn .3s ease both' }}>
        {/* ════ PENDING ════ */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"/>
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-200/60 bg-amber-50/60">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>
              <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] tracking-[0.3em] uppercase text-amber-600">
                Awaiting Approval · {pendingReviews.length}
              </p>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"/>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="relative rounded-2xl border border-dashed border-[#C87D87]/20 bg-[#fef6ec] py-10 flex flex-col items-center gap-2 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C87D87]/25 to-transparent"/>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C87D87]/15 to-transparent"/>
              <div className="absolute top-2 left-2"><LaceCorner/></div>
              <div className="absolute top-2 right-2"><LaceCorner flip/></div>
              <div className="w-12 h-12 rounded-full border border-[#C87D87]/18 bg-[#C87D87]/6 flex items-center justify-center">
                <span className="text-[#C87D87]/35 text-lg">✦</span>
              </div>
              <p className="font-['Playfair_Display',serif] italic text-[#3a3027]/35 text-base">No pending reviews</p>
              <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] text-[#7a6a5a]/30 tracking-widest">
                New submitted reviews will appear here
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingReviews.map((r, i) => (
                <div key={r.id}
                  className="relative bg-[#fef6ec] rounded-2xl border border-amber-200/50 overflow-hidden shadow-[0_2px_12px_rgba(200,125,135,0.06)]"
                  style={{ animation: `fadeUp .25s ease ${i * 60}ms both` }}>
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"/>
                  <div className="absolute top-0 left-0"><LaceCorner/></div>
                  <div className="absolute top-0 right-0"><LaceCorner flip/></div>
                  <div className="px-5 pt-6 pb-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full border border-amber-200/60 overflow-hidden flex-shrink-0 bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-sm">
                          {r.user?.avatarUrl
                            ? <img src={resolveAvatar(r.user.avatarUrl)} alt="" className="w-full h-full object-cover"/>
                            : r.user?.fullName?.charAt(0).toUpperCase()
                          }
                        </div>
                        <div>
                          <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027] leading-none">{r.user?.fullName}</p>
                          <span className="text-amber-400 text-[0.65rem] mt-0.5 block tracking-wider">
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"/> New
                        </span>
                        <span className="font-['Cormorant_Garamond',serif] italic text-[0.55rem] text-[#7a6a5a]/35">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                        </span>
                      </div>
                    </div>
                    {r.activity && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 mb-3 rounded-lg bg-[#C87D87]/8 border border-[#C87D87]/15 font-['Cormorant_Garamond',serif] italic text-[0.62rem] text-[#C87D87]/65">
                        {r.activity}
                      </span>
                    )}
                    <div className="font-['Playfair_Display',serif] text-[3rem] text-amber-200/60 leading-none -mt-2 mb-0.5 select-none">"</div>
                    <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] leading-[1.8] line-clamp-4 mb-5">{r.comment}</p>
                    <div className="flex gap-2 pt-3 border-t border-amber-100">
                      <button onClick={() => approveReview(r.id)}
                        className="flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase py-2 rounded-xl border border-[#6B7556]/30 text-[#6B7556] hover:bg-[#6B7556] hover:text-white hover:border-[#6B7556] transition-all flex items-center justify-center gap-1.5">
                        ✓ Approve
                      </button>
                      <button onClick={() => deleteReview(r.id)}
                        className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase px-4 py-2 rounded-xl border border-[#C87D87]/25 text-[#C87D87]/50 hover:bg-[#C87D87] hover:text-white hover:border-[#C87D87] transition-all">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ════ PUBLISHED — CAROUSEL ════ */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#6B7556]/35 to-transparent"/>
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#6B7556]/22 bg-[#6B7556]/8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B7556]"/>
              <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] tracking-[0.3em] uppercase text-[#6B7556]">
                Published · {allPublished.length}
              </p>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#6B7556]/35 to-transparent"/>
          </div>

          {allPublished.length === 0 ? (
            <div className="relative rounded-2xl border border-dashed border-[#6B7556]/20 bg-[#fef6ec] py-10 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full border border-[#6B7556]/18 bg-[#6B7556]/6 flex items-center justify-center">
                <span className="text-[#6B7556]/35 text-lg">✦</span>
              </div>
              <p className="font-['Playfair_Display',serif] italic text-[#3a3027]/35 text-base">No published reviews yet</p>
            </div>
          ) : (
            <div>
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 overflow-hidden">
                  {responsiveVisibleReviews.map((r, i) => {
                    const isDefault = !r.id || typeof r.id === 'string';
                    return (
                      <div key={r.id ?? r.name ?? i}
                        className="rev-card relative"
                        style={{ animation: 'fadeIn .3s ease both' }}>
                        <div className="absolute top-0 left-0"><LaceCorner/></div>
                        <div className="absolute top-0 right-0"><LaceCorner flip/></div>
                        <div className="pt-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full border border-[#C87D87]/22 overflow-hidden flex-shrink-0 bg-[#C87D87]/10 flex items-center justify-center text-[#C87D87] font-bold text-sm">
                                {r.user?.avatarUrl
                                  ? <img src={resolveAvatar(r.user.avatarUrl)} alt="" className="w-full h-full object-cover"/>
                                  : (r.user?.fullName || r.name || '?').charAt(0).toUpperCase()
                                }
                              </div>
                              <div>
                                <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027] leading-none">{r.user?.fullName || r.name}</p>
                                <span className="text-[#C87D87]/65 text-[0.65rem] mt-0.5 block tracking-wider">
                                  {'★'.repeat(r.rating || r.stars || 5)}{'☆'.repeat(5 - (r.rating || r.stars || 5))}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              {isDefault ? (
                                <span className="font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#6B7556]/8 border border-[#6B7556]/20 text-[#6B7556]/60">
                                  Curated
                                </span>
                              ) : (
                                <span className="font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#6B7556]/10 border border-[#6B7556]/25 text-[#6B7556]">
                                  Live
                                </span>
                              )}
                              {r.createdAt && (
                                <span className="font-['Cormorant_Garamond',serif] italic text-[0.55rem] text-[#7a6a5a]/35">
                                  {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                            </div>
                          </div>
                          {(r.activity || r.activityLabel) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 mb-3 rounded-lg bg-[#C87D87]/8 border border-[#C87D87]/15 font-['Cormorant_Garamond',serif] italic text-[0.62rem] text-[#C87D87]/65">
                              {r.activity || r.activityLabel}
                            </span>
                          )}
                          <div className="font-['Playfair_Display',serif] text-[3rem] text-[#C87D87]/15 leading-none -mt-2 mb-0.5 select-none">"</div>
                          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] leading-[1.8] line-clamp-4 mb-4">
                            {r.comment || r.text}
                          </p>
                          {!isDefault && (
                            <div className="pt-3 border-t border-[#C87D87]/8">
                              <button onClick={() => deleteReview(r.id)}
                                className="w-full font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase py-1.5 rounded-xl border border-[#C87D87]/15 text-[#C87D87]/35 hover:bg-[#C87D87]/8 hover:text-[#C87D87]/60 hover:border-[#C87D87]/25 transition-all">
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {carouselIdx > 0 && (
                  <button onClick={carouselPrev}
                    className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#fef6ec] border border-[#C87D87]/25 shadow-[0_2px_12px_rgba(200,125,135,0.15)] flex items-center justify-center text-[#C87D87]/60 hover:text-[#C87D87] hover:border-[#C87D87]/45 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                )}
                {carouselIdx < responsiveCarouselMax && (
                  <button onClick={carouselNext}
                    className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#fef6ec] border border-[#C87D87]/25 shadow-[0_2px_12px_rgba(200,125,135,0.15)] flex items-center justify-center text-[#C87D87]/60 hover:text-[#C87D87] hover:border-[#C87D87]/45 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                )}
              </div>

              {allPublished.length > responsiveVisibleCount && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  {Array.from({ length: Math.ceil(allPublished.length / responsiveVisibleCount) }).map((_, idx) => (
                    <button key={idx} onClick={() => setCarouselIdx(idx * responsiveVisibleCount)}
                      className="transition-all duration-200 rounded-full"
                      style={{
                        width:  carouselIdx === idx * responsiveVisibleCount ? '20px' : '6px',
                        height: '6px',
                        background: carouselIdx === idx * responsiveVisibleCount ? '#6B7556' : 'rgba(107,117,86,0.25)',
                      }}
                    />
                  ))}
                </div>
              )}

              <p className="text-center font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-widest text-[#7a6a5a]/35 mt-2">
                {carouselIdx + 1}–{Math.min(carouselIdx + responsiveVisibleCount, allPublished.length)} of {allPublished.length}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  })()}

  {/* ════════════ MY PROFILE ════════════ */}
  {activeTab === 'profile' && (
    <div className="max-w-2xl mx-auto space-y-5" style={{ animation:'fadeIn .3s ease both' }}>

      {/* Avatar */}
      <Panel>
        <div className="px-4 md:px-7 py-6">
          <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-4">Profile Photo</p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#C87D87]/25 flex-shrink-0 bg-[#C87D87]/10 flex items-center justify-center">
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover"/>
                : <span className="font-['Playfair_Display',serif] italic text-3xl text-[#C87D87]">{displayName.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar}/>
              <button onClick={() => avatarRef.current?.click()} disabled={avatarLoad}
                className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-[#C87D87] border border-[#C87D87]/35 px-5 py-2.5 rounded-xl hover:bg-[#C87D87]/8 transition-all disabled:opacity-50">
                {avatarLoad ? 'Uploading…' : 'Change Photo'}
              </button>
              <Msg msg={avatarMsg}/>
            </div>
          </div>
        </div>
      </Panel>

      {/* Display Name */}
      <Panel>
        <form onSubmit={handleName} className="px-4 md:px-7 py-5">
          <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-1">Display Name</p>
          <Field label="Full Name">
            <Inp value={nameForm.fullName} onChange={e => setNameForm({ fullName:e.target.value })} placeholder="Your full name"/>
          </Field>
          <div className="flex justify-end mt-3">
            <button type="submit" disabled={nameLoad}
              className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-[#FBEAD6] px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
              style={{ background:'linear-gradient(135deg,#C87D87,#b36d77)', boxShadow:'0 4px 16px rgba(200,125,135,0.3)' }}>
              {nameLoad ? 'Saving…' : 'Save Name'}
            </button>
          </div>
          <Msg msg={nameMsg}/>
        </form>
      </Panel>

      {/* Email */}
      <Panel>
        <form onSubmit={handleEmail} className="px-4 md:px-7 py-5">
          <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-1">Email Address</p>
          <Field label="New Email">
            <Inp type="email" value={emailForm.email} onChange={e => setEmailForm(f => ({ ...f, email:e.target.value }))} placeholder="new@email.com"/>
          </Field>
          <Field label="Password">
            <Inp type="password" value={emailForm.currentPassword} onChange={e => setEmailForm(f => ({ ...f, currentPassword:e.target.value }))} placeholder="Current password"/>
          </Field>
          <div className="flex justify-end mt-3">
            <button type="submit" disabled={emailLoad}
              className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-[#FBEAD6] px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
              style={{ background:'linear-gradient(135deg,#C87D87,#b36d77)', boxShadow:'0 4px 16px rgba(200,125,135,0.3)' }}>
              {emailLoad ? 'Saving…' : 'Update Email'}
            </button>
          </div>
          <Msg msg={emailMsg}/>
        </form>
      </Panel>

      {/* Password */}
      <Panel>
        <form onSubmit={handlePassword} className="px-4 md:px-7 py-5">
          <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-1">Change Password</p>
          <Field label="Current">
            <Inp type="password" value={passForm.currentPassword} onChange={e => setPassForm(f => ({ ...f, currentPassword:e.target.value }))} placeholder="Current password"/>
          </Field>
          <Field label="New">
            <Inp type="password" value={passForm.newPassword} onChange={e => setPassForm(f => ({ ...f, newPassword:e.target.value }))} placeholder="New password"/>
          </Field>
          <Field label="Confirm">
            <Inp type="password" value={passForm.confirmPassword} onChange={e => setPassForm(f => ({ ...f, confirmPassword:e.target.value }))} placeholder="Confirm new password"/>
          </Field>
          <div className="flex justify-end mt-3">
            <button type="submit" disabled={passLoad}
              className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-[#FBEAD6] px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
              style={{ background:'linear-gradient(135deg,#C87D87,#b36d77)', boxShadow:'0 4px 16px rgba(200,125,135,0.3)' }}>
              {passLoad ? 'Saving…' : 'Update Password'}
            </button>
          </div>
          <Msg msg={passMsg}/>
        </form>
      </Panel>

      {/* Danger Zone */}
      <div className="rounded-2xl overflow-hidden border border-red-200/60 relative">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-red-300/50 to-transparent"/>
        <div className="absolute top-0 left-0"><LaceCorner danger/></div>
        <div className="absolute top-0 right-0"><LaceCorner flip danger/></div>
        <div className="px-4 md:px-7 py-5">
          <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-red-400/70 mb-3">Danger Zone</p>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)}
              className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-red-400 border border-red-300/50 px-5 py-2.5 rounded-xl hover:bg-red-50 transition-all">
              Delete Account
            </button>
          ) : (
            <form onSubmit={handleDelete} className="space-y-3">
              <Field label="Password">
                <Inp type="password" value={deleteForm.password} onChange={e => setDeleteForm(f => ({ ...f, password:e.target.value }))} placeholder="Confirm password"/>
              </Field>
              <Field label="Admin Code">
                <Inp value={deleteForm.adminCode} onChange={e => setDeleteForm(f => ({ ...f, adminCode:e.target.value }))} placeholder="Admin deletion code"/>
              </Field>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setShowDelete(false)}
                  className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-widest uppercase text-[#7a6a5a]/50 border border-[#3a3027]/10 px-5 py-2.5 rounded-xl hover:bg-[#3a3027]/5 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={deleteLoad}
                  className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-widest uppercase text-white px-5 py-2.5 rounded-xl bg-red-400 hover:bg-red-500 transition-all disabled:opacity-50">
                  {deleteLoad ? 'Deleting…' : 'Confirm Delete'}
                </button>
              </div>
              <Msg msg={deleteMsg}/>
            </form>
          )}
        </div>
      </div>

    </div>
  )}{/* end activeTab === 'profile' */}

          </div>{/* end p-7 */}
        </main>
      </div>{/* end min-h-screen flex */}
 {/* ════════════ BOOKING DETAIL MODAL ════════════ */}
{selectedBooking && (() => {
  const isPaid    = selectedBooking.paymentStatus === 'PAID';
  const isPending = selectedBooking.paymentStatus === 'PENDING';
  const payBadge  = isPaid
    ? { label:'Paid',    bg:'bg-emerald-50',  border:'border-emerald-200',  text:'text-emerald-600', dot:'bg-emerald-400'  }
    : isPending
    ? { label:'Pending', bg:'bg-amber-50',    border:'border-amber-200',    text:'text-amber-600',   dot:'bg-amber-400'   }
    : { label:'Unpaid',  bg:'bg-[#C87D87]/8', border:'border-[#C87D87]/20', text:'text-[#C87D87]/70',dot:'bg-[#C87D87]/40' };

  return (
    <div className="bmodal-bg fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={() => setSelectedBooking(null)}>
      <div className="bg-[#FBEAD6] w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl shadow-2xl relative"
        style={{ animation:'fadeInScale .3s ease both' }}
        onClick={e => e.stopPropagation()}>

        <div className="h-1 bg-gradient-to-r from-[#C87D87] via-[#b36d77] to-[#C87D87] rounded-t-2xl"/>

        <div className="px-4 md:px-7 py-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="font-['Cormorant_Garamond',serif] italic text-[0.55rem] tracking-[0.4em] uppercase text-[#C87D87]/50 mb-1">
                Booking #{selectedBooking.id}
              </p>
              <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027]">
                {selectedBooking.fullName || selectedBooking.user?.fullName}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase ${payBadge.bg} ${payBadge.border} ${payBadge.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${payBadge.dot}`}/>
                {payBadge.label}
              </span>
              <button onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-[#C87D87]/10 flex items-center justify-center text-[#C87D87]/60 hover:bg-[#C87D87]/20 transition-all text-lg flex-shrink-0">
                ×
              </button>
            </div>
          </div>

          {/* Status control */}
          <div className="mb-6">
            <p className="font-[CormorantGaramond,serif] text-[0.58rem] tracking-widest uppercase text-[#7a6a5a80] mb-3">
              Update Status
            </p>
            {selectedBooking.status === 'pending' && (
              <button
                onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                className="w-full flex items-center justify-center gap-2 font-[CormorantGaramond,serif] text-[0.72rem] tracking-[0.22em] uppercase text-[#FBEAD6] py-3 rounded-2xl transition-all duration-300 mb-3"
                style={{
                  background: 'linear-gradient(135deg, #6B7556 0%, #4a5240 100%)',
                  boxShadow: '0 5px 20px rgba(107,117,86,0.30)',
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Confirm Booking
              </button>
            )}
            <div className="flex flex-wrap gap-2">
              {['pending','completed','cancelled'].map(st => {
                if (st === 'pending' && selectedBooking.status !== 'pending') return null;
                const cfg = statusCfg[st];
                const active = selectedBooking.status === st;
                return (
                  <button key={st} onClick={() => updateBookingStatus(selectedBooking.id, st)}
                    className={`font-[CormorantGaramond,serif] text-[0.58rem] tracking-widest uppercase px-3 py-1.5 rounded-xl border transition-all
                      ${active
                        ? `${cfg.bg} ${cfg.border} ${cfg.text} font-bold`
                        : 'bg-white/50 border-[#3a302710] text-[#7a6a5a60] hover:border-[#C87D8730]'
                      }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-column details */}
          <Panel>
            <div className="px-4 md:px-5 py-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              {[
                { l:'Activity',    v: selectedBooking.activity },
                { l:'Theme',       v: selectedBooking.activityTheme || '—' },
                { l:'Date',        v: selectedBooking.date
                    ? new Date(selectedBooking.date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
                    : '—' },
                { l:'Time',        v: selectedBooking.timeSlot || '—' },
                { l:'Guests',      v: selectedBooking.participants },
                { l:'Setting',     v: (() => { const s = SETTINGS_MAP[selectedBooking.setting]; return s ? `${s.icon} ${s.label}` : selectedBooking.setting || '—'; })() },
                { l:'Location',    v: selectedBooking.location },
                { l:'Email',       v: selectedBooking.email },
                { l:'Phone',       v: selectedBooking.phone },
                { l:'Contact via', v: selectedBooking.preferredContact },
                { l:'Total',       v: selectedBooking.totalPrice > 0 ? `${selectedBooking.totalPrice} MAD` : '—' },
                { l:'Allergies',   v: selectedBooking.allergies || '—' },
                { l:'Requests',    v: selectedBooking.specialRequests || '—' },
              ].map(({ l, v }) => (
                <Field key={l} label={l}>
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027]">{v}</p>
                </Field>
              ))}
            </div>
          </Panel>

          {/* Payment summary */}
          <div className="mt-4 rounded-2xl border border-[#6B7556]/30 overflow-hidden"
            style={{ background:'rgba(107,117,86,0.08)' }}>
            <div className="px-5 py-2.5 border-b border-[#6B7556]/15"
              style={{ background:'rgba(107,117,86,0.12)' }}>
              <p className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase text-[#6B7556]/70">
                Payment
              </p>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold">
                  {selectedBooking.advancePaid ? `${selectedBooking.advancePaid} MAD` : '—'}
                </p>
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] text-[#7a6a5a]/50 mt-0.5">
                  {selectedBooking.paidAt
                    ? `Paid on ${new Date(selectedBooking.paidAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}`
                    : 'No payment recorded'
                  }
                </p>
              </div>
              {(() => {
                const isPaid2    = selectedBooking.paymentStatus === 'PAID';
                const isPending2 = selectedBooking.paymentStatus === 'PENDING';
                const badge = isPaid2
                  ? { label:'Paid',    bg:'bg-emerald-50',  border:'border-emerald-200',  text:'text-emerald-600', dot:'bg-emerald-400'  }
                  : isPending2
                  ? { label:'Pending', bg:'bg-amber-50',    border:'border-amber-200',    text:'text-amber-600',   dot:'bg-amber-400'   }
                  : { label:'Unpaid',  bg:'bg-white/30',    border:'border-[#6B7556]/25', text:'text-[#6B7556]/70',dot:'bg-[#6B7556]/40' };
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase ${badge.bg} ${badge.border} ${badge.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}/>
                    {badge.label}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Export PDF */}
          <button onClick={() => exportBookingPDF(selectedBooking)}
            className="w-full mt-4 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#6B7556] border border-[#6B7556]/30 py-3 rounded-2xl hover:bg-[#6B7556]/8 transition-all flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
            </svg>
            Export as PDF
          </button>

          {/* Delete button - opens confirmation modal */}
          <button 
            onClick={() => confirmDeleteBooking(selectedBooking)}
            className="w-full mt-3 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-red-400 border border-red-200 py-3 rounded-2xl hover:bg-red-50 transition-all"
          >
            Delete Booking
          </button>

        </div>
      </div>
    </div>
  );
})()}

{/* ════════════ DELETE CONFIRMATION MODAL ════════════ */}
{showDeleteConfirm && (
  <div className="bmodal-bg fixed inset-0 z-[60] flex items-center justify-center px-4"
    onClick={() => setShowDeleteConfirm(null)}>
    <div className="bg-[#FBEAD6] w-full max-w-md rounded-2xl shadow-2xl relative"
      style={{ animation: 'fadeInScale .3s ease both' }}
      onClick={e => e.stopPropagation()}>

      <div className="h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-400 rounded-t-2xl"/>

      <div className="p-6 text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-2">
          Delete Booking?
        </h3>

        {/* Message */}
        <p className="font-['Cormorant_Garamond',serif] text-[0.9rem] text-[#7a6a5a]/80 mb-6">
          Are you sure you want to delete this booking?<br/>
          <span className="text-xs text-red-400">This action cannot be undone.</span>
        </p>

        {/* Booking info preview */}
        <div className="bg-[#fdf3e7] rounded-xl p-3 mb-6 text-left border border-[#C87D87]/15">
          <p className="font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a]/60">Booking details:</p>
          <p className="font-['Playfair_Display',serif] italic text-sm text-[#3a3027]">
            {showDeleteConfirm.fullName || showDeleteConfirm.user?.fullName}
          </p>
          <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55">
            {showDeleteConfirm.activity} · {showDeleteConfirm.participants} guests ·{' '}
            {showDeleteConfirm.date ? new Date(showDeleteConfirm.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : '—'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteConfirm(null)}
            className="flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase py-3 rounded-xl border border-[#C87D87]/25 text-[#7a6a5a]/70 hover:bg-[#C87D87]/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteBooking(showDeleteConfirm.id)}
            className="flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all shadow-md"
          >
            Yes, Delete
          </button>
        </div>
      </div>

      {/* Lace corners for the modal */}
      <div className="absolute top-0 left-0"><LaceCorner danger/></div>
      <div className="absolute top-0 right-0"><LaceCorner flip danger/></div>
    </div>
  </div>
)}

{/* ════════════ USER DETAIL MODAL ════════════ */}
{selectedUser && (
  <div className="bmodal-bg fixed inset-0 z-50 flex items-start justify-end"
    onClick={() => setSelectedUser(null)}>
    <div className="bg-[#FBEAD6] w-full max-w-md h-full overflow-y-auto shadow-2xl relative"
      style={{ animation:'slideIn .3s ease both' }}
      onClick={e => e.stopPropagation()}>

      <div className="h-1 bg-gradient-to-r from-[#6B7556] via-[#C87D87] to-[#6B7556]"/>

      <div className="px-4 md:px-7 py-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl overflow-hidden ${selectedUser.role === 'admin' ? 'bg-[#6B7556]' : 'bg-[#C87D87]'}`}>
              {selectedUser.avatarUrl
                ? <img src={resolveAvatar(selectedUser.avatarUrl)} alt={selectedUser.fullName} className="w-full h-full object-cover"/>
                : selectedUser.fullName?.charAt(0).toUpperCase()
              }
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027]">{selectedUser.fullName}</h3>
                {selectedUser.isDeleted && <DeletedBadge/>}
              </div>
              <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55">{selectedUser.email}</p>
            </div>
          </div>
          <button onClick={() => setSelectedUser(null)}
            className="w-8 h-8 rounded-full bg-[#C87D87]/10 flex items-center justify-center text-[#C87D87]/60 hover:bg-[#C87D87]/20 transition-all text-lg">
            ×
          </button>
        </div>

        {/* Suspend / Unsuspend */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => toggleSuspend(selectedUser.id, selectedUser.suspended)}
            className={`flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase py-2.5 rounded-xl border transition-all ${
              selectedUser.suspended
                ? 'border-[#6B7556]/40 text-[#6B7556] hover:bg-[#6B7556] hover:text-white'
                : 'border-amber-300/60 text-amber-600 hover:bg-amber-50'
            }`}>
            {selectedUser.suspended ? 'Unsuspend' : 'Suspend'}
          </button>
        </div>

        {/* Stats */}
        <Panel>
          <div className="px-5 py-1">
            {[
              { l:'Role',     v: selectedUser.role },
              { l:'Joined',   v: new Date(selectedUser.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) },
              { l:'Bookings', v: `${userBookings(selectedUser).length} total` },
              { l:'Payments', v: `${userPayments(selectedUser).length} transactions` },
              { l:'Reviews',  v: `${userReviews(selectedUser).length} submitted` },
            ].map(({ l, v }) => (
              <Field key={l} label={l}>
                <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027]">{v}</p>
              </Field>
            ))}
          </div>
        </Panel>

        {/* Booking history */}
        {userBookings(selectedUser).length > 0 && (
          <div className="mt-5">
            <p className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase text-[#7a6a5a]/50 mb-3">
              Booking History
            </p>
            <div className="space-y-2">
              {userBookings(selectedUser).map(b => {
                const s = getStatus(b.status);
                return (
                  <div key={b.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 border border-[#C87D87]/10">
                    <div className="flex-1 min-w-0">
                      <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{b.activity}</p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/50">
                        {b.date ? new Date(b.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                        {b.timeSlot ? ` · ${b.timeSlot}` : ''}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-widest uppercase ${s.bg} ${s.border} ${s.text}`}>
                      <span className={`w-1 h-1 rounded-full ${s.dot}`}/>{s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
)}
</>
  );
}