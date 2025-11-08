// components/ViewResults.js (Faculty viewing student results)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Results.css';

function ViewResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/faculty/exam/${examId}/results`);
      setExam(response.data.exam);
      setResults(response.data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (results.length === 0) return { avgScore: 0, passRate: 0, highestScore: 0 };
    
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const passedCount = results.filter(r => r.passed).length;
    const highestScore = Math.max(...results.map(r => r.score));
    
    return {
      avgScore: (totalScore / results.length).toFixed(1),
      passRate: ((passedCount / results.length) * 100).toFixed(1),
      highestScore
    };
  };

  const stats = calculateStats();

  return (
    <div className="results-container">
      <div className="results-header">
        <div>
          <h1>Exam Results</h1>
          {exam && <h2>{exam.title}</h2>}
        </div>
        <button onClick={() => navigate('/faculty/dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <p>Loading results...</p>
      ) : (
        <>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Submissions</h3>
              <p className="stat-number">{results.length}</p>
            </div>
            <div className="stat-card">
              <h3>Average Score</h3>
              <p className="stat-number">{stats.avgScore}</p>
            </div>
            <div className="stat-card">
              <h3>Pass Rate</h3>
              <p className="stat-number">{stats.passRate}%</p>
            </div>
            <div className="stat-card">
              <h3>Highest Score</h3>
              <p className="stat-number">{stats.highestScore}</p>
            </div>
          </div>

          {results.length === 0 ? (
            <p className="empty-state">No submissions yet.</p>
          ) : (
            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result._id}>
                      <td>{index + 1}</td>
                      <td>{result.studentName}</td>
                      <td>{result.studentEmail}</td>
                      <td>{result.score}/{result.totalQuestions}</td>
                      <td>{result.percentage}%</td>
                      <td>
                        <span className={`status-badge ${result.passed ? 'passed' : 'failed'}`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td>{new Date(result.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ViewResults;
