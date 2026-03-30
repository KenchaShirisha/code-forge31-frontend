import React, { useEffect, useState, useRef } from 'react';
import api from '../data/api';

export default function NotificationBell() {
  const [data, setData] = useState({ notifications: [], unread: 0 });
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = () => {
    api.get('/notifications').then(r => setData(r.data)).catch(() => {});
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setData(prev => ({ ...prev, unread: 0, notifications: prev.notifications.map(n => ({ ...n, read: true })) }));
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setData(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1), notifications: prev.notifications.map(n => n._id === id ? { ...n, read: true } : n) }));
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '1rem' }}>🔔</span>
        {data.unread > 0 && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {data.unread > 9 ? '9+' : data.unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: '44px', background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', width: '320px', zIndex: 300, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>🔔 Notifications</span>
            {data.unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#7c6af7', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Mark all read</button>
            )}
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {data.notifications.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#4b5563', fontSize: '0.85rem' }}>No notifications yet</div>
            )}
            {data.notifications.map(n => (
              <div key={n._id} onClick={() => markRead(n._id)}
                style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #374151', cursor: 'pointer', background: n.read ? 'transparent' : '#7c6af711', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#374151'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : '#7c6af711'}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{n.icon}</span>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.15rem' }}>{n.message}</div>
                    <div style={{ color: '#4b5563', fontSize: '0.72rem', marginTop: '0.25rem' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                  </div>
                  {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c6af7', flexShrink: 0, marginTop: '4px' }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
