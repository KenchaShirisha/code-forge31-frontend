import React from 'react';

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

export function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp < l.max) || LEVELS[LEVELS.length - 1];
}

const s = {
  wrap: { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '2rem' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  levelName: { color: '#7c6af7', fontWeight: 700, fontSize: '1rem' },
  xpText: { color: '#888', fontSize: '0.85rem' },
  bar: { height: '8px', background: '#2a2a4a', borderRadius: '4px', overflow: 'hidden' },
  fill: { height: '100%', background: 'linear-gradient(90deg, #7c6af7, #a78bfa)', borderRadius: '4px', transition: 'width 0.6s ease' },
  next: { color: '#555', fontSize: '0.75rem', marginTop: '0.4rem' },
};

export default function XPBar({ xp }) {
  const lvl = getLevel(xp);
  const isMax = lvl.max === Infinity;
  const pct = isMax ? 100 : Math.round(((xp - lvl.min) / (lvl.max - lvl.min)) * 100);

  return (
    <div style={s.wrap}>
      <div style={s.top}>
        <span style={s.levelName}>🏅 {lvl.name}</span>
        <span style={s.xpText}>⭐ {xp} XP</span>
      </div>
      <div style={s.bar}><div style={{ ...s.fill, width: `${pct}%` }} /></div>
      <div style={s.next}>
        {isMax ? 'Max level reached!' : `${lvl.max - xp} XP to next level (${LEVELS[LEVELS.indexOf(lvl) + 1]?.name})`}
      </div>
    </div>
  );
}
