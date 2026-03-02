import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function ReviewLoans() {
  const [loanApplications, setLoanApplications] = useState([]);
  const [searchLoan, setSearchLoan] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/loans/all')
      .then((data) => setLoanApplications(Array.isArray(data) ? data : []))
      .catch(() => setErrorMessage('Failed to load loan applications'))
      .finally(() => setLoading(false));
  }, []);

  const filteredLoans = !searchLoan.trim()
    ? loanApplications
    : loanApplications.filter(
        (loan) =>
          String(loan.accountNo || '').includes(searchLoan.trim()) ||
          (loan.status || '').toLowerCase().includes(searchLoan.trim().toLowerCase())
      );

  const updateLoanStatus = (loanId, accountNo, status) => {
    setErrorMessage('');
    api.put('/api/loans/updateStatus', { loanId, accountNo, status })
      .then(() =>
        api
          .get('/api/loans/all')
          .then((data) => setLoanApplications(Array.isArray(data) ? data : []))
      )
      .catch(() =>
        setErrorMessage(
          `Failed to ${status && status.toLowerCase() === 'approved' ? 'approve' : 'reject'} loan`
        )
      );
  };

  const approveLoan = (loanId, accountNo) => {
    updateLoanStatus(loanId, accountNo, 'APPROVED');
  };

  const rejectLoan = (loanId, accountNo) => {
    updateLoanStatus(loanId, accountNo, 'REJECTED');
  };

  const statusClass = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING') return 'rl-status-pending';
    if (s === 'APPROVED') return 'rl-status-approved';
    if (s === 'REJECTED') return 'rl-status-rejected';
    return '';
  };

  return (
    <div className="review-loans-page">
      <header className="rl-header">
        <h1>Loan Applications</h1>
        <p className="rl-subtitle">Review and approve or reject customer loan requests</p>
      </header>

      <div className="rl-toolbar">
        <div className="rl-search-wrap">
          <span className="rl-search-icon">🔍</span>
          <input
            type="text"
            className="rl-search-input"
            placeholder="Search by Account No or Status..."
            value={searchLoan}
            onChange={(e) => setSearchLoan(e.target.value)}
          />
        </div>
        {loanApplications.length > 0 && (
          <span className="rl-count">{filteredLoans.length} of {loanApplications.length} applications</span>
        )}
      </div>

      {errorMessage && <div className="rl-error">{errorMessage}</div>}

      {loading ? (
        <div className="rl-loading">Loading loan applications...</div>
      ) : filteredLoans.length === 0 ? (
        <div className="rl-empty">
          <span className="rl-empty-icon">📋</span>
          <p>{searchLoan.trim() ? 'No applications match your search.' : 'No loan applications yet.'}</p>
        </div>
      ) : (
        <div className="rl-table-card">
          <div className="rl-table-wrap">
            <table className="rl-table">
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Account No</th>
                  <th>Amount</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan.loanId}>
                    <td className="rl-id">#{loan.loanId}</td>
                    <td>{loan.accountNo}</td>
                    <td className="rl-amount">₹{(loan.loanAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="rl-purpose">{loan.purpose || '—'}</td>
                    <td>
                      <span className={`rl-status-badge ${statusClass(loan.status)}`}>
                        {loan.status || '—'}
                      </span>
                    </td>
                    <td className="rl-date">{new Date(loan.appliedDate).toLocaleDateString()}</td>
                    <td>
                      <div className="rl-actions">
                        <button
                          type="button"
                          className="rl-btn rl-btn-approve"
                          onClick={() => approveLoan(loan.loanId, loan.accountNo)}
                          disabled={loan.status !== 'PENDING'}
                          title="Approve"
                        >
                          ✓ Approve
                        </button>
                        <button
                          type="button"
                          className="rl-btn rl-btn-reject"
                          onClick={() => rejectLoan(loan.loanId, loan.accountNo)}
                          disabled={loan.status !== 'PENDING'}
                          title="Reject"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
