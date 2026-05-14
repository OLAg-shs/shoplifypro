import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles, ChevronRight, ArrowRight, Minimize2, Maximize2 } from 'lucide-react';
import { api } from '../utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// Markdown-lite renderer: converts **bold** and bullet lists to JSX
// ─────────────────────────────────────────────────────────────────────────────
const renderText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Message bubble component
// ─────────────────────────────────────────────────────────────────────────────
const MessageBubble = ({ msg, onNavigate }) => {
  const isUser = msg.role === 'user';
  const isTyping = msg.type === 'typing';

  if (isTyping) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '12px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={13} color="white" />
        </div>
        <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 4px', background: '#f1f5f9', maxWidth: '220px' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '16px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8',
                animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '12px',
      flexDirection: isUser ? 'row-reverse' : 'row'
    }}>
      {/* Avatar */}
      {!isUser && (
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
          <Sparkles size={13} color="white" />
        </div>
      )}

      <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {/* Main bubble */}
        <div style={{
          padding: '10px 14px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? 'linear-gradient(135deg, #2563eb, #4f46e5)' : '#f1f5f9',
          color: isUser ? 'white' : '#1e293b',
          fontSize: '0.875rem',
          lineHeight: 1.55,
        }}>
          {renderText(msg.message)}
        </div>

        {/* Step-by-step guide */}
        {msg.steps && msg.steps.length > 0 && (
          <div style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Steps</span>
            </div>
            <div style={{ padding: '8px 4px' }}>
              {msg.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '5px 10px', alignItems: 'flex-start' }}>
                  {!step.startsWith('•') && !step.startsWith('📦') && !step.startsWith('🏪') && !step.startsWith('🤖') && !step.startsWith('📊') && !step.startsWith('🛍️') && !step.startsWith('🎴') && !step.startsWith('⚙️') && (
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', flexShrink: 0, marginTop: '1px' }}>
                      {i + 1}
                    </div>
                  )}
                  <span style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.5 }}>{renderText(step)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        {msg.tip && (
          <div style={{ padding: '8px 12px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5 }}>
            💡 {renderText(msg.tip)}
          </div>
        )}

        {/* Navigate button */}
        {msg.route && msg.contextNote !== 'You\'re already on the right page!' && (
          <button onClick={() => onNavigate(msg.route)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '100px', border: 'none',
            background: '#ede9fe', color: '#7c3aed', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: '700', transition: 'all 0.2s ease'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.color = '#7c3aed'; }}
          >
            <ArrowRight size={12} /> Take me there
          </button>
        )}
        {msg.contextNote === 'You\'re already on the right page!' && (
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>✓ You're already here!</div>
        )}

        {/* Timestamp */}
        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
          {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Quick suggestion chips shown at start
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'How do I add a product?',
  'How do I publish my store?',
  'How do I change my store colors?',
  'How do I view my orders?',
  'Show me my revenue',
];

// ─────────────────────────────────────────────────────────────────────────────
// AI ASSISTANT WIDGET
// ─────────────────────────────────────────────────────────────────────────────
const AIAssistant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [unread, setUnread] = useState(0);
  const [pulse, setPulse] = useState(true);

  const currentRoute = location.pathname;

  // Stop pulse after 5s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // When chat opens, fetch contextual greeting
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      fetchGreeting();
      setHasGreeted(true);
      setUnread(0);
    }
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // When route changes while chat is open, update context
  useEffect(() => {
    if (isOpen && hasGreeted && messages.length > 0) {
      // Subtle system note about page change (don't flood with new greetings)
    }
  }, [currentRoute]);

  const fetchGreeting = async () => {
    setIsLoading(true);
    addMessage({ role: 'assistant', type: 'typing', message: '', ts: Date.now() });
    try {
      const res = await api.get(`/ai/assistant/greeting?route=${encodeURIComponent(currentRoute)}`);
      removeTyping();
      addMessage({
        role: 'assistant',
        type: 'greeting',
        message: `👋 Hi! I'm Eagle, your AI assistant.\n\n${res.greeting}`,
        ts: Date.now(),
      });
    } catch {
      removeTyping();
      addMessage({
        role: 'assistant',
        type: 'greeting',
        message: "👋 Hi! I'm Eagle, your AI assistant. Ask me anything about your store — adding products, publishing, analytics, and more!",
        ts: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
    if (!isOpen) setUnread(u => u + 1);
  };

  const removeTyping = () => {
    setMessages(prev => prev.filter(m => m.type !== 'typing'));
  };

  const sendMessage = useCallback(async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || isLoading) return;

    setInput('');
    addMessage({ role: 'user', message: userMsg, ts: Date.now() });
    setIsLoading(true);
    addMessage({ role: 'assistant', type: 'typing', message: '', ts: Date.now() });

    try {
      const res = await api.post('/ai/assistant', {
        message: userMsg,
        currentRoute,
      });
      removeTyping();
      addMessage({
        role: 'assistant',
        type: res.type,
        message: res.message,
        steps: res.steps,
        tip: res.tip,
        route: res.route,
        contextNote: res.contextNote,
        ts: Date.now(),
      });
    } catch (err) {
      removeTyping();
      addMessage({
        role: 'assistant',
        type: 'error',
        message: 'Sorry, I had trouble connecting. Please try again in a moment.',
        ts: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, currentRoute, isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNavigate = (route) => {
    navigate(route);
    // Don't close the chat — user might want to continue the conversation
  };

  const clearChat = () => {
    setMessages([]);
    setHasGreeted(false);
  };

  // Don't render on non-dashboard pages
  const isDashboard = ['/seller/dashboard', '/products/manage', '/orders/tracking', '/analytics', '/store-builder', '/card-generator', '/seller/settings', '/dashboard'].some(p => currentRoute.startsWith(p));
  if (!isDashboard) return null;

  return (
    <>
      {/* ── Keyframe Styles ── */}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes assistantSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badgePop {
          0% { transform: scale(0.5); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes ringPulse {
          0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.5); }
          70% { box-shadow: 0 0 0 12px rgba(124, 58, 237, 0); }
          100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
        }
        .assistant-input::placeholder { color: #94a3b8; }
        .assistant-input:focus { outline: none; }
        .suggestion-chip:hover { background: #ede9fe !important; color: #7c3aed !important; border-color: #c4b5fd !important; }
      `}</style>

      {/* ── Toggle Button ── */}
      <button
        onClick={() => { setIsOpen(o => !o); setIsMinimized(false); }}
        style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
          width: '56px', height: '56px', borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(79, 70, 229, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          animation: pulse ? 'ringPulse 2s ease-out 2' : 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(79,70,229,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(79,70,229,0.4)'; }}
        title="Eagle AI Assistant"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && unread > 0 && (
          <div style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '20px', height: '20px', borderRadius: '50%',
            background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: '800',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'badgePop 0.3s ease',
            border: '2px solid white'
          }}>{unread > 9 ? '9+' : unread}</div>
        )}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '96px', right: '28px', zIndex: 9998,
          width: '380px',
          height: isMinimized ? '60px' : '560px',
          borderRadius: '20px',
          background: 'white',
          boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'assistantSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>

          {/* ── Header ── */}
          <div style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', gap: '10px',
            flexShrink: 0,
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: '800', fontSize: '0.95rem', lineHeight: 1 }}>Eagle AI Assistant</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                Online · Always here to help
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setIsMinimized(m => !m)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={13} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* ── Messages ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                    <Sparkles size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#c4b5fd' }} />
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Ask me anything about your store</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>I know every feature and page.</p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} onNavigate={handleNavigate} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Suggestions (shown only if <= 1 user message) ── */}
              {messages.filter(m => m.role === 'user').length === 0 && (
                <div style={{ padding: '0 12px 10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)} style={{
                      padding: '5px 12px', borderRadius: '100px', border: '1px solid #e2e8f0',
                      background: '#f8fafc', color: '#374151', fontSize: '0.78rem',
                      fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease'
                    }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Input Area ── */}
              <div style={{ padding: '12px', borderTop: '1px solid #f1f5f9', background: '#fafafa', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <textarea
                    ref={inputRef}
                    className="assistant-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question…"
                    rows={1}
                    style={{
                      flex: 1, border: '1px solid #e2e8f0', borderRadius: '12px',
                      padding: '10px 14px', fontSize: '0.875rem', resize: 'none',
                      fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
                      background: 'white', color: '#1e293b',
                      maxHeight: '80px', overflowY: 'auto',
                    }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    style={{
                      width: '38px', height: '38px', borderRadius: '12px', border: 'none',
                      background: input.trim() && !isLoading ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e2e8f0',
                      color: input.trim() && !isLoading ? 'white' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease', flexShrink: 0,
                    }}
                  >
                    <Send size={15} />
                  </button>
                </div>
                <div style={{ marginTop: '6px', textAlign: 'center', fontSize: '0.7rem', color: '#cbd5e1' }}>
                  Eagle AI · Only references real platform features
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIAssistant;
