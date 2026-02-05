import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const res = await axios.get(
          'http://localhost:5000/api/auth/me',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setUser(res.data);
      } catch {
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!user) return <h2 style={{ textAlign: 'center' }}>Loading...</h2>;

  return (
    <div className="profile-page">
      <header className="page-header">My Profile</header>

      <div className="green-container">

        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>

  {/* PHOTO */}
  <div style={{ background: 'cyan', width: '100px', height: '100px' }}>
    <img
      src={user.photo}
      alt="Photo"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </div>

  {/* DOCUMENT */}
  <div style={{ background: 'cyan', width: '100px', height: '100px' }}>
    <img
      src={user.document}
      alt="Document"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </div>

  {/* ID CARD */}
  <div style={{ background: 'cyan', width: '100px', height: '100px' }}>
    <img
      src={user.idCard}
      alt="ID Card"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </div>

</div>


        <div style={{ marginLeft: '50px', fontSize: '1.5rem', fontWeight: 'bold', lineHeight: '2' }}>
          <div>Name :- {user.name}</div>
          <div>Email :- {user.email}</div>
          <div>User Name :- {user.username}</div>
          <div>Phone no. :- {user.contactNo}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', padding: '0 50px' }}>
          <button className="btn btn-blue"  onClick={() => navigate(`/report/${user._id}`)}>Report</button>
          <button className="btn btn-blue" onClick={() => navigate('/start-work')}>
            Start Work
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;