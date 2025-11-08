// components/ExamResults.js (Student's results view)
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Results.css';

function ExamResults() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/student/results/${user.id}`);
      setResults(response.data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>My Exam Results</h1>
        <button onClick={() => navigate('/student/dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <p>Loading results...</p>
      ) : results.length === 0 ? (
        <p className="empty-state">You haven't taken any exams yet.</p>
      ) : (
        <div className="results-grid">
          {results.map((result) => (
            <div key={result._id} className="result-card">
              <h3>{result.examTitle}</h3>
              <div className="result-stats">
                <div className="stat-item">
                  <span className="stat-label">Score:</span>
                  <span className="stat-value">{result.score}/{result.totalQuestions}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Percentage:</span>
                  <span className="stat-value">{result.percentage}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Status:</span>
                  <span className={`status-badge ${result.passed ? 'passed' : 'failed'}`}>
                    {result.passed ? '✓ Passed' : '✗ Failed'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Submitted:</span>
                  <span className="stat-value">{new Date(result.submittedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExamResults;
