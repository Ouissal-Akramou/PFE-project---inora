'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;
const AuthContext = createContext(null);

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const authFetch = useCallback(async (url, options = {}) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      setUser(null);
      router.push('/login?expired=true');
      throw new Error('Session expirée');
    }

    return response;
  }, [router]);

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authFetch(`${API}/api/profile/me`);
      if (res.status === 403) {
        router.push('/login?suspended=true');
        return;
      }
      if (!res.ok) throw new Error('Not logged in');
      const data = await res.json();
      setUser(data.user ?? data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authFetch, router]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password, selectedRole, adminCode) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, role: selectedRole, adminCode }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
    const data = await res.json();
    if (data.token) localStorage.setItem('token', data.token);
    setUser(data.user ?? data);
    return data;
  };

  const logout = async () => {
    await authFetch(`${API}/api/auth/logout`, { method: 'POST' }).catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, authFetch, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}