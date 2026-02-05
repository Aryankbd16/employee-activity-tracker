import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// ================= TIME FORMAT =================
const formatHours = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h} hrs ${m} mins`;
};


const BACKEND_BASE = 'http://localhost:5000';

// ================= TEXT PROOF COMPONENT =================
const TextProof = ({ path }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`${BACKEND_BASE}/data/${path}`)
      .then(res => res.text())
      .then(setContent)
      .catch(() => setContent('Failed to load proof'));
  }, [path]);

  return (
    <pre
      style={{
        background: '#111',
        color: '#0f0',
        padding: '15px',
        borderRadius: '8px',
        whiteSpace: 'pre-wrap',
        marginBottom: '15px'
      }}
    >
      {content}
    </pre>
  );
};

// ================= IMAGE PROOF COMPONENT =================
const ImageProof = ({ path, alt }) => {
  const [error, setError] = useState(false);

  return (
    <div style={{ marginBottom: '20px' }}>
      {!error ? (
        <img
          src={`${BACKEND_BASE}/data/${path}`}
          crossOrigin="anonymous"   // ✅ REQUIRED
          alt={alt}
          style={{ width: '200px', margin: '10px' }}
          onError={() => setError(true)}
        />
      ) : (
        <p style={{ color: 'red' }}>Image not available</p>
      )}
    </div>
  );
};

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();

  const [employee, setEmployee] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const loadData = async () => {
      const userRes = await axios.get(
        `http://localhost:5000/api/auth/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const summaryRes = await axios.get(
        `http://localhost:5000/api/work/user-summary/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sessionsRes = await axios.get(
        `http://localhost:5000/api/work/sessions/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmployee(userRes.data);
      setSummary(summaryRes.data);
      setSessions(sessionsRes.data);
    };

    loadData();
  }, [id]);

  if (!employee || !summary) {
    return <h2 style={{ textAlign: 'center' }}>Loading Report...</h2>;
  }

  // ================= PIE CHART DATA =================
  const pieData = {
    labels: ['Work Time', 'Wasted Time'],
    datasets: [
      {
        data: [summary.totalWorkHours, summary.totalWastedHours],
        backgroundColor: ['#2ecc71', '#e74c3c']
      }
    ]
  };

  // ================= PDF DOWNLOAD =================
  const downloadPDF = () => {
    html2pdf(reportRef.current, {
      margin: 10,
      filename: `${employee.name}_Work_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,        // ✅ REQUIRED
        allowTaint: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    });
  };

  return (
    
    

    <div className="report-page">

      <button
        className="btn btn-blue"
        style={{ marginBottom: '20px', marginRight: '10px' }}
        onClick={() => navigate(-1)}
      >
        Back
      </button>  
      <button
        className="btn btn-blue"
        style={{ marginBottom: '20px' }}
        onClick={downloadPDF}
      >
        Download PDF
      </button>

      <div ref={reportRef} style={{ padding: '20px' }}>
        <h1>{employee.name} – Work Report</h1>

        {/* ================= BASIC INFO ================= */}
        <img
          src={employee.photo}
          crossOrigin="anonymous"   // ✅ REQUIRED
          alt="Employee"
          style={{ width: '120px', borderRadius: '50%' }}
        />
        <p>Email: {employee.email}</p>

        {/* ================= SUMMARY ================= */}
        <h2>Summary</h2>
        <p>Total Work Time: {formatHours(summary.totalWorkHours)}</p>
        <p>Total Wasted Time: {formatHours(summary.totalWastedHours)}</p>
        <p>Average Efficiency: {summary.averageEfficiency}%</p>

        {/* ================= PIE CHART ================= */}
        <div style={{ width: '300px', margin: '30px auto' }}>
          <Pie data={pieData} />
        </div>

        {/* ================= PROOFS ================= */}
        <h2>Proofs</h2>

        <h3>Typing Proofs</h3>
        {sessions.map(s =>
          s.evidence.typing.map((p, i) => (
            <TextProof key={i} path={p} />
          ))
        )}

        <h3>Face Proofs</h3>
        {sessions.map(s =>
          s.evidence.face.map((p, i) => (
            <ImageProof key={i} path={p} alt="face-proof" />
          ))
        )}

        <h3>Screen Proofs</h3>
        {sessions.map(s =>
          s.evidence.screen.map((p, i) => (
            <ImageProof key={i} path={p} alt="screen-proof" />
          ))
        )}
      </div>
    </div>
  );
};

export default Report;
