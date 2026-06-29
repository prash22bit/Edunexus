import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { MdArrowBack, MdAdd, MdPlayCircle, MdDescription, MdQuiz, MdTextFields, MdCheck, MdDelete } from 'react-icons/md';



export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const assignFileRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ percentage: 0, completedModules: [] });
  const [activeModule, setActiveModule] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingAssignPdf, setUploadingAssignPdf] = useState(false);
  const [mod, setMod] = useState({ title: '', description: '', videoUrl: '' });
  const [assignForm, setAssignForm] = useState({ title: '', description: '', deadline: '', maxMarks: 100, attachmentUrl: '' });
  const [assignFile, setAssignFile] = useState(null);

  const handlePDFUpload = async (e) => {
    if (!activeModule) {
      toast.error('Please select a module first to add a PDF.');
      return;
    }
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadRes = await API.post('/upload', formData);
      const fileUrl = uploadRes.data;
      
      const newDoc = { title: file.name.replace(/\.[^/.]+$/, ''), url: `http://localhost:5001${fileUrl}` };
      const updatedDocs = [...(activeModule.documents || []), newDoc];
      
      await API.put(`/courses/${id}/modules/${activeModule._id}`, { documents: updatedDocs });
      toast.success('PDF added to module!');
      fetchCourse();
      setActiveModule({ ...activeModule, documents: updatedDocs }); // Optimistic UI update
    } catch {
      toast.error('Failed to upload PDF');
    } finally {
      setUploadingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setUploadingAssignPdf(true);
    let finalAttachmentUrl = '';
    
    // Upload PDF if selected
    if (assignFile) {
      const formData = new FormData();
      formData.append('file', assignFile);
      try {
        const uploadRes = await API.post('/upload', formData);
        finalAttachmentUrl = `http://localhost:5001${uploadRes.data}`;
      } catch {
        toast.error('Failed to upload assignment PDF');
        setUploadingAssignPdf(false);
        return;
      }
    }

    // Create Assignment
    try {
      const assignRes = await API.post('/assignments', {
        ...assignForm,
        attachmentUrl: finalAttachmentUrl,
        course: id
      });
      
      // Link to active module
      await API.put(`/courses/${id}/modules/${activeModule._id}`, { assignment: assignRes.data._id });
      toast.success('Assignment created and attached!');
      setShowAddAssignment(false);
      setAssignFile(null);
      setAssignForm({ title: '', description: '', deadline: '', maxMarks: 100, attachmentUrl: '' });
      fetchCourse();
      setActiveModule({ ...activeModule, assignment: assignRes.data });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating assignment');
    } finally {
      setUploadingAssignPdf(false);
    }
  };

  const fetchCourse = async () => {
    try {
      const { data } = await API.get(`/courses/${id}`);
      setCourse(data);
    } catch { navigate('/courses'); }
  };

  const fetchProgress = async () => {
    if (user.role !== 'student') return;
    try { const { data } = await API.get(`/courses/${id}/progress`); setProgress(data); } catch {}
  };

  useEffect(() => { fetchCourse(); fetchProgress(); }, [id]);

  const handleMarkComplete = async (moduleId) => {
    if (user.role !== 'student') return;
    try {
      const { data } = await API.post(`/courses/${id}/progress`, { moduleId });
      setProgress(data);
      toast.success('Module marked complete!');
    } catch {}
  };

  const handleAddModule = async e => {
    e.preventDefault();
    try {
      await API.post(`/courses/${id}/modules`, mod);
      toast.success('Module added!');
      setShowAddModule(false);
      setMod({ title: '', description: '', videoUrl: '' });
      fetchCourse();
    } catch { toast.error('Error adding module'); }
  };

  const handleDeleteModule = async (moduleId) => {
    try { await API.delete(`/courses/${id}/modules/${moduleId}`); fetchCourse(); toast.success('Module deleted'); } catch {}
  };

  if (!course) return <div className="loading-overlay"><div className="spinner" /></div>;

  const isEnrolled = course.enrolledStudents?.some(s => (s._id || s) === user._id);
  const isOwner = course.instructor?._id === user._id || user.role === 'admin';

  return (
    <>
      <div className="page-header">
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: 12 }} onClick={() => navigate('/courses')}><MdArrowBack /> Back</button>
        <h2>{course.title}</h2>
        <p style={{ color: 'var(--text-muted)' }}>By {course.instructor?.name} · {course.enrolledStudents?.length} students enrolled</p>
      </div>
      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          {/* Left: Content Viewer */}
          <div>
            {activeModule ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>
                {/* 1. Main Header & Video */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{activeModule.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>{activeModule.description}</p>
                    </div>
                    {user.role === 'student' && !progress.completedModules?.includes(activeModule._id) && (
                      <button className="btn btn-success btn-sm" onClick={() => handleMarkComplete(activeModule._id)}><MdCheck /> Mark Done</button>
                    )}
                  </div>
                  
                  {activeModule.videoUrl ? (
                    <video controls style={{ width: '100%', borderRadius: 10, background: '#000' }} src={activeModule.videoUrl} />
                  ) : (
                    <div style={{ padding: 40, background: 'rgba(255,255,255,0.02)', borderRadius: 10, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <MdPlayCircle style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.5, marginBottom: 10 }} />
                      <p style={{ color: 'var(--text-muted)' }}>No video lecture available for this module.</p>
                      {isOwner && (
                        <div style={{ marginTop: 15 }}>
                           <input type="text" className="form-control" placeholder="Enter Video URL (e.g. mp4 link)" 
                                  onKeyDown={e => {
                                      if(e.key === 'Enter' && e.target.value) {
                                          API.put(`/courses/${id}/modules/${activeModule._id}`, { videoUrl: e.target.value })
                                            .then(() => { toast.success('Video added'); fetchCourse(); setActiveModule({...activeModule, videoUrl: e.target.value}) });
                                      }
                                  }} />
                           <small style={{ color: 'var(--text-muted)' }}>Press Enter to save video URL</small>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Documents Section */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}><MdDescription style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--success)' }}/>Resources & Documents</h3>
                    {isOwner && (
                      <div>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={handlePDFUpload} />
                        <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current.click()} disabled={uploadingPdf}>
                          {uploadingPdf ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><MdAdd /> Add PDF</>}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {activeModule.documents && activeModule.documents.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {activeModule.documents.map((doc, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontWeight: 500 }}><MdDescription style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--text-muted)' }}/> {doc.title}</span>
                          <a href={doc.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View / Download</a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No attached documents for this module.</p>
                  )}
                </div>

                {/* 3. Assignment Section */}
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}><MdQuiz style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--primary-light)' }}/> Assignment Task</h3>
                  {activeModule.assignment ? (
                    <div>
                      <div className="flex-between">
                        <h4 style={{ marginBottom: 4 }}>{activeModule.assignment.title}</h4>
                        {activeModule.assignment.attachmentUrl && (
                          <a href={activeModule.assignment.attachmentUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><MdDescription style={{verticalAlign: 'middle'}}/> Download PDF</a>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-muted)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>{activeModule.assignment.description}</p>
                      <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 16, fontSize: '0.85rem', display: 'inline-block' }}>
                        <span style={{ color: 'var(--text-muted)', marginRight: 16 }}>Deadline: <strong style={{ color: '#fff' }}>{new Date(activeModule.assignment.deadline).toLocaleDateString()}</strong></span>
                        <span style={{ color: 'var(--text-muted)' }}>Max Marks: <strong style={{ color: '#fff' }}>{activeModule.assignment.maxMarks}</strong></span>
                      </div>
                      
                      {user.role === 'student' ? (
                        <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed var(--primary-light)' }}>
                           <p style={{ marginBottom: 12, fontSize: '0.9rem' }}>Submit your work here. Note: Currently routes to the Assignments page for full submission processing.</p>
                           <button className="btn btn-primary" onClick={() => navigate('/assignments')}>Go to Assignment Submission &rarr;</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/assignments')}>Grade Submissions</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {showAddAssignment && isOwner ? (
                        <form onSubmit={handleCreateAssignment} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
                          <h4 style={{ marginBottom: 16 }}>Create New Assignment</h4>
                          <div className="form-group"><label>Title</label><input className="form-control" value={assignForm.title} onChange={e => setAssignForm({...assignForm, title: e.target.value})} required /></div>
                          <div className="form-group"><label>Instructions (Text)</label><textarea className="form-control" rows={3} value={assignForm.description} onChange={e => setAssignForm({...assignForm, description: e.target.value})} required /></div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group"><label>Deadline</label><input type="date" className="form-control" value={assignForm.deadline} onChange={e => setAssignForm({...assignForm, deadline: e.target.value})} required /></div>
                            <div className="form-group"><label>Max Marks</label><input type="number" className="form-control" value={assignForm.maxMarks} onChange={e => setAssignForm({...assignForm, maxMarks: e.target.value})} required /></div>
                          </div>
                          <div className="form-group">
                            <label>Attach PDF (Optional)</label>
                            <input type="file" ref={assignFileRef} className="form-control" accept=".pdf,.doc,.docx" onChange={e => setAssignFile(e.target.files[0])} />
                          </div>
                          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                            <button type="submit" className="btn btn-primary" disabled={uploadingAssignPdf}>{uploadingAssignPdf ? 'Creating...' : 'Create & Attach'}</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAddAssignment(false)}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <p style={{ color: 'var(--text-muted)' }}>No assignment attached to this module.</p>
                          {isOwner && (
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAddAssignment(true)}>
                                <MdAdd style={{ verticalAlign: 'middle', marginRight: 4 }}/> Create Assignment
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '60px 24px', marginBottom: 20 }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>📖</div>
                <h3 style={{ marginBottom: 8 }}>Select a Module</h3>
                <p style={{ color: 'var(--text-muted)' }}>Choose a module from the right to start learning</p>
              </div>
            )}
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>About This Course</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{course.description}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                {course.category && <span className="badge badge-info">{course.category}</span>}
                <span className="badge badge-purple">{course.level}</span>
                {course.duration && <span className="badge badge-amber" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>⏱ {course.duration}</span>}
              </div>
            </div>
          </div>

          {/* Right: Module List */}
          <div>
            <div className="card">
              {user.role === 'student' && (
                <div style={{ marginBottom: 20 }}>
                  <div className="flex-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Your Progress</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{progress.percentage || 0}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress.percentage || 0}%` }} /></div>
                </div>
              )}

              <div className="flex-between mb-16">
                <h3 className="section-title" style={{ marginBottom: 0 }}>Course Roadmap ({course.modules?.length || 0})</h3>
                {isOwner && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModule(true)}><MdAdd /> Section</button>
                )}
              </div>

              <div className="module-list">
                {course.modules?.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No modules yet.</p>}
                {course.modules?.map((m, i) => {
                  const done = progress.completedModules?.includes(m._id);
                  const isActive = activeModule?._id === m._id;
                  return (
                    <div key={m._id} className={`module-item ${done ? 'completed' : ''}`} style={{ borderLeft: isActive ? '3px solid var(--primary-light)' : '3px solid transparent', background: isActive ? 'rgba(255,255,255,0.05)' : '' }} onClick={() => setActiveModule(m)}>
                      <div className={`module-icon stat-icon ${done ? 'emerald' : 'indigo'}`} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {m.videoUrl && <span style={{ marginRight: 8 }}>🎥 Video</span>}
                          {m.documents?.length > 0 && <span style={{ marginRight: 8 }}>📄 {m.documents.length} Docs</span>}
                          {m.assignment && <span>📝 Task</span>}
                          {!m.videoUrl && !m.documents?.length && !m.assignment && <span>✏️ Section {i+1}</span>}
                        </div>
                      </div>
                      {done && <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>}
                      {isOwner && <button className="btn btn-danger btn-sm" style={{ padding: '3px 6px' }} onClick={e => { e.stopPropagation(); handleDeleteModule(m._id); }}><MdDelete /></button>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModule && (
        <div className="modal-overlay" onClick={() => setShowAddModule(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Module</h3>
              <button className="modal-close" onClick={() => setShowAddModule(false)}>×</button>
            </div>
            <form onSubmit={handleAddModule}>
              <div className="form-group"><label>Section Title</label><input className="form-control" value={mod.title} onChange={e => setMod({ ...mod, title: e.target.value })} required /></div>
              <div className="form-group"><label>Description</label><input className="form-control" value={mod.description} onChange={e => setMod({ ...mod, description: e.target.value })} /></div>
              <div className="form-group"><label>Main Video URL (Optional)</label><input className="form-control" placeholder="https://..." value={mod.videoUrl} onChange={e => setMod({ ...mod, videoUrl: e.target.value })} /></div>
              <button type="submit" className="btn btn-primary btn-full"><MdAdd /> Add Section</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
