import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// ================= TIME FORMATTER =================
const formatHours = (hours) => {
  if (!hours || hours === 0) return '0 hrs 0 mins';

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  return `${wholeHours} hrs ${minutes} mins`;
};

const EmployeeReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get(
          `http://localhost:5000/api/auth/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setEmployee(res.data);
      } catch (error) {
        navigate('/admin');
      }
    };

    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get(
          `http://localhost:5000/api/work/user-summary/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setSummary(res.data);
      } catch (error) {
        console.error('Failed to load user summary');
      }
    };

    fetchEmployee();
    fetchSummary();
  }, [id, navigate]);

  if (!employee || !summary) {
    return <h2 style={{ textAlign: 'center' }}>Loading...</h2>;
  }

  return (
    <div className="report-page">
      <header className="page-header">
        {employee.name} Report
      </header>

      <div className="green-container">
        <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '2.5' }}>
          <div>
            Employee Efficiency :- {summary.averageEfficiency}%
          </div>
          <div>
            Employee Work Time :- {formatHours(summary.totalWorkHours)}
          </div>
          <div>
            Total Time Wasted :- {formatHours(summary.totalWastedHours)}
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '50px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}
        >
          <button className="btn btn-blue" style={{ width: '200px' }} onClick={() => navigate(`/report/${id}`)}>
            Download Report
          </button>

          <button
            className="btn btn-blue"
            style={{ width: '200px' }}
            onClick={() => navigate('/admin')}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReport;
