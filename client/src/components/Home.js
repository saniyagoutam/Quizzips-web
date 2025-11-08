// components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/Home.css';

function Home() {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">🎓 Quizzips</h1>
        <p className="home-subtitle">Online Examination Management System</p>
        
        {isAuthenticated ? (
          <div className="welcome-section">
            <h2>Welcome, {user.name}!</h2>
            <p>You are logged in as a {user.role}</p>
            <Link 
              to={user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'} 
              className="btn btn-primary"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="auth-section">
            <div className="feature-cards">
              <div className="feature-card">
                <h3>👨‍🏫 Faculty</h3>
                <p>Create exams, generate access keys, and view student results</p>
              </div>
              <div className="feature-card">
                <h3>👨‍🎓 Student</h3>
                <p>Enter exam keys, take tests, and view your results</p>
              </div>
            </div>
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
