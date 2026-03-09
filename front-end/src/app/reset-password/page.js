// app/reset-password/page.tsx
'use client';
import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#6B7556]">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}