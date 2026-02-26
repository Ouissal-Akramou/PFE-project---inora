'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2500);
      } else {
        setMessage(data.message || 'Reset failed. Please try again.');
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-12 border border-[#C87D87]/20 text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#6B7556] mb-4">Invalid Reset Link</h1>
          <p className="text-[#C87D87] mb-8">The reset link is invalid or expired.</p>
          <Link 
            href="/login"
            className="inline-block bg-gradient-to-r from-[#6B7556] to-[#556b42] text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-lg"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center -z-20" 
           style={{ 
             backgroundImage: "url('https://images.unsplash.com/photo-1517486808906-6ca8b3f04846')" 
           }}
      />
      <div className="absolute inset-0 animate-gradient-bg -z-10 opacity-70"></div>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-10 border border-[#C87D87]/20 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#6B7556] mb-2 tracking-tight">
            Reset Password
          </h1>
          <p className="text-[#C87D87] text-lg">
            Enter your new password below.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-[#6B7556] font-medium mb-2">
            New Password <span className="text-sm text-[#C87D87]">(6+ characters)</span>
          </label>
          <div className="relative">
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-[#C87D87]/30 bg-white/70 backdrop-blur-sm text-[#6B7556] placeholder-[#C87D87] focus:outline-none focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/30 transition-all duration-200 shadow-sm"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C87D87] hover:text-[#6B7556] transition-colors"
            >
              {passwordVisible ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || password.length < 6}
          className="w-full mt-6 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6B7556] to-[#556b42] hover:scale-[1.02] transition-all duration-200 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        {message && (
          <p className={`mt-6 p-3 rounded-lg text-center font-medium text-sm ${
            message.includes('successfully') || message.includes('Redirecting') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </p>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/login" 
            className="block text-[#C87D87] hover:text-[#6B7556] font-medium transition-colors mb-2"
          >
            ← Back to Login
          </Link>
        </div>
      </form>

      <style jsx>{`
        .animate-gradient-bg {
          background: linear-gradient(-45deg, #FBEAD6, #C87D87, #6B7556, #C87D87);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
        @keyframes gradientBG {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
