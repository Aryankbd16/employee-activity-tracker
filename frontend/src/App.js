import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Component Imports (Placeholders for now)
import Home from './components/Home';
import SignIn from './components/SignIn';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import StartWork from './components/StartWork';
import Working from './components/Working';
import Admin from './components/Admin';
import EmployeeReport from './components/EmployeeReport';
import Report from './components/Report';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/start-work" element={<StartWork />} />
        <Route path="/working" element={<Working />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/employee-report/:id" element={<EmployeeReport />} />
        <Route path="/report/:id" element={<Report />} />
      </Routes>
    </div>
  );
  
}

export default App;