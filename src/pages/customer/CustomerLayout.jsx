import { Outlet, NavLink } from 'react-router-dom';

export default function CustomerLayout() {
  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Maverick Bank</h2>
        <nav>
          <NavLink to="/customer/my-accounts">🏠 My Accounts</NavLink>
          <NavLink to="/customer/transactions">💸 Transactions</NavLink>
          <NavLink to="/customer/reports/transaction-report">📄 Transaction Report</NavLink>
          <NavLink to="/customer/loans/apply-loan">📝 Apply Loan</NavLink>
          <NavLink to="/customer/loans/my-loans">📊 My Loans</NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <header className="top-header">
          <button type="button" className="logout-btn" onClick={logout}>🚪 Logout</button>
        </header>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
