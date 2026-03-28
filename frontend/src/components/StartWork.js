import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StartWork = () => {
    const navigate = useNavigate();
    const [approved, setApproved] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleStartWork = async () => {
        console.log("START WORK CLICKED"); // ✅ debug

        if (loading) return;

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            console.log("TOKEN:", token);
            console.log("USER ID:", userId);

            const response = await fetch("http://localhost:5000/api/work/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();

            console.log("BACKEND RESPONSE:", data);

            if (!response.ok) {
                alert(data.message || "Failed to start work session");
                setLoading(false);
                return;
            }

            localStorage.setItem("sessionId", data.sessionId);

            // ✅ Navigate ONLY after session is created
            navigate('/working');

        } catch (error) {
            console.error("Start Work Error:", error);
            alert("Server error while starting work");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="start-work-page">
            <header className="page-header">Start Work</header>

            <div className="green-container start-work-container">
                <div className="monitoring-card">
                    <div className="monitoring-header">
                        <h2>Monitoring & Permissions</h2>
                        <p>Please review the data points we collect during your work session.</p>
                    </div>
                    
                    <ul className="monitoring-list">
                        <li><span className="monitoring-icon">🖥️</span> <span>Screen Activity Monitoring</span></li>
                        <li><span className="monitoring-icon">📱</span> <span>Active Application Tracking</span></li>
                        <li><span className="monitoring-icon">⌨️</span> <span>Typing Activity (Keystrokes pattern, not content)</span></li>
                        <li><span className="monitoring-icon">🖱️</span> <span>Mouse Movement Tracking</span></li>
                        <li><span className="monitoring-icon">👤</span> <span>Face Verification (if enabled in system)</span></li>
                        <li><span className="monitoring-icon">📈</span> <span>Productivity / Efficiency Analysis</span></li>
                    </ul>
                    
                    <div className="monitoring-disclaimer">
                        <span className="disclaimer-icon">🔒</span>
                        <p>This system only tracks activity for productivity analysis and does not store sensitive personal data.</p>
                    </div>
                </div>

                <div className="approve-action">
                    <button
                        className={`btn btn-blue ${approved ? 'btn-approved' : ''}`}
                        onClick={() => setApproved(true)}
                    >
                        {approved ? "✓ Approved" : "I Approve"}
                    </button>
                </div>
            </div>

            <div className="start-action">
                <button
                    type="button"
                    className="btn btn-green btn-start"
                    disabled={!approved || loading}
                    onClick={handleStartWork}
                >
                    {loading ? "Starting..." : "Start"}
                </button>
            </div>
        </div>
    );
};

export default StartWork;