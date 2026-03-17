/*'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { io }      from 'socket.io-client';

const socket = io('http://localhost:4000', {
  withCredentials: true,
  autoConnect:     false
});

const QUICK_REPLIES = [
  'Thank you for reaching out! We\'ll look into this shortly ✦',
  'Your gathering has been confirmed ✦',
  'Could you share more details about your request?',
  'We\'ll get back to you within a few hours.',
];

export default function AdminChatWidget() {
  const { user } = useAuth();

  const [open,      setOpen]      = useState(false);
  const [convos,    setConvos]    = useState([]);
  const [active,    setActive]    = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [unread,    setUnread]    = useState(0);
  const [search,    setSearch]    = useState('');
  const [isTyping,  setIsTyping]  = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const bottomRef   = useRef(null);
  const activeRef   = useRef(null);
  const typingTimer = useRef(null);
  const openRef     = useRef(open);

  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { openRef.current = open; }, [open]);

  useEffect(() => {
    document.title = unread > 0 ? `(${unread}) Inora` : 'Inora';
  }, [unread]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    socket.connect();
    socket.emit('join_admin');

    socket.on('new_message', (msg) => {
      if (activeRef.current?.id === msg.conversationId) {
        setMessages(prev => [...prev, msg]);
      }
      fetchConvos();
      const isActiveConvo = activeRef.current?.id === msg.conversationId;
      const isWidgetOpen  = openRef.current;
      if (!isWidgetOpen || !isActiveConvo) {
        setUnread(n => n + 1);
        const chime = new Audio('/sounds/chime.wav');
        chime.volume = 0.5;
        chime.play().catch(() => {});
      }
    });

    socket.on('typing', ({ convoId }) => {
      if (activeRef.current?.id === convoId) {
        setIsTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setIsTyping(false), 2000);
      }
    });

    socket.on('stop_typing', () => setIsTyping(false));

    // ✅ real-time claim updates from other admins
    socket.on('convo_claimed', ({ convoId, adminId, adminName }) => {
      setConvos(prev => prev.map(c =>
        c.id === convoId
          ? { ...c, claimedBy: { id: adminId, fullName: adminName } }
          : c
      ));
      // ✅ update active pane header if this convo is open
      setActive(prev =>
        prev?.id === convoId
          ? { ...prev, claimedBy: { id: adminId, fullName: adminName } }
          : prev
      );
    });

    socket.on('convo_unclaimed', ({ convoId }) => {
      setConvos(prev => prev.map(c =>
        c.id === convoId ? { ...c, claimedBy: null } : c
      ));
      setActive(prev =>
        prev?.id === convoId ? { ...prev, claimedBy: null } : prev
      );
    });

    fetchConvos();
    return () => {
      socket.off('new_message');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('convo_claimed');
      socket.off('convo_unclaimed');
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => { if (open) setUnread(0); }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const fetchConvos = async () => {
    const res = await fetch('http://localhost:4000/api/chat/admin/conversations', {
      credentials: 'include'
    });
    if (!res.ok) return;
    const data = await res.json();
    setConvos(data);
    const totalUnread = data.reduce((sum, c) => sum + (c._count?.messages ?? 0), 0);
    setUnread(totalUnread);
  };

  const openConvo = async (convo) => {
    setActive(convo);
    setShowQuick(false);
    setMessages([]);
    const res = await fetch(
      `http://localhost:4000/api/chat/conversations/${convo.id}/messages`,
      { credentials: 'include' }
    );
    if (!res.ok) return;
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : (data.messages ?? []));
    fetchConvos();
  };

  // ✅ claim a conversation
  const claimConvo = async (id) => {
    const res = await fetch(`http://localhost:4000/api/chat/admin/conversations/${id}/claim`, {
      method: 'PATCH', credentials: 'include'
    });
    if (res.status === 409) {
      alert('This conversation was just claimed by another admin.');
      return;
    }
    const updated = await res.json();
    setActive(prev => prev?.id === id ? { ...prev, claimedBy: updated.claimedBy } : prev);
    fetchConvos();
  };

  // ✅ unclaim a conversation
  const unclaimConvo = async (id) => {
    await fetch(`http://localhost:4000/api/chat/admin/conversations/${id}/unclaim`, {
      method: 'PATCH', credentials: 'include'
    });
    setActive(prev => prev?.id === id ? { ...prev, claimedBy: null } : prev);
    fetchConvos();
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (!active) return;
    socket.emit('typing', { convoId: active.id, userId: user.id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('stop_typing', { convoId: active.id, userId: user.id });
    }, 1000);
  };

  const send = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !active) return;
    const body = input.trim();
    setInput('');
    setShowQuick(false);
    socket.emit('stop_typing', { convoId: active.id, userId: user.id });
    await fetch(`http://localhost:4000/api/chat/conversations/${active.id}/messages`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ body })
    });
    const chime = new Audio('/sounds/chime.wav');
    chime.volume = 0.3;
    chime.play().catch(() => {});
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const closeConvo = async (id) => {
    await fetch(`http://localhost:4000/api/chat/admin/conversations/${id}/close`, {
      method: 'PATCH', credentials: 'include'
    });
    setConvos(prev => prev.filter(c => c.id !== id));
    if (active?.id === id) { setActive(null); setMessages([]); }
  };

  const filtered = convos.filter(c =>
    c.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  if (user?.role !== 'admin') return null;

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes bounce1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>

      <div className="fixed bottom-6 right-28 z-50 flex flex-col items-end gap-3">

        {open && (
          <div className="relative flex rounded-2xl overflow-hidden border border-[#FBEAD6]/18
            shadow-[0_24px_64px_rgba(58,48,39,0.35)]"
            style={{ width:'700px', height:'500px', background:'linear-gradient(135deg,#6B7556,#5a6347)', animation:'fadeUp .3s cubic-bezier(.4,0,.2,1) forwards' }}>

            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C87D87] to-transparent z-10"/>
            <div className="absolute inset-0 rounded-2xl border border-[#FBEAD6]/10 pointer-events-none z-10"/>

            <div className="w-60 flex-shrink-0 border-r border-[#FBEAD6]/12 flex flex-col">

              <div className="px-4 py-4 border-b border-[#FBEAD6]/12 flex-shrink-0">
                <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[.28em] uppercase mb-0.5">Admin</p>
                <h3 className="font-['Playfair_Display',serif] italic text-[#FBEAD6] text-base leading-tight">
                  Support Inbox
                  {convos.length > 0 && (
                    <span className="ml-2 text-xs font-['Cormorant_Garamond',serif] not-italic bg-[#C87D87]/25 text-[#FBEAD6]/80 px-1.5 py-0.5 rounded-full">
                      {convos.length}
                    </span>
                  )}
                </h3>
              </div>

              <div className="px-3 py-2.5 border-b border-[#FBEAD6]/8 flex-shrink-0">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#FBEAD6]/30 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="w-full pl-8 pr-3 py-2 bg-[#FBEAD6]/8 border border-[#FBEAD6]/12 focus:border-[#FBEAD6]/25 focus:outline-none font-['Cormorant_Garamond',serif] italic text-xs text-[#FBEAD6] placeholder:text-[#FBEAD6]/25 rounded-lg transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 && (
                  <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/30 text-xs text-center mt-8 px-4">
                    {search ? 'No results' : 'No open conversations'}
                  </p>
                )}
                {filtered.map(c => {
                  const claimedByMe    = c.claimedBy?.id === user.id;
                  const claimedByOther = c.claimedBy && c.claimedBy.id !== user.id;
                  return (
                    <button key={c.id} onClick={() => openConvo(c)}
                      className={`w-full flex items-start gap-2.5 px-4 py-3 text-left border-b border-[#FBEAD6]/8 transition-all duration-200 ${
                        active?.id === c.id ? 'bg-[#FBEAD6]/14' : 'hover:bg-[#FBEAD6]/7'
                      } ${claimedByOther ? 'opacity-50' : ''}`}>

                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C87D87] to-[#6B7556] flex items-center justify-center text-white font-['Playfair_Display',serif] text-xs mt-0.5 shadow-sm">
                          {c.user.fullName.charAt(0).toUpperCase()}
                        </div>
                        {c._count?.messages > 0 && active?.id !== c.id && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#C87D87] border border-[#5a6347]"/>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-['Playfair_Display',serif] italic text-[#FBEAD6] text-sm truncate leading-tight">
                            {c.user.fullName}
                          </p>
                          {c._count?.messages > 0 && active?.id !== c.id && (
                            <span className="min-w-[1.1rem] h-[1.1rem] rounded-full bg-[#C87D87] flex items-center justify-center text-white text-[0.5rem] font-bold flex-shrink-0 px-1">
                              {c._count.messages > 9 ? '9+' : c._count.messages}
                            </span>
                          )}
                        </div>
                        <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/40 text-xs truncate mt-0.5">
                          {c.subject || c.messages?.[0]?.body || 'New conversation'}
                        </p>
                        <p className={`font-['Cormorant_Garamond',serif] italic text-[0.55rem] mt-0.5 ${
                          claimedByMe    ? 'text-[#6B7556]' :
                          claimedByOther ? 'text-[#FBEAD6]/35' :
                                           'text-[#FBEAD6]/20'
                        }`}>
                          {claimedByMe    ? '✦ Claimed by you' :
                           claimedByOther ? `${c.claimedBy.fullName}` :
                                            'Unclaimed'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              {!active ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl border border-[#FBEAD6]/18 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#FBEAD6]/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
                    </svg>
                  </div>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/28 text-sm">
                    Select a conversation
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#FBEAD6]/12 flex-shrink-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-['Playfair_Display',serif] italic text-[#FBEAD6] text-base leading-tight">
                          {active.user.fullName}
                        </p>
                        <span className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/40 text-xs">
                          {active.user.email}
                        </span>
                      </div>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/40 text-xs mt-0.5">
                        {active.subject || 'General inquiry'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {active.claimedBy?.id === user.id ? (
                        <button onClick={() => unclaimConvo(active.id)}
                          className="font-['Cormorant_Garamond',serif] text-xs tracking-[.18em] uppercase text-[#FBEAD6]/50 border border-[#FBEAD6]/20 px-3 py-1.5 rounded-lg hover:bg-[#FBEAD6]/8 transition-all duration-200">
                          Unclaim
                        </button>
                      ) : !active.claimedBy ? (
                        <button onClick={() => claimConvo(active.id)}
                          className="font-['Cormorant_Garamond',serif] text-xs tracking-[.18em] uppercase text-[#6B7556] border border-[#6B7556]/60 px-3 py-1.5 rounded-lg hover:bg-[#FBEAD6]/8 transition-all duration-200">
                          Claim
                        </button>
                      ) : (
                        // ✅ claimed by another admin — show who owns it
                        <span className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/30 text-xs px-3 py-1.5 border border-[#FBEAD6]/10 rounded-lg">
                          {active.claimedBy.fullName}
                        </span>
                      )}

                      <button onClick={() => closeConvo(active.id)}
                        className="font-['Cormorant_Garamond',serif] text-xs tracking-[.18em] uppercase text-[#C87D87] border border-[#C87D87]/40 px-3 py-1.5 rounded-lg hover:bg-[#C87D87]/14 transition-all duration-200">
                        Close
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                    {messages.length === 0 && (
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/28 text-xs text-center mt-8">
                        No messages yet
                      </p>
                    )}
                    {messages.map(msg => {
                      const isAdmin = msg.sender.role === 'admin';
                      return (
                        <div key={msg.id} className={`flex flex-col gap-1 ${isAdmin ? 'items-end' : 'items-start'}`}
                          style={{ animation:'slideIn .2s cubic-bezier(.4,0,.2,1) forwards' }}>
                          <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm
                            font-['Cormorant_Garamond',serif] leading-relaxed shadow-sm ${
                            isAdmin
                              ? 'bg-[#6B7556] text-[#FBEAD6] rounded-br-sm border border-[#FBEAD6]/10'
                              : 'bg-[#FBEAD6]/90 text-[#3a3027] rounded-bl-sm'
                          }`}>
                            {msg.body}
                          </div>
                          <div className={`flex items-center gap-1.5 px-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[0.58rem] text-[#FBEAD6]/28 font-['Cormorant_Garamond',serif] italic">
                              {isAdmin ? msg.sender.fullName : msg.sender.fullName}
                              {' · '}
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                            </span>
                            {isAdmin && (
                              <span className={`text-[0.58rem] ${msg.readAt ? 'text-[#C87D87]' : 'text-[#FBEAD6]/25'}`}>
                                ✓✓
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {isTyping && (
                      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FBEAD6]/90 rounded-2xl rounded-bl-sm w-fit shadow-sm"
                        style={{ animation:'slideIn .2s ease forwards' }}>
                        <span className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/60 text-xs mr-1">
                          {active.user.fullName.split(' ')[0]}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C87D87]" style={{ animation:'bounce1 1s ease-in-out infinite 0ms' }}/>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C87D87]" style={{ animation:'bounce1 1s ease-in-out infinite 150ms' }}/>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C87D87]" style={{ animation:'bounce1 1s ease-in-out infinite 300ms' }}/>
                      </div>
                    )}
                    <div ref={bottomRef}/>
                  </div>

                  {showQuick && (
                    <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0 border-t border-[#FBEAD6]/8 pt-2"
                      style={{ animation:'fadeIn .15s ease forwards' }}>
                      {QUICK_REPLIES.map(text => (
                        <button key={text}
                          onClick={() => { setInput(text); setShowQuick(false); }}
                          className="text-xs font-['Cormorant_Garamond',serif] italic px-3 py-1.5 rounded-xl border border-[#FBEAD6]/18 text-[#FBEAD6]/55 hover:text-[#FBEAD6] hover:border-[#FBEAD6]/35 transition-all duration-200 text-left">
                          {text}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex-shrink-0 border-t border-[#FBEAD6]/12 px-4 pt-3 pb-2">
                    <form onSubmit={send} className="flex items-end gap-2">
                      <button type="button" onClick={() => setShowQuick(s => !s)}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 flex-shrink-0 mb-0.5 ${
                          showQuick
                            ? 'border-[#C87D87]/60 bg-[#C87D87]/14 text-[#C87D87]'
                            : 'border-[#FBEAD6]/18 text-[#FBEAD6]/35 hover:text-[#FBEAD6]/60 hover:border-[#FBEAD6]/30'
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
                        </svg>
                      </button>
                      <div className="flex-1 relative">
                        <textarea
                          value={input}
                          onChange={handleInput}
                          onKeyDown={handleKeyDown}
                          placeholder="Reply to user…"
                          rows={1}
                          maxLength={500}
                          className="w-full px-4 py-2.5 bg-[#FBEAD6]/10 border border-[#FBEAD6]/15 focus:border-[#C87D87]/55 focus:ring-2 focus:ring-[#C87D87]/10 focus:outline-none font-['Cormorant_Garamond',serif] italic text-sm text-[#FBEAD6] placeholder:text-[#FBEAD6]/28 rounded-xl transition-all duration-300 resize-none"
                        />
                      </div>
                      <button type="submit"
                        className="w-9 h-9 rounded-xl bg-[#C87D87] hover:bg-[#a85e6a] flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-0.5 shadow-sm flex-shrink-0 mb-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                        </svg>
                      </button>
                    </form>
                    <div className="flex items-center justify-between px-1 mt-1.5">
                      <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#FBEAD6]/22">
                        Enter to send · Shift+Enter for new line
                      </p>
                      <span className={`font-['Cormorant_Garamond',serif] italic text-[0.58rem] ${
                        input.length > 450 ? 'text-[#C87D87]' : 'text-[#FBEAD6]/25'
                      }`}>
                        {input.length}/500
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-20 w-7 h-7 rounded-lg flex items-center justify-center text-[#FBEAD6]/40 hover:text-[#FBEAD6] hover:bg-[#FBEAD6]/10 transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}

        <button onClick={() => setOpen(o => !o)}
          className="w-14 h-14 rounded-2xl bg-[#6B7556] hover:bg-[#4a5240] text-[#FBEAD6] flex items-center justify-center
            shadow-[0_8px_28px_rgba(107,117,86,0.45)] hover:shadow-[0_12px_36px_rgba(107,117,86,0.55)]
            transition-all duration-300 hover:-translate-y-0.5 active:scale-95 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/>
          </svg>
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] rounded-full bg-[#C87D87] border-2 border-[#FBEAD6] flex items-center justify-center text-white text-[0.5rem] font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
*/