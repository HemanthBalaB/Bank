import { authService } from '../../services/authService';

export default function Statement() {
  const user = authService.getCurrentUser();
  const accountNo = user?.accountNo;
  const url = accountNo ? `http://localhost:8081/api/transactions/statement/${accountNo}` : null;

  return (
    <div className="statement-page">
      <h2>Account Statement</h2>
      {url ? (
        <p><a href={url} target="_blank" rel="noopener noreferrer">Download statement (PDF)</a></p>
      ) : (
        <p>Please log in to view your statement.</p>
      )}
    </div>
  );
}
