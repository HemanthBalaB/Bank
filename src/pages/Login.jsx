import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authService } from '../services/authService';
import { api } from '../api/client';
import { setAuth } from '../store/authSlice';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Account No / Email and password required!');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    const isEmployee = username.endsWith('@employee.com');
    const isAdmin = username.endsWith('@admin.com');

    if (isEmployee) {
      const onSuccess = (res) => {
        if (res?.token) {
          const employeeUser = {
            username,
            role: 'EMPLOYEE',
          };
          dispatch(setAuth({ user: employeeUser, token: res.token, isEmployee: true }));
        }
        setLoading(false);
        navigate('/employee/dashboard');
      };
      const onFail = (err) => { setLoading(false); setErrorMessage(err?.message || 'Invalid employee credentials.'); };
      api.post('/api/employees/login', { username, password })
        .then(onSuccess)
        .catch((err) => {
          const msg = err?.message || '';
          if (msg.includes('Unexpected Server error') || msg.includes('500')) {
            return api.postForm('/api/employees/login', { username, password }).then(onSuccess);
          }
          throw err;
        })
        .catch(onFail);
      return;
    }

    if (isAdmin) {
      authService.login(username, password)
        .then((res) => {
          if (res?.token) {
            const storedUser = {
              accountNo: Number(res.user?.username) || 0,
              name: res.user?.name || 'Admin',
              role: (res.user?.role || 'ADMIN').toUpperCase(),
            };
            dispatch(setAuth({ user: storedUser, token: res.token, isEmployee: false }));
          }
          setLoading(false);
          navigate('/admin/dashboard');
        })
        .catch((err) => {
          setLoading(false);
          setErrorMessage(err?.message || 'Invalid admin credentials.');
        });
      return;
    }

    authService.login(username, password)
      .then((res) => {
        if (res?.token) {
          const storedUser = {
            accountNo: Number(res.user?.username) || 0,
            name: res.user?.name || 'Customer',
            role: (res.user?.role || 'USER').toUpperCase(),
          };
          dispatch(setAuth({ user: storedUser, token: res.token, isEmployee: false }));
        }
        setLoading(false);
        navigate('/customer/dashboard');
      })
      .catch((err) => {
        setLoading(false);
        setErrorMessage(err?.message || 'Invalid credentials. Use account number and password.');
      });
  };

  return (
    <>
      <div className="background-shapes">
        {[1, 2, 3, 4, 5].map((i) => <span key={i} />)}
      </div>
      <div className="login-container">
        <h2>Maverick Bank Login</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username">Account No / Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter account number or email"
            />
          </div>
          <div className="form-group input-with-icon">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <span
                className="toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="register-link">
          New user? <Link to="/register">Click here to register</Link>
        </p>
      </div>
    </>
  );
}
