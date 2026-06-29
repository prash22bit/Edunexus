import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdSearch, MdMenuBook, MdPeople, MdDelete, MdEdit, MdPublish } from 'react-icons/md';

const BANNER_GRADIENTS = [
  'linear-gradient(135deg, #c7d2fe, #a5b4fc)',  // violet-indigo
  'linear-gradient(135deg, #99f6e4, #67e8f9)',  // teal-cyan
  'linear-gradient(135deg, #fde68a, #fca5a5)',  // amber-rose
  'linear-gradient(135deg, #a7f3d0, #6ee7b7)',  // emerald
  'linear-gradient(135deg, #fbcfe8, #f9a8d4)',  // pink
  'linear-gradient(135deg, #bfdbfe, #93c5fd)',  // sky-blue
];
const BANNERS = ['🎨', '💻', '📐', '🔬', '📊', '🎵', '🌍', '🏗️', '🧬', '⚛️'];

export default function CoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', level: 'Beginner', duration: '' });

  const fetch = async () => {
    try { const { data } = await API.get('/courses'); setCourses(data); }
    catch (e) { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    try {
      await API.post('/courses', form);
      toast.success('Course created!');
      setShowModal(false);
      setForm({ title: '', description: '', category: '', level: 'Beginner', duration: '' });
      fetch();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this course?')) return;
    try { await API.delete(`/courses/${id}`); toast.success('Deleted'); fetch(); }
    catch (e) { toast.error('Error'); }
  };

  const handleEnroll = async (id, e) => {
    e.stopPropagation();
    try { await API.post(`/courses/${id}/enroll`); toast.success('Enrolled!'); fetch(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handlePublish = async (course, e) => {
    e.stopPropagation();
    try { await API.put(`/courses/${course._id}`, { isPublished: !course.isPublished }); fetch(); }
    catch (e) { toast.error('Error'); }
  };

  const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="page-header">
        <h2>Courses</h2>
        <p>{user.role === 'instructor' ? 'Manage your courses and content' : 'Browse and enroll in available courses'}</p>
      </div>
      <div className="page-content">
        <div className="flex-between mb-24">
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 20 }} />
            <input className="form-control" style={{ paddingLeft: 40 }} placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {(user.role === 'instructor' || user.role === 'admin') && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><MdAdd /> New Course</button>
          )}
        </div>

        {loading ? <div className="loading-overlay"><div className="spinner" /></div> : filtered.length === 0 ? (
          <div className="empty-state"><MdMenuBook /><p>No courses found.</p></div>
        ) : (
          <div className="grid-3">
            {filtered.map((course, i) => {
              const isEnrolled = Array.isArray(course.enrolledStudents) && course.enrolledStudents.some(s => s === user._id || s?._id === user._id);
              return (
                <div key={course._id} className="course-card" onClick={() => navigate(`/courses/${course._id}`)}>
                  <div className="course-banner" style={{ background: BANNER_GRADIENTS[i % BANNER_GRADIENTS.length] }}>
                    <span>{BANNERS[i % BANNERS.length]}</span>
                    {(user.role === 'instructor' && course.instructor?._id === user._id) || user.role === 'admin' ? (
                      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, opacity: 0 }} className="course-admin-btns" onClick={e => e.stopPropagation()}>
                        <button className="btn btn-sm" style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.85)', color: '#1e293b', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.75rem' }} onClick={e => handlePublish(course, e)}>
                          {course.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button className="btn btn-sm btn-danger" style={{ padding: '5px 8px', background: 'rgba(254,226,226,0.9)', backdropFilter: 'blur(4px)' }} onClick={e => handleDelete(course._id, e)}><MdDelete /></button>
                      </div>
                    ) : null}
                  </div>
                  <div className="course-body">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {course.category && <span className="badge badge-info">{course.category}</span>}
                      <span className="badge badge-purple">{course.level}</span>
                    </div>
                  </div>
                  <div className="course-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdPeople /> {course.enrolledStudents?.length || 0}</span>
                    {user.role === 'student' && (
                      isEnrolled ? <span className="badge badge-success">✓ Enrolled</span>
                        : <button className="btn btn-primary btn-sm" onClick={e => handleEnroll(course._id, e)}>Enroll</button>
                    )}
                    {user.role !== 'student' && <span className={`badge badge-${course.isPublished ? 'success' : 'warning'}`}>{course.isPublished ? 'Published' : 'Draft'}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Course</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>Course Title</label><input className="form-control" placeholder="e.g. Introduction to Python" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" placeholder="What will students learn?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Category</label><input className="form-control" placeholder="e.g. Programming" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
                <div className="form-group"><label>Level</label><select className="form-control" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
              </div>
              <div className="form-group"><label>Duration</label><input className="form-control" placeholder="e.g. 6 weeks" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></div>
              <button type="submit" className="btn btn-primary btn-full"><MdAdd /> Create Course</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
