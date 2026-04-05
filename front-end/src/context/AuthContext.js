'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Ajoute had l'import

export default function DraftBanner() {
  const router = useRouter();
  const { user, authFetch, loading } = useAuth(); // Jib authFetch mn context
  const [draft, setDraft] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Tstanna 7ta ykoun loading finished o user connecté
    if (loading) return;
    
    // Ma tb3atch request ila makaynch user (mader login)
    if (!user) return;

    // Khdem b authFetch (kayzid token otomatiquement)
    authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drafts`)
      .then(async (r) => {
        if (r.ok) {
          const d = await r.json();
          if (d?.id) {
            setDraft(d);
            setVisible(true);
          }
        }
        return null;
      })
      .catch(() => {});
  }, [user, loading, authFetch]); // Tcharge fach user tbeddel

  const discard = async () => {
    if (!draft?.id) return;
    
    // Khdem b authFetch l DELETE
    await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drafts/${draft.id}`, {
      method: 'DELETE'
    });
    setDraft(null);
    setVisible(false);
  };

  const resume = () => router.push('/book');

  if (!visible || !draft) return null;

  const fd = draft.formData || {};

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
      style={{ animation: 'fadeInUp .4s ease both' }}>
      <div className="bg-[#FBEAD6] border border-[#C87D87]/25 rounded-2xl px-5 py-4
        shadow-[0_12px_40px_rgba(58,48,39,0.14)] flex items-center gap-4">

        <div className="w-9 h-9 rounded-xl bg-[#C87D87]/10 border border-[#C87D87]/20
          flex items-center justify-center flex-shrink-0">
          <span className="text-[#C87D87] text-sm">◈</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-['Playfair_Display',serif] italic text-[#3a3027] text-sm leading-tight">
            You have an unfinished booking
          </p>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/60 text-xs mt-0.5 truncate">
            {fd.activity || 'Activity not yet selected'}
            {fd.date
              ? ` · ${new Date(fd.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
              : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={resume}
            className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase
              px-3 py-1.5 bg-[#C87D87] text-[#FBEAD6] rounded-lg hover:bg-[#b36d77] transition-all">
            Continue
          </button>
          <button onClick={discard}
            className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase
              px-3 py-1.5 border border-[#3a3027]/12 text-[#7a6a5a]/60 rounded-lg
              hover:bg-[#3a3027]/5 transition-all">
            Discard
          </button>
        </div>

      </div>
    </div>
  );
}