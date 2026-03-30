import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../data/api';

const diffColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };

export default function DailyChallenge() {
  const [data, setData] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/progress/daily/challenge').then(r => {
      setData(r.data);
      setDone(r.data.alreadyDone);
    }).catch(() => {});
  }, []);

  const complete = async () => {
    setCompleting(true);
    await api.post('/progress/daily/complete');
    setDone(true);
    setCompleting(false);
  };

  if (!data?.problem) return null;
  const { problem, dailyChallengeStreak } = data;

  return (
    <div style={{ background: done ? 'linear-gradient(135deg,#22c55e11,#1f2937)' : 'linear-gradient(135deg,#7c6af711,#1e1b4b)', border: `1px solid ${done ? '#22c55e44' : '#7c6af744'}`, borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
      <div style={{ fontSize: '2rem' }}>{done ? '✅' : '🔥'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span style={{ color: done ? '#22c55e' : '#a78bfa', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Challenge</span>
          <span style={{ background: '#f59e0b22', color: '#f59e0b', padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>+50 XP</span>
          {dailyChallengeStreak > 0 && <span style={{ background: '#f9731622', color: '#f97316', padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>🔥 {dailyChallengeStreak} day streak</span>}
        </div>
        <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem' }}>{problem.title}</div>
        <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '0.2rem' }}>{problem.courseName} • <span style={{ color: diffColors[problem.difficulty] }}>{problem.difficulty}</span></div>
      </div>
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <button onClick={() => navigate(`/problem/${problem.courseId}/beginner/${problem._id}`)}
          style={{ padding: '0.55rem 1.1rem', background: 'transparent', border: '1px solid #374151', borderRadius: '8px', color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
          View Problem
        </button>
        {!done && (
          <button onClick={complete} disabled={completing}
            style={{ padding: '0.55rem 1.2rem', background: '#7c6af7', border: 'none', borderRadius: '8px', color: '#fff', cursor: completing ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
            {completing ? '...' : 'Mark Done ✓'}
          </button>
        )}
        {done && <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.88rem', alignSelf: 'center' }}>Completed! 🎉</span>}
      </div>
    </div>
  );
}
