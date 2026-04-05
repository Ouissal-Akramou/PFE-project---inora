'use client';
import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: 'linear-gradient(150deg,#4e5a3c 0%,#6B7556 45%,#5a6347 80%,#4a5535 100%)' }}
      >
        <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/60 tracking-widest text-sm animate-pulse">
          Loading…
        </p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}