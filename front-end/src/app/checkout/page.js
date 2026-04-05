'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const PRICE_PER_PERSON = 150;
const ADVANCE_AMOUNT   = 250;

const CROSSHATCH_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cline x1='0' y1='1' x2='18' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='0' x2='1' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='1' x2='62' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='0' x2='79' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='0' y1='79' x2='18' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='80' x2='1' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='79' x2='62' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='80' x2='79' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Crect x='2' y='2' width='3.5' height='3.5' transform='rotate(45 3.75 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='2' width='3.5' height='3.5' transform='rotate(45 75.25 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='2' y='73.5' width='3.5' height='3.5' transform='rotate(45 3.75 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='73.5' width='3.5' height='3.5' transform='rotate(45 75.25 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Ccircle cx='3.75' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='3.75' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3C/svg%3E")`;

const stripeElementStyle = {
  base: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle:  'italic',
    fontSize:   '14px',
    color:      '#3a3027',
    letterSpacing: '0.03em',
    '::placeholder': { color: 'rgba(58,48,39,0.28)' },
  },
  invalid: { color: '#C87D87' },
};

function OrnamentDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-[#3a3027]/6" />
      <svg width="8" height="8" viewBox="0 0 8 8">
        <rect x="1" y="1" width="6" height="6" transform="rotate(45 4 4)"
          fill="none" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.38" />
      </svg>
      <div className="flex-1 h-px bg-[#3a3027]/6" />
    </div>
  );
}

