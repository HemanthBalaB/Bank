import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', mobileNo: '', address: '' });
  const navigate = useNavigate();

  const loadUsers = () => {
    setLoading(true);
    api.get('/getAllAccounts')
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setErrorMessage('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadUsers(), []);

  const filteredUsers = users.filter((user) =>
    user.accountNo?.toString().includes(searchTerm) ||
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const goToRegister = () => navigate('/register');

  const deleteUser = (accountNo) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    api.delete(`/closeAccount/${accountNo}`)
      .then(() => setUsers((prev) => prev.filter((u) => u.accountNo !== accountNo)))
      .catch(() => setErrorMessage('Failed to delete user'));
  };

  const openEdit = (user) => {
    setErrorMessage('');
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      mobileNo: user.mobileNo || '',
      address: user.address || '',
    });
  };

  const closeEdit = () => setEditingUser(null);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const payload = {
      accountNo: editingUser.accountNo,
      name: editForm.name,
      email: editForm.email,
      mobileNo: editForm.mobileNo,
      address: editForm.address,
      balance: editingUser.balance,
      ifscCode: editingUser.ifscCode,
      branch: editingUser.branch,
    };
    api.put('/updateAccount', payload)
      .then(() => {
        setErrorMessage('');
        loadUsers();
        closeEdit();
      })
      .catch((err) => setErrorMessage(err?.message || 'Failed to update user'));
  };

  return (
    <div className="manage-user-page">
      <header className="mu-header">
        <h1>Manage Users</h1>
        <p className="mu-subtitle">View, edit, and remove customer accounts</p>
      </header>

      <div className="mu-toolbar">
        <button type="button" className="mu-add-btn" onClick={goToRegister}>➕ Add New User</button>
        <div className="mu-search-wrap">
          <span className="mu-search-icon">🔍</span>
          <input
            type="text"
            className="mu-search-input"
            placeholder="Search by Account No, Name or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {users.length > 0 && (
          <span className="mu-count">{filteredUsers.length} of {users.length} users</span>
        )}
      </div>

      {errorMessage && <div className="mu-error">{errorMessage}</div>}

      {loading ? (
        <div className="mu-loading">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="mu-empty">
          <span className="mu-empty-icon">📋</span>
          <p>{searchTerm.trim() ? 'No users match your search.' : 'No users yet.'}</p>
        </div>
      ) : (
        <div className="mu-table-card">
          <div className="mu-table-wrap">
            <table className="mu-table">
              <thead>
                <tr>
                  <th>Account No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.accountNo}>
                    <td className="mu-id">{user.accountNo}</td>
                    <td className="mu-name">{user.name ?? '—'}</td>
                    <td className="mu-email">{user.email ?? '—'}</td>
                    <td>{user.mobileNo ?? '—'}</td>
                    <td className="mu-address">{user.address || '—'}</td>
                    <td className="mu-balance">₹{(user.balance ?? 0).toLocaleString('en-IN')}</td>
                    <td>
                      <div className="mu-actions">
                        <button type="button" className="mu-btn mu-btn-edit" onClick={() => openEdit(user)} title="Edit">
                          ✎ Edit
                        </button>
                        <button type="button" className="mu-btn mu-btn-delete" onClick={() => deleteUser(user.accountNo)} title="Delete">
                          🗑 Delete
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

      {editingUser && (
        <div className="mu-modal-overlay" onClick={closeEdit}>
          <div className="mu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mu-modal-header">
              <h3>Edit User · Account #{editingUser.accountNo}</h3>
              <button type="button" className="mu-modal-close" onClick={closeEdit}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="mu-modal-form">
              <div className="mu-form-group">
                <label>Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="mu-form-group">
                <label>Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="mu-form-group">
                <label>Mobile</label>
                <input type="text" value={editForm.mobileNo} onChange={(e) => setEditForm((f) => ({ ...f, mobileNo: e.target.value }))} />
              </div>
              <div className="mu-form-group">
                <label>Address</label>
                <input type="text" value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="mu-modal-actions">
                <button type="button" className="mu-btn mu-btn-cancel" onClick={closeEdit}>Cancel</button>
                <button type="submit" className="mu-btn mu-btn-save">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
