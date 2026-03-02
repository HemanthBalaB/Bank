import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerLayout from './pages/customer/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyAccounts from './pages/customer/MyAccounts';
import Transactions from './pages/customer/Transactions';
import ApplyLoan from './pages/customer/ApplyLoan';
import MyLoans from './pages/customer/MyLoans';
import Statement from './pages/customer/Statement';
import TransactionReport from './pages/customer/TransactionReport';
import EmployeeLayout from './pages/employee/EmployeeLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ReviewLoans from './pages/employee/ReviewLoans';
import AdminLayout from './pages/admin/AdminLayout';
import ManageUser from './pages/admin/ManageUser';
import ManageEmployee from './pages/admin/ManageEmployee';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="my-accounts" element={<MyAccounts />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="reports/statement" element={<Statement />} />
        <Route path="reports/transaction-report" element={<TransactionReport />} />
        <Route path="loans/apply-loan" element={<ApplyLoan />} />
        <Route path="loans/my-loans" element={<MyLoans />} />
      </Route>

      <Route path="/employee" element={<EmployeeLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="review-loans" element={<ReviewLoans />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Navigate to="/admin/dashboard/manage-user" replace />} />
        <Route path="dashboard/manage-user" element={<ManageUser />} />
        <Route path="dashboard/manage-employee" element={<ManageEmployee />} />
        <Route path="dashboard/add-employee" element={<ManageEmployee />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
