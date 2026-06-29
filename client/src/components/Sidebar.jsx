import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdMenuBook, MdAssignment, MdQuiz, MdMessage,
  MdPeople, MdBarChart, MdPerson, MdLogout, MdSchool
} from 'react-icons/md';

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/auth'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <img
            src="/logo.png"
            alt="EduNexus Logo"
            style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
        <h1>EduNexus</h1>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <strong>{user?.name}</strong>
          <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-title">Main</p>
        <NavItem to="/" icon={<MdDashboard />} label="Dashboard" />
        <NavItem to="/courses" icon={<MdMenuBook />} label="Courses" />
        <NavItem to="/assignments" icon={<MdAssignment />} label="Assignments" />
        <NavItem to="/quizzes" icon={<MdQuiz />} label="Quizzes" />
        <NavItem to="/messages" icon={<MdMessage />} label="Messages" />

        {user?.role === 'admin' && (
          <>
            <p className="nav-section-title">Admin</p>
            <NavItem to="/admin/users" icon={<MdPeople />} label="Manage Users" />
            <NavItem to="/admin/reports" icon={<MdBarChart />} label="Reports" />
          </>
        )}

        <p className="nav-section-title">Account</p>
        <NavItem to="/profile" icon={<MdPerson />} label="Profile" />
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <MdLogout />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