// ════════════════════════════════════════
//  PAYMENT FORM
// ════════════════════════════════════════
function PaymentForm({ booking, bookingId, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();

  const [name,     setName]     = useState('');
  const [paying,   setPaying]   = useState(false);
  const [error,    setError]    = useState(null);
  const [focused,  setFocused]  = useState(null);
  const [payMode,  setPayMode]  = useState('advance');

  const participants = parseInt(booking?.participants) || 1;
  const totalAmount  = participants * PRICE_PER_PERSON;
  const remaining    = totalAmount - ADVANCE_AMOUNT;
  const amountToPay  = payMode === 'full' ? totalAmount : ADVANCE_AMOUNT;

  const fieldWrap = (field) =>
    `rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border transition-all duration-300 ${
      focused === field
        ? 'bg-white/95 border-[#C87D87]/50 shadow-[0_0_0_3px_rgba(200,125,135,0.07)]'
        : 'bg-white/65 border-[#3a3027]/12 hover:border-[#C87D87]/30'
    }`;

  const friendlyError = (code) => ({
    card_declined:      'Card declined. Please try another card.',
    incorrect_cvc:      'Incorrect CVC.',
    expired_card:       'Card has expired.',
    insufficient_funds: 'Insufficient funds.',
    incorrect_number:   'Incorrect card number.',
    processing_error:   'Processing error. Please try again.',
  }[code] || 'Payment declined. Please check your details.');

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !name.trim()) return;
    setError(null);
    setPaying(true);
    try {
      const intentRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-intent`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, payMode }),
        }
      );
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.error || 'Server error');

      const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(
        intentData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: { name },
          },
        }
      );
      if (stripeErr) throw new Error(friendlyError(stripeErr.code));
      if (paymentIntent.status !== 'succeeded')
        throw new Error('Payment did not go through. Please retry.');

      const confirmRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/confirm`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id, bookingId, payMode }),
        }
      );
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.error || 'Confirmation error');
      onSuccess(payMode, amountToPay);
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .pay-enter { animation: fadeInUp .3s cubic-bezier(.4,0,.2,1) both; }
        input::placeholder { color: rgba(58,48,39,0.30); font-style: italic; }
        @keyframes modeSlide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .mode-enter { animation: modeSlide .25s ease both; }
      `}</style>

      {/* ── Step heading ── */}
      <div className="flex items-start justify-between mb-6 sm:mb-8 px-1 pay-enter">
        <div>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/60 text-[0.68rem] sm:text-[0.72rem] tracking-[0.38em] uppercase mb-2">
            Step 2 of 3
          </p>
          <h1 className="font-['Playfair_Display',serif] italic text-[1.6rem] sm:text-[1.9rem] md:text-[2.4rem] text-[#3a3027] leading-none">
            Payment<span className="text-[#C87D87]">.</span>
          </h1>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/65 text-[0.9rem] sm:text-[1rem] mt-2">
            Choose how you'd like to pay for your experience.
          </p>
        </div>
        <span className="font-['Playfair_Display',serif] italic text-[3.5rem] sm:text-[4rem] md:text-[5rem] text-[#C87D87]/8 leading-none select-none mt-1 hidden sm:block">02</span>
      </div>

      {/* ── Booking summary pill ── */}
      <div
        className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-3 sm:px-4 py-2 mb-5 sm:mb-6 rounded-xl pay-enter"
        style={{ background: 'rgba(107,117,86,0.09)', border: '1px solid rgba(107,117,86,0.18)' }}
      >
        <span className="text-[#6B7556] text-sm sm:text-base">◈</span>

        <span className="font-['Cormorant_Garamond',serif] italic text-[#3a3027]/85 text-[0.9rem] sm:text-[1rem]">
          {booking?.activity || 'Your activity'}
        </span>

        {booking?.date && (
          <span className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/55 text-[0.75rem] sm:text-[0.85rem] before:content-['·'] before:mr-1.5 before:opacity-40">
            {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        )}

        {booking?.timeSlot && (
          <span className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/55 text-[0.75rem] sm:text-[0.85rem] before:content-['·'] before:mr-1.5 before:opacity-40">
            {booking.timeSlot}
          </span>
        )}

        <span className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/55 text-[0.75rem] sm:text-[0.85rem] before:content-['·'] before:mr-1.5 before:opacity-40">
          {participants} {participants === 1 ? 'guest' : 'guests'}
        </span>
      </div>

      {/* ════════════════════════════════════
           PAYMENT MODE SELECTOR
          ════════════════════════════════════ */}
      <div className="mb-5 sm:mb-6 pay-enter">
        <p
          className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-[0.65rem] tracking-[0.22em] uppercase font-semibold mb-2 sm:mb-3"
          style={{ color: 'rgba(90,74,58,0.55)' }}
        >
          How would you like to pay?
        </p>
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">

          {/* Option A — Advance only */}
          <button
            type="button"
            onClick={() => setPayMode('advance')}
            className="relative text-left rounded-2xl p-3 sm:p-4 border-2 transition-all duration-300 focus:outline-none w-full"
            style={{
              background:
                payMode === 'advance'
                  ? 'linear-gradient(135deg,rgba(200,125,135,0.08),rgba(200,125,135,0.04))'
                  : 'rgba(255,255,255,0.50)',
              borderColor:
                payMode === 'advance'
                  ? 'rgba(200,125,135,0.45)'
                  : 'rgba(58,48,39,0.10)',
              boxShadow:
                payMode === 'advance'
                  ? '0 0 0 3px rgba(200,125,135,0.06)'
                  : 'none',
            }}
          >
            <div
              className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200"
              style={{
                borderColor: payMode === 'advance' ? '#C87D87' : 'rgba(58,48,39,0.18)',
                background: payMode === 'advance' ? '#C87D87' : 'transparent',
              }}
            >
              {payMode === 'advance' && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2.5" stroke="#FBEAD6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            <p
              className="font-['Cormorant_Garamond',serif] text-[0.55rem] sm:text-[0.58rem] tracking-[0.22em] uppercase font-semibold mb-1"
              style={{ color: payMode === 'advance' ? '#C87D87' : 'rgba(90,74,58,0.45)' }}
            >
              Advance only
            </p>
            <p className="font-['Playfair_Display',serif] italic text-[1.3rem] sm:text-[1.5rem] leading-none text-[#3a3027] mb-1">
              {ADVANCE_AMOUNT} <span className="text-[0.65rem] sm:text-[0.75rem] text-[#7a6a5a]/50">MAD</span>
            </p>
            <p
              className="font-['Cormorant_Garamond',serif] italic text-[0.68rem] sm:text-[0.72rem] leading-snug"
              style={{ color: 'rgba(90,74,58,0.50)' }}
            >
              Pay now to confirm. <span style={{ color: '#C87D87' }}>{remaining} MAD</span> due on the day.
            </p>
          </button>

          {/* Option B — Full payment */}
          <button
            type="button"
            onClick={() => setPayMode('full')}
            className="relative text-left rounded-2xl p-3 sm:p-4 border-2 transition-all duration-300 focus:outline-none w-full"
            style={{
              background:
                payMode === 'full'
                  ? 'linear-gradient(135deg,rgba(107,117,86,0.10),rgba(107,117,86,0.05))'
                  : 'rgba(255,255,255,0.50)',
              borderColor:
                payMode === 'full'
                  ? 'rgba(107,117,86,0.45)'
                  : 'rgba(58,48,39,0.10)',
              boxShadow:
                payMode === 'full'
                  ? '0 0 0 3px rgba(107,117,86,0.06)'
                  : 'none',
            }}
          >
            <div
              className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200"
              style={{
                borderColor: payMode === 'full' ? '#6B7556' : 'rgba(58,48,39,0.18)',
                background: payMode === 'full' ? '#6B7556' : 'transparent',
              }}
            >
              {payMode === 'full' && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2.5" stroke="#FBEAD6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            <p
              className="font-['Cormorant_Garamond',serif] text-[0.55rem] sm:text-[0.58rem] tracking-[0.22em] uppercase font-semibold mb-1"
              style={{ color: payMode === 'full' ? '#6B7556' : 'rgba(90,74,58,0.45)' }}
            >
              Full payment
            </p>
            <p className="font-['Playfair_Display',serif] italic text-[1.3rem] sm:text-[1.5rem] leading-none text-[#3a3027] mb-1">
              {totalAmount} <span className="text-[0.65rem] sm:text-[0.75rem] text-[#7a6a5a]/50">MAD</span>
            </p>
            <p
              className="font-['Cormorant_Garamond',serif] italic text-[0.68rem] sm:text-[0.72rem] leading-snug"
              style={{ color: 'rgba(90,74,58,0.50)' }}
            >
              Everything settled online.{' '}
              <span style={{ color: '#6B7556' }}>Nothing to pay on the day.</span>
            </p>
          </button>
        </div>

        {/* Dynamic summary line under selector */}
        <div
          key={payMode}
          className="mode-enter mt-3 flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl"
          style={{
            background:
              payMode === 'full'
                ? 'rgba(107,117,86,0.07)'
                : 'rgba(200,125,135,0.06)',
            border: `1px solid ${payMode === 'full' ? 'rgba(107,117,86,0.14)' : 'rgba(200,125,135,0.14)'}`,
          }}
        >
          <span style={{ color: payMode === 'full' ? '#6B7556' : '#C87D87', fontSize: '0.7rem' }}>✦</span>
          <p
            className="font-['Cormorant_Garamond',serif] italic text-[0.72rem] sm:text-[0.78rem]"
            style={{ color: payMode === 'full' ? 'rgba(107,117,86,0.80)' : 'rgba(200,125,135,0.80)' }}
          >
            {payMode === 'full'
              ? `You'll be charged ${totalAmount} MAD now. Nothing owed on arrival.`
              : `You'll be charged ${ADVANCE_AMOUNT} MAD now. ${remaining} MAD payable on the day.`}
          </p>
        </div>
      </div>
      {/* ════════════════════════════════════ */}

      <OrnamentDivider />

      {/* ── Decorative card mockup ── */}
      <div
        className="mb-5 sm:mb-6 rounded-2xl overflow-hidden relative pay-enter"
        style={{
          background: 'linear-gradient(135deg,#3a3027 0%,#4a5240 55%,#3d3028 100%)',
          boxShadow: '0 8px 28px rgba(58,48,39,0.16)',
          height: '96px',
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(251,234,214,1) 1px,transparent 1px),linear-gradient(90deg,rgba(251,234,214,1) 1px,transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          className="absolute -top-3 -right-3 w-20 h-20 rounded-full"
          style={{
            background: 'radial-gradient(circle,rgba(200,125,135,0.22) 0%,transparent 70%)',
            filter: 'blur(12px)',
          }}
        />
        <div className="relative h-full p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div
              className="w-6 h-4 rounded-md overflow-hidden"
              style={{
                background: 'linear-gradient(135deg,rgba(251,234,214,0.28),rgba(200,125,135,0.18))',
              }}
            >
              <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-px p-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-sm bg-[#FBEAD6]/15" />
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#6B7556]/50" />
              <div className="w-3 h-3 rounded-full bg-[#C87D87]/40 -ml-1" />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[0.35rem] tracking-widest uppercase text-[#FBEAD6]/18 mb-0.5">
                Cardholder
              </p>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/55 text-[0.6rem] sm:text-[0.68rem] tracking-wider uppercase">
                {name || 'YOUR NAME'}
              </p>
            </div>
            <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/22 text-[0.5rem] sm:text-[0.56rem] tracking-widest">
              INORA PAY
            </p>
          </div>
        </div>
      </div>

      {/* ── Card fields ── */}
      <div className="space-y-4 sm:space-y-5 pay-enter">
        <div>
          <p className="font-['Cormorant_Garamond',serif] text-[0.68rem] sm:text-[0.72rem] uppercase tracking-[0.18em] text-[#4a3a2a]/65 mb-1.5 sm:mb-2 select-none font-semibold">
            Card Number
          </p>
          <div className={fieldWrap('number')}>
            <CardNumberElement
              options={{ style: stripeElementStyle, showIcon: true }}
              onFocus={() => setFocused('number')}
              onBlur={() => setFocused(null)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <div>
            <p className="font-['Cormorant_Garamond',serif] text-[0.68rem] sm:text-[0.72rem] uppercase tracking-[0.18em] text-[#4a3a2a]/65 mb-1.5 sm:mb-2 select-none font-semibold">
              Expiry
            </p>
            <div className={fieldWrap('expiry')}>
              <CardExpiryElement
                options={{ style: stripeElementStyle }}
                onFocus={() => setFocused('expiry')}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>
          <div>
            <p className="font-['Cormorant_Garamond',serif] text-[0.68rem] sm:text-[0.72rem] uppercase tracking-[0.18em] text-[#4a3a2a]/65 mb-1.5 sm:mb-2 select-none font-semibold">
              CVC
            </p>
            <div className={fieldWrap('cvc')}>
              <CardCvcElement
                options={{ style: stripeElementStyle }}
                onFocus={() => setFocused('cvc')}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="font-['Cormorant_Garamond',serif] text-[0.68rem] sm:text-[0.72rem] uppercase tracking-[0.18em] text-[#4a3a2a]/65 mb-1.5 sm:mb-2 select-none font-semibold">
            Name on Card
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
            placeholder="First LAST"
            className={`w-full font-['Cormorant_Garamond',serif] italic text-[#3a3027] text-[0.9rem] sm:text-[1rem] bg-white/65 border border-[#3a3027]/12 rounded-xl px-3 sm:px-4 py-2.5 outline-none transition-all duration-200 ${
              focused === 'name'
                ? 'bg-white/95 border-[#C87D87]/50 shadow-[0_0_0_3px_rgba(200,125,135,0.07)]'
                : 'hover:border-[#C87D87]/30'
            }`}
          />
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="flex items-center gap-3 px-3 sm:px-4 py-3 mt-4 sm:mt-5 rounded-xl"
          style={{
            background: 'rgba(200,125,135,0.07)',
            border: '1px solid rgba(200,125,135,0.22)',
          }}
        >
          <span className="text-[#C87D87] flex-shrink-0 text-sm sm:text-base">⚠</span>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-[0.85rem] sm:text-[0.95rem]">
            {error}
          </p>
        </div>
      )}

      <OrnamentDivider />

      {/* ── Security note ── */}
      <div
        className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 mb-5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl"
        style={{ background: 'rgba(107,117,86,0.07)', border: '1px solid rgba(107,117,86,0.14)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0"
          style={{ color: 'rgba(107,117,86,0.55)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
        <p
          className="font-['Cormorant_Garamond',serif] text-[0.55rem] sm:text-[0.65rem] tracking-[0.1em] uppercase flex-1"
          style={{ color: 'rgba(107,117,86,0.65)' }}
        >
          SSL 256-bit · Powered by Stripe · No card data stored
        </p>
        <div className="flex gap-1 sm:gap-1.5">
          {['VISA', 'MC', 'CB'].map((b) => (
            <span
              key={b}
              className="font-['Cormorant_Garamond',serif] text-[0.42rem] sm:text-[0.46rem] uppercase border rounded-md px-1 sm:px-1.5 py-0.5"
              style={{ color: 'rgba(90,74,58,0.38)', borderColor: 'rgba(58,48,39,0.12)' }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* ── Pay button ── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-5 border-t border-[#3a3027]/6">
        <Link
          href="/account"
          className="font-['Cormorant_Garamond',serif] text-[0.8rem] sm:text-[0.82rem] tracking-[0.16em] uppercase px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-[#3a3027]/10 text-[#7a6a5a]/65 hover:border-[#3a3027]/18 hover:text-[#7a6a5a]/90 hover:bg-white/40 transition-all duration-200 flex items-center justify-center order-2 sm:order-1"
        >
          ← Back
        </Link>
        <button
          type="submit"
          disabled={paying || !stripe}
          className="relative overflow-hidden group font-['Cormorant_Garamond',serif] text-[0.8rem] sm:text-[0.82rem] tracking-[0.24em] uppercase text-[#FBEAD6] py-2.5 sm:py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed order-1 sm:order-2"
          style={{
            background:
              payMode === 'full'
                ? 'linear-gradient(135deg,#6B7556 0%,#4a5240 50%,#6B7556 100%)'
                : 'linear-gradient(135deg,#C87D87 0%,#b36d77 50%,#C87D87 100%)',
            boxShadow: paying
              ? 'none'
              : payMode === 'full'
              ? '0 5px 20px rgba(107,117,86,0.28)'
              : '0 5px 20px rgba(200,125,135,0.28)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
          {paying ? (
            <>
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-[#FBEAD6]/30 border-t-[#FBEAD6] animate-spin" />
              <span>Processing…</span>
            </>
          ) : (
            <>
              <span className="opacity-40 text-[0.4rem] sm:text-[0.45rem]">◆</span>
              <span>Pay {amountToPay} MAD</span>
              <span className="opacity-40 text-[0.4rem] sm:text-[0.45rem]">◆</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ════════════════════════════════════════
//  PAGE
// ════════════════════════════════════════
export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const bookingId    = searchParams.get('bookingId');

  const [booking,      setBooking]      = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error,        setError]        = useState(null);
  const [paid,         setPaid]         = useState(false);
  const [paidMode,     setPaidMode]     = useState('advance');
  const [paidAmount,   setPaidAmount]   = useState(ADVANCE_AMOUNT);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided.');
      setFetchLoading(false);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Booking not found');
        return res.json();
      })
      .then((data) => {
        if (data.paymentStatus === 'PAID') setPaid(true);
        setBooking(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setFetchLoading(false));
  }, [bookingId]);

  // ── Loading ──
  if (loading || fetchLoading) return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg,#4e5a3c 0%,#6B7556 45%,#5a6347 80%,#4a5535 100%)' }}
    >
      <style>{`
        @keyframes laceRotate  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes laceCounter { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes lacePulse   { 0%,100%{opacity:.45} 50%{opacity:1} }
        @keyframes floatOrb    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      `}</style>
      <div className="absolute top-10 left-10 w-48 sm:w-64 h-48 sm:h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(251,234,214,0.10) 0%,transparent 70%)', animation: 'floatOrb 10s ease-in-out infinite', filter: 'blur(18px)' }} />
      <div className="absolute bottom-10 right-10 w-56 sm:w-72 h-56 sm:h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(200,125,135,0.12) 0%,transparent 70%)', animation: 'floatOrb 13s ease-in-out infinite 2s', filter: 'blur(22px)' }} />
      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-5 px-4">
        <div className="relative w-20 sm:w-24 h-20 sm:h-24 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96" style={{ animation: 'laceRotate 8s linear infinite' }}>
            <circle cx="48" cy="48" r="44" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.35" strokeDasharray="3 5" />
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => {
              const r = (a * Math.PI) / 180;
              return (
                <g key={i}>
                  <line x1={48+Math.cos(r)*20} y1={48+Math.sin(r)*20} x2={48+Math.cos(r)*44} y2={48+Math.sin(r)*44} stroke="#FBEAD6" strokeWidth="0.5" strokeOpacity="0.28" />
                  <circle cx={48+Math.cos(r)*44} cy={48+Math.sin(r)*44} r="1.2" fill="#FBEAD6" fillOpacity="0.45" />
                </g>
              );
            })}
          </svg>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96" style={{ animation: 'laceCounter 6s linear infinite' }}>
            <circle cx="48" cy="48" r="30" fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.38" />
            {[0,45,90,135,180,225,270,315].map((a, i) => {
              const r = (a * Math.PI) / 180;
              return (
                <g key={i}>
                  <circle cx={48+Math.cos(r)*30} cy={48+Math.sin(r)*30} r="2" fill="none" stroke="#FBEAD6" strokeWidth="0.5" strokeOpacity="0.50" />
                  <line x1={48+Math.cos(r)*30} y1={48+Math.sin(r)*30} x2={48+Math.cos(r)*20} y2={48+Math.sin(r)*20} stroke="#FBEAD6" strokeWidth="0.4" strokeOpacity="0.28" />
                </g>
              );
            })}
          </svg>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96" style={{ animation: 'lacePulse 2s ease-in-out infinite' }}>
            <circle cx="48" cy="48" r="14" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.42" />
            <rect x="43" y="43" width="10" height="10" transform="rotate(45 48 48)" fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.62" />
            <circle cx="48" cy="48" r="2.5" fill="#FBEAD6" fillOpacity="0.52" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="font-['Playfair_Display',serif] italic text-[#FBEAD6]/75 text-lg sm:text-xl">Inora</p>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/40 text-[0.65rem] sm:text-[0.7rem] tracking-[0.4em] uppercase">Preparing payment…</p>
        </div>
      </div>
    </div>
  );

  if (!user) return null;

  const participants = parseInt(booking?.participants) || 1;
  const totalAmount  = participants * PRICE_PER_PERSON;
  const remaining    = totalAmount - ADVANCE_AMOUNT;

  // ── Error ──
  if (error) return (
    <div className="min-h-screen relative overflow-x-hidden flex items-center justify-center px-4"
      style={{ backgroundColor: '#FBEAD6', backgroundImage: CROSSHATCH_SVG }}>
      <div className="text-center max-w-sm w-full rounded-2xl overflow-hidden mx-4"
        style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(58,48,39,0.08)', boxShadow: '0 1px 8px rgba(58,48,39,0.04)' }}>
        <div className="px-4 sm:px-5 py-2.5 sm:py-3" style={{ background: 'rgba(255,255,255,0.40)', borderBottom: '1px solid rgba(58,48,39,0.06)' }}>
          <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.22em] font-semibold" style={{ color: 'rgba(90,74,58,0.60)' }}>Error</p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(200,125,135,0.09)', border: '1px solid rgba(200,125,135,0.22)' }}>
            <span className="text-[#C87D87] text-sm sm:text-base">✕</span>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a] text-[0.85rem] sm:text-[0.95rem] mb-5 sm:mb-6 text-center">{error}</p>
          <Link href="/account"
            className="font-['Cormorant_Garamond',serif] text-[0.8rem] sm:text-[0.82rem] tracking-[0.16em] uppercase px-5 sm:px-6 py-2.5 rounded-xl border border-[#3a3027]/10 text-[#7a6a5a]/65 hover:border-[#3a3027]/18 hover:bg-white/40 transition-all duration-200 inline-block w-full sm:w-auto text-center">
            ← Back
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Success ──
  if (paid) return (
    <div className="min-h-screen relative overflow-x-hidden flex items-center justify-center px-4"
      style={{ backgroundColor: '#FBEAD6', backgroundImage: CROSSHATCH_SVG }}>
      <style>{`
        @keyframes checkDraw { to { stroke-dashoffset: 0 } }
        @keyframes ringPop   { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="max-w-md w-full rounded-2xl overflow-hidden mx-4"
        style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(58,48,39,0.08)', boxShadow: '0 1px 8px rgba(58,48,39,0.04)' }}>
        <div className="px-4 sm:px-5 py-2.5 sm:py-3"
          style={{ background: 'rgba(255,255,255,0.40)', borderBottom: '1px solid rgba(58,48,39,0.06)' }}>
          <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.22em] font-semibold"
            style={{ color: 'rgba(90,74,58,0.60)' }}>Payment Confirmed</p>
        </div>

        <div className="px-5 sm:px-8 py-6 sm:py-8 text-center">
          <div className="mx-auto mb-4 sm:mb-5 w-16 sm:w-20 h-16 sm:h-20" style={{ animation: 'ringPop .6s cubic-bezier(.34,1.56,.64,1) forwards' }}>
            <svg viewBox="0 0 80 80" className="w-full h-full">
              <circle cx="40" cy="40" r="36" fill="rgba(107,117,86,0.07)" stroke="rgba(107,117,86,0.22)" strokeWidth="1.2" />
              <path d="M24 40 L35 51 L56 29" fill="none" stroke="#6B7556" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" strokeDasharray="44" strokeDashoffset="44"
                style={{ animation: 'checkDraw .5s ease .45s forwards' }} />
            </svg>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/60 text-[0.65rem] sm:text-[0.72rem] tracking-[0.38em] uppercase mb-1"
            style={{ animation: 'fadeInUp .4s ease .5s both' }}>Step 3 of 3</p>
          <h2 className="font-['Playfair_Display',serif] italic text-[1.8rem] sm:text-[2rem] md:text-[2.4rem] text-[#3a3027] leading-none mb-1"
            style={{ animation: 'fadeInUp .4s ease .55s both' }}>
            You&apos;re confirmed<span className="text-[#C87D87]">.</span>
          </h2>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/65 text-[0.9rem] sm:text-[1rem] mt-2 mb-5 sm:mb-6"
            style={{ animation: 'fadeInUp .4s ease .58s both' }}>
            {paidMode === 'full'
              ? 'Fully paid. Nothing owed on arrival. See you soon!'
              : 'Your place is secured. See you soon.'}
          </p>
        </div>

        <div style={{ animation: 'fadeInUp .4s ease .6s both' }}>
          {(paidMode === 'full'
            ? [
                { l: 'Activity',     v: booking?.activity || '—' },
                { l: 'Participants', v: `${participants} ${participants === 1 ? 'person' : 'people'}` },
                { l: 'Paid in full', v: `${paidAmount} MAD`, c: 'text-[#6B7556]', big: true },
                { l: 'Due on arrival', v: '0 MAD', c: 'text-[#3a3027]' },
              ]
            : [
                { l: 'Activity',      v: booking?.activity || '—' },
                { l: 'Participants',  v: `${participants} ${participants === 1 ? 'person' : 'people'}` },
                { l: 'Total service', v: `${totalAmount} MAD`,      c: 'text-[#3a3027]' },
                { l: 'Advance paid',  v: `− ${paidAmount} MAD`,     c: 'text-[#6B7556]' },
                { l: 'Remaining',     v: `${remaining} MAD`,         c: 'text-[#C87D87]', big: true },
              ]
          ).map(({ l, v, c, big }, idx, arr) => (
            <div key={l} className="flex justify-between items-baseline px-5 sm:px-6 py-2 sm:py-2.5 flex-wrap gap-2"
              style={{ borderBottom: idx < arr.length - 1 ? '1px solid rgba(58,48,39,0.05)' : 'none' }}>
              <span className="font-['Cormorant_Garamond',serif] text-[0.6rem] sm:text-[0.63rem] uppercase tracking-[0.14em] flex-shrink-0 mr-2 font-semibold"
                style={{ color: 'rgba(90,74,58,0.50)' }}>{l}</span>
              <span className={`font-['Playfair_Display',serif] italic text-right ${big ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'} ${c || 'text-[#3a3027]'}`}>{v}</span>
            </div>
          ))}
        </div>

        <div className="px-5 sm:px-6 py-5 sm:py-6" style={{ animation: 'fadeInUp .4s ease .7s both' }}>
          <Link href="/account#bookings"
            className="relative overflow-hidden group font-['Cormorant_Garamond',serif] text-[0.8rem] sm:text-[0.82rem] tracking-[0.24em] uppercase text-[#FBEAD6] py-2.5 sm:py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 w-full"
            style={{ background: 'linear-gradient(135deg,#6B7556 0%,#4a5240 100%)', boxShadow: '0 5px 18px rgba(107,117,86,0.26)' }}>
            <span className="opacity-40 text-[0.4rem] sm:text-[0.45rem]">◆</span>
            <span>View My Bookings</span>
            <span className="opacity-40 text-[0.4rem] sm:text-[0.45rem]">◆</span>
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Main ──
  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: '#FBEAD6', backgroundImage: CROSSHATCH_SVG }}>
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .pay-enter { animation: fadeInUp .3s cubic-bezier(.4,0,.2,1) both; }
        input::placeholder, textarea::placeholder { color: rgba(58,48,39,0.30); font-style: italic; }
      `}</style>

      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C87D87]/30 to-transparent z-50" />

      <header className="sticky top-0 z-40 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between"
        style={{ backgroundColor: '#6B7556', boxShadow: '0 2px 20px rgba(40,50,30,0.18)', borderBottom: '1px solid rgba(251,234,214,0.10)' }}>
        <Link href="/account"
          className="group flex items-center gap-1 font-['Cormorant_Garamond',serif] italic text-[0.8rem] sm:text-[0.85rem] transition-colors duration-200"
          style={{ color: 'rgba(251,234,214,0.60)' }}>
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="font-['Playfair_Display',serif] italic text-[#FBEAD6] text-[1rem] sm:text-[1.1rem] leading-tight">Inora</span>
        </div>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {['Booking', 'Payment', 'Done'].map((s, i) => (
            <div key={s} className="flex items-center gap-0.5 sm:gap-1">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  fontSize: '0.38rem',
                  fontWeight: 700,
                  background: i < 1 ? 'rgba(251,234,214,0.20)' : i === 1 ? '#C87D87' : 'rgba(251,234,214,0.06)',
                  color: i <= 1 ? '#FBEAD6' : 'rgba(251,234,214,0.18)',
                  boxShadow: i === 1 ? '0 0 8px rgba(200,125,135,0.40)' : 'none',
                }}>
                {i < 1 ? '✓' : i + 1}
              </div>
              <span className="font-['Cormorant_Garamond',serif] text-[0.48rem] sm:text-[0.54rem] tracking-[0.12em] uppercase hidden sm:block"
                style={{ color: i === 1 ? 'rgba(251,234,214,0.75)' : 'rgba(251,234,214,0.22)' }}>{s}</span>
              {i < 2 && <div className="w-1.5 sm:w-2.5 h-px mx-0.5" style={{ background: 'rgba(251,234,214,0.10)' }} />}
            </div>
          ))}
        </nav>
      </header>

      <div className="h-3 sm:h-5" style={{ background: 'linear-gradient(to bottom, rgba(107,117,86,0.10), transparent)' }} />

      <main className="w-full max-w-lg mx-auto px-3 sm:px-6 pb-16 sm:pb-20 relative z-10">
        <Elements stripe={stripePromise}>
          <PaymentForm
            booking={booking}
            bookingId={bookingId}
            onSuccess={(mode, amount) => {
              setPaidMode(mode);
              setPaidAmount(amount);
              setPaid(true);
            }}
          />
        </Elements>
      </main>
    </div>
  );
}