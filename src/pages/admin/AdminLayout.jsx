import { Outlet, NavLink } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function AdminLayout() {
  const logout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className="admin-layout-new">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-icon">🏢</span>
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard/manage-employee" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <span className="admin-nav-icon">👥</span>
            Manage Employee
          </NavLink>
          <NavLink to="/admin/dashboard/manage-user" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <span className="admin-nav-icon">📋</span>
            Manage User
          </NavLink>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar-welcome">Welcome Admin</span>
          <button type="button" className="admin-logout-btn" onClick={logout}>Logout</button>
        </header>
        <section className="admin-content">
          <div className="page-enter">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}
