import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const SignIn = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNo: '',
    username: '',
    password: '',
    confirmPassword: '',
    photo: '',
    document: '',
    idCard: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert('File must be less than 100MB');
      return;
    }

    const base64 = await convertToBase64(file);
    setFormData({ ...formData, [name]: base64 });
  };

  const handleSubmit = async () => {
    setError('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/signup',
        formData
      );

      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="signin-page">
      <header className="page-header">Sign In</header>

      <div className="green-container">

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        {['name', 'email', 'contactNo', 'username', 'password', 'confirmPassword'].map((field) => (
          <div className="form-group" key={field}>
            <label className="form-label">{field} :-</label>
            <input
              type={field.includes('password') ? 'password' : 'text'}
              name={field}
              className="form-input"
              onChange={handleChange}
            />
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <div style={{ width: '30%' }}>
            <strong>Photo</strong>
            <input type="file" name="photo" onChange={handleFileChange} />
          </div>

          <div style={{ width: '30%' }}>
            <strong>Document</strong>
            <input type="file" name="document" onChange={handleFileChange} />
          </div>

          <div style={{ width: '30%' }}>
            <strong>ID Card</strong>
            <input type="file" name="idCard" onChange={handleFileChange} />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button className="btn btn-green" onClick={handleSubmit}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;