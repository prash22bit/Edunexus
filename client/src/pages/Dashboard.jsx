import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { MdMenuBook, MdPeople, MdAssignment, MdSchool, MdTrendingUp, MdQuiz, MdCheckCircle } from 'react-icons/md';

const BANNER_GRADIENTS = [
  'linear-gradient(135deg, #c7d2fe, #a5b4fc)',
  'linear-gradient(135deg, #99f6e4, #67e8f9)',
  'linear-gradient(135deg, #fde68a, #fca5a5)',
  'linear-gradient(135deg, #a7f3d0, #6ee7b7)',
  'linear-gradient(135deg, #fbcfe8, #f9a8d4)',
  'linear-gradient(135deg, #bfdbfe, #93c5fd)',
];

function StatCard({ icon, label, value, index }) {
  const cls = ['indigo', 'sky', 'amber', 'emerald'][index % 4];
  return (
    <div className={`stat-card ${cls}`}>
      <div className={`stat-icon ${cls}`}>{icon}</div>
      <div className="stat-info">
        <h3>{value ?? '—'}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchDash = async () => {
      try {
        if (user.role === 'admin') {
          const { data: stats } = await API.get('/admin/stats');
          setData(stats);
        }
        const { data: c } = await API.get('/courses');
        setCourses(c.slice(0, 6));
      } catch (e) {}
    };
    fetchDash();
  }, [user]);

  const banners = ['🎨', '💻', '📐', '🔬', '📊', '🎵', '🌍', '🏗️'];

  return (
    <>
      <div className="page-header">
        <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
        <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="page-content">
        {user.role === 'admin' && data && (
          <div className="stats-grid">
            <StatCard icon={<MdPeople />} label="Total Users" value={data.totalUsers} index={0} />
            <StatCard icon={<MdSchool />} label="Students" value={data.students} index={1} />
            <StatCard icon={<MdMenuBook />} label="Total Courses" value={data.totalCourses} index={2} />
            <StatCard icon={<MdTrendingUp />} label="Avg. Completion" value={`${data.avgCompletion}%`} index={3} />
          </div>
        )}

        {user.role === 'instructor' && (
          <div className="stats-grid">
            <StatCard icon={<MdMenuBook />} label="Your Courses" value={courses.length} index={0} />
            <StatCard icon={<MdPeople />} label="Total Students" value={courses.reduce((a, c) => a + (c.enrolledStudents?.length || 0), 0)} index={1} />
            <StatCard icon={<MdAssignment />} label="Create Content" value="↗" index={2} />
            <StatCard icon={<MdQuiz />} label="Quizzes" value="↗" index={3} />
          </div>
        )}

        {user.role === 'student' && (
          <div className="stats-grid">
            <StatCard icon={<MdMenuBook />} label="Available Courses" value={courses.length} index={0} />
            <StatCard icon={<MdCheckCircle />} label="Enrolled" value={courses.filter(c => c.enrolledStudents?.includes(user._id)).length} index={3} />
            <StatCard icon={<MdAssignment />} label="Assignments" value="View All" index={1} />
            <StatCard icon={<MdQuiz />} label="Quizzes" value="View All" index={2} />
          </div>
        )}

        <div className="mb-24">
          <div className="flex-between mb-16">
            <h3 className="section-title"><MdMenuBook /> {user.role === 'instructor' ? 'Your Courses' : 'Browse Courses'}</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/courses')}>View All</button>
          </div>
          {courses.length === 0 ? (
            <div className="empty-state"><MdMenuBook /><p>No courses yet. {user.role === 'instructor' ? 'Create your first course!' : 'Check back later.'}</p></div>
          ) : (
            <div className="grid-3">
              {courses.map((course, i) => (
                <div key={course._id} className="course-card" onClick={() => navigate(`/courses/${course._id}`)}>
                  <div className="course-banner" style={{ background: BANNER_GRADIENTS[i % BANNER_GRADIENTS.length] }}>
                    <span>{banners[i % banners.length]}</span>
                  </div>
                  <div className="course-body">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                  </div>
                  <div className="course-meta">
                    <span>By {course.instructor?.name}</span>
                    <span className={`badge badge-${course.isPublished ? 'success' : 'warning'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
