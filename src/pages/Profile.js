import React, { useEffect, useState } from 'react';
import api from '../data/api';
import { useAuth } from '../context/AuthContext';

const LEVELS = [
  { name: 'Newbie', min: 0, max: 100 },
  { name: 'Beginner', min: 100, max: 300 },
  { name: 'Learner', min: 300, max: 600 },
  { name: 'Coder', min: 600, max: 1000 },
  { name: 'Developer', min: 1000, max: 1500 },
  { name: 'Pro', min: 1500, max: 2500 },
  { name: 'Expert', min: 2500, max: 4000 },
  { name: 'Master', min: 4000, max: Infinity },
];

const ALL_BADGES = [
  { id: 'first_blood', name: 'First Blood', icon: '🩸', desc: 'Solved your first problem' },
  { id: 'quiz_master', name: 'Quiz Master', icon: '🎯', desc: 'Scored 100% on a quiz' },
  { id: 'streak_3', name: 'On Fire', icon: '🔥', desc: 'Maintained a 3-day streak' },
  { id: 'streak_7', name: 'Week Warrior', icon: '⚔️', desc: 'Maintained a 7-day streak' },
  { id: 'streak_30', name: 'Monthly Legend', icon: '🏆', desc: 'Maintained a 30-day streak' },
  { id: 'xp_100', name: 'XP Hunter', icon: '⭐', desc: 'Earned 100 XP' },
  { id: 'xp_500', name: 'XP Collector', icon: '💫', desc: 'Earned 500 XP' },
  { id: 'xp_1000', name: 'XP Master', icon: '🌟', desc: 'Earned 1000 XP' },
  { id: 'course_complete', name: 'Graduate', icon: '🎓', desc: 'Completed a full course' },
  { id: 'daily_5', name: 'Daily Grinder', icon: '📅', desc: 'Completed 5 daily challenges' },
  { id: 'problems_10', name: 'Problem Solver', icon: '🧩', desc: 'Solved 10 problems' },
  { id: 'problems_50', name: 'Code Ninja', icon: '🥷', desc: 'Solved 50 problems' },
];

function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp < l.max) || LEVELS[LEVELS.length - 1];
}

