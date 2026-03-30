import React, { useEffect, useState } from 'react';
import api from '../data/api';
import { useAuth } from '../context/AuthContext';

const LEVELS = [
  { name: 'Newbie', min: 0 }, { name: 'Beginner', min: 100 }, { name: 'Learner', min: 300 },
  { name: 'Coder', min: 600 }, { name: 'Developer', min: 1000 }, { name: 'Pro', min: 1500 },
  { name: 'Expert', min: 2500 }, { name: 'Master', min: 4000 },
];
function getLevel(xp) { return [...LEVELS].reverse().find(l => xp >= l.min) || LEVELS[0]; }

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/leaderboard').then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const myRank = users.findIndex(u => u._id === user?._id) + 1;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#111827)', borderBottom: '1px solid #1f2937', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem', margin: '0 0 0.3rem' }}>Leaderboard</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Top coders ranked by XP</p>
        {myRank > 0 && (
          <div style={{ display: 'inline-block', marginTop: '1rem', background: '#7c6af722', border: '1px solid #7c6af744', borderRadius: '20px', padding: '0.4rem 1rem', color: '#a78bfa', fontSize: '0.88rem', fontWeight: 600 }}>
            Your rank: #{myRank}
          </div>
        )}
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
        {/* Top 3 Podium */}
        {!loading && users.length >= 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
            {[users[1], users[0], users[2]].map((u, i) => {
              const heights = ['140px', '170px', '120px'];
              const medals = ['🥈', '🥇', '🥉'];
              const colors = ['#9ca3af', '#f7c948', '#cd7f32'];
              const ranks = [2, 1, 3];
              return (
                <div key={u._id} style={{ flex: 1, maxWidth: '180px', textAlign: 'center' }}>
                  <div style={{ color: colors[i], fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>{medals[i]}</div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg,${colors[i]},${colors[i]}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                  <div style={{ color: '#f7c948', fontWeight: 700, fontSize: '0.82rem' }}>⭐ {u.xp}</div>
                  <div style={{ height: heights[i], background: `${colors[i]}22`, border: `1px solid ${colors[i]}44`, borderRadius: '8px 8px 0 0', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: colors[i], fontWeight: 800, fontSize: '1.5rem' }}>#{ranks[i]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full List */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>Loading...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {users.map((u, i) => {
              const isMe = u._id === user?._id;
              const lvl = getLevel(u.xp);
              return (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: isMe ? '#7c6af711' : '#1f2937', border: `1px solid ${isMe ? '#7c6af7' : '#374151'}`, borderRadius: '10px', padding: '0.9rem 1.25rem', transition: 'all 0.15s' }}>
                  <div style={{ width: '32px', textAlign: 'center', fontWeight: 700, fontSize: '1rem', color: i === 0 ? '#f7c948' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : '#4b5563', flexShrink: 0 }}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                  </div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: isMe ? 'linear-gradient(135deg,#7c6af7,#a78bfa)' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.95rem', flexShrink: 0 }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: isMe ? '#a78bfa' : '#e2e8f0', fontWeight: 600, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {u.name}
                      {isMe && <span style={{ color: '#7c6af7', fontSize: '0.72rem', background: '#7c6af722', padding: '0.1rem 0.4rem', borderRadius: '20px' }}>you</span>}
                    </div>
                    <div style={{ color: '#4b5563', fontSize: '0.75rem' }}>{lvl.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ color: '#f97316', fontSize: '0.82rem', fontWeight: 600 }}>🔥 {u.streak || 0}</div>
                    <div style={{ color: '#f7c948', fontWeight: 700, fontSize: '0.9rem' }}>⭐ {u.xp}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
