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

const Card = ({ children, danger = false, ...props }) => (
  <div className={`bg-[#fef6ec] rounded-2xl overflow-hidden border shadow-[0_2px_12px_rgba(58,48,39,0.06)] transition-all hover:shadow-[0_8px_32px_rgba(58,48,39,0.10)] relative ${danger ? 'border-red-200/60' : 'border-[#C87D87]/20'}`} {...props}>
    <div className={`h-0.5 ${danger ? 'bg-gradient-to-r from-transparent via-red-400 to-transparent' : 'bg-gradient-to-r from-transparent via-[#C87D87]/50 to-transparent'}`}/>
    <div className="absolute top-0 left-0"><LaceCorner danger={danger}/></div>
    <div className="absolute top-0 right-0"><LaceCorner flip danger={danger}/></div>
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

const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(58,48,39,0.55)', backdropFilter: 'blur(4px)', animation: 'fadeIn .2s ease both' }}>
    <div className="bg-[#fef6ec] rounded-2xl border border-red-200/60 shadow-[0_24px_64px_rgba(58,48,39,0.25)] w-full max-w-md relative overflow-hidden"
      style={{ animation: 'fadeUp .25s ease both' }}>
      <div className="h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent"/>
      <div className="absolute top-0 left-0"><LaceCorner danger/></div>
      <div className="absolute top-0 right-0"><LaceCorner flip danger/></div>
      <div className="p-8">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>
        <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] text-center mb-2">Are you sure?</h3>
        <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-red-400/70 text-center mb-4">This action cannot be undone</p>
        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#5a4a3a] text-center leading-relaxed mb-8">
          Your account will be <span className="text-red-500 font-semibold">permanently deleted</span>. Your bookings and payment history will be preserved but your account will no longer be accessible.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-[#7a6a5a] bg-[#fdf3e7] border border-[#C87D87]/20 px-6 py-3 rounded-xl hover:bg-[#f5e8d4] transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-white bg-red-500 px-6 py-3 rounded-xl hover:bg-red-600 transition-all shadow-[0_4px_16px_rgba(239,68,68,0.25)] active:scale-[0.98]">Yes, delete my account</button>
        </div>
      </div>
    </div>
  </div>
);

const CancelBookingModal = ({ booking, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(58,48,39,0.55)', backdropFilter: 'blur(4px)', animation: 'fadeIn .2s ease both' }}>
    <div className="bg-[#fef6ec] rounded-2xl border border-[#C87D87]/30 shadow-[0_24px_64px_rgba(58,48,39,0.25)] w-full max-w-md relative overflow-hidden"
      style={{ animation: 'fadeUp .25s ease both' }}>
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C87D87]/50 to-transparent"/>
      <div className="absolute top-0 left-0"><LaceCorner/></div>
      <div className="absolute top-0 right-0"><LaceCorner flip/></div>
      <div className="p-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] text-center mb-2">Cancel Booking?</h3>
        <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-[#C87D87]/70 text-center mb-4">This cannot be undone</p>
        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#5a4a3a] text-center leading-relaxed mb-2">You are about to cancel</p>
        <p className="font-['Playfair_Display',serif] italic text-base text-[#3a3027] text-center mb-8">{booking?.activity || booking?.activityType} · this booking</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-[#7a6a5a] bg-[#fdf3e7] border border-[#C87D87]/20 px-6 py-3 rounded-xl hover:bg-[#f5e8d4] transition-all">Keep Booking</button>
          <button onClick={onConfirm} className="flex-1 font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-white bg-amber-500 px-6 py-3 rounded-xl hover:bg-amber-600 transition-all shadow-[0_4px_16px_rgba(245,158,11,0.25)] active:scale-[0.98]">Yes, Cancel</button>
        </div>
      </div>
    </div>
  </div>
);

function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg,#4e5a3c 0%,#6B7556 45%,#5a6347 80%,#4a5535 100%)' }}>
      <style>{`
        @keyframes lacePulse{0%,100%{opacity:.45}50%{opacity:1}}
        @keyframes laceRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes laceCounter{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes floatOrb{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      `}</style>
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(251,234,214,0.10) 0%,transparent 70%)', animation: 'floatOrb 10s ease-in-out infinite', filter: 'blur(18px)' }}/>
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(200,125,135,0.12) 0%,transparent 70%)', animation: 'floatOrb 13s ease-in-out infinite 2s', filter: 'blur(22px)' }}/>
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96" style={{ animation: 'laceRotate 8s linear infinite' }}>
            <circle cx="48" cy="48" r="44" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.35" strokeDasharray="3 5"/>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => {
              const r = a * Math.PI/180;
              return <g key={i}><line x1={48+Math.cos(r)*20} y1={48+Math.sin(r)*20} x2={48+Math.cos(r)*44} y2={48+Math.sin(r)*44} stroke="#FBEAD6" strokeWidth="0.5" strokeOpacity="0.28"/><circle cx={48+Math.cos(r)*44} cy={48+Math.sin(r)*44} r="1.2" fill="#FBEAD6" fillOpacity="0.45"/></g>;
            })}
          </svg>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96" style={{ animation: 'laceCounter 6s linear infinite' }}>
            <circle cx="48" cy="48" r="30" fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.38"/>
            {[0,45,90,135,180,225,270,315].map((a,i) => {
              const r = a * Math.PI/180;
              return <g key={i}><circle cx={48+Math.cos(r)*30} cy={48+Math.sin(r)*30} r="2" fill="none" stroke="#FBEAD6" strokeWidth="0.5" strokeOpacity="0.50"/></g>;
            })}
          </svg>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96" style={{ animation: 'lacePulse 2s ease-in-out infinite' }}>
            <circle cx="48" cy="48" r="14" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.42"/>
            <rect x="43" y="43" width="10" height="10" transform="rotate(45 48 48)" fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.62"/>
            <circle cx="48" cy="48" r="2.5" fill="#FBEAD6" fillOpacity="0.52"/>
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-['Playfair_Display',serif] italic text-[#FBEAD6]/75 text-xl">Inora</p>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/40 text-[0.7rem] tracking-[0.4em] uppercase">Loading your profile</p>
        </div>
      </div>
    </div>
  );
}

function PaymentBadge({ booking }) {
  if (booking.status?.toLowerCase() !== 'confirmed' || booking.paymentStatus !== 'PAID') return null;
  const total = (parseInt(booking.participants) || 1) * 150;
  const isFullPay = booking.paymentMode === 'full';
  const amountPaid = booking.advancePaid ?? (isFullPay ? total : 0);
  const dueOnDay = isFullPay ? 0 : total - amountPaid;

  return isFullPay ? (
    <div className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.18em] uppercase text-[#6B7556] bg-[#6B7556]/10 border border-[#6B7556]/25 px-3 py-1.5 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Fully paid · {total} MAD · Nothing due on arrival
    </div>
  ) : (
    <div className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.18em] uppercase text-[#C87D87] bg-[#C87D87]/8 border border-[#C87D87]/25 px-3 py-1.5 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/>
      </svg>
      Advance paid · {amountPaid} MAD · {dueOnDay} MAD due on arrival
    </div>
  );
}

