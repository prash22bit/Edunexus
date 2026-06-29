import { useEffect, useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { MdPeople, MdDelete, MdEdit } from 'react-icons/md';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try { const { data } = await API.get('/admin/users'); setUsers(data); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id, role) => {
    try { await API.put(`/admin/users/${id}/role`, { role }); toast.success('Role updated'); fetchUsers(); }
    catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await API.delete(`/admin/users/${id}`); toast.success('User deleted'); fetchUsers(); }
    catch { toast.error('Error'); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Manage Users</h2>
        <p>View, update roles, and remove users from the platform</p>
      </div>
      <div className="page-content">
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Users', value: users.length, color: 'indigo' },
            { label: 'Students', value: users.filter(u => u.role === 'student').length, color: 'sky' },
            { label: 'Instructors', value: users.filter(u => u.role === 'instructor').length, color: 'amber' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'emerald' },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className={`stat-icon ${s.color}`}><MdPeople /></div>
              <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
            </div>
          ))}
        </div>

        {loading ? <div className="loading-overlay"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id}>
                    <td>{i + 1}</td>
                    <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'white', flexShrink: 0 }}>
                          {u.name[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td>
                      <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} style={{ background: u.role === 'student' ? '#eef2ff' : u.role === 'instructor' ? '#fff7ed' : '#fdf4ff', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 10px', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}><MdDelete /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
