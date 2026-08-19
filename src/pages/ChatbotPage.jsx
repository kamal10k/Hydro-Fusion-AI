import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Bot, Send, User, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

export const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am HydroFusion AI - The Digital Chemist. I analyze your data center thermal load, cooling tower chemistry, scaling risk, and freshwater-greywater ratio. How can I assist your water management today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const promptChips = [
    "Why is my scaling risk high?",
    "How can I maximize greywater reuse safely?",
    "What pH adjustments balance high TDS?",
    "Explain GPU thermal impact on scaling."
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(query);
      setMessages(prev => [...prev, { sender: 'bot', text: res.response }]);
      setLoading(false);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'The current scaling risk is evaluated based on TDS, pH, conductivity, and cooling cycles. Review the recommended blending ratio to lower mineral precipitation.'
      }]);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={22} color="#a78bfa" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              The Digital Chemist <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>(Gemini AI)</span>
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Context-Aware AI Water Management & Thermodynamics Assistant
            </p>
          </div>
        </div>

        <button className="btn-secondary" onClick={() => setMessages([messages[0]])} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          <RefreshCw size={14} /> Clear Chat
        </button>
      </div>

      {/* Messages Box */}
      <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            {m.sender === 'bot' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={16} color="#a78bfa" />
              </div>
            )}

            <div style={{
              background: m.sender === 'user'
                ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)'
                : 'rgba(15, 23, 42, 0.9)',
              color: m.sender === 'user' ? '#070a12' : '#f8fafc',
              border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
              padding: '0.85rem 1.1rem',
              borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              fontWeight: m.sender === 'user' ? 600 : 400
            }}>
              {m.text}
            </div>

            {m.sender === 'user' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 242, 254, 0.2)',
                border: '1px solid rgba(0, 242, 254, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <User size={16} color="#00f2fe" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#a78bfa" />
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '0.85rem 1.1rem', borderRadius: '16px', fontSize: '0.85rem', color: '#a78bfa' }} className="pulse-active">
              Thinking and analyzing water chemistry...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: '9999px',
              padding: '0.4rem 0.85rem',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ✨ {chip}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask The Digital Chemist about scaling risk, TDS, pH, or blending ratios..."
          className="input-field"
          style={{ flex: 1 }}
        />
        <button className="btn-primary" onClick={() => handleSend()} disabled={loading}>
          <Send size={16} /> Send
        </button>
      </div>
    </div>
  );
};
