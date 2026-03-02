import { useEffect, useState } from 'react';
import { accountService } from '../../services/accountService';
import { authService } from '../../services/authService';

export default function MyAccounts() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    const role = user?.role?.toLowerCase();
    const accountNo = user?.accountNo;
    if (accountNo && role === 'user') {
      accountService.getAccount(accountNo).then(setAccount);
    } else {
      window.location.href = '/login';
    }
  }, []);

  const downloadPdf = () => {
    const accountNo = account?.accountNo;
    if (!accountNo) return;
    window.open(`http://localhost:8081/api/transactions/statement/${accountNo}`, '_blank');
  };

  if (!account) return <p>Loading account details...</p>;

  return (
    <div className="account-container">
      <h2 className="account-heading">🧾 Account Details</h2>
      <table className="account-table">
        <tbody>
          <tr><td><strong>Account No:</strong></td><td>{account.accountNo ?? 'N/A'}</td></tr>
          <tr><td><strong>Name:</strong></td><td>{account.name ?? 'N/A'}</td></tr>
          <tr><td><strong>Email:</strong></td><td>{account.email ?? 'N/A'}</td></tr>
          <tr><td><strong>Mobile No:</strong></td><td>{account.mobileNo ?? 'N/A'}</td></tr>
          <tr><td><strong>Balance:</strong></td><td>₹{account.balance ?? '0'}</td></tr>
          <tr><td><strong>Address:</strong></td><td>{account.address ?? 'N/A'}</td></tr>
          <tr><td><strong>Gender:</strong></td><td>{account.gender ?? 'N/A'}</td></tr>
          <tr><td><strong>DOB:</strong></td><td>{account.dob ?? 'N/A'}</td></tr>
          <tr><td><strong>Aadhar:</strong></td><td>{account.aadhar ?? 'N/A'}</td></tr>
          <tr><td><strong>PAN:</strong></td><td>{account.pan ?? 'N/A'}</td></tr>
          <tr><td><strong>Account Type:</strong></td><td>{account.accountType ?? 'N/A'}</td></tr>
          <tr><td><strong>Branch:</strong></td><td>{account.branch?.branchName ?? 'N/A'}</td></tr>
          <tr><td><strong>IFSC Code:</strong></td><td>{account.ifscCode ?? 'N/A'}</td></tr>
        </tbody>
      </table>
      <div className="download-section">
        <span className="label">📄 Transaction History</span>
        <button type="button" className="download-btn" onClick={downloadPdf}>⬇️ Download</button>
      </div>
    </div>
  );
}
