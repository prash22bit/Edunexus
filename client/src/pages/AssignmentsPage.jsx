import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { MdAssignment, MdAdd, MdGrade, MdClose } from 'react-icons/md';

function formatDate(d) {
  if (!d) return '--';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSubmit, setShowSubmit] = useState(null);
  const [showGrade, setShowGrade] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', course: '', deadline: '', maxMarks: 100 });
  const [submitForm, setSubmitForm] = useState({ textAnswer: '' });
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });

  const fetchAll = async () => {
    try {
      const [{ data: a }, { data: c }] = await Promise.all([API.get('/assignments'), API.get('/courses')]);
      setAssignments(a); setCourses(c);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    try { await API.post('/assignments', form); toast.success('Assignment created!'); setShowCreate(false); setForm({ title: '', description: '', course: '', deadline: '', maxMarks: 100 }); fetchAll(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleSubmit = async (assignId, e) => {
    e.preventDefault();
    try { await API.post(`/assignments/${assignId}/submit`, submitForm); toast.success('Submitted!'); setShowSubmit(null); fetchAll(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleGrade = async (assignId, subId, e) => {
    e.preventDefault();
    try { await API.put(`/assignments/${assignId}/grade/${subId}`, gradeForm); toast.success('Graded!'); setShowGrade(null); fetchAll(); }
    catch (e) { toast.error('Error'); }
  };

  const mySubmission = (a) => a.submissions?.find(s => (s.student?._id || s.student) === user._id);
  const isPast = (d) => new Date(d) < new Date();

  return (
    <>
      <div className="page-header">
        <h2>Assignments</h2>
        <p>{user.role === 'instructor' ? 'Create and grade student assignments' : 'Submit your assignments before the deadline'}</p>
      </div>
      <div className="page-content">
        <div className="flex-between mb-24">
          <span style={{ color: 'var(--text-muted)' }}>{assignments.length} assignment{assignments.length !== 1 ? 's' : ''}</span>
          {(user.role === 'instructor' || user.role === 'admin') && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><MdAdd /> New Assignment</button>
          )}
        </div>

        {loading ? <div className="loading-overlay"><div className="spinner" /></div>
          : assignments.length === 0 ? <div className="empty-state"><MdAssignment /><p>No assignments yet.</p></div>
          : (
            <div className="grid-2">
              {assignments.map(a => {
                const sub = mySubmission(a);
                const past = isPast(a.deadline);
                return (
                  <div key={a._id} className="card">
                    <div className="flex-between mb-16">
                      <h3 style={{ fontSize: '1rem', maxWidth: '70%' }}>{a.title}</h3>
                      <span className={`badge badge-${past ? 'danger' : 'success'}`}>{past ? 'Past Due' : 'Open'}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12, lineHeight: 1.6 }}>{a.description}</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                      <div>📚 {a.course?.title || 'Course'}</div>
                      <div>📅 Due: {formatDate(a.deadline)}</div>
                      <div>⭐ Max: {a.maxMarks} marks</div>
                      {user.role !== 'student' && <div>👥 {a.submissions?.length || 0} submissions</div>}
                    </div>

                    {user.role === 'student' && (
                      sub ? (
                        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: 12 }}>
                          <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>✓ Submitted on {formatDate(sub.submittedAt)}</div>
                          {sub.isGraded && <div style={{ marginTop: 8 }}>
                            <div style={{ fontWeight: 700 }}>Grade: {sub.grade}/{a.maxMarks}</div>
                            {sub.feedback && <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>Feedback: {sub.feedback}</div>}
                          </div>}
                          {!sub.isGraded && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Pending grade</div>}
                        </div>
                      ) : (
                        <button className="btn btn-primary btn-sm" disabled={past} onClick={() => setShowSubmit(a)}>
                          {past ? 'Deadline Passed' : 'Submit Assignment'}
                        </button>
                      )
                    )}

                    {(user.role === 'instructor' || user.role === 'admin') && a.submissions?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Submissions</p>
                        {a.submissions.map(s => (
                          <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 6 }}>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.student?.name || 'Student'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(s.submittedAt)}</div>
                            </div>
                            {s.isGraded ? <span className="badge badge-success">{s.grade}/{a.maxMarks}</span>
                              : <button className="btn btn-secondary btn-sm" onClick={() => { setGradeForm({ grade: '', feedback: '' }); setShowGrade({ assignment: a, submission: s }); }}><MdGrade /> Grade</button>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>New Assignment</h3><button className="modal-close" onClick={() => setShowCreate(false)}>×</button></div>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
              <div className="form-group"><label>Course</label>
                <select className="form-control" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} required>
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Deadline</label><input type="datetime-local" className="form-control" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required /></div>
                <div className="form-group"><label>Max Marks</label><input type="number" className="form-control" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} /></div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Create Assignment</button>
            </form>
          </div>
        </div>
      )}

      {showSubmit && (
        <div className="modal-overlay" onClick={() => setShowSubmit(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Submit: {showSubmit.title}</h3><button className="modal-close" onClick={() => setShowSubmit(null)}>×</button></div>
            <form onSubmit={e => handleSubmit(showSubmit._id, e)}>
              <div className="form-group"><label>Your Answer</label><textarea className="form-control" rows={6} placeholder="Write your answer here..." value={submitForm.textAnswer} onChange={e => setSubmitForm({ ...submitForm, textAnswer: e.target.value })} required /></div>
              <button type="submit" className="btn btn-primary btn-full">Submit</button>
            </form>
          </div>
        </div>
      )}

      {showGrade && (
        <div className="modal-overlay" onClick={() => setShowGrade(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Grade Submission</h3><button className="modal-close" onClick={() => setShowGrade(null)}>×</button></div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>{showGrade.submission.student?.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{showGrade.submission.textAnswer}</p>
            </div>
            <form onSubmit={e => handleGrade(showGrade.assignment._id, showGrade.submission._id, e)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Grade (/{showGrade.assignment.maxMarks})</label><input type="number" className="form-control" value={gradeForm.grade} onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })} max={showGrade.assignment.maxMarks} min={0} required /></div>
              </div>
              <div className="form-group"><label>Feedback</label><textarea className="form-control" rows={3} value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} /></div>
              <button type="submit" className="btn btn-primary btn-full"><MdGrade /> Submit Grade</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
