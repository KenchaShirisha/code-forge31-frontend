import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../data/api';

export default function QuizPage() {
  const { courseId, level } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/quiz/${courseId}/${level}`).then(r => {
      setQuiz(r.data);
      setTimeLeft(r.data.length * 30);
    });
  }, [courseId, level]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft === 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, submitted]);

  const handleSubmit = async () => {
    if (submitted) return;
    clearTimeout(timerRef.current);
    const answersArr = quiz.map((_, i) => answers[i] ?? -1);
    const res = await api.post('/quiz/submit', { courseId, level, answers: answersArr });
    setResult(res.data);
    setSubmitted(true);
    await api.post('/progress/quiz', { courseId, topicId: level, score: res.data.score, total: res.data.total, level });
  };

  const select = (oi) => {
    if (!submitted) setAnswers(prev => ({ ...prev, [current]: oi }));
  };

  const optionStyle = (oi) => {
    const base = { display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.85rem 1.1rem', marginBottom: '0.6rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', color: '#d1d5db', cursor: submitted ? 'default' : 'pointer', textAlign: 'left', fontSize: '0.92rem', transition: 'all 0.15s' };
    if (submitted && result) {
      if (oi === result.results[current]?.correctIndex) return { ...base, borderColor: '#22c55e', background: '#22c55e11', color: '#22c55e' };
      if (answers[current] === oi && oi !== result.results[current]?.correctIndex) return { ...base, borderColor: '#ef4444', background: '#ef444411', color: '#ef4444' };
    } else if (answers[current] === oi) {
      return { ...base, borderColor: '#7c6af7', background: '#7c6af711', color: '#a78bfa' };
    }
    return base;
  };

  if (!quiz.length) return <div style={{ background: '#0f172a', minHeight: '100vh', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading quiz...</div>;

  const mins = Math.floor((timeLeft || 0) / 60);
  const secs = (timeLeft || 0) % 60;
  const progress = ((current + 1) / quiz.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Top Bar */}
      <div style={{ background: '#111827', borderBottom: '1px solid #1f2937', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate(`/course/${courseId}`)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem' }}>← Back</button>
        <span style={{ color: '#fff', fontWeight: 700 }}>{level.charAt(0).toUpperCase() + level.slice(1)} Quiz</span>
        {!submitted && (
          <span style={{ color: timeLeft < 30 ? '#ef4444' : '#f59e0b', fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>
            ⏱ {mins}:{secs.toString().padStart(2, '0')}
          </span>
        )}
        {submitted && <span style={{ color: '#22c55e', fontWeight: 700 }}>Completed</span>}
      </div>

      {/* Progress Bar */}
      <div style={{ height: '3px', background: '#1f2937' }}>
        <div style={{ height: '100%', background: '#7c6af7', width: `${progress}%`, transition: 'width 0.3s' }} />
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
        {!submitted ? (
          <>
            {/* Question Nav */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {quiz.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${i === current ? '#7c6af7' : answers[i] !== undefined ? '#22c55e' : '#374151'}`, background: i === current ? '#7c6af7' : answers[i] !== undefined ? '#22c55e22' : 'transparent', color: i === current ? '#fff' : answers[i] !== undefined ? '#22c55e' : '#6b7280', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Question Card */}
            <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.5rem' }}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>QUESTION {current + 1} OF {quiz.length}</div>
              <div style={{ color: '#f1f5f9', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '1.5rem' }}>{quiz[current].question}</div>
              {quiz[current].options.map((opt, oi) => (
                <button key={oi} style={optionStyle(oi)} onClick={() => select(oi)}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${answers[current] === oi ? '#7c6af7' : '#374151'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0, color: answers[current] === oi ? '#7c6af7' : '#6b7280' }}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #374151', borderRadius: '8px', color: '#6b7280', cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '0.88rem' }}>
                ← Previous
              </button>
              {current < quiz.length - 1 ? (
                <button onClick={() => setCurrent(c => c + 1)}
                  style={{ padding: '0.6rem 1.2rem', background: '#7c6af7', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                  Next →
                </button>
              ) : (
                <button onClick={handleSubmit}
                  style={{ padding: '0.6rem 1.5rem', background: '#22c55e', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700 }}>
                  Submit Quiz ✓
                </button>
              )}
            </div>
          </>
        ) : (
          /* Results */
          <div>
            <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '14px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: result.percentage >= 70 ? '#22c55e' : '#ef4444', marginBottom: '0.25rem' }}>{result.percentage}%</div>
              <div style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>{result.score} / {result.total} correct</div>
              <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{result.percentage >= 70 ? '🎉' : '📚'}</div>
              <div style={{ color: result.percentage >= 70 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                {result.percentage >= 70 ? 'Great job! You passed!' : 'Keep practicing and try again!'}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button onClick={() => navigate(`/course/${courseId}`)}
                  style={{ padding: '0.65rem 1.5rem', background: 'transparent', border: '1px solid #374151', borderRadius: '8px', color: '#9ca3af', cursor: 'pointer', fontWeight: 600 }}>
                  Back to Course
                </button>
                <button onClick={() => { setSubmitted(false); setAnswers({}); setCurrent(0); setResult(null); setTimeLeft(quiz.length * 30); }}
                  style={{ padding: '0.65rem 1.5rem', background: '#7c6af7', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Retry Quiz
                </button>
              </div>
            </div>

            {/* Answer Review */}
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem' }}>Answer Review</div>
            {quiz.map((q, qi) => (
              <div key={q._id} style={{ background: '#1f2937', border: `1px solid ${answers[qi] === result.results[qi]?.correctIndex ? '#22c55e44' : '#ef444444'}`, borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ color: answers[qi] === result.results[qi]?.correctIndex ? '#22c55e' : '#ef4444', fontWeight: 700, flexShrink: 0 }}>{answers[qi] === result.results[qi]?.correctIndex ? '✓' : '✗'}</span>
                  <span style={{ color: '#e2e8f0', fontSize: '0.92rem' }}>{q.question}</span>
                </div>
                <div style={{ color: '#22c55e', fontSize: '0.83rem', marginBottom: '0.3rem' }}>✓ Correct: {q.options[result.results[qi]?.correctIndex]}</div>
                {answers[qi] !== result.results[qi]?.correctIndex && (
                  <div style={{ color: '#ef4444', fontSize: '0.83rem', marginBottom: '0.3rem' }}>✗ Your answer: {q.options[answers[qi]] || 'Not answered'}</div>
                )}
                {result.results[qi]?.explanation && (
                  <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '0.4rem' }}>💡 {result.results[qi].explanation}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
