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

            <div className="green-container">
                <div style={{ height: '100%' }}></div>

                <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '300px' }}>
                    <button
                        className="btn btn-blue"
                        onClick={() => setApproved(true)}
                        style={{ marginBottom: '20px' }}
                    >
                        I Approve
                    </button>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                    type="button"
                    className="btn btn-green"
                    disabled={!approved || loading}
                    style={{ opacity: approved ? 1 : 0.5 }}
                    onClick={handleStartWork}
                >
                    {loading ? "Starting..." : "Start"}
                </button>
            </div>
        </div>
    );
};

export default StartWork;