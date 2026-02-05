import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Admin = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get(
          'http://localhost:5000/api/auth/users',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setEmployees(res.data);
      } catch (error) {
        console.error('Failed to load users');
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="admin-page">
      <header className="page-header">Admin</header>

      <div
        className="green-container scroll-container"
        style={{ overflowY: 'auto', maxHeight: '500px' }}
      >
        {employees.map((emp) => (
          <div
            key={emp._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/employee-report/${emp._id}`)}
          >
            {/* PHOTO */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'cyan',
                marginRight: '30px',
                overflow: 'hidden'
              }}
            >
              <img
                src={emp.photo}
                alt="Employee"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* NAME */}
            <h2 style={{ fontWeight: 'bold' }}>{emp.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;