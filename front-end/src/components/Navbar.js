// src/components/Navbar.jsx - FULL WORKING
'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-6 text-white bg-transparent backdrop-blur-md border-b border-white/20">
      <h1 className="text-2xl font-bold tracking-widest">inora</h1>
      
      <ul className="hidden md:flex gap-12 text-sm font-medium tracking-wide uppercase">
        <li><Link href="/" className="hover:text-[#C87D87] transition">Home</Link></li>
        <li><Link href="#about" className="hover:text-[#C87D87] transition">About</Link></li>
        <li><Link href="#services" className="hover:text-[#C87D87] transition">Services</Link></li>
        <li><Link href="#contact" className="hover:text-[#C87D87] transition">Contact</Link></li>
      </ul>
      
      {user ? (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#C87D87] rounded-full flex items-center justify-center text-white font-medium">
            {user.fullName?.charAt(0) || '?'}
          </div>
          <span className="font-medium hidden lg:block">{user.fullName}</span>
          <button 
            onClick={handleLogout}
            className="text-sm bg-red-500/20 hover:bg-red-500/30 px-4 py-1 rounded-full transition border border-red-500/30"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link 
          href="/login" 
          className="bg-gradient-to-r from-[#6B7556] to-[#556b42] px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-lg"
        >
          Login
        </Link>
      )}
    </nav>
  );
}
