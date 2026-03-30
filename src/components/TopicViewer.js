import React, { useState } from 'react';

const s = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '14px', width: '100%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.3rem', fontWeight: 700, color: '#fff' },
  close: { background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 },
  label: { color: '#7c6af7', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' },
  explanation: { color: '#ccc', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' },
  codeBlock: { background: '#0f0f1a', border: '1px solid #2a2a4a', borderRadius: '10px', padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.88rem', color: '#e0e0e0', whiteSpace: 'pre-wrap', overflowX: 'auto', position: 'relative' },
  copyBtn: { position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#2a2a4a', border: 'none', color: '#ccc', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' },
  langBadge: { display: 'inline-block', background: '#7c6af722', color: '#7c6af7', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' },
};

export default function TopicViewer({ topic, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(topic.codeExample || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div style={s.title}>📚 {topic.title}</div>
          <button style={s.close} onClick={onClose}>×</button>
        </div>
        <span style={s.langBadge}>{topic.language}</span>
        <div style={s.label}>Explanation</div>
        <div style={s.explanation}>{topic.explanation}</div>
        {topic.codeExample && (
          <>
            <div style={s.label}>Code Example</div>
            <div style={s.codeBlock}>
              <button style={s.copyBtn} onClick={copy}>{copied ? '✅ Copied' : 'Copy'}</button>
              {topic.codeExample}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
