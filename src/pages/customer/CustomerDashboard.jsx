import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { api } from '../../api/client';

export default function CustomerDashboard() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showBalance, setShowBalance] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const user = authService.getCurrentUser();
  const accNo = +(user?.accountNo ?? user?.username ?? 0);

  useEffect(() => {
    if (!accNo) {
      setErrorMessage('No account number found!');
      return;
    }
    api.get(`/searchAccount/${accNo}`)
      .then(setAccount)
      .catch(() => setErrorMessage('Unable to load account details'));
    api.get(`/api/transactions/recent/${accNo}`)
      .then((data) => setTransactions(data ?? []))
      .catch(() => setTransactions([]));
  }, [accNo]);

  if (errorMessage) {
    return <p className="error-msg">{errorMessage}</p>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-background">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="bubble" />)}
      </div>
      <div className="welcome-header">
        <h2>Welcome, {account?.name || 'Customer'}!</h2>
        <div className="account-meta">
          <div>Acc No: {account?.accountNo}</div>
          <div>IFSC: {account?.ifscCode}</div>
          <div>Branch: {account?.branch?.branchName}</div>
        </div>
      </div>
      {account && (
        <div className="balance-card">
          <div className="balance-header">
            <span>Account Balance</span>
            <span className="toggle" onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? 'Hide' : 'Show'}
            </span>
          </div>
          <div className="balance-value">
            {showBalance ? `₹${account.balance}` : '••••••••'}
          </div>
        </div>
      )}
      {transactions.length > 0 && (
        <div className="transactions-section">
          <div className="header">
            <h4>Recent Transactions</h4>
            <Link to="/customer/transactions">View All</Link>
          </div>
          {transactions.map((tx, i) => (
            <div key={i} className="transaction">
              <div className="tx-icon">💰</div>
              <div className="tx-info">
                <span className="desc">{tx.type} – {tx.description}</span>
                <span className="date">
                  {new Date(tx.timestamp || tx.date).toLocaleString()}
                </span>
              </div>
              <div
                className={`tx-amount ${
                  (tx.type || '').toUpperCase() === 'DEPOSIT' ? 'credit' : 'debit'
                }`}
              >
                ₹{tx.amount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
