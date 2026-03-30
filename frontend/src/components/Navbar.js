import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => ({
    textDecoration: 'none',
    color: isActive(to) ? '#7c6af7' : '#ccc',
    fontSize: '0.92rem',
    fontWeight: isActive(to) ? 600 : 400,
    padding: '0.3rem 0',
    borderBottom: isActive(to) ? '2px solid #7c6af7' : '2px solid transparent',
    transition: 'color 0.2s',
  });

  return (
    <nav style={{ background: '#111827', borderBottom: '1px solid #1f2937', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexShrink: 0 }}>
        <Link to="/" style={{ color: '#7c6af7', fontWeight: 800, fontSize: '1.3rem', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          ⚡ CodeForge
        </Link>
        {user && (
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/" style={navLink('/')}>Courses</Link>
            <Link to="/roadmap" style={navLink('/roadmap')}>Roadmaps</Link>
            <Link to="/leaderboard" style={navLink('/leaderboard')}>Leaderboard</Link>
          </div>
        )}
      </div>

      {user && <GlobalSearch />}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1f2937', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
              <span style={{ fontSize: '0.8rem' }}>🔥</span>
              <span style={{ color: '#f97316', fontWeight: 700, fontSize: '0.85rem' }}>{user.streak}</span>
              <span style={{ color: '#374151', margin: '0 0.2rem' }}>|</span>
              <span style={{ fontSize: '0.8rem' }}>⭐</span>
              <span style={{ color: '#f7c948', fontWeight: 700, fontSize: '0.85rem' }}>{user.xp}</span>
            </div>
            <NotificationBell />
            <div style={{ position: 'relative' }}>
              <div onClick={() => setDropOpen(!dropOpen)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              {dropOpen && (
                <div style={{ position: 'absolute', right: 0, top: '44px', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', minWidth: '180px', zIndex: 200, overflow: 'hidden' }}
                  onMouseLeave={() => setDropOpen(false)}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #374151' }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>{user.email}</div>
                  </div>
                  <Link to="/profile" onClick={() => setDropOpen(false)}
                    style={{ display: 'block', padding: '0.65rem 1rem', color: '#d1d5db', textDecoration: 'none', fontSize: '0.88rem' }}>
                    👤 Profile
                  </Link>
                  <button onClick={() => { setDropOpen(false); logout(); }}
                    style={{ display: 'block', width: '100%', padding: '0.65rem 1rem', color: '#ef4444', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem' }}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Login</Link>
            <Link to="/register" style={{ background: '#7c6af7', color: '#fff', padding: '0.45rem 1.1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
