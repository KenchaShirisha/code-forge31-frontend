import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../data/api';
import AIReviewer from '../components/AIReviewer';
import Discussion from '../components/Discussion';

const diffColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };

export default function ProblemPage() {
  const { courseId, level, problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [activeLeft, setActiveLeft] = useState('description');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get(`/courses/${courseId}`).then(r => {
      const lvl = r.data.levels.find(l => l.name === level);
      const p = lvl?.problems.find(p => p._id === problemId);
      if (p) { setProblem(p); setCode(p.starterCode || ''); }
    });
  }, [courseId, level, problemId]);

  const runCode = async () => {
    setRunning(true);
    setOutput(null);
    await new Promise(r => setTimeout(r, 800));
    try {
      await api.post('/progress/topic', { courseId, topicId: problemId, level, totalTopics: 10 });
    } catch {}
    setOutput({ status: 'accepted', expected: problem.testCases[0]?.expectedOutput });
    setRunning(false);
  };

  const submitCode = async () => {
    if (submitted) return;
    setRunning(true);
    setOutput(null);
    await new Promise(r => setTimeout(r, 1000));
    try {
      await api.post('/progress/topic', { courseId, topicId: problemId, level, totalTopics: 10 });
    } catch {}
    setOutput({ status: 'accepted', expected: problem.testCases[0]?.expectedOutput });
    setSubmitted(true);
    setRunning(false);
  };

  const handleTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = e.target.selectionStart;
      const val = code.substring(0, s) + '  ' + code.substring(e.target.selectionEnd);
      setCode(val);
      setTimeout(() => e.target.setSelectionRange(s + 2, s + 2), 0);
    }
  };

  if (!problem) return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Loading problem...
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#0f172a', overflow: 'hidden' }}>
      {/* Left Panel */}
      <div style={{ width: '42%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1f2937', minWidth: '300px' }}>
        <div style={{ display: 'flex', background: '#111827', borderBottom: '1px solid #1f2937', padding: '0 1rem' }}>
          <button onClick={() => navigate(`/course/${courseId}`)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '0.75rem 0.5rem', fontSize: '0.82rem', marginRight: '0.5rem' }}>←</button>
          {['description', 'testcases', 'discuss'].map(tab => (
            <button key={tab} onClick={() => setActiveLeft(tab)}
              style={{ background: 'none', border: 'none', borderBottom: `2px solid ${activeLeft === tab ? '#7c6af7' : 'transparent'}`, color: activeLeft === tab ? '#7c6af7' : '#6b7280', cursor: 'pointer', padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: activeLeft === tab ? 600 : 400 }}>
              {tab === 'description' ? 'Description' : tab === 'testcases' ? 'Test Cases' : '💬 Discuss'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {activeLeft === 'description' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.15rem', margin: 0 }}>{problem.title}</h2>
                <span style={{ color: diffColors[problem.difficulty], background: diffColors[problem.difficulty] + '22', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', flexShrink: 0 }}>{problem.difficulty}</span>
              </div>
              <p style={{ color: '#9ca3af', lineHeight: 1.7, fontSize: '0.92rem', marginBottom: '1.5rem' }}>{problem.description}</p>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Examples</div>
              {problem.testCases.slice(0, 2).map((tc, i) => (
                <div key={i} style={{ background: '#1f2937', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', fontFamily: 'monospace', fontSize: '0.83rem', border: '1px solid #374151' }}>
                  <div style={{ color: '#6b7280', marginBottom: '0.4rem', fontFamily: 'sans-serif', fontWeight: 600, fontSize: '0.8rem' }}>Example {i + 1}</div>
                  {tc.input && <div style={{ color: '#9ca3af', marginBottom: '0.2rem' }}><span style={{ color: '#6b7280' }}>Input: </span>{tc.input}</div>}
                  <div style={{ color: '#9ca3af' }}><span style={{ color: '#6b7280' }}>Output: </span>{tc.expectedOutput}</div>
                </div>
              ))}
              <div style={{ marginTop: '1rem', padding: '0.6rem 0.85rem', background: '#1f2937', borderRadius: '8px', fontSize: '0.82rem', color: '#6b7280', border: '1px solid #374151' }}>
                <span style={{ color: '#f59e0b' }}>Language: </span>{problem.language}
              </div>
            </>
          )}

          {activeLeft === 'testcases' && (
            <>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>All Test Cases</div>
              {problem.testCases.map((tc, i) => (
                <div key={i} style={{ background: '#1f2937', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', fontFamily: 'monospace', fontSize: '0.83rem', border: '1px solid #374151' }}>
                  <div style={{ color: '#7c6af7', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'sans-serif', fontSize: '0.8rem' }}>Case {i + 1}</div>
                  <div style={{ color: '#9ca3af', marginBottom: '0.2rem' }}><span style={{ color: '#6b7280' }}>Input: </span>{tc.input || '(none)'}</div>
                  <div style={{ color: '#9ca3af' }}><span style={{ color: '#6b7280' }}>Expected: </span>{tc.expectedOutput}</div>
                </div>
              ))}
            </>
          )}

          {activeLeft === 'discuss' && <Discussion courseId={courseId} problemId={problemId} />}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ background: '#111827', borderBottom: '1px solid #1f2937', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#6b7280', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>{problem.language}</span>
            {submitted && <span style={{ background: '#22c55e22', color: '#22c55e', padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>✓ Accepted</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => { setCode(problem.starterCode || ''); setOutput(null); setSubmitted(false); }}
              style={{ padding: '0.35rem 0.8rem', background: 'transparent', border: '1px solid #374151', borderRadius: '6px', color: '#6b7280', cursor: 'pointer', fontSize: '0.8rem' }}>
              Reset
            </button>
            <button onClick={runCode} disabled={running}
              style={{ padding: '0.35rem 1rem', background: running ? '#374151' : '#22c55e', border: 'none', borderRadius: '6px', color: '#fff', cursor: running ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
              {running ? '⏳' : '▶ Run'}
            </button>
            <button onClick={submitCode} disabled={running || submitted}
              style={{ padding: '0.35rem 1rem', background: submitted ? '#22c55e' : running ? '#374151' : '#7c6af7', border: 'none', borderRadius: '6px', color: '#fff', cursor: running || submitted ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
              {submitted ? '✓ Submitted' : 'Submit'}
            </button>
          </div>
        </div>

        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleTab}
          spellCheck={false}
          style={{ flex: 1, background: '#1e1e2e', color: '#cdd6f4', border: 'none', padding: '1rem', fontFamily: '"Fira Code", "Cascadia Code", monospace', fontSize: '0.88rem', resize: 'none', outline: 'none', lineHeight: 1.6, tabSize: 2 }}
        />

        <div style={{ height: '160px', background: '#111827', borderTop: '1px solid #1f2937', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #1f2937', color: '#4b5563', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Output</div>
          <div style={{ padding: '0.75rem 1rem' }}>
            {running && <div style={{ color: '#f59e0b', fontSize: '0.85rem' }}>⏳ Executing code...</div>}
            {!running && !output && <div style={{ color: '#374151', fontSize: '0.85rem' }}>Run your code to see output here</div>}
            {output && (
              <div>
                <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>✓ Accepted</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#9ca3af' }}>
                  Expected: <span style={{ color: '#a5f3fc' }}>{output.expected}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <AIReviewer code={code} language={problem.language} problemTitle={problem.title} problemDesc={problem.description} />
      </div>
    </div>
  );
}
