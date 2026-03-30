import React, { useState } from 'react';
import api from '../data/api';

export default function AIReviewer({ code, language, problemTitle, problemDesc }) {
  const [review, setReview] = useState('');
  const [hints, setHints] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [loadingHints, setLoadingHints] = useState(false);
  const [activeTab, setActiveTab] = useState('review');
  const [error, setError] = useState('');

  const getReview = async () => {
    if (!code?.trim()) return setError('Write some code first!');
    setLoadingReview(true);
    setError('');
    setReview('');
    try {
      const res = await api.post('/ai/review', { code, language, problemTitle });
      setReview(res.data.review);
      setActiveTab('review');
    } catch (err) {
      setError(err.response?.data?.message || 'AI review failed. Add GEMINI_API_KEY to backend .env');
    }
    setLoadingReview(false);
  };

  const getHints = async () => {
    setLoadingHints(true);
    setError('');
    setHints('');
    try {
      const res = await api.post('/ai/hint', { problemTitle, problemDesc, language });
      setHints(res.data.hints);
      setActiveTab('hints');
    } catch (err) {
      setError(err.response?.data?.message || 'AI hints failed.');
    }
    setLoadingHints(false);
  };

  const formatReview = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.88rem', marginTop: '1rem', marginBottom: '0.3rem' }}>{line.replace(/\*\*/g, '')}</div>;
      }
      if (line.match(/^\d+\.\s\*\*/)) {
        const clean = line.replace(/\*\*/g, '');
        return <div key={i} style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.88rem', marginTop: '1rem', marginBottom: '0.3rem' }}>{clean}</div>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <div key={i} style={{ color: '#9ca3af', fontSize: '0.83rem', paddingLeft: '0.75rem', marginBottom: '0.2rem' }}>• {line.slice(2)}</div>;
      }
      if (line.trim() === '') return <div key={i} style={{ height: '0.3rem' }} />;
      return <div key={i} style={{ color: '#d1d5db', fontSize: '0.83rem', marginBottom: '0.2rem', lineHeight: 1.5 }}>{line.replace(/\*\*/g, '')}</div>;
    });
  };

  return (
    <div style={{ borderTop: '1px solid #1f2937', background: '#0f172a' }}>
      {/* AI Header */}
      <div style={{ padding: '0.75rem 1.25rem', background: '#111827', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>🤖</span>
          <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.85rem' }}>AI Assistant</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={getHints} disabled={loadingHints}
            style={{ padding: '0.3rem 0.8rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: '#f59e0b', cursor: loadingHints ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
            {loadingHints ? '...' : '💡 Hints'}
          </button>
          <button onClick={getReview} disabled={loadingReview}
            style={{ padding: '0.3rem 0.8rem', background: '#7c6af7', border: 'none', borderRadius: '6px', color: '#fff', cursor: loadingReview ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
            {loadingReview ? '⏳ Reviewing...' : '🔍 Review Code'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '1rem 1.25rem' }}>
        {error && (
          <div style={{ background: '#ef444411', border: '1px solid #ef444444', borderRadius: '8px', padding: '0.75rem', color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            ⚠️ {error}
          </div>
        )}

        {!review && !hints && !loadingReview && !loadingHints && !error && (
          <div style={{ color: '#374151', fontSize: '0.83rem', textAlign: 'center', padding: '1rem 0' }}>
            Click <span style={{ color: '#7c6af7' }}>Review Code</span> for AI feedback or <span style={{ color: '#f59e0b' }}>Hints</span> for guidance
          </div>
        )}

        {(loadingReview || loadingHints) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6b7280', fontSize: '0.83rem', padding: '0.5rem 0' }}>
            <div style={{ width: '16px', height: '16px', border: '2px solid #7c6af7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            AI is analyzing your code...
          </div>
        )}

        {/* Tabs when both available */}
        {(review || hints) && (
          <>
            {review && hints && (
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {['review', 'hints'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: activeTab === t ? '#7c6af7' : '#1f2937', color: activeTab === t ? '#fff' : '#6b7280' }}>
                    {t === 'review' ? '🔍 Review' : '💡 Hints'}
                  </button>
                ))}
              </div>
            )}
            {activeTab === 'review' && review && <div>{formatReview(review)}</div>}
            {activeTab === 'hints' && hints && <div>{formatReview(hints)}</div>}
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
