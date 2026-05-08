import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/', label: 'Overview', icon: '⚡' },
  { path: '/iss', label: 'ISS Tracker', icon: '🛰️' },
  { path: '/news', label: 'News', icon: '📰' },
  { path: '/charts', label: 'Charts', icon: '📊' },
];

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <aside className="sidebar" style={{
        width: '240px', minHeight: '100vh', padding: '24px 0',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
        zIndex: 100, flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #6c63ff, #00d2ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20
            }}>🛸</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>ISS & AI</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Dashboard</div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <div
                  className={isActive ? 'nav-active' : ''}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 10, marginBottom: 4,
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400, fontSize: 14,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: 14 }}
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0, padding: '24px', overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 24
        }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            🟢 Live — Updates every 15s
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,210,255,0.1))',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: 20, padding: '6px 14px', fontSize: 12, color: 'var(--accent)'
            }}>
              🛰️ ISS Live
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
