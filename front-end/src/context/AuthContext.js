'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;
const AuthContext = createContext(null);

// ─────────────── Helpers ───────────────
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const getToken = () => {
  return getCookie('token') || localStorage.getItem('token') || null;
};

// ─────────────── AuthProvider ───────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // blocks rendering until resolved
  const router = useRouter();

  // ─────────────── Authenticated fetch ───────────────
  const authFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    };
    return fetch(url, { ...options, credentials: 'include', headers });
  };

  // ─────────────── Fetch current user ───────────────
  const fetchMe = async () => {
    try {
      const res = await authFetch(`${API}/api/profile/me`);
      if (res.status === 403) {
        router.push('/login?suspended=true');
        return;
      }
      if (!res.ok) throw new Error('Not logged in');
      const data = await res.json();
      setUser(data.user ?? data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchMe()
      .finally(() => setLoading(false));
  }, []);

  const refreshUser = () => fetchMe().catch(() => {});

  // ─────────────── Login ───────────────
  const login = async (email, password, role, adminCode) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, role, adminCode }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    const data = await res.json();
    if (data.token) localStorage.setItem('token', data.token);
    setUser(data.user ?? data);
    return data;
  };

  // ─────────────── Register ───────────────
  const register = async (fullName, email, password, adminCode) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fullName, email, password, adminCode }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    if (data.token) localStorage.setItem('token', data.token);
    setUser(data.user ?? data);
    return data;
  };

  // ─────────────── Logout ───────────────
  const logout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  // ─────────────── Prevent rendering until ready ───────────────
  if (loading) return null; // optionally replace with <LoadingScreen />

  // ─────────────── Provider ───────────────
  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      register,
      logout,
      loading,
      refreshUser,
      authFetch,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────── Hook ───────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}