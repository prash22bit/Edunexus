import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [tab, setTab] = useState('register');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    if (type) setTab(type);
    
    // If the button clicked is not the active tab, we just switch tabs.
    // In this UI, both "Sign Up" and "Sign In" are visible. 
    if (type && type !== tab) {
      return; 
    }

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
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-branding">
          <div className="auth-icon-wrapper">
            <svg className="rocket-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M11.3 1.046A12.014 12.014 0 0121 11.642V17a2 2 0 01-2 2h-5.358a12.014 12.014 0 01-10.596-9.7 12.03 12.03 0 013.918-10.457A2 2 0 019.261 1.046zM15 8a1 1 0 100-2 1 1 0 000 2zM9 14.5a1.5 1.5 0 00-3 0v1.758a1 1 0 00.293.707l1.5 1.5a1 1 0 001.414 0l1.5-1.5a1 1 0 00.293-.707V14.5z" clipRule="evenodd" />
            </svg>
          </div>
          <h1>edunexus</h1>
          <p className="auth-desc">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
        </div>
        <div className="auth-footer">
          <span>CREATOR HERE</span> &nbsp;|&nbsp; <span>DESIGNER HERE</span>
        </div>
        
        {/* Cloud Separator for Mobile */}
        <div className="cloud-separator">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
             <path fill="#ffffff" fillOpacity="1" d="M0,160L48,165.3C96,171,192,181,288,197.3C384,213,480,235,576,218.7C672,203,768,149,864,138.7C960,128,1056,160,1152,181.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           </svg>
        </div>
        
        {/* Cloud Separator for Desktop */}
        <div className="cloud-separator-desktop">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 1440" preserveAspectRatio="none">
            <path fill="#ffffff" fillOpacity="1" d="M160,0C165.3,48 171,96 197.3,192C213,288 235,384 218.7,480C203,576 149,672 138.7,768C128,864 160,960 181.3,1056C203,1152 213,1248 218.7,1296L224,1440L320,1440L320,1296C320,1248 320,1152 320,1056C320,960 320,864 320,768C320,672 320,576 320,480C320,384 320,288 320,192C320,96 320,48 320,0Z"></path>
          </svg>
        </div>
      </div>
      
      <div className="auth-right">
        <h2 className="auth-title">{tab === 'register' ? 'Create your account' : 'Login to your account'}</h2>
        
        <form className="auth-form" onSubmit={(e) => handleSubmit(e, tab)}>
          {tab === 'register' && (
            <div className="input-group">
              <label>Name</label>
              <div className="input-wrapper">
                <input name="name" placeholder="Enter your name" value={form.name} onChange={handleChange} required />
                <span className="check-icon">✓</span>
              </div>
            </div>
          )}
          
          <div className="input-group">
            <label>E-mail Address</label>
            <div className="input-wrapper">
              <input name="email" type="email" placeholder="Enter your mail" value={form.email} onChange={handleChange} required />
              <span className="check-icon">✓</span>
            </div>
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
              <span className="check-icon">✓</span>
            </div>
          </div>

          {tab === 'register' && (
            <div className="input-group">
              <label>Role</label>
              <div className="input-wrapper">
                <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: '#333', padding: '8px 0', fontSize: '0.95rem' }}>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
            </div>
          )}
          
          {tab === 'register' && (
            <div className="terms-group">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">By Signing Up, I Agree with <span>Terms & Conditions</span></label>
            </div>
          )}

          <div className="auth-actions">
            <button 
              type="button" 
              className={`btn-auth ${tab === 'register' ? 'btn-primary-solid' : 'btn-outline'}`}
              onClick={(e) => handleSubmit(e, 'register')}
              disabled={loading && tab === 'register'}
            >
              {loading && tab === 'register' ? <span className="spinner-small" /> : 'Sign Up'}
            </button>
            <button 
              type="button" 
              className={`btn-auth ${tab === 'login' ? 'btn-primary-solid' : 'btn-outline'}`}
              onClick={(e) => handleSubmit(e, 'login')}
              disabled={loading && tab === 'login'}
            >
              {loading && tab === 'login' ? <span className="spinner-small" /> : 'Sign In'}
            </button>
          </div>
          
        </form>
        
        {/* Admin credentials for demo */}
        <div style={{ marginTop: 40, padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 8, border: '1px dashed #ccc', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: 4, fontWeight: 600 }}>Quick Demo — Admin Seeded Credentials</p>
          <p style={{ fontSize: '0.75rem', color: '#2563eb' }}>admin@lms.com | admin123</p>
        </div>
      </div>
    </div>
  );
}
