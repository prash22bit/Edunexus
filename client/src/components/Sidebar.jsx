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
          <svg style={{ width: 24, height: 24 }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M11.3 1.046A12.014 12.014 0 0121 11.642V17a2 2 0 01-2 2h-5.358a12.014 12.014 0 01-10.596-9.7 12.03 12.03 0 013.918-10.457A2 2 0 019.261 1.046zM15 8a1 1 0 100-2 1 1 0 000 2zM9 14.5a1.5 1.5 0 00-3 0v1.758a1 1 0 00.293.707l1.5 1.5a1 1 0 001.414 0l1.5-1.5a1 1 0 00.293-.707V14.5z" clipRule="evenodd" />
          </svg>
        </div>
        <h1>edunexus</h1>
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