export default function Profile() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [fullUser, setFullUser] = useState(null);
  const [activeTab, setActiveTab] = useState('progress');

  useEffect(() => {
    api.get('/progress/all/me').then(r => setProgress(r.data));
    api.get('/auth/me').then(r => setFullUser(r.data));
  }, []);

  const xp = user?.xp || 0;
  const lvl = getLevel(xp);
  const isMax = lvl.max === Infinity;
  const pct = isMax ? 100 : Math.round(((xp - lvl.min) / (lvl.max - lvl.min)) * 100);
  const earnedBadgeIds = (fullUser?.badges || []).map(b => b.id);

  const tabs = ['progress', 'badges', 'analytics', 'quizzes', 'certificates'];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #111827)', borderBottom: '1px solid #1f2937', padding: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.2rem' }}>{user?.name}</h1>
            <div style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '1rem' }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { val: `🔥 ${user?.streak}`, label: 'Streak', color: '#f97316' },
                { val: `⭐ ${xp}`, label: 'XP', color: '#f7c948' },
                { val: earnedBadgeIds.length, label: 'Badges', color: '#a78bfa' },
                { val: user?.certificates?.length || 0, label: 'Certs', color: '#22c55e' },
                { val: progress.length, label: 'Courses', color: '#7c6af7' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#1f293788', border: '1px solid #374151', borderRadius: '10px', padding: '0.6rem 1rem', textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* XP Bar */}
          <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '1rem 1.25rem', minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: '#7c6af7', fontWeight: 700, fontSize: '0.9rem' }}>🏅 {lvl.name}</span>
              <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>{xp} XP</span>
            </div>
            <div style={{ height: '6px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#7c6af7,#a78bfa)', width: `${pct}%`, borderRadius: '3px' }} />
            </div>
            <div style={{ color: '#4b5563', fontSize: '0.72rem', marginTop: '0.3rem' }}>
              {isMax ? 'Max level!' : `${lvl.max - xp} XP to ${LEVELS[LEVELS.indexOf(lvl) + 1]?.name}`}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', background: '#1f2937', borderRadius: '10px', padding: '0.3rem', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: activeTab === tab ? '#7c6af7' : 'transparent', color: activeTab === tab ? '#fff' : '#6b7280', whiteSpace: 'nowrap' }}>
              {tab === 'progress' ? '📈 Progress' : tab === 'badges' ? '🏅 Badges' : tab === 'analytics' ? '📊 Analytics' : tab === 'quizzes' ? '🎯 Quizzes' : '🏆 Certificates'}
            </button>
          ))}
        </div>

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div>
            {progress.length === 0
              ? <Empty msg="No courses started yet. Enroll in a course to begin!" />
              : progress.map(p => (
                <div key={p._id} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{p.course?.title || 'Course'}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.2rem' }}>{p.level} • {p.completedTopics?.length || 0} topics</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#7c6af7', fontWeight: 800, fontSize: '1.1rem' }}>{p.percentage}%</div>
                      {p.completed && <div style={{ color: '#22c55e', fontSize: '0.75rem' }}>✓ Completed</div>}
                    </div>
                  </div>
                  <div style={{ height: '6px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: p.percentage >= 100 ? '#22c55e' : '#7c6af7', width: `${p.percentage}%`, borderRadius: '3px', transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div>
            <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {earnedBadgeIds.length} / {ALL_BADGES.length} badges earned
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {ALL_BADGES.map(badge => {
                const earned = earnedBadgeIds.includes(badge.id);
                const earnedData = fullUser?.badges?.find(b => b.id === badge.id);
                return (
                  <div key={badge.id} style={{ background: earned ? '#1f2937' : '#111827', border: `1px solid ${earned ? '#7c6af7' : '#1f2937'}`, borderRadius: '12px', padding: '1.25rem', textAlign: 'center', opacity: earned ? 1 : 0.45, transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem', filter: earned ? 'none' : 'grayscale(1)' }}>{badge.icon}</div>
                    <div style={{ color: earned ? '#f1f5f9' : '#4b5563', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{badge.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem', lineHeight: 1.4 }}>{badge.desc}</div>
                    {earned && earnedData?.earnedAt && (
                      <div style={{ color: '#7c6af7', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                        Earned {new Date(earnedData.earnedAt).toLocaleDateString()}
                      </div>
                    )}
                    {!earned && <div style={{ color: '#374151', fontSize: '0.7rem', marginTop: '0.5rem' }}>🔒 Locked</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsTab progress={progress} user={fullUser || user} />
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div>
            {progress.every(p => !p.quizScores?.length)
              ? <Empty msg="No quizzes taken yet." />
              : progress.filter(p => p.quizScores?.length > 0).map(p => (
                <div key={p._id} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '0.75rem' }}>{p.course?.title}</div>
                  {p.quizScores.map((qs, i) => {
                    const pct = Math.round((qs.score / qs.total) * 100);
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderTop: '1px solid #374151' }}>
                        <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{qs.topicId} level</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '80px', height: '5px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 70 ? '#22c55e' : '#f59e0b', borderRadius: '3px' }} />
                          </div>
                          <span style={{ color: pct >= 70 ? '#22c55e' : '#f59e0b', fontWeight: 700, fontSize: '0.85rem', minWidth: '45px', textAlign: 'right' }}>{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            }
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div>
            {!user?.certificates?.length
              ? <Empty msg="Complete a course to earn your first certificate!" />
              : user.certificates.map((c, i) => (
                <div key={i} style={{ background: 'linear-gradient(135deg,#1e1b4b,#1f2937)', border: '1px solid #7c6af7', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>🎓</span>
                  <div>
                    <div style={{ color: '#f7c948', fontWeight: 700, fontSize: '1rem' }}>Certificate of Completion</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      Issued on {new Date(c.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsTab({ progress, user }) {
  const totalProblems = progress.reduce((s, p) => s + (p.solvedProblems?.length || 0), 0);
  const totalQuizzes = progress.reduce((s, p) => s + (p.quizScores?.length || 0), 0);
  const avgQuizScore = (() => {
    const all = progress.flatMap(p => p.quizScores || []);
    if (!all.length) return 0;
    return Math.round(all.reduce((s, q) => s + (q.score / q.total) * 100, 0) / all.length);
  })();

  // Activity heatmap — last 30 days
  const activityLog = user?.activityLog || [];
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split('T')[0];
    const entry = activityLog.find(a => a.date === key);
    return { date: key, problems: entry?.problems || 0, quizzes: entry?.quizzes || 0, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
  });

  const maxActivity = Math.max(...last30.map(d => d.problems + d.quizzes), 1);

  // Language distribution
  const langMap = {};
  progress.forEach(p => {
    const lang = p.course?.language || 'unknown';
    langMap[lang] = (langMap[lang] || 0) + (p.completedTopics?.length || 0);
  });
  const langColors = { python: '#3776AB', java: '#ED8B00', c: '#A8B9CC', cpp: '#00599C', javascript: '#F7DF1E' };
  const langTotal = Object.values(langMap).reduce((s, v) => s + v, 0) || 1;

  return (
    <div>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Problems Solved', val: totalProblems, icon: '🧩', color: '#7c6af7' },
          { label: 'Quizzes Taken', val: totalQuizzes, icon: '🎯', color: '#f59e0b' },
          { label: 'Avg Quiz Score', val: `${avgQuizScore}%`, icon: '📊', color: avgQuizScore >= 70 ? '#22c55e' : '#ef4444' },
          { label: 'Daily Streak', val: `🔥 ${user?.dailyChallengeStreak || 0}`, icon: '📅', color: '#f97316' },
          { label: 'Total XP', val: user?.xp || 0, icon: '⭐', color: '#f7c948' },
          { label: 'Courses Active', val: progress.length, icon: '📚', color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
            <div style={{ color: s.color, fontWeight: 800, fontSize: '1.2rem' }}>{s.val}</div>
            <div style={{ color: '#6b7280', fontSize: '0.72rem', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Activity Heatmap */}
      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '1rem' }}>📅 Activity — Last 30 Days</div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {last30.map((day, i) => {
            const activity = day.problems + day.quizzes;
            const intensity = activity === 0 ? 0 : Math.max(0.2, activity / maxActivity);
            return (
              <div key={i} title={`${day.label}: ${day.problems} problems, ${day.quizzes} quizzes`}
                style={{ width: '20px', height: `${Math.max(8, intensity * 60)}px`, background: activity === 0 ? '#374151' : `rgba(124,106,247,${intensity})`, borderRadius: '3px', cursor: 'default', transition: 'height 0.3s', border: activity > 0 ? '1px solid #7c6af744' : 'none' }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#4b5563', fontSize: '0.72rem' }}>
          <span>{last30[0]?.label}</span>
          <span>Today</span>
        </div>
      </div>

      {/* Language Distribution */}
      {langTotal > 0 && (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '1rem' }}>🌐 Language Distribution</div>
          {Object.entries(langMap).map(([lang, count]) => (
            <div key={lang} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'capitalize' }}>{lang}</span>
                <span style={{ color: langColors[lang] || '#7c6af7', fontWeight: 600, fontSize: '0.85rem' }}>{count} topics</span>
              </div>
              <div style={{ height: '6px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(count / langTotal) * 100}%`, background: langColors[lang] || '#7c6af7', borderRadius: '3px', transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ msg }) {
  return <div style={{ color: '#4b5563', textAlign: 'center', padding: '3rem', background: '#1f2937', borderRadius: '12px' }}>{msg}</div>;
}
