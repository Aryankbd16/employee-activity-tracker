import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Working = () => {
    const navigate = useNavigate();
    const [time, setTime] = useState(0);
    const [loading, setLoading] = useState(false);

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(t => t + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleStopWork = async () => {
        console.log("STOP WORK CLICKED");

        if (loading) return;

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            const sessionId = localStorage.getItem("sessionId");

            if (!token || !sessionId) {
                alert("Session data missing. Please login again.");
                navigate('/login');
                return;
            }

            const response = await fetch("http://localhost:5000/api/work/stop", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ sessionId })
            });

            const data = await response.json();
            console.log("STOP WORK RESPONSE:", data);

            if (!response.ok) {
                alert(data.message || "Failed to stop work session");
                setLoading(false);
                return;
            }

            // Cleanup session
            localStorage.removeItem("sessionId");

            // Navigate only AFTER backend confirms
            navigate('/profile');

        } catch (error) {
            console.error("Stop Work Error:", error);
            alert("Server error while stopping work");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="working-page">
            <header className="page-header">Work Monitoring</header>

            <div
                className="green-container"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <h2 style={{ fontSize: '3rem' }}>
                    {formatTime(time)}
                </h2>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                    type="button"
                    className="btn btn-green"
                    onClick={handleStopWork}
                    disabled={loading}
                >
                    {loading ? "Stopping..." : "Stop Working"}
                </button>
            </div>
        </div>
    );
};

export default Working;
