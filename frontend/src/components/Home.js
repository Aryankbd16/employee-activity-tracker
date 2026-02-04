import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <header className="page-header" style={{ justifyContent: 'space-between', padding: '0 50px' }}>
                <span>Project Name</span>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button className="btn btn-blue" onClick={() => navigate('/signin')}>Sign In</button>
                    <button className="btn btn-blue" onClick={() => navigate('/login')}>Login</button>
                </div>
            </header>
            <div className="content-body" style={{ flex: 1 }}>
                {/* Cyan background is global */}
            </div>
        </div>
    );
};

export default Home;
