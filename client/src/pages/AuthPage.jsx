import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.name, form.email, form.password, form.role);
        toast.success('Account created!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative background blobs */}
      <div className="auth-blob auth-blob-yellow-lg" />
      <div className="auth-blob auth-blob-yellow-sm" />
      <div className="auth-blob auth-blob-purple-sm" />
      <div className="auth-blob auth-blob-purple-dot" />

      {/* Purple wavy line SVG */}
      <svg className="auth-wave" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path
          d="M20,200 C80,120 160,280 240,180 C320,80 400,240 480,140"
          stroke="#7c3aed"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
      </svg>

      {/* Card */}
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-card-logo">
          <img src="/logo.png" alt="EduNexus" onError={e => { e.target.style.display = 'none'; }} />
        </div>

        <h2 className="auth-card-title">
          {tab === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="auth-card-subtitle">
          {tab === 'login' ? 'Sign in to your EduNexus account' : 'Join EduNexus today'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="auth-field">
              <label>Full Name <span className="auth-required">*</span></label>
              <input
                name="name"
                type="text"
                placeholder="Enter your Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label>Username / Email <span className="auth-required">*</span></label>
            <input
              name="email"
              type="email"
              placeholder="Enter your Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password <span className="auth-required">*</span></label>
            <input
              name="password"
              type="password"
              placeholder="Enter your Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {tab === 'register' && (
            <div className="auth-field">
              <label>Role <span className="auth-required">*</span></label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
          )}

          {tab === 'login' && (
            <div className="auth-remember">
              <label className="auth-check-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                Remember me
              </label>
            </div>
          )}

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? <span className="spinner-small" /> : (tab === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-links">
          {tab === 'login' ? (
            <>
              <button className="auth-link-btn" onClick={() => {}}>Forgot password?</button>
              <button className="auth-link-btn" onClick={() => setTab('register')}>
                Don't have an account? <strong>Sign Up</strong>
              </button>
            </>
          ) : (
            <button className="auth-link-btn" onClick={() => setTab('login')}>
              Already have an account? <strong>Sign In</strong>
            </button>
          )}
        </div>

        {/* Demo credentials */}
        <div className="auth-demo-box">
          <p>Demo Admin: <strong>admin@lms.com</strong> / <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
}
