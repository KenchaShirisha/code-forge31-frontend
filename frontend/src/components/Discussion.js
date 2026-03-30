import React, { useEffect, useState } from 'react';
import api from '../data/api';
import { useAuth } from '../context/AuthContext';

export default function Discussion({ courseId, problemId }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [showReply, setShowReply] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/discuss/${courseId}/${problemId}`).then(r => { setPosts(r.data); setLoading(false); });
  }, [courseId, problemId]);

  const submit = async () => {
    if (!content.trim()) return;
    const res = await api.post('/discuss', { courseId, problemId, content });
    setPosts(prev => [res.data, ...prev]);
    setContent('');
  };

  const upvote = async (id) => {
    const res = await api.post(`/discuss/${id}/upvote`);
    setPosts(prev => prev.map(p => p._id === id ? { ...p, upvotes: Array(res.data.upvotes).fill('') } : p));
  };

  const reply = async (id) => {
    if (!replyContent[id]?.trim()) return;
    const res = await api.post(`/discuss/${id}/reply`, { content: replyContent[id] });
    setPosts(prev => prev.map(p => p._id === id ? { ...p, replies: [...(p.replies || []), res.data] } : p));
    setReplyContent(prev => ({ ...prev, [id]: '' }));
    setShowReply(prev => ({ ...prev, [id]: false }));
  };

  const deletePost = async (id) => {
    await api.delete(`/discuss/${id}`);
    setPosts(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div style={{ padding: '1.5rem', background: '#0f172a' }}>
      <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>
        💬 Discussion <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '0.85rem' }}>({posts.length})</span>
      </div>

      {/* Post Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share your approach, ask a question, or help others..."
          style={{ width: '100%', padding: '0.75rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', color: '#e2e8f0', fontSize: '0.88rem', resize: 'vertical', minHeight: '80px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        <button onClick={submit}
          style={{ marginTop: '0.5rem', padding: '0.5rem 1.25rem', background: '#7c6af7', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
          Post
        </button>
      </div>

      {/* Posts */}
      {loading && <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Loading...</div>}
      {!loading && posts.length === 0 && <div style={{ color: '#374151', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>No discussions yet. Be the first to post!</div>}

      {posts.map(post => (
        <div key={post._id} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>
                {post.user?.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.85rem' }}>{post.user?.name}</span>
              <span style={{ color: '#4b5563', fontSize: '0.75rem' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            {post.user?._id === user?._id && (
              <button onClick={() => deletePost(post._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem' }}>Delete</button>
            )}
          </div>

          <p style={{ color: '#d1d5db', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>{post.content}</p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => upvote(post._id)}
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              👍 {post.upvotes?.length || 0}
            </button>
            <button onClick={() => setShowReply(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.82rem' }}>
              💬 Reply ({post.replies?.length || 0})
            </button>
          </div>

          {/* Replies */}
          {post.replies?.length > 0 && (
            <div style={{ marginTop: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid #374151' }}>
              {post.replies.map((r, i) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.8rem' }}>{r.user?.name} </span>
                  <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>{r.content}</span>
                </div>
              ))}
            </div>
          )}

          {showReply[post._id] && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <input
                value={replyContent[post._id] || ''}
                onChange={e => setReplyContent(prev => ({ ...prev, [post._id]: e.target.value }))}
                placeholder="Write a reply..."
                style={{ flex: 1, padding: '0.5rem 0.75rem', background: '#0f172a', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.83rem', outline: 'none' }}
              />
              <button onClick={() => reply(post._id)}
                style={{ padding: '0.5rem 1rem', background: '#7c6af7', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                Send
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
