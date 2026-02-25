'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      // Your backend always returns "link sent" for security
      setMessage('If the email exists, check your inbox for reset instructions.');
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center -z-20" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c')" 
        }}
      />
      <div className="absolute inset-0 animate-gradient-bg -z-10 opacity-70"></div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-10 border border-[#C87D87]/20 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#6B7556] mb-2 tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-[#C87D87] text-lg">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-[#6B7556] font-medium mb-2">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#C87D87]/30 bg-white/70 backdrop-blur-sm text-[#6B7556] placeholder-[#C87D87] focus:outline-none focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/30 transition-all duration-200 shadow-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6B7556] to-[#556b42] hover:scale-[1.02] transition-all duration-200 shadow-xl hover:shadow-2xl disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {message && (
          <p className={`mt-6 p-3 rounded-lg text-center font-medium text-sm ${
            message.includes('inbox') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </p>
        )}

        <div className="mt-8 text-center space-y-2">
          <Link 
            href="/login" 
            className="block text-[#C87D87] hover:text-[#6B7556] font-medium transition-colors"
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
