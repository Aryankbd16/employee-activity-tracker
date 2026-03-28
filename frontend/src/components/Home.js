import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page landing-page">
            <header className="page-header landing-header">
                <span>AI Based Work Fraud Detection</span>
                <div className="header-actions">
                    <button className="btn btn-blue" onClick={() => navigate('/signin')}>Sign In</button>
                    <button className="btn btn-blue" onClick={() => navigate('/login')}>Login</button>
                </div>
            </header>

            <div className="content-body">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">AI Based Work Fraud Detection</h1>
                        <p className="hero-tagline">Monitor productivity. Detect inefficiencies. Ensure accountability.</p>
                        <button className="btn btn-blue hero-btn" onClick={() => navigate('/login')}>
                            Get Started
                        </button>
                    </div>
                    <div className="hero-image-wrapper">
                        <img 
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop" 
                            alt="Data Analytics Dashboard" 
                            className="hero-image"
                        />
                    </div>
                </section>

                {/* About Section */}
                <section className="about-section">
                    <div className="about-container">
                        <h2 className="section-title">How It Works</h2>
                        <p className="about-description">
                            Our advanced system tracks employee activity in real-time to detect distractions and calculate 
                            work efficiency using state-of-the-art AI and Machine Learning models. By analyzing screen time 
                            and user behavior, it ensures transparent accountability and maximizes team productivity.
                        </p>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section">
                    <h2 className="section-title text-center">Key Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">⏱️</div>
                            <h3>Real-time Activity Monitoring</h3>
                            <p>Track working hours precisely and spot idle times as they happen.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💻</div>
                            <h3>Screen Efficiency Tracking</h3>
                            <p>Determine productive vs. non-productive application usage.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🛡️</div>
                            <h3>AI-based Fraud Detection</h3>
                            <p>Smart algorithms identify unusual patterns and potential work fraud.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Admin Dashboard &amp; Reports</h3>
                            <p>Comprehensive insights and downloadable reports for management.</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <h3>AI Based Work Fraud Detection</h3>
                    <p>&copy; 2026 AI Based Work Fraud Detection. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;