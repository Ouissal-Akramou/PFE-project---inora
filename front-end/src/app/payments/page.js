'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserPayments() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [pageReady, setPageReady] = useState(false);
  const [activeTab, setActiveTab] = useState('history');

  // Mock data - replace with API calls
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2024-001',
      date: '2024-03-15',
      description: 'Crochet Circle - Garden Session',
      amount: 450.00,
      status: 'paid',
      paymentMethod: 'Carte Bancaire'
    },
    {
      id: 'INV-2024-002',
      date: '2024-02-28',
      description: 'Painting Workshop - Afternoon',
      amount: 320.00,
      status: 'paid',
      paymentMethod: 'PayPal'
    },
    {
      id: 'INV-2024-003',
      date: '2024-03-10',
      description: 'Pottery Class - Evening',
      amount: 280.00,
      status: 'pending',
      paymentMethod: 'En attente'
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Carte Bancaire', last4: '4242', expiry: '12/25' },
    { id: 2, type: 'PayPal', email: 'user@example.com' }
  ]);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push('/login');
      return;
    }
    setTimeout(() => setPageReady(true), 100);
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const displayName = user?.fullName ?? user?.name ?? 'Utilisateur';

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return <span className="px-3 py-1 bg-green-100 text-green-600 border border-green-300 rounded-full text-xs font-['Cormorant_Garamond',serif]">✅ Payé</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-600 border border-yellow-300 rounded-full text-xs font-['Cormorant_Garamond',serif] animate-pulse">⏳ En attente</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-red-100 text-red-600 border border-red-300 rounded-full text-xs font-['Cormorant_Garamond',serif]">❌ Échoué</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-300 rounded-full text-xs font-['Cormorant_Garamond',serif]">{status}</span>;
    }
  };

  // Calculate totals
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#FBEAD6] via-[#f5ddd0] to-[#FBEAD6]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(200,125,135,0.16);
        }
      `}</style>

      {/* Lace Frame */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute inset-3 border border-[#C87D87]/25"/>
        <div className="absolute inset-[13px] border border-[#C87D87]/12"/>
        <div className="absolute inset-[21px] border border-[#C87D87]/7"/>
        <div className="absolute inset-[28px] border border-[#C87D87]/4"/>
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full pointer-events-none bg-[#C87D87]/5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full pointer-events-none bg-[#6B7556]/5 blur-3xl" />

      {/* Main Content */}
      <div className={`relative z-20 max-w-6xl mx-auto px-8 py-12 transition-opacity duration-700 ${pageReady ? 'opacity-100' : 'opacity-0'}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-[fadeUp_0.5s_ease_forwards]">
          <div className="flex items-center gap-4">
            <Link href="/" 
              className="group flex items-center gap-2 text-[#C87D87] hover:text-[#6B7556] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-['Cormorant_Garamond',serif] italic text-sm tracking-[0.2em] uppercase">Accueil</span>
            </Link>
            <div className="w-px h-6 bg-[#C87D87]/20" />
            <div>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/50 text-xs tracking-[0.25em] uppercase">Mes Paiements</p>
              <h1 className="font-['Playfair_Display',serif] italic text-3xl text-[#3a3027]">
                {displayName}
              </h1>
            </div>
          </div>

          <button onClick={handleLogout}
            className="px-5 py-2.5 font-['Cormorant_Garamond',serif] text-sm tracking-[0.2em] uppercase text-[#C87D87] hover:text-[#6B7556] transition-colors flex items-center gap-2 border border-[#C87D87]/20 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 animate-[fadeUp_0.5s_ease_forwards_0.1s]">
          {[
            { label: 'Total Payé', value: `${totalPaid.toFixed(2)} €`, icon: '💰', color: '#6B7556' },
            { label: 'En Attente', value: `${totalPending.toFixed(2)} €`, icon: '⏳', color: '#C87D87' },
            { label: 'Factures', value: invoices.length, icon: '📄', color: '#3a3027' },
          ].map((stat, i) => (
            <div key={stat.label}
              style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              className="relative bg-white/50 border border-[#C87D87]/15 p-5 rounded-xl card-hover animate-[fadeUp_0.5s_ease_forwards]">
              <div className="absolute top-2 left-2 w-4 h-4 pointer-events-none border-t border-l border-[#C87D87]/30" />
              <div className="absolute bottom-2 right-2 w-4 h-4 pointer-events-none border-b border-r border-[#C87D87]/30" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/60">{stat.label}</span>
              </div>
              <p className="font-['Playfair_Display',serif] italic text-2xl leading-none" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#C87D87]/15 animate-[fadeUp_0.5s_ease_forwards_0.15s]">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 font-['Cormorant_Garamond',serif] text-sm tracking-[0.2em] uppercase transition-all duration-300 ${
              activeTab === 'history'
                ? 'text-[#C87D87] border-b-2 border-[#C87D87]'
                : 'text-[#7a6a5a]/50 hover:text-[#C87D87]/70'
            }`}>
            Historique
          </button>
          <button
            onClick={() => setActiveTab('payment-methods')}
            className={`pb-3 px-1 font-['Cormorant_Garamond',serif] text-sm tracking-[0.2em] uppercase transition-all duration-300 ${
              activeTab === 'payment-methods'
                ? 'text-[#C87D87] border-b-2 border-[#C87D87]'
                : 'text-[#7a6a5a]/50 hover:text-[#C87D87]/70'
            }`}>
            Moyens de paiement
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'history' && (
          <div className="bg-white/50 border border-[#C87D87]/15 rounded-xl overflow-hidden backdrop-blur-sm animate-[fadeUp_0.5s_ease_forwards_0.2s]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#C87D87]/12 bg-[#C87D87]/6">
                    <th className="px-6 py-4 text-left font-['Cormorant_Garamond',serif] italic text-xs tracking-[0.25em] uppercase text-[#7a6a5a]/60">Facture</th>
                    <th className="px-6 py-4 text-left font-['Cormorant_Garamond',serif] italic text-xs tracking-[0.25em] uppercase text-[#7a6a5a]/60">Description</th>
                    <th className="px-6 py-4 text-left font-['Cormorant_Garamond',serif] italic text-xs tracking-[0.25em] uppercase text-[#7a6a5a]/60">Montant</th>
                    <th className="px-6 py-4 text-left font-['Cormorant_Garamond',serif] italic text-xs tracking-[0.25em] uppercase text-[#7a6a5a]/60">Statut</th>
                    <th className="px-6 py-4 text-left font-['Cormorant_Garamond',serif] italic text-xs tracking-[0.25em] uppercase text-[#7a6a5a]/60">Méthode</th>
                    <th className="px-6 py-4 text-left font-['Cormorant_Garamond',serif] italic text-xs tracking-[0.25em] uppercase text-[#7a6a5a]/60">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, i) => (
                    <tr key={invoice.id}
                      style={{ animationDelay: `${0.2 + i * 0.03}s` }}
                      className="border-b border-[#C87D87]/8 hover:bg-[#C87D87]/4 transition-colors animate-[fadeUp_0.5s_ease_forwards]">
                      <td className="px-6 py-4">
                        <span className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold">{invoice.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/80">{invoice.description}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-['Playfair_Display',serif] italic text-lg text-[#6B7556]">{invoice.amount} €</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-['Cormorant_Garamond',serif] text-sm text-[#7a6a5a]/70">{invoice.paymentMethod}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/50">
                          {new Date(invoice.date).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payment-methods' && (
          <div className="grid md:grid-cols-2 gap-5 animate-[fadeUp_0.5s_ease_forwards_0.2s]">
            {paymentMethods.map((method, i) => (
              <div key={method.id}
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                className="relative bg-white/50 border border-[#C87D87]/15 p-6 rounded-xl card-hover animate-[fadeUp_0.5s_ease_forwards]">
                <div className="absolute top-2 left-2 w-4 h-4 pointer-events-none border-t border-l border-[#C87D87]/30" />
                <div className="absolute bottom-2 right-2 w-4 h-4 pointer-events-none border-b border-r border-[#C87D87]/30" />
                
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{method.type === 'Carte Bancaire' ? '💳' : '📧'}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-600 border border-green-300 rounded-full text-xs font-['Cormorant_Garamond',serif]">
                    ✓ Par défaut
                  </span>
                </div>
                
                <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-1">{method.type}</h3>
                {method.last4 && (
                  <p className="font-['Cormorant_Garamond',serif] text-sm text-[#7a6a5a] mb-2">
                    •••• •••• •••• {method.last4}
                  </p>
                )}
                {method.email && (
                  <p className="font-['Cormorant_Garamond',serif] text-sm text-[#7a6a5a] mb-2">
                    {method.email}
                  </p>
                )}
                {method.expiry && (
                  <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/50">
                    Expire le {method.expiry}
                  </p>
                )}
              </div>
            ))}
            
            <button className="relative bg-[#C87D87]/5 border border-dashed border-[#C87D87]/30 p-6 rounded-xl hover:bg-[#C87D87]/10 transition-all duration-300 flex flex-col items-center justify-center gap-2 min-h-[200px] group">
              <div className="w-12 h-12 rounded-full border-2 border-[#C87D87]/30 flex items-center justify-center group-hover:border-[#C87D87] transition-colors">
                <span className="text-2xl text-[#C87D87]/50 group-hover:text-[#C87D87]">+</span>
              </div>
              <span className="font-['Cormorant_Garamond',serif] italic text-sm text-[#C87D87]/50 group-hover:text-[#C87D87]">
                Ajouter un moyen de paiement
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}