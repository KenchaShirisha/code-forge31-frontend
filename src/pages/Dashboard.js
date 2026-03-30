import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../data/api';
import { useAuth } from '../context/AuthContext';
import DailyChallenge from '../components/DailyChallenge';

const levelColors = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };
const languages = ['All', 'Python', 'Java', 'C', 'C++', 'JavaScript'];

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/courses'), api.get('/auth/me')])
      .then(([cr, ur]) => {
        setCourses(cr.data);
        setEnrolledIds((ur.data.enrolledCourses || []).map(c => c._id || c));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const enroll = async (e, courseId) => {
    e.stopPropagation();
    setEnrolling(courseId);
    try {
      await api.post(`/users/enroll/${courseId}`);
      setEnrolledIds(prev => [...prev, courseId]);
    } catch {}
    setEnrolling(null);
  };

  const unenroll = async (e, courseId) => {
    e.stopPropagation();
    if (!window.confirm('Unenroll from this course?')) return;
    setEnrolling(courseId);
    try {
      await api.delete(`/users/enroll/${courseId}`);
      setEnrolledIds(prev => prev.filter(id => id !== courseId));
    } catch {}
    setEnrolling(null);
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.language === filter.toLowerCase().replace('c++', 'cpp').replace('javascript', 'javascript');
    return matchSearch && matchFilter;
  });

  const enrolled = filtered.filter(c => enrolledIds.includes(c._id));
  const notEnrolled = filtered.filter(c => !enrolledIds.includes(c._id));

  if (loading) return <LoadingSkeleton />;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #111827 100%)', borderBottom: '1px solid #1f2937', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Continue your coding journey</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { val: `🔥 ${user?.streak || 0}`, label: 'Day Streak', color: '#f97316' },
              { val: `⭐ ${user?.xp || 0}`, label: 'Total XP', color: '#f7c948' },
              { val: enrolledIds.length, label: 'Enrolled', color: '#7c6af7' },
              { val: user?.certificates?.length || 0, label: 'Certificates', color: '#22c55e' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '0.75rem 1.25rem', minWidth: '110px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <DailyChallenge />

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: '0.9rem' }}>🔍</span>
            <input
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#7c6af7'}
              onBlur={e => e.target.style.borderColor = '#374151'}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {languages.map(l => (
              <button key={l}
                style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: `1px solid ${filter === l ? '#7c6af7' : '#374151'}`, cursor: 'pointer', fontSize: '0.82rem', background: filter === l ? '#7c6af7' : 'transparent', color: filter === l ? '#fff' : '#9ca3af', fontWeight: filter === l ? 600 : 400, transition: 'all 0.15s' }}
                onClick={() => setFilter(l)}>{l}
              </button>
            ))}
          </div>
        </div>

        {/* My Courses */}
        {enrolled.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>📌 My Courses</span>
              <span style={{ background: '#7c6af722', color: '#7c6af7', padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{enrolled.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
              {enrolled.map(c => <CourseCard key={c._id} course={c} enrolled enrolling={enrolling === c._id} onEnroll={enroll} onUnenroll={unenroll} navigate={navigate} />)}
            </div>
          </section>
        )}

        {/* All Courses */}
        <section>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem' }}>
            🌐 {enrolled.length > 0 ? 'Explore More' : 'All Courses'}
          </div>
          {notEnrolled.length === 0 && enrolled.length === 0 ? (
            <div style={{ color: '#4b5563', textAlign: 'center', padding: '4rem 2rem', background: '#1f2937', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
              <div style={{ fontWeight: 600, color: '#6b7280' }}>No courses found</div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Try a different search or filter</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
              {notEnrolled.map(c => <CourseCard key={c._id} course={c} enrolled={false} enrolling={enrolling === c._id} onEnroll={enroll} onUnenroll={unenroll} navigate={navigate} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CourseCard({ course, enrolled, navigate, onEnroll, onUnenroll, enrolling }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => navigate(`/course/${course._id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: '#1f2937', border: `1px solid ${hover ? course.color : '#374151'}`, borderRadius: '14px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', transform: hover ? 'translateY(-3px)' : 'none', boxShadow: hover ? `0 8px 24px ${course.color}22` : 'none', position: 'relative' }}>
      {enrolled && (
        <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#22c55e22', color: '#22c55e', padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>✓ Enrolled</span>
      )}
      <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{course.icon}</div>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.3rem' }}>{course.title}</div>
      <div style={{ color: '#6b7280', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: 1.5 }}>{course.description}</div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['beginner', 'intermediate', 'advanced'].map(l => (
          <span key={l} style={{ padding: '0.15rem 0.55rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: levelColors[l] + '22', color: levelColors[l] }}>{l}</span>
        ))}
      </div>
      {enrolled ? (
        <button
          onClick={e => onUnenroll(e, course._id)}
          disabled={enrolling}
          style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid #374151', borderRadius: '8px', color: '#6b7280', cursor: enrolling ? 'not-allowed' : 'pointer', fontSize: '0.82rem', transition: 'all 0.15s' }}>
          {enrolling ? '...' : 'Unenroll'}
        </button>
      ) : (
        <button
          onClick={e => onEnroll(e, course._id)}
          disabled={enrolling}
          style={{ width: '100%', padding: '0.5rem', background: `${course.color}22`, border: `1px solid ${course.color}`, borderRadius: '8px', color: course.color, cursor: enrolling ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.15s' }}>
          {enrolling ? '⏳ Enrolling...' : '+ Enroll Free'}
        </button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ height: '160px', background: '#1f2937', borderRadius: '12px', marginBottom: '2rem', animation: 'pulse 1.5s infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ height: '220px', background: '#1f2937', borderRadius: '14px', border: '1px solid #374151' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
