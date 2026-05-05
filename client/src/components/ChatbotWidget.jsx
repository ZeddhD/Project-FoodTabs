import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';

const QUICK_ACTIONS = [
  { label: '💡 Recommendations', message: 'recommend' },
  { label: '📅 How to Book',     message: 'book a table' },
  { label: '⭐ Write a Review',  message: 'write a review' },
  { label: '💬 Community',       message: 'forum' }
];

export default function ChatbotWidget() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "👋 Hi! I'm the FoodTabs assistant. Ask me anything about restaurants, bookings, or reviews!" }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text) =>
    setMessages(prev => [...prev, { type: 'bot', text }]);

  const sendMessage = async (text) => {
    setLoading(true);
    try {
      const res = await chatAPI.send(text);
      addBotMessage(res.data?.data?.reply || 'Sorry, I could not understand that.');
    } catch {
      addBotMessage('Sorry, I\'m having trouble connecting right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { type: 'user', text }]);
    setInput('');
    sendMessage(text);
  };

  const handleQuick = (msg) => {
    setMessages(prev => [...prev, { type: 'user', text: msg }]);
    sendMessage(msg);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        title="FoodTabs AI Assistant"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--clr-primary)', color: 'white',
          border: 'none', fontSize: 24, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(232,70,11,0.4)',
          zIndex: 999, display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 96, right: 24,
          width: 360, maxWidth: 'calc(100vw - 48px)',
          height: 480, maxHeight: '75vh',
          background: 'white',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column',
          zIndex: 998, overflow: 'hidden',
          border: '1px solid var(--clr-border)',
          animation: 'chatSlideUp 0.22s ease',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--clr-primary), #FF7043)',
            color: 'white', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>FoodTabs Assistant</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>● Online · Rule-Based Bot</div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none',
              color: 'white', width: 28, height: 28, borderRadius: '50%',
              cursor: 'pointer', fontSize: 13, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
            background: 'var(--clr-bg)',
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '78%', padding: '10px 14px',
                  borderRadius: msg.type === 'user'
                    ? 'var(--r-md) var(--r-sm) var(--r-sm) var(--r-md)'
                    : 'var(--r-sm) var(--r-md) var(--r-md) var(--r-sm)',
                  background: msg.type === 'user' ? 'var(--clr-primary)' : 'white',
                  color: msg.type === 'user' ? 'white' : 'var(--clr-text)',
                  fontSize: 13, lineHeight: 1.55,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--r-sm) var(--r-md) var(--r-md) var(--r-sm)',
                  background: 'white', display: 'flex', gap: 4, alignItems: 'center',
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--clr-text-light)',
                      animation: `chatBounce 1.1s ${delay}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (shown only at start) */}
          {messages.length <= 1 && !loading && (
            <div style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--clr-border)',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
            }}>
              {QUICK_ACTIONS.map(a => (
                <button
                  key={a.label}
                  onClick={() => handleQuick(a.message)}
                  style={{
                    padding: '7px 10px',
                    background: 'var(--clr-primary-light)',
                    color: 'var(--clr-primary)',
                    border: '1px solid var(--clr-primary)',
                    borderRadius: 'var(--r-sm)',
                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--clr-primary)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--clr-primary-light)'; e.currentTarget.style.color = 'var(--clr-primary)'; }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} style={{
            display: 'flex', gap: 8, padding: '10px 12px',
            borderTop: '1px solid var(--clr-border)',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
              className="form-input"
              style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary btn-sm"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
