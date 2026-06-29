import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { MdQuiz, MdAdd, MdTimer } from 'react-icons/md';

export default function QuizzesPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ title: '', course: '', timeLimit: 30, questions: [] });
  const [qForm, setQForm] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 });

  const fetchAll = async () => {
    try {
      const [{ data: q }, { data: c }] = await Promise.all([API.get('/quizzes'), API.get('/courses')]);
      setQuizzes(q); setCourses(c);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const addQuestion = () => {
    if (!qForm.question || qForm.options.some(o => !o)) return toast.error('Fill all question fields');
    setForm({ ...form, questions: [...form.questions, { ...qForm }] });
    setQForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 });
  };

  const handleCreate = async e => {
    e.preventDefault();
    if (form.questions.length === 0) return toast.error('Add at least one question');
    try { await API.post('/quizzes', form); toast.success('Quiz created!'); setShowCreate(false); setForm({ title: '', course: '', timeLimit: 30, questions: [] }); fetchAll(); }
    catch (e) { toast.error('Error'); }
  };

  const startQuiz = (quiz) => { setActiveQuiz(quiz); setAnswers(new Array(quiz.questions.length).fill(null)); setResult(null); };

  const handleSubmit = async () => {
    if (answers.some(a => a === null)) return toast.error('Answer all questions');
    try {
      const { data } = await API.post(`/quizzes/${activeQuiz._id}/attempt`, { answers });
      setResult(data); toast.success(`Score: ${data.score}/${data.totalPoints}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Quizzes</h2>
        <p>{user.role === 'instructor' ? 'Create and manage quizzes' : 'Test your knowledge'}</p>
      </div>
      <div className="page-content">
        <div className="flex-between mb-24">
          <span style={{ color: 'var(--text-muted)' }}>{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}</span>
          {(user.role === 'instructor' || user.role === 'admin') && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><MdAdd /> Create Quiz</button>
          )}
        </div>

        {loading ? <div className="loading-overlay"><div className="spinner" /></div>
          : quizzes.length === 0 ? <div className="empty-state"><MdQuiz /><p>No quizzes yet.</p></div>
          : (
            <div className="grid-2">
              {quizzes.map(q => (
                <div key={q._id} className="card">
                  <div className="flex-between mb-16">
                    <h3>{q.title}</h3>
                    <span className="badge badge-purple">{q.questions?.length} Q</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: 12 }}>📚 {q.course?.title}</p>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span><MdTimer style={{ verticalAlign: 'middle' }} /> {q.timeLimit} min</span>
                    <span>👤 {q.instructor?.name}</span>
                    {user.role !== 'student' && <span>🎯 {q.attempts?.length || 0} attempts</span>}
                  </div>
                  {user.role === 'student' && (
                    <button className="btn btn-primary btn-sm" onClick={() => startQuiz(q)}>Start Quiz</button>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Quiz attempt modal */}
      {activeQuiz && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h3>{result ? '🎉 Quiz Results' : activeQuiz.title}</h3>
              <button className="modal-close" onClick={() => { setActiveQuiz(null); setResult(null); }}>×</button>
            </div>
            {result ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>{result.percentage >= 70 ? '🏆' : result.percentage >= 50 ? '👍' : '📚'}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.percentage >= 70 ? 'var(--success)' : result.percentage >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{result.percentage}%</div>
                <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Score: {result.score} / {result.totalPoints}</p>
                <p style={{ marginTop: 8 }}>{result.percentage >= 70 ? 'Excellent work!' : result.percentage >= 50 ? 'Good effort!' : 'Keep practicing!'}</p>
                <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => { setActiveQuiz(null); setResult(null); }}>Done</button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${(answers.filter(a => a !== null).length / activeQuiz.questions.length) * 100}%` }} /></div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>Answered {answers.filter(a => a !== null).length} of {activeQuiz.questions.length}</p>
                </div>
                {activeQuiz.questions.map((q, qi) => (
                  <div key={qi} style={{ marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <p style={{ fontWeight: 600, marginBottom: 12 }}>Q{qi + 1}. {q.question} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>({q.points} pt{q.points !== 1 ? 's' : ''})</span></p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options.map((opt, oi) => (
                        <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: answers[qi] === oi ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${answers[qi] === oi ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <input type="radio" name={`q${qi}`} value={oi} checked={answers[qi] === oi} onChange={() => { const a = [...answers]; a[qi] = oi; setAnswers(a); }} style={{ accentColor: 'var(--primary)' }} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="btn btn-primary btn-full" onClick={handleSubmit}>Submit Quiz</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Create Quiz</h3><button className="modal-close" onClick={() => setShowCreate(false)}>×</button></div>
            <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label>Course</label>
                <select className="form-control" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}>
                  <option value="">-- Select --</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Time Limit (min)</label><input type="number" className="form-control" value={form.timeLimit} onChange={e => setForm({ ...form, timeLimit: e.target.value })} /></div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginBottom: 16 }}>
              <h4 style={{ marginBottom: 12 }}>Add Question</h4>
              <div className="form-group"><label>Question</label><input className="form-control" value={qForm.question} onChange={e => setQForm({ ...qForm, question: e.target.value })} /></div>
              {qForm.options.map((opt, i) => (
                <div className="form-group" key={i}>
                  <label>Option {i + 1} {qForm.correctAnswer === i && <span style={{ color: 'var(--success)' }}>(Correct)</span>}</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-control" value={opt} onChange={e => { const o = [...qForm.options]; o[i] = e.target.value; setQForm({ ...qForm, options: o }); }} />
                    <button type="button" className={`btn btn-sm ${qForm.correctAnswer === i ? 'btn-success' : 'btn-secondary'}`} onClick={() => setQForm({ ...qForm, correctAnswer: i })}>✓</button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}><MdAdd /> Add Question ({form.questions.length} added)</button>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleCreate}>Create Quiz</button>
          </div>
        </div>
      )}
    </>
  );
}
