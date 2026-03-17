'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'; // Fallback pour local

  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 403) {
          setUser(null);
          router.push('/login?suspended=true');
          return;
        }
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => { if (data) setUser(data.user || data); })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [API_URL, router]);

  const login = async (email, password, selectedRole, adminCode) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email, password,
        role:      selectedRole,
        adminCode: adminCode || undefined,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    const data = await res.json();
    setUser(data.user || data);
    return data;
  };

  const register = async (fullName, email, password, adminCode) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        fullName, email, password,
        adminCode: adminCode || undefined,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    setUser(data.user || data);
    return data;
  };

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST', credentials: 'include',
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}