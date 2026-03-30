import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../data/api';

const diffColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
const levelOrder = ['beginner', 'intermediate', 'advanced'];
const levelColors = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [activeTab, setActiveTab] = useState('problems');
  const [progress, setProgress] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [markingTopic, setMarkingTopic] = useState(null);

  useEffect(() => {
    api.get(`/courses/${id}`).then(r => setCourse(r.data));
    api.get(`/progress/${id}`).then(r => setProgress(r.data)).catch(() => {});
  }, [id]);

  if (!course) return <Loader />;

  const level = course.levels.find(l => l.name === activeLevel);
  const solved = progress?.solvedProblems || [];
  const completed = progress?.completedTopics || [];

  const markTopic = async (e, t) => {
    e.stopPropagation();
    if (completed.includes(t._id)) return;
    setMarkingTopic(t._id);
    try {
      await api.post('/progress/topic', { courseId: id, topicId: t._id, level: activeLevel, totalTopics: level.topics.length });
      setProgress(p => ({ ...p, completedTopics: [...(p?.completedTopics || []), t._id] }));
    } catch {}
    setMarkingTopic(null);
  };

  const solvedCount = level?.problems?.filter(p => solved.includes(p._id)).length || 0;
  const topicsCount = level?.topics?.filter(t => completed.includes(t._id)).length || 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ background: '#111827', borderBottom: '1px solid #1f2937', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            ← Back to Courses
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.5rem' }}>{course.icon}</span>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0 }}>{course.title}</h1>
              <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.9rem' }}>{course.description}</p>
            </div>
          </div>

          {/* Level Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {levelOrder.map(l => {
              const lvl = course.levels.find(lv => lv.name === l);
              const lvlSolved = lvl?.problems?.filter(p => solved.includes(p._id)).length || 0;
              return (
                <button key={l}
                  onClick={() => { setActiveLevel(l); setSelectedTopic(null); }}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: `1px solid ${activeLevel === l ? levelColors[l] : '#374151'}`, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, background: activeLevel === l ? levelColors[l] + '22' : 'transparent', color: activeLevel === l ? levelColors[l] : '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                  {lvlSolved > 0 && <span style={{ background: levelColors[l] + '33', color: levelColors[l], padding: '0.05rem 0.4rem', borderRadius: '20px', fontSize: '0.7rem' }}>{lvlSolved}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        {/* Progress Bar */}
        {level && (
          <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Problems Solved', val: solvedCount, total: level.problems?.length || 0, color: '#7c6af7' },
              { label: 'Topics Done', val: topicsCount, total: level.topics?.length || 0, color: '#22c55e' },
              { label: 'Assignments', val: level.assignments?.length || 0, total: level.assignments?.length || 0, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, minWidth: '120px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.78rem' }}>{s.label}</span>
                  <span style={{ color: s.color, fontWeight: 700, fontSize: '0.82rem' }}>{s.val}/{s.total}</span>
                </div>
                <div style={{ height: '4px', background: '#374151', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: s.total ? `${(s.val / s.total) * 100}%` : '0%', background: s.color, borderRadius: '2px', transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', background: '#1f2937', borderRadius: '10px', padding: '0.3rem', width: 'fit-content', flexWrap: 'wrap' }}>
          {['problems', 'topics', 'assignments', 'quiz'].map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, background: activeTab === tab ? '#7c6af7' : 'transparent', color: activeTab === tab ? '#fff' : '#6b7280', transition: 'all 0.15s' }}>
              {tab === 'problems' ? '🧩 Problems' : tab === 'topics' ? '📚 Topics' : tab === 'assignments' ? '📝 Assignments' : '🎯 Quiz'}
            </button>
          ))}
        </div>

        {/* Problems Tab */}
        {activeTab === 'problems' && level && (
          <div>
            <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>{level.problems.length} problems • {solvedCount} solved</div>
            {level.problems.length === 0 ? (
              <EmptyState icon="🧩" msg="No problems for this level yet." />
            ) : (
              <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', border: '1px solid #374151' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '0.75rem 1.25rem', borderBottom: '1px solid #374151', color: '#4b5563', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <span>Title</span><span>Difficulty</span><span>Status</span>
                </div>
                {level.problems.map((p, i) => (
                  <div key={p._id}
                    onClick={() => navigate(`/problem/${id}/${activeLevel}/${p._id}`)}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '1rem 1.25rem', borderBottom: i < level.problems.length - 1 ? '1px solid #1f2937' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#374151'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '0.92rem' }}>{i + 1}. {p.title}</span>
                    <span style={{ color: diffColors[p.difficulty], fontWeight: 600, fontSize: '0.82rem', textTransform: 'capitalize' }}>{p.difficulty}</span>
                    <span style={{ fontSize: '0.82rem' }}>
                      {solved.includes(p._id)
                        ? <span style={{ color: '#22c55e' }}>✓ Solved</span>
                        : <span style={{ color: '#4b5563' }}>— Todo</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && level && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {level.topics.length === 0 ? <EmptyState icon="📚" msg="No topics for this level yet." /> : level.topics.map(t => (
              <div key={t._id}
                onClick={() => setSelectedTopic(selectedTopic?._id === t._id ? null : t)}
                style={{ background: '#1f2937', border: `1px solid ${selectedTopic?._id === t._id ? '#7c6af7' : completed.includes(t._id) ? '#22c55e44' : '#374151'}`, borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: completed.includes(t._id) ? '#22c55e' : '#4b5563', fontSize: '1rem', fontWeight: 700 }}>{completed.includes(t._id) ? '✓' : '○'}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{t.title}</span>
                    {completed.includes(t._id) && <span style={{ background: '#22c55e22', color: '#22c55e', padding: '0.1rem 0.45rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>Done</span>}
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', transition: 'transform 0.2s', transform: selectedTopic?._id === t._id ? 'rotate(180deg)' : 'none' }}>▼</span>
                </div>
                {selectedTopic?._id === t._id && (
                  <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #374151' }}>
                    <p style={{ color: '#9ca3af', lineHeight: 1.7, marginTop: '1rem', fontSize: '0.92rem' }}>{t.explanation}</p>
                    {t.codeExample && (
                      <pre style={{ background: '#0f172a', border: '1px solid #374151', borderRadius: '8px', padding: '1rem', color: '#a5f3fc', fontFamily: '"Fira Code", monospace', fontSize: '0.85rem', overflowX: 'auto', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{t.codeExample}</pre>
                    )}
                    <button
                      onClick={e => markTopic(e, t)}
                      disabled={completed.includes(t._id) || markingTopic === t._id}
                      style={{ marginTop: '1rem', padding: '0.5rem 1.2rem', background: completed.includes(t._id) ? '#22c55e22' : '#7c6af7', color: completed.includes(t._id) ? '#22c55e' : '#fff', border: completed.includes(t._id) ? '1px solid #22c55e44' : 'none', borderRadius: '8px', cursor: completed.includes(t._id) ? 'default' : 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                      {markingTopic === t._id ? '⏳ Saving...' : completed.includes(t._id) ? '✓ Completed' : 'Mark Complete'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && level && (
          <div>
            {(!level.assignments || level.assignments.length === 0) ? (
              <EmptyState icon="📝" msg="No assignments for this level yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {level.assignments.map((a, i) => (
                  <div key={a._id} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '1.5rem', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#7c6af744'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#374151'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ color: '#6b7280', fontSize: '0.78rem', fontWeight: 600 }}>Assignment {i + 1}</span>
                        <h3 style={{ color: '#f1f5f9', fontWeight: 700, margin: '0.2rem 0', fontSize: '1rem' }}>{a.title}</h3>
                      </div>
                      <span style={{ color: diffColors[a.difficulty], background: diffColors[a.difficulty] + '22', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', flexShrink: 0 }}>{a.difficulty}</span>
                    </div>
                    <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>{a.description}</p>
                    {a.hints?.length > 0 && (
                      <div style={{ background: '#0f172a', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                        <div style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.4rem' }}>💡 Hints</div>
                        {a.hints.map((h, hi) => <div key={hi} style={{ color: '#9ca3af', fontSize: '0.83rem', marginBottom: '0.2rem' }}>• {h}</div>)}
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/assignment/${id}/${activeLevel}/${a._id}`)}
                      style={{ padding: '0.55rem 1.3rem', background: '#7c6af7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.target.style.background = '#6d5ce6'}
                      onMouseLeave={e => e.target.style.background = '#7c6af7'}>
                      Start Assignment →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.2rem' }}>{activeLevel.charAt(0).toUpperCase() + activeLevel.slice(1)} Quiz</h3>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Test your knowledge with {level?.quiz?.length || 0} questions</p>
            <p style={{ color: '#4b5563', fontSize: '0.82rem', marginBottom: '1.75rem' }}>⏱ ~{(level?.quiz?.length || 0) * 30} seconds • Pass with 70%+</p>
            <button
              onClick={() => navigate(`/quiz/${id}/${activeLevel}`)}
              style={{ padding: '0.75rem 2.5rem', background: '#7c6af7', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', transition: 'background 0.15s' }}
              onMouseEnter={e => e.target.style.background = '#6d5ce6'}
              onMouseLeave={e => e.target.style.background = '#7c6af7'}>
              Start Quiz →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, msg }) {
  return (
    <div style={{ color: '#4b5563', textAlign: 'center', padding: '3rem', background: '#1f2937', borderRadius: '12px' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div>{msg}</div>
    </div>
  );
}

function Loader() {
  return <div style={{ color: '#6b7280', padding: '3rem', textAlign: 'center', background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading course...</div>;
}
