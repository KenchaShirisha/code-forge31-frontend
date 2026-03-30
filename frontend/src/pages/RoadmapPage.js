import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import roadmaps from '../data/roadmaps';

const languages = [
  { key: 'python', icon: '🐍', label: 'Python', color: '#3776AB' },
  { key: 'java', icon: '☕', label: 'Java', color: '#ED8B00' },
  { key: 'c', icon: '⚙️', label: 'C', color: '#A8B9CC' },
  { key: 'cpp', icon: '🔧', label: 'C++', color: '#00599C' },
  { key: 'javascript', icon: '🌐', label: 'JavaScript', color: '#F7DF1E' },
];

export default function RoadmapPage() {
  const { lang } = useParams();
  const navigate = useNavigate();
  const roadmap = lang ? roadmaps[lang] : null;

  if (!lang || !roadmap) return <RoadmapHome navigate={navigate} />;
  return <RoadmapDetail roadmap={roadmap} lang={lang} navigate={navigate} />;
}

function RoadmapHome({ navigate }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#111827)', borderBottom: '1px solid #1f2937', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗺️</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Learning Roadmaps</h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>Step-by-step guides from beginner to advanced for each language</p>
      </div>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {languages.map(l => (
            <div key={l.key}
              onClick={() => navigate(`/roadmap/${l.key}`)}
              style={{ background: '#1f2937', border: `1px solid ${l.color}44`, borderRadius: '16px', padding: '2rem', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = l.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${l.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = l.color + '44'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{l.icon}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>{l.label}</div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Beginner → Advanced</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl, i) => (
                  <span key={i} style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: ['#22c55e22', '#f59e0b22', '#ef444422'][i], color: ['#22c55e', '#f59e0b', '#ef4444'][i] }}>{lvl}</span>
                ))}
              </div>
              <div style={{ marginTop: '1.25rem', padding: '0.5rem 1.2rem', background: l.color + '22', border: `1px solid ${l.color}`, borderRadius: '8px', color: l.color, fontWeight: 700, fontSize: '0.88rem' }}>
                View Roadmap →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoadmapDetail({ roadmap, lang, navigate }) {
  const [activeLevel, setActiveLevel] = useState(0);
  const [expandedNode, setExpandedNode] = useState(null);
  const [checkedNodes, setCheckedNodes] = useState(() => {
    const saved = localStorage.getItem(`roadmap_${lang}`);
    return saved ? JSON.parse(saved) : [];
  });

  const toggleCheck = (id) => {
    const updated = checkedNodes.includes(id)
      ? checkedNodes.filter(n => n !== id)
      : [...checkedNodes, id];
    setCheckedNodes(updated);
    localStorage.setItem(`roadmap_${lang}`, JSON.stringify(updated));
  };

  const level = roadmap.levels[activeLevel];
  const totalNodes = roadmap.levels.reduce((sum, l) => sum + l.nodes.length, 0);
  const completedCount = checkedNodes.length;
  const pct = Math.round((completedCount / totalNodes) * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ background: '#111827', borderBottom: '1px solid #1f2937', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button onClick={() => navigate('/roadmap')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}>← All Roadmaps</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{roadmap.icon}</span>
            <div>
              <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem', margin: 0 }}>{roadmap.title} Roadmap</h1>
              <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.88rem' }}>Complete guide from beginner to advanced</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ color: roadmap.color, fontWeight: 800, fontSize: '1.3rem' }}>{pct}%</div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{completedCount}/{totalNodes} completed</div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div style={{ height: '6px', background: '#1f2937', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${roadmap.color}, ${roadmap.color}aa)`, width: `${pct}%`, borderRadius: '3px', transition: 'width 0.4s' }} />
          </div>

          {/* Level Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {roadmap.levels.map((l, i) => {
              const lvlCompleted = l.nodes.filter(n => checkedNodes.includes(n.id)).length;
              return (
                <button key={i} onClick={() => setActiveLevel(i)}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: `1px solid ${activeLevel === i ? l.color : '#374151'}`, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, background: activeLevel === i ? l.color + '22' : 'transparent', color: activeLevel === i ? l.color : '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {l.name}
                  <span style={{ background: activeLevel === i ? l.color + '33' : '#374151', color: activeLevel === i ? l.color : '#6b7280', padding: '0.1rem 0.45rem', borderRadius: '20px', fontSize: '0.72rem' }}>
                    {lvlCompleted}/{l.nodes.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Roadmap Nodes */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ color: '#6b7280', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
          Click a node to expand details • Check the box to mark as completed
        </div>

        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: '23px', top: '24px', bottom: '24px', width: '2px', background: 'linear-gradient(180deg, ' + level.color + '88, ' + level.color + '22)', borderRadius: '1px' }} />

          {level.nodes.map((node, idx) => {
            const isChecked = checkedNodes.includes(node.id);
            const isExpanded = expandedNode === node.id;
            return (
              <div key={node.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', position: 'relative' }}>
                {/* Node Circle */}
                <div style={{ flexShrink: 0, width: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    onClick={() => toggleCheck(node.id)}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${isChecked ? level.color : '#374151'}`, background: isChecked ? level.color + '22' : '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', zIndex: 1, flexShrink: 0 }}>
                    {isChecked
                      ? <span style={{ color: level.color, fontSize: '1.2rem', fontWeight: 700 }}>✓</span>
                      : <span style={{ color: '#4b5563', fontWeight: 700, fontSize: '0.85rem' }}>{idx + 1}</span>
                    }
                  </div>
                </div>

                {/* Node Card */}
                <div style={{ flex: 1, background: '#1f2937', border: `1px solid ${isExpanded ? level.color : isChecked ? level.color + '44' : '#374151'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <div
                    onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                    style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: isChecked ? level.color : '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>{node.title}</span>
                      {isChecked && <span style={{ background: level.color + '22', color: level.color, padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>Done</span>}
                    </div>
                    <span style={{ color: '#4b5563', fontSize: '0.85rem', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #374151' }}>
                      <p style={{ color: '#9ca3af', lineHeight: 1.7, fontSize: '0.9rem', marginTop: '1rem', marginBottom: '1rem' }}>{node.desc}</p>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Key Topics</div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {node.resources.map((r, ri) => (
                            <span key={ri} style={{ background: '#0f172a', border: '1px solid #374151', color: '#9ca3af', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}>{r}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCheck(node.id)}
                        style={{ padding: '0.5rem 1.2rem', background: isChecked ? '#374151' : level.color, border: 'none', borderRadius: '8px', color: isChecked ? '#9ca3af' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                        {isChecked ? '✓ Mark Incomplete' : '+ Mark as Complete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Level Complete Banner */}
        {level.nodes.every(n => checkedNodes.includes(n.id)) && (
          <div style={{ background: 'linear-gradient(135deg, #22c55e22, #22c55e11)', border: '1px solid #22c55e44', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
            <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.1rem' }}>{level.name} Level Complete!</div>
            {activeLevel < roadmap.levels.length - 1 && (
              <button onClick={() => setActiveLevel(activeLevel + 1)}
                style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#22c55e', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                Continue to {roadmap.levels[activeLevel + 1].name} →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
