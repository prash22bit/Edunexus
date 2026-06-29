import { useEffect, useState } from 'react';
import API from '../api/axios';
import { MdBarChart, MdPeople } from 'react-icons/md';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/reports').then(({ data }) => { setReports(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <h2>Reports & Analytics</h2>
        <p>Course completion and student progress overview</p>
      </div>
      <div className="page-content">
        {loading ? <div className="loading-overlay"><div className="spinner" /></div>
          : reports.length === 0 ? <div className="empty-state"><MdBarChart /><p>No data yet.</p></div>
          : reports.map(course => (
            <div key={course._id} className="card" style={{ marginBottom: 20 }}>
              <div className="flex-between mb-16">
                <div>
                  <h3>{course.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>Instructor: {course.instructor?.name} · {course.enrolledStudents?.length || 0} enrolled</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '1.4rem' }}>
                    {course.progressList?.length ? Math.round(course.progressList.reduce((s, p) => s + p.percentage, 0) / course.progressList.length) : 0}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>avg completion</div>
                </div>
              </div>

              {course.progressList?.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Student</th><th>Email</th><th>Progress</th><th>Last Accessed</th></tr></thead>
                    <tbody>
                      {course.progressList.map(p => (
                        <tr key={p._id}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                              {p.student?.name?.[0]?.toUpperCase()}
                            </div>
                            {p.student?.name}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{p.student?.email}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="progress-bar" style={{ flex: 1, height: 6 }}>
                                <div className="progress-fill" style={{ width: `${p.percentage}%` }} />
                              </div>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: 36 }}>{p.percentage}%</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(p.lastAccessed).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>No students enrolled yet.</p>
              )}
            </div>
          ))}
      </div>
    </>
  );
}
