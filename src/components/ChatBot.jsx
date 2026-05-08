import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryAI, extractAIReply } from '../services/api';
import { useISS } from '../context/ISSContext';
import { useNewsContext } from '../context/NewsContext';

const CHAT_KEY  = 'iss_ai_chats';
const MAX_CHATS = 30;

function buildSystemPrompt(position, astronauts, news) {
  const newsSnippets = news.slice(0, 5).map((n, i) => `${i + 1}. "${n.title}" — ${n.source}`).join('\n');
  return `You are an AI assistant for this ISS & News Dashboard. Be concise and helpful. Only answer using the data provided below. If asked something not in this data, say "I only have dashboard data available."

ISS POSITION:
- Latitude: ${position?.lat?.toFixed(4) ?? 'N/A'}°
- Longitude: ${position?.lon?.toFixed(4) ?? 'N/A'}°
- Speed: ~${position?.speed?.toLocaleString() ?? '27,600'} km/h
- Altitude: ${position?.altitude ?? '408'} km
- Visibility: ${position?.visibility ?? 'unknown'}
- Region: ${position?.nearest ?? 'Unknown'}

CREW ABOARD ISS (${astronauts.length} people):
${astronauts.length ? astronauts.map(a => `- ${a.name}`).join('\n') : 'No data available'}

LATEST NEWS:
${newsSnippets || 'No news data'}`;
}

/**
 * Local smart fallback when AI API is unavailable.
 * Answers basic ISS questions from live context data.
 */
function localAnswer(question, position, astronauts, news) {
  const q = question.toLowerCase();

  if (q.includes('lat') || q.includes('where') || q.includes('location') || q.includes('position')) {
    if (position) {
      return `The ISS is currently at latitude **${position.lat.toFixed(4)}°**, longitude **${position.lon.toFixed(4)}°** — over the **${position.nearest}** region.`;
    }
    return 'ISS position data is currently loading. Please wait a moment.';
  }

  if (q.includes('speed') || q.includes('fast') || q.includes('velocity')) {
    return `The ISS travels at approximately **${position?.speed?.toLocaleString() ?? '27,600'} km/h** (~7.7 km/s), completing one orbit every ~92 minutes.`;
  }

  if (q.includes('altitud') || q.includes('high')) {
    return `The ISS orbits at approximately **${position?.altitude ?? '408'} km** above Earth's surface.`;
  }

  if (q.includes('astron') || q.includes('crew') || q.includes('people') || q.includes('aboard')) {
    if (astronauts.length) {
      return `There are **${astronauts.length} astronauts** aboard the ISS: ${astronauts.map(a => a.name).join(', ')}.`;
    }
    return 'Crew data is currently unavailable.';
  }

  if (q.includes('news') || q.includes('headline') || q.includes('article')) {
    if (news.length) {
      return `Top headlines:\n${news.slice(0, 3).map((n, i) => `${i + 1}. **${n.title}** (${n.source})`).join('\n')}`;
    }
    return 'No news articles are currently loaded.';
  }

  if (q.includes('visibility') || q.includes('sun') || q.includes('day')) {
    return `The ISS is currently in **${position?.visibility ?? 'unknown'}** — ${position?.visibility === 'daylight' ? 'lit by the sun' : 'in Earth\'s shadow'}.`;
  }

  if (q.includes('hi') || q.includes('hello') || q.includes('hey')) {
    return `Hello! 👋 I'm the ISS AI Assistant. Ask me about the ISS position, speed, altitude, crew, or current news headlines!`;
  }

  return `I can answer questions about the ISS position, speed, altitude, crew, and current news. Try: "Where is the ISS?", "How fast is it?", or "Who is on board?"`;
}

export default function ChatBot() {
  const [open,      setOpen]      = useState(false);
  const [input,     setInput]     = useState('');
  const [isTyping,  setIsTyping]  = useState(false);
  const [aiStatus,  setAiStatus]  = useState('idle'); // 'idle' | 'ok' | 'local'
  const [chats,     setChats]     = useState(() => {
    try { return JSON.parse(localStorage.getItem(CHAT_KEY)) || []; }
    catch { return []; }
  });

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const { position, astronauts } = useISS();
  const { news } = useNewsContext();

  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chats.slice(-MAX_CHATS)));
  }, [chats]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [chats, open, isTyping]);

  const addChat = (role, text) =>
    setChats(prev => [...prev, { role, text }]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    addChat('user', userText);
    setInput('');
    setIsTyping(true);

    try {
      const systemPrompt = buildSystemPrompt(position, astronauts, news);
      const messages = [
        { role: 'system', content: systemPrompt },
        // Only last 6 turns to stay within token budget
        ...chats.slice(-6).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        { role: 'user', content: userText },
      ];

      const data  = await queryAI(messages);
      const reply = extractAIReply(data);

      if (reply) {
        setAiStatus('ok');
        addChat('ai', reply);
      } else {
        throw new Error('EMPTY_RESPONSE');
      }
    } catch (err) {
      console.error('[ChatBot] AI error:', err.message, err.response?.status, err.response?.data);

      // Friendly message for model-loading state
      if (err.message === 'MODEL_LOADING') {
        addChat('ai', '⏳ The AI model is warming up (usually takes ~20s). Meanwhile, here\'s what I know from dashboard data:\n\n' + localAnswer(userText, position, astronauts, news));
        setAiStatus('local');
      } else {
        // Always fall back to local rule-based answer — never show raw error
        const fallback = localAnswer(userText, position, astronauts, news);
        setAiStatus('local');
        addChat('ai', fallback);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* FAB */}
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
              padding: '14px 18px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,210,255,0.1))'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>🤖 ISS AI Assistant</div>
                <div style={{ fontSize: 11, color: aiStatus === 'local' ? '#f59e0b' : 'var(--text-secondary)' }}>
                  {aiStatus === 'local' ? '⚡ Local mode (AI offline)' : 'Powered by Qwen3-1.7B'}
                </div>
              </div>
              <button
                onClick={() => setChats([])}
                style={{
                  background: 'none', border: '1px solid var(--border-color)',
                  borderRadius: 8, padding: '4px 10px', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: 12
                }}
              >Clear</button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: 12,
              minHeight: 280, maxHeight: 380
            }}>
              {chats.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, marginTop: 30 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🛸</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>ISS AI Assistant</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Ask about ISS location, speed, crew, or news</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, justifyContent: 'center' }}>
                    {['Where is the ISS?', 'Who is on board?', 'Top news?'].map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        style={{
                          background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)',
                          borderRadius: 20, padding: '5px 12px', fontSize: 12,
                          color: 'var(--text-primary)', cursor: 'pointer'
                        }}
                      >{q}</button>
                    ))}
                  </div>
                </div>
              )}

              {chats.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #6c63ff, #8b85ff)'
                      : 'rgba(255,255,255,0.07)',
                    color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6,
                    border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{
                  display: 'flex', gap: 6, padding: '10px 14px',
                  background: 'rgba(255,255,255,0.07)', borderRadius: '16px 16px 16px 4px',
                  width: 'fit-content', border: '1px solid var(--border-color)'
                }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
              <input
                ref={inputRef}
                className="input-glass"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
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
