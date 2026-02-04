import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setError('');

    if (!formData.username || !formData.password) {
      return setError('All fields are mandatory');
    }

    try {
      // 1️⃣ LOGIN
      const loginRes = await axios.post(
        'http://localhost:5000/api/auth/login',
        formData
      );

      const token = loginRes.data.token;
      localStorage.setItem('token', token);

      // 2️⃣ FETCH LOGGED-IN USER
      const meRes = await axios.get(
        'http://localhost:5000/api/auth/me',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // 3️⃣ STORE USER DATA
      localStorage.setItem('userId', meRes.data._id);
      localStorage.setItem('userName', meRes.data.name);

      alert(loginRes.data.message);

      // 4️⃣ ROLE-BASED ROUTING (TEMP)
      if (formData.username.toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <header className="page-header">Login</header>

      <div className="green-container" style={{ alignItems: 'center' }}>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="form-group">
          <label className="form-label">Username:</label>
          <input
            type="text"
            className="form-input"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password:</label>
          <input
            type="password"
            className="form-input"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="btn btn-green" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
