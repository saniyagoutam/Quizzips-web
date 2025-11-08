// components/StudentDashboard.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Dashboard.css';

function StudentDashboard() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const handleStartExam = (e) => {
    e.preventDefault();
    if (accessKey.trim()) {
      navigate(`/student/exam/${accessKey.trim().toUpperCase()}`);
    } else {
      setError('Please enter an access key');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
        <div className="header-actions">
          <Link to="/student/results" className="btn btn-secondary">My Results</Link>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="exam-access-section">
          <h2>Enter Exam Access Key</h2>
          <p>Enter the access key provided by your faculty to start the exam</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleStartExam} className="access-form">
            <input
              type="text"
              value={accessKey}
              onChange={(e) => {
                setAccessKey(e.target.value);
                setError('');
              }}
              placeholder="Enter Access Key (e.g., ABC123XY)"
              className="access-input"
            />
            <button type="submit" className="btn btn-primary btn-large">
              Start Exam
            </button>
          </form>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <h3>📝 Instructions</h3>
            <ul>
              <li>Each exam has a time limit</li>
              <li>All questions must be answered</li>
              <li>You can review answers before submission</li>
              <li>Once submitted, answers cannot be changed</li>
            </ul>
          </div>
          <div className="info-card">
            <h3>📊 Results</h3>
            <p>View your exam results and performance history in the "My Results" section.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
