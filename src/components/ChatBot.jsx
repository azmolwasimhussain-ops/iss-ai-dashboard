import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryAI } from '../services/api';
import { useISS } from '../context/ISSContext';
import { useNewsContext } from '../context/NewsContext';

const CHAT_KEY = 'iss_ai_chats';
const MAX_CHATS = 30;

function buildSystemPrompt(position, astronauts, news) {
  const newsSnippets = news.slice(0, 5).map((n, i) => `${i + 1}. "${n.title}" — ${n.source}`).join('\n');
  return `You are an AI assistant ONLY for this ISS & News Dashboard. Answer ONLY using the data below. If a question is not about this data, respond: "I only answer using dashboard data."

ISS CURRENT DATA:
- Latitude: ${position?.lat?.toFixed(4) ?? 'N/A'}°
- Longitude: ${position?.lon?.toFixed(4) ?? 'N/A'}°
- Speed: ~${position?.speed?.toLocaleString() ?? '27,600'} km/h
- Location: ${position?.nearest ?? 'Unknown'}
- Trajectory points tracked: ${position ? 1 : 0}

ASTRONAUTS IN SPACE (ISS):
${astronauts.length ? astronauts.map(a => `- ${a.name}`).join('\n') : 'No data'}

TOP NEWS:
${newsSnippets || 'No news data available'}`;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chats, setChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CHAT_KEY)) || []; }
    catch { return []; }
  });
  const bottomRef = useRef(null);
  const { position, astronauts } = useISS();
  const { news } = useNewsContext();

  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chats.slice(-MAX_CHATS)));
  }, [chats]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, open, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = { role: 'user', text: input.trim() };
    setChats(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const systemMessage = buildSystemPrompt(position, astronauts, news);
      const messages = [
        { role: 'system', content: systemMessage },
        ...chats.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: input.trim() }
      ];

      const data = await queryAI(messages);
      let reply = '';
      if (data && data.choices && data.choices.length > 0) {
        reply = data.choices[0].message.content.trim();
      } else {
        reply = "I only answer using dashboard data.";
      }
      setChats(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (e) {
      console.error(e);
      setChats(prev => [...prev, { role: 'ai', text: 'Error connecting to AI. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1001,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6c63ff, #00d2ff)',
          border: 'none', cursor: 'pointer', fontSize: 24,
          boxShadow: '0 8px 32px rgba(108,99,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {open ? '✕' : '🤖'}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="chatbot-window glass-strong"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,210,255,0.1))'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>🤖 ISS AI Assistant</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Answers from dashboard data only</div>
              </div>
              <button
                onClick={() => setChats([])}
                style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 8, padding: '4px 10px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 }}
              >Clear</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 300, maxHeight: 400 }}>
              {chats.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, marginTop: 40 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🛸</div>
                  Ask me about ISS location, speed, astronauts, or current news!
                </div>
              )}
              {chats.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #6c63ff, #8b85ff)' : 'rgba(255,255,255,0.08)',
                    color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.5,
                    border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', gap: 6, padding: '10px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 4px', width: 'fit-content', border: '1px solid var(--border-color)' }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
              <input
                className="input-glass"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about ISS or news..."
                style={{ flex: 1, fontSize: 13 }}
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                className="btn-primary"
                disabled={isTyping || !input.trim()}
                style={{ padding: '10px 16px', fontSize: 16 }}
              >➤</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
