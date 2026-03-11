/*'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { io }      from 'socket.io-client';

const socket = io('http://localhost:4000', {
  withCredentials: true,
  autoConnect:     false
});

export default function ChatWidget() {
  const { user } = useAuth();

  const [open,       setOpen]       = useState(false);
  const [tab,        setTab]        = useState('current');
  const [convo,      setConvo]      = useState(null);
  const [history,    setHistory]    = useState([]);
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [subject,    setSubject]    = useState('');
  const [loading,    setLoading]    = useState(false);
  const [unread,     setUnread]     = useState(0); // ✅ number instead of boolean
  const [isTyping,   setIsTyping]   = useState(false);
  const bottomRef    = useRef(null);
  const typingTimer  = useRef(null);
  const openRef      = useRef(open);
  const convoRef     = useRef(convo);

  useEffect(() => { openRef.current  = open;  }, [open]);
  useEffect(() => { convoRef.current = convo; }, [convo]);

  // ✅ show count in tab title
  useEffect(() => {
    document.title = unread > 0 ? `(${unread}) Inora` : 'Inora';
  }, [unread]);

  useEffect(() => {
    if (!user || user.role === 'admin') return;
    socket.connect();
    socket.emit('join', user.id);
    fetchUnreadCount(); // ✅ load unread count on login/page load

    socket.on('new_message', (msg) => {
      if (convoRef.current?.id === msg.conversationId) {
        setMessages(prev => [...prev, msg]);
      }
      if (!openRef.current) {
        setUnread(n => n + 1); // ✅ increment
        const chime = new Audio('/sounds/chime.wav');
        chime.volume = 0.5;
        chime.play().catch(() => {});
      }
    });

    socket.on('typing', () => {
      setIsTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setIsTyping(false), 2000);
    });

    socket.on('stop_typing', () => setIsTyping(false));

    return () => {
      socket.off('new_message');
      socket.off('typing');
      socket.off('stop_typing');
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => { if (open) setUnread(0); }, [open]); // ✅ reset to 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (tab === 'history' && user) fetchHistory();
  }, [tab]);

  useEffect(() => {
    if (convo && messages.length === 0) {
      setMessages([{
        id:        'welcome',
        body:      `Hello ${user?.fullName?.split(' ')[0] ?? 'there'} ✦  How can we help you today?`,
        sender:    { fullName: 'Inora Team', role: 'admin' },
        senderId:  'admin',
        createdAt: new Date().toISOString(),
        readAt:    new Date().toISOString(),
      }]);
    }
  }, [convo]);

  // ✅ fetch unread count from backend on mount
  const fetchUnreadCount = async () => {
    const res = await fetch('http://localhost:4000/api/chat/conversations/my', {
      credentials: 'include'
    });
    if (!res.ok) return;
    const convos = await res.json();
    const total = convos.reduce((sum, c) => sum + (c._count?.messages ?? 0), 0);
    setUnread(total);
  };

  const fetchHistory = async () => {
    const res = await fetch('http://localhost:4000/api/chat/conversations/my', {
      credentials: 'include'
    });
    if (res.ok) setHistory(await res.json());
  };

  const startConvo = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/chat/conversations', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ subject })
      });
      if (!res.ok) return;
      const data = await res.json();
      setConvo(data);
      const mRes = await fetch(
        `http://localhost:4000/api/chat/conversations/${data.id}/messages`,
        { credentials: 'include' }
      );
      if (!mRes.ok) return;
      const msgs = await mRes.json();
      setMessages(Array.isArray(msgs) ? msgs : (msgs.messages ?? []));
    } finally {
      setLoading(false);
    }
  };

  const openHistoryConvo = async (c) => {
    setConvo(c);
    setTab('current');
    setMessages([]);
    const res = await fetch(
      `http://localhost:4000/api/chat/conversations/${c.id}/messages`,
      { credentials: 'include' }
    );
    if (!res.ok) return;
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : (data.messages ?? []));
    // ✅ refresh unread count after reading a conversation
    fetchUnreadCount();
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (!convo) return;
    socket.emit('typing', { convoId: convo.id, userId: user.id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('stop_typing', { convoId: convo.id, userId: user.id });
    }, 1000);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !convo) return;
    const body = input.trim();
    setInput('');
    socket.emit('stop_typing', { convoId: convo.id, userId: user.id });
    await fetch(`http://localhost:4000/api/chat/conversations/${convo.id}/messages`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ body })
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user || user.role === 'admin') return null;

  return (
    <>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideIn  { from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes bounce1  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes pulseDot { 0%,100%{transform:scale(1)} 50%{transform:scale(1.5)} }
      `}</style>

      <div className="fixed bottom-6 right-8 z-50 flex flex-col items-end gap-3">

        {open && (
          <div className="relative w-[360px] bg-[#FBEAD6]/96 backdrop-blur-xl border border-[#C87D87]/25
            rounded-2xl shadow-[0_24px_64px_rgba(58,48,39,0.25)] overflow-hidden flex flex-col"
            style={{ height:'520px', animation:'fadeUp .3s cubic-bezier(.4,0,.2,1) forwards' }}>

            <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/10 pointer-events-none z-10"/>
            <div className="absolute inset-[5px] rounded-xl border border-[#C87D87]/6 pointer-events-none z-10"/>
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C87D87] to-transparent z-10"/>

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#C87D87]/15 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[.3em] uppercase">Support</p>
                  <h3 className="font-['Playfair_Display',serif] italic text-[#3a3027] text-lg leading-tight">Chat with us</h3>
                </div>
                {convo?.subject && (
                  <span className="font-['Cormorant_Garamond',serif] italic text-xs px-2.5 py-1 rounded-full bg-[#C87D87]/10 text-[#C87D87] border border-[#C87D87]/25">
                    {convo.subject}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#6B7556]" style={{ animation:'pulseDot 2s ease-in-out infinite' }}/>
                  <span className="font-['Cormorant_Garamond',serif] italic text-[#6B7556] text-xs">Online</span>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7a6a5a] hover:bg-[#C87D87]/12 hover:text-[#C87D87] transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex border-b border-[#C87D87]/12 flex-shrink-0">
              {['current', 'history'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 font-['Cormorant_Garamond',serif] italic text-sm tracking-[.1em] transition-all duration-200 ${
                    tab === t
                      ? 'text-[#C87D87] border-b-2 border-[#C87D87] -mb-px bg-[#C87D87]/4'
                      : 'text-[#7a6a5a]/60 hover:text-[#5a4a3a]'
                  }`}>
                  {t === 'current' ? 'Conversation' : 'History'}
                </button>
              ))}
            </div>

            {tab === 'history' && (
              <div className="flex-1 overflow-y-auto" style={{ animation:'fadeIn .2s ease forwards' }}>
                {history.length === 0 && (
                  <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/50 text-sm text-center mt-12">
                    No past conversations
                  </p>
                )}
                {history.map(c => (
                  <button key={c.id} onClick={() => openHistoryConvo(c)}
                    className="w-full flex items-start gap-3 px-5 py-4 text-left border-b border-[#C87D87]/10 hover:bg-[#C87D87]/5 transition-all duration-200">
                    <div className="relative flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full mt-2 ${c.status === 'OPEN' ? 'bg-[#6B7556]' : 'bg-[#7a6a5a]/35'}`}/>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">
                          {c.subject || 'General inquiry'}
                        </p>
                        {c._count?.messages > 0 && (
                          <span className="min-w-[1.1rem] h-[1.1rem] rounded-full bg-[#C87D87] flex items-center justify-center text-white text-[0.5rem] font-bold flex-shrink-0 px-1">
                            {c._count.messages > 9 ? '9+' : c._count.messages}
                          </span>
                        )}
                      </div>
                      <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/60 truncate mt-0.5">
                        {c.messages?.[0]?.body || 'No messages'}
                      </p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] text-[#7a6a5a]/40 mt-1">
                        {new Date(c.updatedAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                        {' · '}
                        <span className={c.status === 'OPEN' ? 'text-[#6B7556]' : 'text-[#7a6a5a]/40'}>
                          {c.status}
                        </span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {tab === 'current' && (
              <>
                {!convo ? (
                  <div className="flex-1 p-6 flex flex-col gap-4" style={{ animation:'fadeIn .25s ease forwards' }}>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#5a4a3a] text-sm leading-relaxed">
                      Have a question about an activity or gathering? Send us a message and we'll get back to you shortly.
                    </p>
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Subject  (e.g. Pottery Workshop)"
                      className="w-full px-4 py-3 bg-white/70 border border-[#C87D87]/30 focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/15 focus:outline-none font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] placeholder:text-[#7a6a5a]/50 rounded-xl transition-all duration-300"
                    />
                    <button onClick={startConvo} disabled={loading}
                      className="font-['Cormorant_Garamond',serif] text-sm tracking-[.22em] uppercase text-[#FBEAD6] bg-[#6B7556] py-3 rounded-xl hover:bg-[#4a5240] transition-all duration-300 disabled:opacity-40 shadow-[0_4px_16px_rgba(107,117,86,0.28)] hover:-translate-y-0.5">
                      {loading ? 'Starting…' : 'Start Conversation'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                      {messages.map((msg) => {
                        const isMe = msg.senderId === user.id;
                        return (
                          <div key={msg.id} className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}
                            style={{ animation:'slideIn .2s cubic-bezier(.4,0,.2,1) forwards' }}>
                            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm
                              font-['Cormorant_Garamond',serif] leading-relaxed shadow-sm ${
                              isMe
                                ? 'bg-[#6B7556] text-[#FBEAD6] rounded-br-sm'
                                : 'bg-white/80 border border-[#C87D87]/18 text-[#3a3027] rounded-bl-sm'
                            }`}>
                              {msg.body}
                            </div>
                            <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[0.6rem] text-[#7a6a5a]/55 font-['Cormorant_Garamond',serif] italic">
                                {msg.sender?.role === 'admin' ? 'Inora Team' : 'You'}
                                {' · '}
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                              </span>
                              {isMe && (
                                <span className={`text-[0.6rem] ${msg.readAt ? 'text-[#C87D87]' : 'text-[#7a6a5a]/35'}`}>
                                  ✓✓
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {isTyping && (
                        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/80 border border-[#C87D87]/18 rounded-2xl rounded-bl-sm w-fit shadow-sm"
                          style={{ animation:'slideIn .2s ease forwards' }}>
                          <span className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/60 text-xs mr-1">Inora Team</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C87D87]" style={{ animation:'bounce1 1s ease-in-out infinite 0ms' }}/>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C87D87]" style={{ animation:'bounce1 1s ease-in-out infinite 150ms' }}/>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C87D87]" style={{ animation:'bounce1 1s ease-in-out infinite 300ms' }}/>
                        </div>
                      )}
                      <div ref={bottomRef}/>
                    </div>

                    <div className="flex-shrink-0 border-t border-[#C87D87]/12 px-4 pt-3 pb-2">
                      <form onSubmit={sendMessage} className="flex items-end gap-2">
                        <div className="flex-1 relative">
                          <textarea
                            value={input}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message…"
                            rows={1}
                            maxLength={500}
                            className="w-full px-4 py-2.5 bg-white/70 border border-[#C87D87]/25 focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/12 focus:outline-none font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] placeholder:text-[#7a6a5a]/45 rounded-xl transition-all duration-300 resize-none"
                          />
                        </div>
                        <button type="submit"
                          className="w-10 h-10 rounded-xl bg-[#C87D87] hover:bg-[#a85e6a] flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-0.5 shadow-sm flex-shrink-0 mb-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                          </svg>
                        </button>
                      </form>
                      <div className="flex items-center justify-between px-1 mt-1.5">
                        <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] text-[#7a6a5a]/40">
                          Enter to send · Shift+Enter for new line
                        </p>
                        <span className={`font-['Cormorant_Garamond',serif] italic text-[0.6rem] ${
                          input.length > 450 ? 'text-[#C87D87]' : 'text-[#7a6a5a]/35'
                        }`}>
                          {input.length}/500
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        <button onClick={() => setOpen(o => !o)}
          className="w-14 h-14 rounded-2xl bg-[#C87D87] hover:bg-[#a85e6a] text-white flex items-center justify-center
            shadow-[0_8px_28px_rgba(200,125,135,0.45)] hover:shadow-[0_12px_36px_rgba(200,125,135,0.55)]
            transition-all duration-300 hover:-translate-y-0.5 active:scale-95 relative">
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
            </svg>
          )}
          {unread > 0 && !open && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] rounded-full bg-[#6B7556] border-2 border-white flex items-center justify-center text-white text-[0.5rem] font-bold px-1">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
*/