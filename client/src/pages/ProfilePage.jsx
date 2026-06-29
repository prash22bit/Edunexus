import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { MdPerson, MdEdit, MdLock } from 'react-icons/md';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [tab, setTab] = useState('info');
  const [passwords, setPasswords] = useState({ email: user?.email || '', newPassword: '', newPassword2: '' });
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/forgot-password', { email: passwords.email });
      toast.success(`Reset token: ${data.resetToken}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <>
      <div className="page-header">
        <h2>My Profile</h2>
        <p>Your account information and settings</p>
      </div>
      <div className="page-content">
        <div style={{ maxWidth: 600 }}>
          {/* Profile card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.8rem', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 4 }}>{user?.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
              <span className={`role-badge role-${user?.role}`} style={{ marginTop: 8, display: 'inline-block' }}>{user?.role}</span>
            </div>
          </div>

          <div className="tabs">
            <div className={`tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}><MdPerson style={{ verticalAlign: 'middle' }} /> Account Info</div>
            <div className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}><MdLock style={{ verticalAlign: 'middle' }} /> Security</div>
          </div>

          {tab === 'info' && (
            <div className="card">
              <h3 className="section-title"><MdEdit /> Account Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Full Name', value: user?.name },
                  { label: 'Email Address', value: user?.email },
                  { label: 'Role', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
                  { label: 'User ID', value: user?._id },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                    <div style={{ fontSize: '0.9rem' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="card">
              <h3 className="section-title"><MdLock /> Password Reset</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                Request a password reset token. In production, this would be sent to your email.
              </p>
              <form onSubmit={handleResetRequest}>
                <div className="form-group">
                  <label>Your Email</label>
                  <input className="form-control" type="email" value={passwords.email} onChange={e => setPasswords({ ...passwords, email: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  {loading ? <span className="spinner" /> : 'Request Reset Token'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