const exportSinglePDF = (booking) => {
  import('jspdf').then(({ default: jsPDF }) => {
    const doc = new jsPDF();
    const total = (parseInt(booking.participants) || 1) * 150;
    const isFullPay = booking.paymentMode === 'full';
    const amtPaid = booking.advancePaid ?? (isFullPay ? total : 0);
    const dueOnDay = isFullPay ? 0 : total - amtPaid;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(58, 48, 39);
    doc.text('Inora', 20, 22);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(200, 125, 135);
    doc.text('Booking Confirmation', 20, 30);
    doc.setDrawColor(200, 125, 135); doc.setLineWidth(0.4); doc.line(20, 35, 190, 35);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(58, 48, 39);
    doc.text(`${booking.activity || booking.activityType || 'Activity'}`, 20, 46);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120, 100, 90);
    doc.text(`Booking ID: ${String(booking.id).padStart(5, '0')}`, 20, 54);
    const s = booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : '—';
    doc.text(`Status: ${s}`, 20, 61);
    doc.setDrawColor(230, 215, 200); doc.setLineWidth(0.2); doc.line(20, 66, 190, 66);

    const rows = [
      ['Activity', booking.activity || booking.activityType || '—'],
      ['Theme', booking.activityTheme || '—'],
      ['Setting', booking.setting || '—'],
      ['Date', booking.date ? new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
      ['Time Slot', booking.timeSlot || '—'],
      ['Location', booking.location || '—'],
      ['Guests', `${booking.participants || 1} ${parseInt(booking.participants) === 1 ? 'person' : 'people'}`],
      ['Full Name', booking.fullName || '—'],
      ['Email', booking.email || '—'],
      ['Phone', booking.phone || '—'],
      ['Preferred Contact', booking.preferredContact || '—'],
      ...(booking.paymentStatus === 'PAID' ? [
        ['Payment', 'Paid'],
        ['Total Amount', `${total} MAD`],
        ['Amount Paid', `${amtPaid} MAD`],
        ['Payment Mode', isFullPay ? 'Full payment' : 'Advance payment'],
        ['Due on Arrival', dueOnDay > 0 ? `${dueOnDay} MAD` : 'Nothing due — fully paid'],
      ] : []),
      ...(booking.allergies ? [['Allergies', booking.allergies]] : []),
      ...(booking.specialRequests ? [['Special Requests', booking.specialRequests]] : []),
      ...(booking.additionalNotes ? [['Additional Notes', booking.additionalNotes]] : []),
    ];

    let y = 76;
    rows.forEach(([label, value]) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(150, 120, 100);
      doc.text(label.toUpperCase(), 20, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(58, 48, 39);
      const lines = doc.splitTextToSize(String(value), 125);
      doc.text(lines, 72, y);
      y += lines.length > 1 ? lines.length * 6 : 4 + 10;
    });

    doc.setDrawColor(200, 125, 135); doc.setLineWidth(0.3); doc.line(20, 270, 190, 270);
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(160, 130, 110);
    doc.text(`Booked on ${new Date(booking.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 276);
    doc.text(`Generated by Inora · ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`, 190, 276, { align: 'right' });
    doc.save(`inora-booking-${String(booking.id).padStart(5, '0')}.pdf`);
  });
};

const statusConfig = {
  pending:   { label: 'Pending',   bg: 'bg-amber-50',      border: 'border-amber-200',      text: 'text-amber-600',  dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmed', bg: 'bg-green-50',      border: 'border-green-200',      text: 'text-green-600',  dot: 'bg-green-400' },
  done:      { label: 'Completed', bg: 'bg-[#6B7556]/8',   border: 'border-[#6B7556]/30',   text: 'text-[#6B7556]', dot: 'bg-[#6B7556]' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50',        border: 'border-red-200',        text: 'text-red-500',   dot: 'bg-red-400' },
  rejected:  { label: 'Rejected',  bg: 'bg-red-50',        border: 'border-red-200',        text: 'text-red-500',   dot: 'bg-red-400' },
};

const getStatus = (s) => statusConfig[s?.toLowerCase()] ?? { label: s ?? 'Unknown', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', dot: 'bg-gray-400' };

const sideNav = [
  { id: 'personal', label: 'Personal Details', sub: 'Name · email · address', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  { id: 'bookings', label: 'My Bookings',      sub: 'Reservations · status', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'security', label: 'Password Security',sub: 'Change your password',  icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z' },
  { id: 'danger',   label: 'Delete Account',   sub: 'Permanently remove account', icon: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' },
];

const IC = 'w-full px-4 py-3 bg-[#fdf3e7] border border-[#C87D87]/20 focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/10 focus:outline-none font-[\'Cormorant_Garamond\',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/45 transition-all rounded-xl';
const LC = 'font-[\'Cormorant_Garamond\',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/60 block mb-2 font-semibold';
const BTN = 'font-[\'Cormorant_Garamond\',serif] text-sm tracking-[0.22em] uppercase text-white bg-[#6B7556] px-8 py-3 rounded-xl hover:bg-[#4a5240] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 inline-block cursor-pointer font-semibold shadow-[0_4px_16px_rgba(107,117,86,0.30)] hover:-translate-y-0.5';

export default function Dashboard() {
  const { user, setUser, authFetch, logout } = useAuth();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState('personal');
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ type: '', text: '' });
  const [nameForm, setNameForm] = useState({ fullName: '' });
  const [nameMsg, setNameMsg] = useState({ type: '', text: '' });
  const [nameLoading, setNameLoading] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: '', currentPassword: '' });
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [deleteForm, setDeleteForm] = useState({ password: '' });
  const [deleteMsg, setDeleteMsg] = useState({ type: '', text: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [allBookingsLoading, setAllBookingsLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);

  const allPublished = [...DEFAULT_REVIEWS, ...approvedReviews];
  const visibleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;
  const carouselMax = Math.max(0, allPublished.length - visibleCount);
  const visibleReviews = allPublished.slice(carouselIdx, carouselIdx + visibleCount);
  const carouselNext = () => setCarouselIdx(i => Math.min(i + visibleCount, carouselMax));
  const carouselPrev = () => setCarouselIdx(i => Math.max(i - visibleCount, 0));

  useEffect(() => {
    if (user?.role === 'admin') {
      setIsAdmin(true);
      fetchAllAdminData();
    }
  }, [user]);

  useEffect(() => {
    authFetch(`${API}/api/profile/me`)
      .then(res => { if (!res.ok) throw new Error('Failed to load profile'); return res.json(); })
      .then(data => {
        setProfile(data);
        setNameForm({ fullName: data.fullName });
        setEmailForm(f => ({ ...f, email: data.email }));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [authFetch]);

  useEffect(() => {
    if (activeSection !== 'bookings') return;
    setBookingsLoading(true);
    setBookingsError(null);
    authFetch(`${API}/api/bookings/my`)
      .then(res => { if (!res.ok) throw new Error('Failed to load bookings'); return res.json(); })
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(err => setBookingsError(err.message))
      .finally(() => setBookingsLoading(false));
  }, [activeSection, authFetch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    if (['personal','bookings','security','danger','admin-overview','admin-bookings','admin-members','admin-payments','admin-reviews'].includes(hash)) setActiveSection(hash);
  }, []);

  const fetchAllAdminData = async () => {
    await Promise.all([
      fetchReviews(),
      fetchUsers(),
      fetchAllBookings(),
      fetchPayments(),
    ]);
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
      const bookingsRes = await fetch(`${API}/api/bookings/all`, { credentials: 'include' });
      if (bookingsRes.ok) {
        const bookings = await bookingsRes.json();
        const uniqueUsers = new Map();
        bookings.forEach(booking => {
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
          } else if (booking.email && !uniqueUsers.has(booking.email)) {
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
            const existing = uniqueUsers.get(booking.email);
            existing.bookingsCount = (existing.bookingsCount || 0) + 1;
            uniqueUsers.set(booking.email, existing);
          }
        });
        setUsers(Array.from(uniqueUsers.values()));
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally { setUsersLoading(false); }
  };

  const fetchAllBookings = async () => {
    setAllBookingsLoading(true);
    try {
      const res = await fetch(`${API}/api/bookings/all`, { credentials:'include' });
      const d = await res.json();
      setAllBookings(Array.isArray(d) ? d : []);
    } catch { setAllBookings([]); } finally { setAllBookingsLoading(false); }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch(`${API}/api/bookings/paid`, { credentials:'include' });
      const d = await res.json();
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
        method:'PATCH', credentials:'include',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ suspended: !suspended }),
      });
      if (res.ok) fetchUsers();
    } catch (err) { console.error('Error toggling suspend:', err); }
  };

  const updateBookingStatus = async (id, status) => {
    await fetch(`${API}/api/bookings/${id}/status`, {
      method:'PATCH', credentials:'include',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchAllBookings();
    if (selectedBooking?.id === id) setSelectedBooking(b => ({ ...b, status }));
  };

  const confirmDeleteBooking = (booking) => {
    setSelectedBooking(null);
    if (confirm(`Delete booking #${booking.id}? This action cannot be undone.`)) {
      fetch(`${API}/api/bookings/${booking.id}`, { method: 'DELETE', credentials: 'include' })
        .then(() => fetchAllBookings())
        .catch(console.error);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0]; 
    if (!file) return;
    setAvatarLoading(true);
    const formData = new FormData(); 
    formData.append('avatar', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/profile/me/avatar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) { setAvatarMsg({ type: 'error', text: data.message }); return; }
      setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      setUser(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      setAvatarMsg({ type: 'success', text: 'Photo updated!' });
      setTimeout(() => setAvatarMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setAvatarMsg({ type: 'error', text: 'Upload failed' });
    } finally { setAvatarLoading(false); }
  };

  const handleName = async (e) => {
    e.preventDefault(); setNameLoading(true);
    try {
      const res = await authFetch(`${API}/api/profile/me/name`, { method: 'PATCH', body: JSON.stringify(nameForm) });
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
      const res = await authFetch(`${API}/api/profile/me/email`, { method: 'PATCH', body: JSON.stringify(emailForm) });
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
      const res = await authFetch(`${API}/api/profile/me/password`, { method: 'PATCH', body: JSON.stringify(passForm) });
      const data = await res.json();
      if (!res.ok) { setPassMsg({ type: 'error', text: data.message }); return; }
      setPassMsg({ type: 'success', text: 'Password updated successfully' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassMsg({ type: '', text: '' }), 4000);
    } finally { setPassLoading(false); }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault(); setDeleteLoading(true);
    try {
      const res = await authFetch(`${API}/api/profile/me/verify-password`, { method: 'POST', body: JSON.stringify({ password: deleteForm.password }) });
      const data = await res.json();
      if (!res.ok) { setDeleteMsg({ type: 'error', text: data.message }); return; }
      setShowDeleteModal(true);
    } finally { setDeleteLoading(false); }
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false); setDeleteLoading(true);
    try {
      const res = await authFetch(`${API}/api/profile/me`, { method: 'DELETE', body: JSON.stringify({ password: deleteForm.password }) });
      const data = await res.json();
      if (!res.ok) { setDeleteMsg({ type: 'error', text: data.message }); return; }
      setUser(null); router.push('/');
    } finally { setDeleteLoading(false); }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
    } catch (err) { console.error('Logout error:', err); }
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    setCancellingId(cancelTarget.id); setCancelTarget(null);
    try {
      const res = await authFetch(`${API}/api/profile/me/bookings/${cancelTarget.id}/cancel`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setBookings(prev => prev.map(b => b.id === cancelTarget.id ? { ...b, status: 'cancelled' } : b));
    } catch (err) { console.error(err); }
    finally { setCancellingId(null); }
  };

  const displayName = profile?.fullName ?? user?.fullName ?? 'Member';
  const avatarUrl = profile?.avatarUrl ?? user?.avatarUrl ?? null;
  const sideW = collapsed ? 'w-[72px]' : 'w-64';
  const mainML = collapsed ? 'ml-[72px]' : 'ml-64';

  const adminNavItems = [
    { id: 'admin-overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'admin-bookings', label: 'All Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'admin-members', label: 'Members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'admin-payments', label: 'Payments', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'admin-reviews', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  ];

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const userBookings = (u) => allBookings.filter(b => b.email?.toLowerCase() === u.email?.toLowerCase());
  const userPayments = (u) => payments.filter(p => p.email?.toLowerCase() === u.email?.toLowerCase());
  const userReviews = (u) => [...approvedReviews, ...pendingReviews].filter(r => r.user?.id === u.id);

  if (loading) return <LoadingScreen />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg,#6B7556 0%,#5a6347 100%)' }}>
      <p className="font-['Cormorant_Garamond',serif] italic text-white/80 text-lg">{error}</p>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes fadeInScale { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .green-sidebar { background: linear-gradient(160deg,#6B7556 0%,#5a6347 60%,#4a5240 100%); }
        .dash-bg {
          background-color: #FBEAD6;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cline x1='0' y1='1' x2='18' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='0' x2='1' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='1' x2='62' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='0' x2='79' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='0' y1='79' x2='18' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='80' x2='1' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='79' x2='62' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='80' x2='79' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Crect x='2' y='2' width='3.5' height='3.5' transform='rotate(45 3.75 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='2' width='3.5' height='3.5' transform='rotate(45 75.25 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='2' y='73.5' width='3.5' height='3.5' transform='rotate(45 3.75 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='73.5' width='3.5' height='3.5' transform='rotate(45 75.25 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Ccircle cx='3.75' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='3.75' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3C/svg%3E");
        }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0px 1000px #fdf3e7 inset; -webkit-text-fill-color:#3a3027; }
        .stat-card { background:#fef6ec; border:1px solid rgba(200,125,135,0.20); border-radius:18px; padding:20px; transition:all .22s; position:relative; overflow:hidden; }
        .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(200,125,135,0.5),transparent); }
        .stat-card:hover { border-color:rgba(200,125,135,0.40); transform:translateY(-2px); box-shadow:0 8px 32px rgba(58,48,39,0.10); }
        .trow { transition:background .15s; }
        .trow:hover { background:rgba(200,125,135,0.05); cursor:pointer; }
        .search-input { background:#fdf3e7; border:1.5px solid rgba(200,125,135,0.25); border-radius:12px; padding:10px 14px; font-family:'Cormorant Garamond',serif; font-size:.9rem; color:#3a3027; outline:none; width:100%; transition:all .18s; }
        .search-input:focus { border-color:rgba(200,125,135,0.55); background:#fef6ec; box-shadow:0 0 0 3px rgba(200,125,135,0.08); }
        .bmodal-bg { background:rgba(58,48,39,0.55); backdrop-filter:blur(8px); }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#FBEAD6; }
        ::-webkit-scrollbar-thumb { background:rgba(200,125,135,0.30); border-radius:8px; }
        @media (max-width: 768px) {
          .stat-card { padding: 14px; }
        }
      `}</style>

      {showDeleteModal && <DeleteModal onConfirm={confirmDelete} onCancel={() => setShowDeleteModal(false)}/>}
      {cancelTarget && <CancelBookingModal booking={cancelTarget} onConfirm={handleCancelBooking} onCancel={() => setCancelTarget(null)}/>}

      <div className="min-h-screen flex" style={{ animation: 'fadeIn .4s ease both' }}>

        {/* SIDEBAR */}
        <aside className={`green-sidebar fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 ${sideW} overflow-hidden flex-shrink-0`} style={{ boxShadow: '6px 0 32px rgba(107,117,86,0.30)' }}>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#C87D87]/50 to-transparent"/>

          <div className={`flex items-center border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center px-0 py-5' : 'justify-between px-6 py-5'}`}>
            {!collapsed && (
              <Link href="/" className="group logo">
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.5rem] tracking-[0.4em] uppercase text-white/50">My Account</p>
                <h1 className="font-['Playfair_Display',serif] italic text-2xl text-white leading-tight group-hover:[.logo_&]:text-[#FBEAD6] transition-colors">Inora</h1>
              </Link>
            )}
            <button onClick={() => setCollapsed(c => !c)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all flex-shrink-0" title={collapsed ? 'Expand' : 'Collapse'}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {collapsed ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/> : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>}
              </svg>
            </button>
          </div>

          {!collapsed && (
            <div className="px-5 py-4 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center gap-3">
                <label htmlFor="avatar-upload" className="cursor-pointer group-av flex-shrink-0 relative">
                  {avatarUrl
                    ? <img src={`${API}${avatarUrl}`} alt="avatar" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20 transition-opacity hover:opacity-70"/>
                    : <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">{displayName.charAt(0).toUpperCase()}</div>
                  }
                  {avatarLoading && <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center"><span className="text-white text-[0.5rem] animate-pulse">…</span></div>}
                  <input id="avatar-upload" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} disabled={avatarLoading}/>
                </label>
                <div className="min-w-0">
                  <p className="font-['Cormorant_Garamond',serif] text-sm text-white font-semibold truncate">{displayName}</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-white/50 truncate">{profile?.email}</p>
                </div>
              </div>
              {avatarMsg.text && (
                <p className={`font-['Cormorant_Garamond',serif] italic text-[0.6rem] mt-2 flex items-center gap-1 ${avatarMsg.type === 'success' ? 'text-[#FBEAD6]/80' : 'text-[#C87D87]/80'}`}>
                  {avatarMsg.text}
                </p>
              )}
            </div>
          )}

          {collapsed && (
            <div className="flex justify-center py-3 border-b border-white/8 flex-shrink-0">
              <label htmlFor="avatar-upload-c" className="cursor-pointer" title="Change photo">
                {avatarUrl
                  ? <img src={`${API}${avatarUrl}`} alt="avatar" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20 hover:opacity-70 transition-opacity"/>
                  : <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm hover:opacity-70 transition-opacity">{displayName.charAt(0).toUpperCase()}</div>
                }
                <input id="avatar-upload-c" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} disabled={avatarLoading}/>
              </label>
            </div>
          )}

          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
            {sideNav.map(item => (
              <button key={item.id} onClick={() => setActiveSection(item.id)} title={collapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl text-left relative transition-all duration-200 group ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'} ${activeSection === item.id ? (item.id === 'danger' ? 'bg-red-500/20' : 'bg-white/18') : 'hover:bg-white/10'}`}>
                {activeSection === item.id && <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full ${item.id === 'danger' ? 'bg-red-400' : 'bg-[#C87D87]'}`}/>}
                <svg xmlns="http://www.w3.org/2000/svg" className={`flex-shrink-0 w-5 h-5 transition-colors ${activeSection === item.id ? (item.id === 'danger' ? 'text-red-300' : 'text-white') : (item.id === 'danger' ? 'text-red-300/50 group-hover:text-red-300' : 'text-white/50 group-hover:text-white/80')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                </svg>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className={`font-['Cormorant_Garamond',serif] text-[0.72rem] tracking-[0.15em] uppercase transition-colors ${activeSection === item.id ? (item.id === 'danger' ? 'text-red-200' : 'text-white') : (item.id === 'danger' ? 'text-red-300/60 group-hover:text-red-200' : 'text-white/55 group-hover:text-white/85')}`}>{item.label}</p>
                    <p className={`font-['Cormorant_Garamond',serif] italic text-[0.6rem] truncate ${item.id === 'danger' ? 'text-red-300/40' : 'text-white/30'}`}>{item.sub}</p>
                  </div>
                )}
              </button>
            ))}

            {isAdmin && (
              <>
                <div className="h-px bg-white/10 my-2 mx-2"/>
                {adminNavItems.map(item => (
                  <button key={item.id} onClick={() => setActiveSection(item.id)} title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-xl text-left relative transition-all duration-200 group ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'} ${activeSection === item.id ? 'bg-white/18' : 'hover:bg-white/10'}`}>
                    {activeSection === item.id && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-[#C87D87]"/>}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`flex-shrink-0 w-5 h-5 transition-colors ${activeSection === item.id ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                    </svg>
                    {!collapsed && (
                      <div className="min-w-0 flex-1">
                        <p className={`font-['Cormorant_Garamond',serif] text-[0.72rem] tracking-[0.15em] uppercase transition-colors ${activeSection === item.id ? 'text-white' : 'text-white/55 group-hover:text-white/85'}`}>{item.label}</p>
                      </div>
                    )}
                  </button>
                ))}
              </>
            )}
          </nav>

          <div className="border-t border-white/8 py-3 px-2 flex-shrink-0">
            <button onClick={handleLogout} title="Log out" className={`w-full flex items-center rounded-xl text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all group ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
              </svg>
              {!collapsed && <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.15em] uppercase">Log Out</span>}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className={`${mainML} flex-1 min-h-screen dash-bg transition-all duration-300`}>
          <header className="sticky top-0 z-30 bg-[#6B7556] backdrop-blur-xl border-b border-[#556b43]/30 px-6 py-2 flex items-center justify-between relative" style={{ boxShadow: '0 2px 24px rgba(200,125,135,0.22)' }}>
            <div className="absolute top-0 left-0 pointer-events-none"><LaceCorner/></div>
            <div className="absolute top-0 right-0 pointer-events-none"><LaceCorner flip/></div>
            <div>
              <p className="font-['Cormorant_Garamond',serif] italic text-xs tracking-[0.3em] uppercase text-white/60">
                Inora · {isAdmin && activeSection.startsWith('admin-') ? 'Admin' : sideNav.find(n => n.id === activeSection)?.label || 'Dashboard'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {profile?.role && (
                <span className={`font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase border px-2.5 py-1 rounded-full ${profile.role === 'admin' ? 'bg-white/20 text-white border-white/30' : 'bg-white/15 text-white border-white/25'}`}>
                  {profile.role}
                </span>
              )}
              <p className="font-['Cormorant_Garamond',serif] italic text-sm text-white/60 hidden md:block">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </header>

          <div className="p-8" style={{ animation: 'fadeUp .4s ease both' }}>

            {/* PERSONAL SECTION */}
            {activeSection === 'personal' && (
              <div className="space-y-4">
                <Card>
                  <form onSubmit={handleName} className="p-7">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-0.5">Update</p>
                    <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-1">Full Name</h3>
                    <div className="w-6 h-px bg-[#C87D87]/40 mb-5"/>
                    <label className={LC}>Name</label>
                    <input type="text" value={nameForm.fullName} onChange={e => setNameForm({ fullName: e.target.value })} placeholder="Your full name" className={`${IC} mb-5`}/>
                    <Msg msg={nameMsg}/>
                    <button type="submit" disabled={nameLoading} className={BTN}>{nameLoading ? 'Saving…' : 'Save Name'}</button>
                  </form>
                </Card>
                <Card>
                  <form onSubmit={handleEmail} className="p-7">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-0.5">Update</p>
                    <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-1">Email Address</h3>
                    <div className="w-6 h-px bg-[#C87D87]/40 mb-5"/>
                    <label className={LC}>New Email</label>
                    <input type="email" value={emailForm.email} onChange={e => setEmailForm(f => ({...f, email: e.target.value}))} placeholder="your@email.com" className={`${IC} mb-4`}/>
                    <label className={LC}>Current Password</label>
                    <input type="password" value={emailForm.currentPassword} onChange={e => setEmailForm(f => ({...f, currentPassword: e.target.value}))} placeholder="Confirm with your password" className={`${IC} mb-5`}/>
                    <Msg msg={emailMsg}/>
                    <button type="submit" disabled={emailLoading} className={BTN}>{emailLoading ? 'Saving…' : 'Save Email'}</button>
                  </form>
                </Card>
              </div>
            )}

            {/* BOOKINGS SECTION */}
            {activeSection === 'bookings' && (
              <div className="space-y-4">
                {bookingsLoading && (
                  <div className="flex flex-col items-center gap-4 py-20">
                    <div className="w-8 h-8 border-2 border-[#C87D87]/20 border-t-[#C87D87] rounded-full animate-spin"/>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/60 text-sm tracking-widest">Loading your bookings</p>
                  </div>
                )}
                {bookingsError && <Card><div className="p-8 text-center"><p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]">{bookingsError}</p></div></Card>}

                {!bookingsLoading && !bookingsError && bookings.length === 0 && (
                  <Card>
                    <div className="p-12 text-center">
                      <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-2">No bookings yet</h3>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a] text-sm mb-6">You haven't made any reservations yet.</p>
                      <Link href="/gatherings" className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.2em] uppercase text-white bg-[#6B7556] px-7 py-2.5 rounded-xl hover:bg-[#4a5240] transition-all inline-block shadow-[0_4px_16px_rgba(107,117,86,0.28)]">Plan a Gathering</Link>
                    </div>
                  </Card>
                )}

                {!bookingsLoading && !bookingsError && bookings.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {['all', ...Object.keys(bookings.reduce((acc, b) => { acc[b.status?.toLowerCase() ?? 'unknown'] = 1; return acc; }, {}))].map(status => {
                        const s = status === 'all'
                          ? { label: 'All', dot: 'bg-[#C87D87]', text: 'text-[#C87D87]', bg: 'bg-[#C87D87]/10', border: 'border-[#C87D87]/25' }
                          : getStatus(status);
                        const count = status === 'all' ? bookings.length : bookings.filter(b => b.status?.toLowerCase() === status).length;
                        return (
                          <button key={status} onClick={() => setBookingFilter(status)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-['Cormorant_Garamond',serif] text-xs font-semibold ${s.bg} ${s.border} ${s.text} ${bookingFilter === status ? 'ring-2 ring-offset-1 ring-[#C87D87]/30 scale-[1.03]' : 'opacity-70 hover:opacity-100'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
                            {count} · {s.label}
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
                            <div key={booking.id} className="bg-[#fef6ec] rounded-2xl overflow-hidden border border-[#e8ddd8] shadow-[0_2px_12px_rgba(58,48,39,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(58,48,39,0.10)] relative" style={{ animation: `fadeIn .3s ease ${i * 0.06}s both` }}>
                              <div className={`h-0.5 bg-gradient-to-r from-transparent ${s.dot.replace('bg-','via-')} to-transparent`}/>
                              <div className="absolute top-0 left-0"><LaceCorner/></div>
                              <div className="absolute top-0 right-0"><LaceCorner flip/></div>
                              <div className="p-6">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl border ${s.border} ${s.bg} flex items-center justify-center flex-shrink-0`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${s.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                      </svg>
                                    </div>
                                    <div>
                                      <h3 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027]">{booking.activity || booking.activityType} Activity</h3>
                                      <p className="font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a]/50 tracking-widest mt-0.5">#{String(booking.id).padStart(5,'0')}</p>
                                    </div>
                                  </div>
                                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold tracking-[0.15em] uppercase font-['Cormorant_Garamond',serif] flex-shrink-0 ${s.bg} ${s.border} ${s.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {[
                                    { label: 'Date',    value: booking.date    ? new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                                    { label: 'Time',    value: booking.timeSlot || '—' },
                                    { label: 'Guests',  value: `${booking.participants || 1} ${parseInt(booking.participants) === 1 ? 'person' : 'people'}` },
                                    { label: 'Contact', value: booking.preferredContact || '—' },
                                  ].map(({ label, value }) => (
                                    <div key={label} className="bg-[#fdf3e7] rounded-xl px-3 py-2.5 border border-[#C87D87]/8">
                                      <p className="font-['Cormorant_Garamond',serif] text-[0.65rem] tracking-[0.18em] uppercase text-[#7a6a5a]/50 mb-0.5">{label}</p>
                                      <p className="font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] font-semibold">{value}</p>
                                    </div>
                                  ))}
                                </div>

                                {(booking.specialRequests || booking.allergies) && (
                                  <div className="mt-3 px-4 py-3 bg-[#fdf3e7] rounded-xl border border-[#C87D87]/8">
                                    {booking.specialRequests && <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]"><span className="not-italic font-semibold text-[0.6rem] tracking-widest uppercase text-[#7a6a5a]">Requests · </span>{booking.specialRequests}</p>}
                                    {booking.allergies       && <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] mt-1"><span className="not-italic font-semibold text-[0.6rem] tracking-widest uppercase text-[#7a6a5a]">Allergies · </span>{booking.allergies}</p>}
                                  </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-[#C87D87]/8 flex items-center justify-between flex-wrap gap-3">
                                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/50">
                                    Booked on {new Date(booking.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button onClick={() => exportSinglePDF(booking)} className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.15em] uppercase text-[#C87D87] border border-[#C87D87]/25 bg-[#C87D87]/8 px-3 py-1.5 rounded-lg hover:bg-[#C87D87]/15 transition-all">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                                      PDF
                                    </button>

                                    {(booking.status?.toLowerCase() === 'pending' || booking.status?.toLowerCase() === 'confirmed') && booking.paymentStatus !== 'PAID' && (
                                      <button onClick={() => setCancelTarget(booking)} disabled={cancellingId === booking.id}
                                        className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.15em] uppercase text-amber-600 border border-amber-200 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-all disabled:opacity-40">
                                        {cancellingId === booking.id
                                          ? <span className="w-3 h-3 rounded-full border border-amber-400 border-t-transparent animate-spin"/>
                                          : <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                        }
                                        {cancellingId === booking.id ? 'Cancelling…' : 'Cancel'}
                                      </button>
                                    )}

                                    {booking.status?.toLowerCase() === 'pending' && (
                                      <p className="font-['Cormorant_Garamond',serif] italic text-sm text-amber-500 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"/>
                                        Awaiting confirmation
                                      </p>
                                    )}

                                    <PaymentBadge booking={booking}/>

                                    {booking.status?.toLowerCase() === 'confirmed' && booking.paymentStatus !== 'PAID' && (
                                      <Link href={`/checkout?bookingId=${booking.id}`} className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.18em] uppercase text-white bg-[#6B7556] px-3 py-1.5 rounded-lg hover:bg-[#4a5240] transition-all shadow-[0_3px_10px_rgba(107,117,86,0.28)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
                                        Proceed to payment
                                      </Link>
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

            {/* SECURITY SECTION */}
            {activeSection === 'security' && (
              <div>
                <Card>
                  <form onSubmit={handlePassword} className="p-7">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-0.5">Update</p>
                    <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-1">Change Password</h3>
                    <div className="w-6 h-px bg-[#C87D87]/40 mb-5"/>
                    <div className="space-y-4 mb-5">
                      {[
                        { lbl: 'Current Password', key: 'currentPassword', ph: 'Your current password' },
                        { lbl: 'New Password',     key: 'newPassword',     ph: 'At least 6 characters' },
                        { lbl: 'Confirm Password', key: 'confirmPassword', ph: 'Repeat new password' },
                      ].map(({ lbl, key, ph }) => (
                        <div key={key}>
                          <label className={LC}>{lbl}</label>
                          <input type="password" value={passForm[key]} onChange={e => setPassForm(f => ({...f, [key]: e.target.value}))} placeholder={ph} className={IC}/>
                        </div>
                      ))}
                    </div>
                    <Msg msg={passMsg}/>
                    <button type="submit" disabled={passLoading} className={BTN}>{passLoading ? 'Updating…' : 'Update Password'}</button>
                  </form>
                </Card>
              </div>
            )}

            {/* DANGER SECTION */}
            {activeSection === 'danger' && (
              <div className="space-y-4">
                <Card danger>
                  <div className="p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
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
                  <form onSubmit={handleDeleteAccount} className="p-7">
                    <h3 className="font-['Playfair_Display',serif] italic text-xl text-red-500 mb-1">Confirm Deletion</h3>
                    <div className="w-6 h-px bg-red-300 mb-5"/>
                    <label className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/60 block mb-2 font-semibold">Enter your password to continue</label>
                    <input type="password" value={deleteForm.password} onChange={e => setDeleteForm({ password: e.target.value })} placeholder="Your password" className="w-full px-4 py-3 bg-[#fdf3e7] border border-red-200/60 focus:border-red-400 focus:ring-2 focus:ring-red-100 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/45 transition-all rounded-xl mb-5"/>
                    {deleteMsg.text && (
                      <p className="font-['Cormorant_Garamond',serif] italic text-sm mb-5 text-red-500 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[0.6rem]">!</span>
                        {deleteMsg.text}
                      </p>
                    )}
                    <button type="submit" disabled={deleteLoading || !deleteForm.password} className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-white bg-red-500 px-8 py-3 rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer font-semibold shadow-[0_4px_16px_rgba(239,68,68,0.25)] hover:-translate-y-0.5">
                      {deleteLoading ? 'Verifying…' : 'Delete My Account'}
                    </button>
                  </form>
                </Card>
              </div>
            )}

            {/* ADMIN OVERVIEW */}
            {isAdmin && activeSection === 'admin-overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label:'Bookings', n: allBookings.length, sub:`${allBookings.filter(b=>b.status==='pending').length} pending`, c:'#C87D87', icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                    { label:'Members', n: users.length, sub:`${users.filter(u=>u.role==='admin').length} admins`, c:'#6B7556', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                    { label:'MAD Collected', n:`${payments.reduce((s,p)=>s+(p.totalPrice||p.advancePaid||0),0).toLocaleString()}`, sub:`${payments.length} payments`, c:'#3a3027', icon:'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
                    { label:'Pending Reviews', n: pendingReviews.length, sub:`${approvedReviews.length} published`, c:'#C87D87', icon:'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
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
              </div>
            )}

            {/* ADMIN MEMBERS */}
            {isAdmin && activeSection === 'admin-members' && (
              <div>
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
                    );
                  })}
                  {filteredUsers.length === 0 && <p className="font-['Cormorant_Garamond',serif] italic text-center py-12 text-[#7a6a5a]/35">No members found</p>}
                </Panel>
              </div>
            )}

            {/* ADMIN PAYMENTS */}
            {isAdmin && activeSection === 'admin-payments' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label:'Total Collected', n:`${payments.reduce((s,p)=>s+(p.totalPrice||p.advancePaid||0),0).toLocaleString()} MAD`, c:'#6B7556' },
                    { label:'Payments', n: payments.length, c:'#C87D87' },
                    { label:'Unique Clients', n: new Set(payments.map(p=>p.email)).size, c:'#3a3027' },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <p className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.22em] uppercase text-[#7a6a5a]/45 mb-1">{s.label}</p>
                      <p className="font-['Playfair_Display',serif] italic text-3xl" style={{ color:s.c }}>{s.n}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADMIN REVIEWS */}
            {isAdmin && activeSection === 'admin-reviews' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"/>
                  <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-200/60 bg-amber-50/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] tracking-[0.3em] uppercase text-amber-600">
                      Pending · {pendingReviews.length}
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"/>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pendingReviews.map((r, i) => (
                    <div key={r.id} className="relative bg-[#fef6ec] rounded-2xl border border-amber-200/50 overflow-hidden shadow-[0_2px_12px_rgba(200,125,135,0.06)]">
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
                          <span className="font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"/> New
                          </span>
                        </div>
                        <div className="font-['Playfair_Display',serif] text-[3rem] text-amber-200/60 leading-none -mt-2 mb-0.5 select-none">"</div>
                        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] leading-[1.8] line-clamp-4 mb-5">{r.comment}</p>
                        <div className="flex gap-2 pt-3 border-t border-amber-100">
                          <button onClick={() => approveReview(r.id)} className="flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase py-2 rounded-xl border border-[#6B7556]/30 text-[#6B7556] hover:bg-[#6B7556] hover:text-white hover:border-[#6B7556] transition-all flex items-center justify-center gap-1.5">
                            ✓ Approve
                          </button>
                          <button onClick={() => deleteReview(r.id)} className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase px-4 py-2 rounded-xl border border-[#C87D87]/25 text-[#C87D87]/50 hover:bg-[#C87D87] hover:text-white hover:border-[#C87D87] transition-all">
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADMIN PROFILE (same as personal) */}
            {activeSection === 'profile' && (
              <div className="max-w-2xl mx-auto space-y-5">
                <Panel>
                  <div className="px-7 py-6">
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
                        <button onClick={() => avatarRef.current?.click()} disabled={avatarLoading}
                          className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-[#C87D87] border border-[#C87D87]/35 px-5 py-2.5 rounded-xl hover:bg-[#C87D87]/8 transition-all disabled:opacity-50">
                          {avatarLoading ? 'Uploading…' : 'Change Photo'}
                        </button>
                        <Msg msg={avatarMsg}/>
                      </div>
                    </div>
                  </div>
                </Panel>

                <Panel>
                  <form onSubmit={handleName} className="px-7 py-5">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-1">Display Name</p>
                    <Field label="Full Name">
                      <Inp value={nameForm.fullName} onChange={e => setNameForm({ fullName:e.target.value })} placeholder="Your full name"/>
                    </Field>
                    <div className="flex justify-end mt-3">
                      <button type="submit" disabled={nameLoading}
                        className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-[#FBEAD6] px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
                        style={{ background:'linear-gradient(135deg,#C87D87,#b36d77)', boxShadow:'0 4px 16px rgba(200,125,135,0.3)' }}>
                        {nameLoading ? 'Saving…' : 'Save Name'}
                      </button>
                    </div>
                    <Msg msg={nameMsg}/>
                  </form>
                </Panel>

                <Panel>
                  <form onSubmit={handleEmail} className="px-7 py-5">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-[#C87D87]/60 mb-1">Email Address</p>
                    <Field label="New Email">
                      <Inp type="email" value={emailForm.email} onChange={e => setEmailForm(f => ({ ...f, email:e.target.value }))} placeholder="new@email.com"/>
                    </Field>
                    <Field label="Password">
                      <Inp type="password" value={emailForm.currentPassword} onChange={e => setEmailForm(f => ({ ...f, currentPassword:e.target.value }))} placeholder="Current password"/>
                    </Field>
                    <div className="flex justify-end mt-3">
                      <button type="submit" disabled={emailLoading}
                        className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-[#FBEAD6] px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
                        style={{ background:'linear-gradient(135deg,#C87D87,#b36d77)', boxShadow:'0 4px 16px rgba(200,125,135,0.3)' }}>
                        {emailLoading ? 'Saving…' : 'Update Email'}
                      </button>
                    </div>
                    <Msg msg={emailMsg}/>
                  </form>
                </Panel>

                <Panel>
                  <form onSubmit={handlePassword} className="px-7 py-5">
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
                      <button type="submit" disabled={passLoading}
                        className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-[#FBEAD6] px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
                        style={{ background:'linear-gradient(135deg,#C87D87,#b36d77)', boxShadow:'0 4px 16px rgba(200,125,135,0.3)' }}>
                        {passLoading ? 'Saving…' : 'Update Password'}
                      </button>
                    </div>
                    <Msg msg={passMsg}/>
                  </form>
                </Panel>

                <div className="rounded-2xl overflow-hidden border border-red-200/60 relative">
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-red-300/50 to-transparent"/>
                  <div className="absolute top-0 left-0"><LaceCorner danger/></div>
                  <div className="absolute top-0 right-0"><LaceCorner flip danger/></div>
                  <div className="px-7 py-5">
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.3em] uppercase text-red-400/70 mb-3">Danger Zone</p>
                    {!showDeleteModal ? (
                      <button onClick={() => setShowDeleteModal(true)}
                        className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[0.22em] uppercase text-red-400 border border-red-300/50 px-5 py-2.5 rounded-xl hover:bg-red-50 transition-all">
                        Delete Account
                      </button>
                    ) : (
                      <form onSubmit={handleDeleteAccount} className="space-y-3">
                        <Field label="Password">
                          <Inp type="password" value={deleteForm.password} onChange={e => setDeleteForm(f => ({ ...f, password:e.target.value }))} placeholder="Confirm password"/>
                        </Field>
                        <Field label="Admin Code">
                          <Inp value={deleteForm.adminCode} onChange={e => setDeleteForm(f => ({ ...f, adminCode:e.target.value }))} placeholder="Admin deletion code"/>
                        </Field>
                        <div className="flex gap-3 justify-end mt-2">
                          <button type="button" onClick={() => setShowDeleteModal(false)}
                            className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-widest uppercase text-[#7a6a5a]/50 border border-[#3a3027]/10 px-5 py-2.5 rounded-xl hover:bg-[#3a3027]/5 transition-all">
                            Cancel
                          </button>
                          <button type="submit" disabled={deleteLoading}
                            className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-widest uppercase text-white px-5 py-2.5 rounded-xl bg-red-400 hover:bg-red-500 transition-all disabled:opacity-50">
                            {deleteLoading ? 'Deleting…' : 'Confirm Delete'}
                          </button>
                        </div>
                        <Msg msg={deleteMsg}/>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* BOOKING DETAIL MODAL */}
      {selectedBooking && (() => {
        const isPaid = selectedBooking.paymentStatus === 'PAID';
        const isPending = selectedBooking.paymentStatus === 'PENDING';
        const payBadge = isPaid
          ? { label:'Paid', bg:'bg-emerald-50', border:'border-emerald-200', text:'text-emerald-600', dot:'bg-emerald-400' }
          : isPending
          ? { label:'Pending', bg:'bg-amber-50', border:'border-amber-200', text:'text-amber-600', dot:'bg-amber-400' }
          : { label:'Unpaid', bg:'bg-[#C87D87]/8', border:'border-[#C87D87]/20', text:'text-[#C87D87]/70', dot:'bg-[#C87D87]/40' };

        return (
          <div className="bmodal-bg fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setSelectedBooking(null)}>
            <div className="bg-[#FBEAD6] w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl shadow-2xl relative" style={{ animation:'fadeInScale .3s ease both' }} onClick={e => e.stopPropagation()}>
              <div className="h-1 bg-gradient-to-r from-[#C87D87] via-[#b36d77] to-[#C87D87] rounded-t-2xl"/>
              <div className="px-7 py-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.55rem] tracking-[0.4em] uppercase text-[#C87D87]/50 mb-1">Booking #{selectedBooking.id}</p>
                    <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027]">{selectedBooking.fullName || selectedBooking.user?.fullName}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase ${payBadge.bg} ${payBadge.border} ${payBadge.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${payBadge.dot}`}/>{payBadge.label}
                    </span>
                    <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 rounded-full bg-[#C87D87]/10 flex items-center justify-center text-[#C87D87]/60 hover:bg-[#C87D87]/20 transition-all text-lg flex-shrink-0">×</button>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase text-[#7a6a5a80] mb-3">Update Status</p>
                  {selectedBooking.status === 'pending' && (
                    <button onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                      className="w-full flex items-center justify-center gap-2 font-['Cormorant_Garamond',serif] text-[0.72rem] tracking-[0.22em] uppercase text-[#FBEAD6] py-3 rounded-2xl transition-all duration-300 mb-3"
                      style={{ background: 'linear-gradient(135deg, #6B7556 0%, #4a5240 100%)', boxShadow: '0 5px 20px rgba(107,117,86,0.30)' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm Booking
                    </button>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {['pending','completed','cancelled'].map(st => {
                      if (st === 'pending' && selectedBooking.status !== 'pending') return null;
                      const cfg = statusConfig[st];
                      const active = selectedBooking.status === st;
                      return (
                        <button key={st} onClick={() => updateBookingStatus(selectedBooking.id, st)}
                          className={`font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase px-3 py-1.5 rounded-xl border transition-all ${active ? `${cfg.bg} ${cfg.border} ${cfg.text} font-bold` : 'bg-white/50 border-[#3a302710] text-[#7a6a5a60] hover:border-[#C87D8730]'}`}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Panel>
                  <div className="px-5 py-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    {[
                      { l:'Activity', v: selectedBooking.activity },
                      { l:'Theme', v: selectedBooking.activityTheme || '—' },
                      { l:'Date', v: selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '—' },
                      { l:'Time', v: selectedBooking.timeSlot || '—' },
                      { l:'Guests', v: selectedBooking.participants },
                      { l:'Setting', v: (() => { const s = SETTINGS_MAP[selectedBooking.setting]; return s ? `${s.icon} ${s.label}` : selectedBooking.setting || '—'; })() },
                      { l:'Location', v: selectedBooking.location },
                      { l:'Email', v: selectedBooking.email },
                      { l:'Phone', v: selectedBooking.phone },
                      { l:'Contact via', v: selectedBooking.preferredContact },
                      { l:'Total', v: selectedBooking.totalPrice > 0 ? `${selectedBooking.totalPrice} MAD` : '—' },
                      { l:'Allergies', v: selectedBooking.allergies || '—' },
                      { l:'Requests', v: selectedBooking.specialRequests || '—' },
                    ].map(({ l, v }) => (
                      <Field key={l} label={l}>
                        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027]">{v}</p>
                      </Field>
                    ))}
                  </div>
                </Panel>

                <div className="mt-4 rounded-2xl border border-[#6B7556]/30 overflow-hidden" style={{ background:'rgba(107,117,86,0.08)' }}>
                  <div className="px-5 py-2.5 border-b border-[#6B7556]/15" style={{ background:'rgba(107,117,86,0.12)' }}>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase text-[#6B7556]/70">Payment</p>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold">{selectedBooking.advancePaid ? `${selectedBooking.advancePaid} MAD` : '—'}</p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] text-[#7a6a5a]/50 mt-0.5">{selectedBooking.paidAt ? `Paid on ${new Date(selectedBooking.paidAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}` : 'No payment recorded'}</p>
                    </div>
                    {(() => {
                      const isPaid2 = selectedBooking.paymentStatus === 'PAID';
                      const isPending2 = selectedBooking.paymentStatus === 'PENDING';
                      const badge = isPaid2
                        ? { label:'Paid', bg:'bg-emerald-50', border:'border-emerald-200', text:'text-emerald-600', dot:'bg-emerald-400' }
                        : isPending2
                        ? { label:'Pending', bg:'bg-amber-50', border:'border-amber-200', text:'text-amber-600', dot:'bg-amber-400' }
                        : { label:'Unpaid', bg:'bg-white/30', border:'border-[#6B7556]/25', text:'text-[#6B7556]/70', dot:'bg-[#6B7556]/40' };
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase ${badge.bg} ${badge.border} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}/>{badge.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <button onClick={() => exportBookingPDF(selectedBooking)} className="w-full mt-4 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#6B7556] border border-[#6B7556]/30 py-3 rounded-2xl hover:bg-[#6B7556]/8 transition-all flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                  </svg>
                  Export as PDF
                </button>

                <button onClick={() => confirmDeleteBooking(selectedBooking)} className="w-full mt-3 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-red-400 border border-red-200 py-3 rounded-2xl hover:bg-red-50 transition-all">
                  Delete Booking
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="bmodal-bg fixed inset-0 z-50 flex items-start justify-end" onClick={() => setSelectedUser(null)}>
          <div className="bg-[#FBEAD6] w-full max-w-md h-full overflow-y-auto shadow-2xl relative" style={{ animation:'slideIn .3s ease both' }} onClick={e => e.stopPropagation()}>
            <div className="h-1 bg-gradient-to-r from-[#6B7556] via-[#C87D87] to-[#6B7556]"/>
            <div className="px-7 py-6">
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
                <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-[#C87D87]/10 flex items-center justify-center text-[#C87D87]/60 hover:bg-[#C87D87]/20 transition-all text-lg">×</button>
              </div>

              <div className="flex gap-2 mb-6">
                <button onClick={() => toggleSuspend(selectedUser.id, selectedUser.suspended)}
                  className={`flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase py-2.5 rounded-xl border transition-all ${selectedUser.suspended ? 'border-[#6B7556]/40 text-[#6B7556] hover:bg-[#6B7556] hover:text-white' : 'border-amber-300/60 text-amber-600 hover:bg-amber-50'}`}>
                  {selectedUser.suspended ? 'Unsuspend' : 'Suspend'}
                </button>
              </div>

              <Panel>
                <div className="px-5 py-1">
                  {[
                    { l:'Role', v: selectedUser.role },
                    { l:'Joined', v: new Date(selectedUser.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) },
                    { l:'Bookings', v: `${userBookings(selectedUser).length} total` },
                    { l:'Payments', v: `${userPayments(selectedUser).length} transactions` },
                    { l:'Reviews', v: `${userReviews(selectedUser).length} submitted` },
                  ].map(({ l, v }) => (
                    <Field key={l} label={l}>
                      <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027]">{v}</p>
                    </Field>
                  ))}
                </div>
              </Panel>

              {userBookings(selectedUser).length > 0 && (
                <div className="mt-5">
                  <p className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase text-[#7a6a5a]/50 mb-3">Booking History</p>
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