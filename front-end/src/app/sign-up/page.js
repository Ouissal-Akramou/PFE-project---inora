'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function SignUp() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

 async function handleSubmit(e) {
  e.preventDefault();
  if (form.password !== form.confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  if (form.password.length < 6) {
    setError('Password must be at least 6 characters');
    return;
  }
  
  try {
    await register(form.fullName, form.email, form.password);
    router.refresh();  // refresh auth context
    router.push('/');
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed');
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Keep your exact design */}
      <div className="absolute inset-0 bg-cover bg-center -z-20" 
           style={{ backgroundImage: "url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e)" }} />
      <div className="absolute inset-0 animate-gradient-bg -z-10 opacity-70"></div>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-10 border border-[#C87D87]/20 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-[#6B7556] mb-1 tracking-tight">Create Account</h1>
          <p className="text-[#C87D87] text-md">Sign up to start your journey with us</p>
        </div>
        
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        
        <div className="space-y-4">
          <label className="block text-[#6B7556] font-medium mb-1">Full Name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-[#C87D87]/30 bg-white/70 backdrop-blur-sm text-[#6B7556] placeholder-[#C87D87] focus:outline-none focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/30 transition shadow-sm"
            required
          />
          
          <label className="block text-[#6B7556] font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-[#C87D87]/30 bg-white/70 backdrop-blur-sm text-[#6B7556] placeholder-[#C87D87] focus:outline-none focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/30 transition shadow-sm"
            required
          />
          
          <label className="block text-[#6B7556] font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-[#C87D87]/30 bg-white/70 backdrop-blur-sm text-[#6B7556] placeholder-[#C87D87] focus:outline-none focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/30 transition shadow-sm"
            required
            minLength={6}
          />
          
          <label className="block text-[#6B7556] font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-[#C87D87]/30 bg-white/70 backdrop-blur-sm text-[#6B7556] placeholder-[#C87D87] focus:outline-none focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/30 transition shadow-sm"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6B7556] to-[#556b42] hover:scale-105 transition shadow-lg hover:shadow-xl mt-4"
        >
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
        
        <p className="text-center text-[#6B7556] mt-4 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-[#C87D87] font-medium hover:text-[#6B7556] transition">
            Sign in
          </Link>
        </p>
      </form>
      
      {/* Your gradient CSS */}
      <style jsx>{`
        .animate-gradient-bg {
          background: linear-gradient(-45deg, #FBEAD6, #C87D87, #6B7556, #C87D87);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
