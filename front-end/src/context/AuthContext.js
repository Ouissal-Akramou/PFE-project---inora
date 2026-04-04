'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fonction pour récupérer le token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Fonction pour faire des appels authentifiés
  const authFetch = async (url, options = {}) => {
    const token = getToken();
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });
  };

  const fetchMe = async () => {
    try {
      const res = await authFetch(`${API}/api/auth/me`);
      if (res.status === 403) {
        setUser(null);
        router.push('/login?suspended=true');
        return;
      }
      if (!res.ok) throw new Error('Not logged in');
      const data = await res.json();
      setUser(data.user ?? data);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchMe()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const refreshUser = () => fetchMe().catch(() => {});

  const login = async (email, password, selectedRole, adminCode) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, role: selectedRole, adminCode: adminCode || undefined }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    const data = await res.json();
    
    // 🔥 STOCKER LE TOKEN DANS localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    setUser(data.user ?? data);
    return data;
  };

  const register = async (fullName, email, password, adminCode) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fullName, email, password, adminCode: adminCode || undefined }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    
    // 🔥 STOCKER LE TOKEN DANS localStorage (si le register renvoie un token)
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    setUser(data.user ?? data);
    return data;
  };

  const logout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    // 🔥 SUPPRIMER LE TOKEN
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');     // ← redirect to landing page
    router.refresh();     // ← force re-render so Navbar/DraftBanner reset
  };

  return (
    <AuthContext.Provider value={{ 
      user, setUser, login, register, logout, loading, refreshUser, 
      authFetch, getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}