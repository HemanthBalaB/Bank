import { useEffect, useState } from 'react';
import { transactionService } from '../../services/transactionService';
import { accountService } from '../../services/accountService';

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [accountId, setAccountId] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [toAccountId, setToAccountId] = useState(0);
  const [recentTxns, setRecentTxns] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const rawUser = localStorage.getItem('currentUser');
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        setAccountId(+user.accountNo);
        setCustomerName(user.name || 'Customer');
        accountService.getBalance(+user.accountNo).then((b) => setBalance(Number(b)));
        transactionService.getTransactions(+user.accountNo).then(setRecentTxns);
      } catch {
        alert('Invalid user data.');
      }
    } else {
      alert('Please login first.');
    }
  }, []);

  const setTab = (tab) => {
    setActiveTab(tab);
    setAmount(0);
    setToAccountId(0);
    setMessage('');
  };

  const fetchBalance = () => {
    accountService.getBalance(accountId).then((b) => setBalance(Number(b)));
  };
  const fetchRecent = () => {
    transactionService.getTransactions(accountId).then(setRecentTxns);
  };

  const onDeposit = (e) => {
    e.preventDefault();
    if (amount <= 0) { alert('Enter a valid amount.'); return; }
    transactionService.deposit(accountId, amount)
      .then((msg) => { setMessage(String(msg)); fetchBalance(); fetchRecent(); setAmount(0); })
      .catch(() => setMessage('❌ Deposit failed'));
  };

  const onWithdraw = (e) => {
    e.preventDefault();
    if (amount <= 0) { alert('Enter a valid amount.'); return; }
    transactionService.withdraw(accountId, amount)
      .then((msg) => { setMessage(String(msg)); fetchBalance(); fetchRecent(); setAmount(0); })
      .catch(() => setMessage('❌ Withdrawal failed'));
  };

  const onTransfer = (e) => {
    e.preventDefault();
    if (amount <= 0 || !toAccountId) { alert('Enter valid amount and recipient.'); return; }
    transactionService.transfer(accountId, toAccountId, amount)
      .then((msg) => { setMessage(String(msg)); fetchBalance(); fetchRecent(); setAmount(0); setToAccountId(0); })
      .catch(() => setMessage('❌ Transfer failed'));
  };

  return (
    <div className="transactions-page">
      <h2>Hello, {customerName} | Balance: ₹{balance}</h2>
      <div className="tx-actions">
        <button type="button" className={activeTab === 'deposit' ? 'active' : ''} onClick={() => setTab('deposit')}>💰 Deposit</button>
        <button type="button" className={activeTab === 'withdraw' ? 'active' : ''} onClick={() => setTab('withdraw')}>💸 Withdraw</button>
        <button type="button" className={activeTab === 'transfer' ? 'active' : ''} onClick={() => setTab('transfer')}>🔄 Transfer</button>
      </div>
      {message && <div className="msg">{message}</div>}
      <div className="tx-form">
        {activeTab === 'deposit' && (
          <form onSubmit={onDeposit}>
            <label>Amount</label>
            <input type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} required />
            <button type="submit">Deposit</button>
          </form>
        )}
        {activeTab === 'withdraw' && (
          <form onSubmit={onWithdraw}>
            <label>Amount</label>
            <input type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} required />
            <button type="submit">Withdraw</button>
          </form>
        )}
        {activeTab === 'transfer' && (
          <form onSubmit={onTransfer}>
            <label>To Account No</label>
            <input type="number" value={toAccountId || ''} onChange={(e) => setToAccountId(Number(e.target.value))} required />
            <label>Amount</label>
            <input type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} required />
            <button type="submit">Transfer</button>
          </form>
        )}
      </div>
      <h3>Recent Transactions</h3>
      {!recentTxns.length && <div>No transactions available.</div>}
      {recentTxns.length > 0 && (
        <div className="recent-list">
          {recentTxns.map((tx) => (
            <div key={tx.transactionId} className="txn">
              <span className="icon">{tx.type === 'DEPOSIT' ? '💰' : tx.type === 'WITHDRAW' ? '💸' : '🔄'}</span>
              <span className="desc">{tx.description}</span>
              <span className="date">{new Date(tx.timestamp).toLocaleString()}</span>
              <span className={`amt ${tx.type === 'DEPOSIT' ? 'credit' : ''}`}>₹{tx.amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
