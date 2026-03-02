'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');          // not logged in
      } else if (user.role !== 'admin') {
        router.push('/');               // logged in but not admin
      }
    }
  }, [user, loading]);

  if (loading || !user || user.role !== 'admin') return null;

  return <>{children}</>;
}
