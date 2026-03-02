import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [role, setRole] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const onRegister = (e) => {
    e.preventDefault();
    if (role !== 'CUSTOMER') {
      setErrorMessage('Only CUSTOMER registration is supported here.');
      setSuccessMessage('');
      return;
    }
    const payload = { name: username, email, password, mobileNo };
    api.post('/createAccount', payload)
      .then((response) => {
        if (response?.accountNo) {
          setSuccessMessage(`✅ ${response.message || 'Success'} Your Account Number is ${response.accountNo}. Please save it to log in.`);
          setErrorMessage('');
          setTimeout(() => navigate('/login'), 6000);
        } else {
          setSuccessMessage('');
          setErrorMessage('Something went wrong. Please try again.');
        }
      })
      .catch((error) => {
        const msg = error?.message || '';
        if (msg.includes('mobile_no')) {
          setErrorMessage('Mobile number already exists. Please use a different one.');
        } else {
          setErrorMessage(msg || 'Registration failed.');
        }
        setSuccessMessage('');
      });
  };

  return (
    <div className="register-wrapper">
      <div className="register-box">
        <h2>Register here</h2>
        <form onSubmit={onRegister}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Mobile No</label>
            <input type="text" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="" disabled>Select role</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
          {successMessage && <div className="success-message">{successMessage}</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit">Register</button>
        </form>
        <p className="login-link">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
