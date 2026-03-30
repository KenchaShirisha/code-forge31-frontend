import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getPasswordStrength(p) {
  if (!p) return { label: '', color: '#374151', width: '0%' };
  if (p.length < 6) return { label: 'Too short', color: '#ef4444', width: '25%' };
  if (p.length < 8) return { label: 'Weak', color: '#f59e0b', width: '50%' };
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: 'Strong', color: '#22c55e', width: '100%' };
  return { label: 'Medium', color: '#f59e0b', width: '75%' };
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, type, placeholder, label) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        required
        style={{ width: '100%', padding: '0.75rem 1rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
        onFocus={e => e.target.style.borderColor = '#7c6af7'}
        onBlur={e => e.target.style.borderColor = '#374151'}
      />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c6af7', marginBottom: '0.3rem' }}>⚡ CodeForge</div>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Create your free account and start coding.</p>
        </div>

        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '2rem' }}>
          {error && (
            <div style={{ background: '#ef444411', border: '1px solid #ef444444', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#ef4444', fontSize: '0.88rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {field('name', 'text', 'John Doe', 'FULL NAME')}
            {field('email', 'email', 'you@example.com', 'EMAIL')}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '0.75rem 2.8rem 0.75rem 1rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#7c6af7'}
                  onBlur={e => e.target.style.borderColor = '#374151'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ height: '4px', background: '#374151', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '2px', transition: 'all 0.3s' }} />
                  </div>
                  <div style={{ color: strength.color, fontSize: '0.75rem', marginTop: '0.25rem' }}>{strength.label}</div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.8rem', background: loading ? '#374151' : '#7c6af7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
              {loading ? '⏳ Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#6b7280', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#7c6af7', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
