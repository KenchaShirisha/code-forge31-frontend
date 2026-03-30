import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../data/api';

const diffColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const timerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = (q) => {
    setQuery(q);
    clearTimeout(timerRef.current);
    if (q.trim().length < 2) { setResults(null); setOpen(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(q.trim())}`);
        setResults(res.data);
        setOpen(true);
      } catch (err) {
        setResults({ courses: [], problems: [], topics: [] });
        setOpen(true);
      }
      setLoading(false);
    }, 400);
  };

  const clear = () => { setQuery(''); setResults(null); setOpen(false); };

  const go = (path) => { setOpen(false); setQuery(''); setResults(null); navigate(path); };

  const hasResults = results && (results.courses?.length || results.problems?.length || results.topics?.length);

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: '0.9rem' }}>🔍</span>
        <input
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => query.length >= 2 && results && setOpen(true)}
          placeholder="Search problems, topics, courses..."
          style={{ width: '100%', padding: '0.5rem 2.2rem 0.5rem 2.2rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
        />
        {loading && <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '0.75rem' }}>⏳</span>}
        {!loading && query && <span onClick={clear} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '0.85rem', cursor: 'pointer' }}>✕</span>}
      </div>

      {open && (
        <div style={{ position: 'absolute', top: '42px', left: 0, right: 0, background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', zIndex: 9999, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', maxHeight: '420px', overflowY: 'auto' }}>
          {!hasResults && !loading && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#4b5563', fontSize: '0.85rem' }}>No results for "{query}"</div>
          )}

          {results?.courses?.length > 0 && (
            <Section title="Courses">
              {results.courses.map(c => (
                <Item key={c._id} onClick={() => go(`/course/${c._id}`)}>
                  <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                  <span style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{c.title}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.75rem', marginLeft: 'auto' }}>{c.language}</span>
                </Item>
              ))}
            </Section>
          )}

          {results?.problems?.length > 0 && (
            <Section title="Problems">
              {results.problems.map(p => (
                <Item key={p._id} onClick={() => go(`/problem/${p.courseId}/${p.level}/${p._id}`)}>
                  <span style={{ fontSize: '1rem' }}>🧩</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{p.title}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>{p.courseName} • {p.level}</div>
                  </div>
                  <span style={{ color: diffColors[p.difficulty], fontSize: '0.72rem', fontWeight: 700 }}>{p.difficulty}</span>
                </Item>
              ))}
            </Section>
          )}

          {results?.topics?.length > 0 && (
            <Section title="Topics">
              {results.topics.map(t => (
                <Item key={t._id} onClick={() => go(`/course/${t.courseId}`)}>
                  <span style={{ fontSize: '1rem' }}>📚</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{t.title}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>{t.courseName} • {t.level}</div>
                  </div>
                </Item>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ padding: '0.5rem 1rem', color: '#4b5563', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#111827' }}>{title}</div>
      {children}
    </div>
  );
}

function Item({ onClick, children }) {
  return (
    <div onClick={onClick}
      style={{ padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #374151' }}
      onMouseEnter={e => e.currentTarget.style.background = '#374151'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {children}
    </div>
  );
}
