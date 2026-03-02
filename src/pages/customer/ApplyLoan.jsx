import { useState } from 'react';
import { authService } from '../../services/authService';
import { api } from '../../api/client';

export default function ApplyLoan() {
  const user = authService.getCurrentUser();
  const accountNo = +(user?.accountNo ?? user?.username ?? 0);

  const [loanAmount, setLoanAmount] = useState(0);
  const [tenureInMonths, setTenureInMonths] = useState(0);
  const [purpose, setPurpose] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const apply = (e) => {
    e.preventDefault();
    if (!loanAmount || !tenureInMonths || !purpose) {
      setError('Please fill all the fields.');
      return;
    }
    const loan = { accountNo, loanAmount, tenureInMonths, purpose };
    api.post('/api/loans/apply', loan, 'text')
      .then((res) => {
        setMessage(String(res));
        setError('');
        setLoanAmount(0);
        setTenureInMonths(0);
        setPurpose('');
      })
      .catch(() => {
        setError('Loan application failed.');
        setMessage('');
      });
  };

  return (
    <div className="apply-loan-container">
      <h2>📝 Apply for a Loan</h2>
      <form onSubmit={apply}>
        <div className="form-group">
          <label>Loan Amount</label>
          <input type="number" value={loanAmount || ''} onChange={(e) => setLoanAmount(Number(e.target.value))} required />
        </div>
        <div className="form-group">
          <label>Tenure (in months)</label>
          <input type="number" value={tenureInMonths || ''} onChange={(e) => setTenureInMonths(Number(e.target.value))} required />
        </div>
        <div className="form-group">
          <label>Purpose</label>
          <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
        </div>
        <button type="submit">Apply</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
