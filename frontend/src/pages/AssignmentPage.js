import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../data/api';

const diffColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };

export default function AssignmentPage() {
  const { courseId, level, assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeLeft, setActiveLeft] = useState('instructions');

  useEffect(() => {
    api.get(`/courses/${courseId}`).then(r => {
      const lvl = r.data.levels.find(l => l.name === level);
      const a = lvl?.assignments?.find(a => a._id === assignmentId);
      if (a) { setAssignment(a); setCode(a.starterCode || '// Write your solution here\n'); }
    });
  }, [courseId, level, assignmentId]);

  const submit = async () => {
    if (submitted) return;
    setRunning(true);
    await new Promise(r => setTimeout(r, 900));
    try {
      await api.post('/progress/topic', { courseId, topicId: assignmentId, level, totalTopics: 10 });
    } catch {}
    setSubmitted(true);
    setRunning(false);
  };

  if (!assignment) return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Loading assignment...
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#0f172a', overflow: 'hidden' }}>
      {/* Left Panel */}
      <div style={{ width: '42%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1f2937', minWidth: '320px' }}>
        {/* Left Header */}
        <div style={{ background: '#111827', borderBottom: '1px solid #1f2937', padding: '0 1rem', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate(`/course/${courseId}`)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '0.75rem 0.5rem', fontSize: '0.82rem', marginRight: '0.5rem' }}>←</button>
          {['instructions', 'hints', 'solution'].map(tab => (
            <button key={tab} onClick={() => setActiveLeft(tab)}
              style={{ background: 'none', border: 'none', borderBottom: `2px solid ${activeLeft === tab ? '#7c6af7' : 'transparent'}`, color: activeLeft === tab ? '#7c6af7' : '#6b7280', cursor: 'pointer', padding: '0.75rem 0.9rem', fontSize: '0.85rem', fontWeight: activeLeft === tab ? 600 : 400, textTransform: 'capitalize' }}>
              {tab === 'instructions' ? '📋 Instructions' : tab === 'hints' ? `💡 Hints (${assignment.hints?.length || 0})` : '🔑 Solution'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {activeLeft === 'instructions' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{assignment.title}</h2>
                <span style={{ color: diffColors[assignment.difficulty], background: diffColors[assignment.difficulty] + '22', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', flexShrink: 0 }}>{assignment.difficulty}</span>
              </div>
              <p style={{ color: '#9ca3af', lineHeight: 1.7, fontSize: '0.92rem', marginBottom: '1.5rem' }}>{assignment.description}</p>
              {assignment.instructions && (
                <div style={{ background: '#1f2937', borderRadius: '10px', padding: '1rem', border: '1px solid #374151' }}>
                  <div style={{ color: '#7c6af7', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Task</div>
                  <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{assignment.instructions}</p>
                </div>
              )}
            </>
          )}

          {activeLeft === 'hints' && (
            <>
              {!assignment.hints?.length ? (
                <div style={{ color: '#4b5563', textAlign: 'center', padding: '2rem' }}>No hints available.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {assignment.hints.map((h, i) => (
                    <div key={i} style={{ background: '#1f2937', border: '1px solid #f59e0b33', borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: 1.6 }}>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeLeft === 'solution' && (
            <>
              {!assignment.solution ? (
                <div style={{ color: '#4b5563', textAlign: 'center', padding: '2rem' }}>No solution available.</div>
              ) : (
                <div>
                  <div style={{ background: '#ef444411', border: '1px solid #ef444433', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ef4444', fontSize: '0.82rem' }}>
                    ⚠️ Try solving it yourself first!
                  </div>
                  <pre style={{ background: '#0f172a', border: '1px solid #374151', borderRadius: '8px', padding: '1rem', color: '#a5f3fc', fontFamily: '"Fira Code", monospace', fontSize: '0.83rem', overflowX: 'auto', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {assignment.solution}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Editor Toolbar */}
        <div style={{ background: '#111827', borderBottom: '1px solid #1f2937', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#6b7280', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>{assignment.language}</span>
            {submitted && <span style={{ background: '#22c55e22', color: '#22c55e', padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>✓ Submitted</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setCode(assignment.starterCode || '')}
              style={{ padding: '0.35rem 0.8rem', background: 'transparent', border: '1px solid #374151', borderRadius: '6px', color: '#6b7280', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s' }}>
              Reset
            </button>
            <button onClick={submit} disabled={running || submitted}
              style={{ padding: '0.35rem 1.2rem', background: submitted ? '#22c55e' : running ? '#374151' : '#7c6af7', border: 'none', borderRadius: '6px', color: '#fff', cursor: running || submitted ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 700, transition: 'background 0.2s' }}>
              {submitted ? '✓ Submitted' : running ? '⏳ Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          style={{ flex: 1, background: '#1e1e2e', color: '#cdd6f4', border: 'none', padding: '1rem', fontFamily: '"Fira Code", "Cascadia Code", monospace', fontSize: '0.88rem', resize: 'none', outline: 'none', lineHeight: 1.6, tabSize: 2 }}
          onKeyDown={e => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const s = e.target.selectionStart;
              const val = code.substring(0, s) + '  ' + code.substring(e.target.selectionEnd);
              setCode(val);
              setTimeout(() => e.target.setSelectionRange(s + 2, s + 2), 0);
            }
          }}
        />

        {/* Output Panel */}
        <div style={{ height: '120px', background: '#111827', borderTop: '1px solid #1f2937', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #1f2937', color: '#4b5563', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Output</div>
          <div style={{ padding: '0.75rem 1rem' }}>
            {running && <div style={{ color: '#f59e0b', fontSize: '0.85rem' }}>⏳ Submitting assignment...</div>}
            {!running && !submitted && <div style={{ color: '#374151', fontSize: '0.85rem' }}>Submit your assignment to record progress.</div>}
            {submitted && (
              <div>
                <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>✓ Assignment submitted successfully!</div>
                <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>+10 XP earned 🎉</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
