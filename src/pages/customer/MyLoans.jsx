import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { api } from '../../api/client';

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const user = authService.getCurrentUser();
  const accountNo = +(user?.accountNo ?? user?.username ?? 0);

  useEffect(() => {
    if (!accountNo) {
      setErrorMessage('No account number found!');
      return;
    }
    setLoading(true);
    api.get(`/api/loans/status/${accountNo}`)
      .then((data) => { setLoans(data ?? []); setLoading(false); })
      .catch(() => { setErrorMessage('Unable to fetch loan records'); setLoading(false); });
  }, [accountNo]);

  if (loading) return <div>Loading...</div>;
  if (errorMessage) return <div className="error-msg">{errorMessage}</div>;
  if (!loans.length) return <div className="my-loans-container"><h2>📊 My Loan Applications</h2><div className="no-records">No loan applications found.</div></div>;

  return (
    <div className="my-loans-container">
      <h2>📊 My Loan Applications</h2>
      <table className="loan-table">
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Amount (₹)</th>
            <th>Tenure (months)</th>
            <th>Purpose</th>
            <th>Status</th>
            <th>Applied Date</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.loanId}>
              <td>{loan.loanId}</td>
              <td>{loan.loanAmount}</td>
              <td>{loan.tenureInMonths}</td>
              <td>{loan.purpose}</td>
              <td className={loan.status.toLowerCase()}>{loan.status}</td>
              <td>{new Date(loan.appliedDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
