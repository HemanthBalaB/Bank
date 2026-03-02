import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function ManageEmployee() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', mobileNo: '', address: '', role: 'EMPLOYEE' });

  const loadEmployees = () => {
    setLoading(true);
    api.get('/api/employees/all')
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => setErrorMessage('Failed to load employees'))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadEmployees(), []);

  const filteredEmployees = !searchTerm.trim()
    ? employees
    : employees.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleDelete = (emp) => {
    if (!confirm(`Delete employee "${emp.name}"? This cannot be undone.`)) return;
    api.delete(`/api/employees/delete/${emp.employeeId}`)
      .then(() => {
        setEmployees((prev) => prev.filter((e) => e.employeeId !== emp.employeeId));
      })
      .catch((err) => setErrorMessage(err?.message || 'Failed to delete employee'));
  };

  const openEdit = (emp) => {
    setEditingEmployee(emp);
    setEditForm({
      name: emp.name || '',
      email: emp.email || '',
      mobileNo: emp.mobileNo || '',
      address: emp.address || '',
      role: emp.role || 'EMPLOYEE',
    });
  };

  const closeEdit = () => {
    setEditingEmployee(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingEmployee) return;
    api.put(`/api/employees/update/${editingEmployee.employeeId}`, editForm)
      .then(() => {
        loadEmployees();
        closeEdit();
      })
      .catch((err) => setErrorMessage(err?.message || 'Failed to update employee'));
  };

  return (
    <div className="manage-employee-page">
      <header className="me-header">
        <h1>Manage Employees</h1>
        <p className="me-subtitle">View, edit, and remove employee accounts</p>
      </header>

      <div className="me-toolbar">
        <Link to="/admin/dashboard/add-employee" className="me-add-btn">➕ Add New Employee</Link>
        <div className="me-search-wrap">
          <span className="me-search-icon">🔍</span>
          <input
            type="text"
            className="me-search-input"
            placeholder="Search by Email or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {employees.length > 0 && (
          <span className="me-count">{filteredEmployees.length} of {employees.length} employees</span>
        )}
      </div>

      {errorMessage && <div className="me-error">{errorMessage}</div>}

      {loading ? (
        <div className="me-loading">Loading employees...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="me-empty">
          <span className="me-empty-icon">👥</span>
          <p>{searchTerm.trim() ? 'No employees match your search.' : 'No employees yet.'}</p>
        </div>
      ) : (
        <div className="me-table-card">
          <div className="me-table-wrap">
            <table className="me-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.employeeId}>
                    <td className="me-id">{emp.employeeId}</td>
                    <td className="me-name">{emp.name ?? '—'}</td>
                    <td className="me-email">{emp.email ?? '—'}</td>
                    <td>{emp.mobileNo ?? '—'}</td>
                    <td className="me-address">{emp.address || '—'}</td>
                    <td>
                      <span className="me-role-badge">{emp.role || 'EMPLOYEE'}</span>
                    </td>
                    <td>
                      <div className="me-actions">
                        <button type="button" className="me-btn me-btn-edit" onClick={() => openEdit(emp)} title="Edit">
                          ✎ Edit
                        </button>
                        <button type="button" className="me-btn me-btn-delete" onClick={() => handleDelete(emp)} title="Delete">
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

      {editingEmployee && (
        <div className="me-modal-overlay" onClick={closeEdit}>
          <div className="me-modal" onClick={(e) => e.stopPropagation()}>
            <div className="me-modal-header">
              <h3>Edit Employee</h3>
              <button type="button" className="me-modal-close" onClick={closeEdit}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="me-modal-form">
              <div className="me-form-group">
                <label>Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="me-form-group">
                <label>Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="me-form-group">
                <label>Mobile</label>
                <input type="text" value={editForm.mobileNo} onChange={(e) => setEditForm((f) => ({ ...f, mobileNo: e.target.value }))} />
              </div>
              <div className="me-form-group">
                <label>Address</label>
                <input type="text" value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="me-form-group">
                <label>Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
              </div>
              <div className="me-modal-actions">
                <button type="button" className="me-btn me-btn-cancel" onClick={closeEdit}>Cancel</button>
                <button type="submit" className="me-btn me-btn-save">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
