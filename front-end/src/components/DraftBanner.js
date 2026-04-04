'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DraftBanner() {
  const [draft, setDraft] = useState(null);
  const { authFetch } = useAuth();  // ← AJOUTER CETTE LIGNE

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drafts`);  // ← MODIFIER ICI
        if (res.ok) {
          const data = await res.json();
          if (data?.id) setDraft(data);
        }
      } catch (err) {
        console.error('Failed to load draft:', err);
      }
    };
    loadDraft();
  }, [authFetch]);

  const deleteDraft = async () => {
    if (!draft?.id) return;
    try {
      await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drafts/${draft.id}`, {  // ← MODIFIER ICI
        method: 'DELETE',
      });
      setDraft(null);
    } catch (err) {
      console.error('Failed to delete draft:', err);
    }
  };

  if (!draft) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 bg-[#6B7556] text-[#FBEAD6] px-4 py-2 rounded-xl shadow-lg border border-[#FBEAD6]/20">
      <div className="flex items-center gap-3">
        <span className="text-sm">✧</span>
        <p className="font-['Cormorant_Garamond',serif] italic text-sm">
          You have an unfinished booking.
        </p>
        <Link href={`/book?draftId=${draft.id}`}
          className="font-['Cormorant_Garamond',serif] text-xs uppercase tracking-wider bg-[#FBEAD6]/20 px-3 py-1 rounded-lg hover:bg-[#FBEAD6]/30 transition-colors">
          Resume
        </Link>
        <button onClick={deleteDraft}
          className="font-['Cormorant_Garamond',serif] text-xs uppercase tracking-wider text-[#FBEAD6]/60 hover:text-[#FBEAD6] transition-colors">
          ✕
        </button>
      </div>
    </div>
  );
}