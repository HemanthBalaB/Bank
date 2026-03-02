import { Outlet, NavLink } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function EmployeeLayout() {
  const logout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className="emp-layout">
      <aside className="emp-sidebar">
        <div className="emp-sidebar-brand">
          <span className="emp-sidebar-icon">🏦</span>
          <h2>Employee Panel</h2>
        </div>
        <nav className="emp-nav">
          <NavLink to="/employee/dashboard" className={({ isActive }) => isActive ? 'emp-nav-link active' : 'emp-nav-link'}>
            <span className="emp-nav-icon">📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/employee/review-loans" className={({ isActive }) => isActive ? 'emp-nav-link active' : 'emp-nav-link'}>
            <span className="emp-nav-icon">📄</span>
            Review Loans
          </NavLink>
        </nav>
      </aside>
      <main className="emp-main">
        <header className="emp-topbar">
          <span className="emp-topbar-welcome">Welcome, Employee</span>
          <button type="button" className="emp-logout-btn" onClick={logout}>Logout</button>
        </header>
        <section className="emp-content">
          <div className="page-enter">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}
