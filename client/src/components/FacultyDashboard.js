// components/FacultyDashboard.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';

function FacultyDashboard() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/faculty/exams/${user.id}`);
      setExams(response.data.exams);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const handleDelete = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await axios.delete(`http://localhost:8080/api/faculty/exam/${examId}`);
        fetchExams();
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Failed to delete exam');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Faculty Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
        <div className="header-actions">
          <Link to="/faculty/create-exam" className="btn btn-primary">Create New Exam</Link>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <h2>My Exams</h2>
        {loading ? (
          <p>Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="empty-state">No exams created yet. Create your first exam!</p>
        ) : (
          <div className="exam-grid">
            {exams.map((exam) => (
              <div key={exam._id} className="exam-card">
                <h3>{exam.title}</h3>
                <p className="exam-description">{exam.description}</p>
                <div className="exam-details">
                  <span>📝 {exam.questions.length} Questions</span>
                  <span>⏱️ {exam.duration} mins</span>
                  <span>🎯 {exam.totalMarks} marks</span>
                </div>
                <div className="exam-key">
                  <strong>Access Key:</strong> 
                  <span className="key-badge">{exam.accessKey}</span>
                </div>
                <div className="exam-actions">
                  <Link to={`/faculty/exam/${exam._id}/results`} className="btn btn-sm btn-primary">
                    View Results
                  </Link>
                  <button onClick={() => handleDelete(exam._id)} className="btn btn-sm btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyDashboard;
