import { useState, useEffect } from 'react';
import { api } from '../../api/client';

export default function EmployeeDashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountTransactions, setAccountTransactions] = useState([]);
  const [accountDetails, setAccountDetails] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    api.get('/api/employees/session-check')
      .then((employee) => setEmployeeName(employee?.name || ''))
      .catch(() => { window.location.href = '/login'; });
  }, []);

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    api.get('/getAllAccounts')
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMessage(err?.message || 'Failed to load customers. You may need backend access for /getAllAccounts.');
        setCustomers([]);
        setLoading(false);
      });
  }, []);

  const filteredCustomers = !searchTerm.trim()
    ? customers
    : customers.filter(
        (c) =>
          String(c.accountNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

  const totalBalance = customers.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);

  const viewTransactions = (accountNo) => {
    setSelectedAccount(accountNo);
    setAccountTransactions([]);
    setAccountDetails(null);
    setLoadingTransactions(true);
    api.get(`/searchAccount/${accountNo}`)
      .then(setAccountDetails)
      .catch(() => setAccountDetails(null));
    api.get(`/api/transactions/recent/${accountNo}`)
      .then((data) => setAccountTransactions(Array.isArray(data) ? data : []))
      .catch(() => setAccountTransactions([]))
      .finally(() => setLoadingTransactions(false));
  };

  const closeTransactions = () => {
    setSelectedAccount(null);
    setAccountTransactions([]);
    setAccountDetails(null);
  };

  return (
    <div className="employee-dashboard-page">
      <header className="emp-dash-header">
        <h1>Employee Dashboard</h1>
        {employeeName && <p className="emp-greeting">Hello, {employeeName}</p>}
      </header>

      {errorMessage && (
        <div className="emp-dash-error">{errorMessage}</div>
      )}

      {!errorMessage && !loading && (
        <>
          <div className="emp-dash-stats">
            <div className="emp-stat-card">
              <span className="emp-stat-value">{customers.length}</span>
              <span className="emp-stat-label">Total Customers</span>
            </div>
            <div className="emp-stat-card emp-stat-balance">
              <span className="emp-stat-value">₹{totalBalance.toLocaleString('en-IN')}</span>
              <span className="emp-stat-label">Total Balance</span>
            </div>
          </div>

          <section className="emp-customers-section">
            <h2>All Customers</h2>
            <div className="emp-search-wrap">
              <input
                type="text"
                className="emp-search-input"
                placeholder="Search by Account No, Name or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="emp-loading">Loading customers...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="emp-empty">No customers found.</div>
            ) : (
              <div className="emp-table-wrap">
                <table className="emp-customers-table">
                  <thead>
                    <tr>
                      <th>Account No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c) => (
                      <tr key={c.accountNo}>
                        <td className="emp-id">{c.accountNo}</td>
                        <td className="emp-name">{c.name ?? '—'}</td>
                        <td className="emp-email">{c.email ?? '—'}</td>
                        <td className="emp-balance">₹{(c.balance ?? 0).toLocaleString('en-IN')}</td>
                        <td>
                          <button
                            type="button"
                            className="emp-btn-view"
                            onClick={() => viewTransactions(c.accountNo)}
                          >
                            View Transactions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {selectedAccount != null && (
            <section className="emp-transactions-panel">
              <div className="emp-panel-header">
                <h3>Transactions for Account #{selectedAccount}</h3>
                <button type="button" className="emp-btn-close" onClick={closeTransactions}>Close</button>
              </div>
              {accountDetails && (
                <p className="emp-panel-meta">
                  {accountDetails.name} · Balance: ₹{(accountDetails.balance ?? 0).toLocaleString('en-IN')}
                </p>
              )}
              {loadingTransactions ? (
                <p className="emp-loading">Loading transactions...</p>
              ) : accountTransactions.length === 0 ? (
                <p className="emp-empty">No recent transactions.</p>
              ) : (
                <div className="emp-txn-list">
                  {accountTransactions.map((tx, i) => (
                    <div key={tx.transactionId || i} className="emp-txn-item">
                      <span className="emp-txn-type">{tx.type}</span>
                      <span className="emp-txn-desc">{tx.description}</span>
                      <span className="emp-txn-date">{new Date(tx.timestamp || tx.date).toLocaleString()}</span>
                      <span className={`emp-txn-amt ${tx.type === 'DEPOSIT' ? 'credit' : ''}`}>₹{tx.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {loading && !errorMessage && (
        <div className="emp-loading">Loading dashboard...</div>
      )}
    </div>
  );
}
