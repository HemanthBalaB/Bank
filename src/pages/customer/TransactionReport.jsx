import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { api } from '../../api/client';

const API_BASE = 'http://localhost:8081';

export default function TransactionReport() {
  const [accountNo, setAccountNo] = useState(0);
  const [miniStatement, setMiniStatement] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    const accNo = Number(user?.accountNo || 0);
    setAccountNo(accNo);
    if (!accNo) {
      setErrorMessage('Account number not found.');
      return;
    }
    api.get(`/api/transactions/recent/${accNo}`)
      .then((data) => setMiniStatement(data ?? []))
      .catch(() => setMiniStatement([]));
  }, []);

  const downloadStatementPdf = () => {
    if (!fromDate || !toDate) {
      alert('Please select both From and To dates');
      return;
    }
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
    const url = `${API_BASE}/api/transactions/statement/${accountNo}?from=${fromDate}&to=${toDate}`;
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: 'include' })
      .then((res) => res.blob())
      .then((blob) => {
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = `statement_${accountNo}_${fromDate}_to_${toDate}.pdf`;
        link.click();
      })
      .catch(() => alert('❌ Failed to download statement'));
  };

  return (
    <div className="transaction-report">
      <h2>📋 Transaction Report</h2>
      <div className="mini-statement">
        <h4>🧾 Mini Statement (Last 10 Transactions)</h4>
        {!miniStatement.length && <div>No recent transactions found.</div>}
        {miniStatement.map((tx) => (
          <div key={tx.transactionId} className="txn">
            <span className="type">{tx.type}</span>
            <span className="desc">{tx.description}</span>
            <span className="date">{new Date(tx.timestamp).toLocaleString()}</span>
            <span className={`amt ${tx.type === 'DEPOSIT' ? 'credit' : ''}`}>₹{tx.amount}</span>
          </div>
        ))}
      </div>
      <div className="full-statement">
        <h4>📁 Download Statement by Date Range</h4>
        <label>From:</label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
        <label>To:</label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
        <button type="button" onClick={downloadStatementPdf}>⬇️ Download PDF</button>
      </div>
      {errorMessage && <div className="error-msg">{errorMessage}</div>}
    </div>
  );
}
