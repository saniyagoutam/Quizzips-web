// components/TakeExam.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TakeExam.css';

function TakeExam() {
  const { accessKey } = useParams();
  const { user } = useSelector(state => state.auth);
  const { currentExam, answers, trace } = useSelector(state => state.exam);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [accessKey]);

  useEffect(() => {
    if (currentExam && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentExam, timeLeft]);

  const fetchExam = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/student/exam/${accessKey}`);
      dispatch({ type: 'SET_EXAM', payload: response.data.exam });
      setTimeLeft(response.data.exam.duration * 60); // Convert to seconds
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load exam');
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex) => {
    dispatch({ type: 'SET_ANSWER', payload: { index: trace, answer: answerIndex } });
  };

  const handleNext = () => {
    if (trace < currentExam.questions.length - 1) {
      dispatch({ type: 'SET_TRACE', payload: trace + 1 });
    }
  };

  const handlePrevious = () => {
    if (trace > 0) {
      dispatch({ type: 'SET_TRACE', payload: trace - 1 });
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered questions. Do you want to submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);

    try {
      const submissionData = {
        examId: currentExam._id,
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        answers: answers.map(a => a === null ? -1 : a) // Replace null with -1
      };

      const response = await axios.post('http://localhost:8080/api/student/exam/submit', submissionData);
      
      dispatch({ type: 'RESET_EXAM' });
      alert(`Exam submitted! Score: ${response.data.result.score}/${response.data.result.totalQuestions}`);
      navigate('/student/results');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit exam');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) return <div className="loading">Loading exam...</div>;
  if (error) return <div className="error-page"><h2>{error}</h2></div>;
  if (!currentExam) return null;

  const currentQuestion = currentExam.questions[trace];
  const progress = ((trace + 1) / currentExam.questions.length) * 100;

  return (
    <div className="take-exam-container">
      <div className="exam-header">
        <div className="exam-info">
          <h1>{currentExam.title}</h1>
          <p>{currentExam.description}</p>
        </div>
        <div className={`timer ${timeLeft < 60 ? 'timer-warning' : ''}`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question-section">
        <div className="question-header">
          <h2>Question {trace + 1} of {currentExam.questions.length}</h2>
        </div>

        <div className="question-content">
          <h3>{currentQuestion.question}</h3>
          <div className="options-list">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`option-item ${answers[trace] === index ? 'selected' : ''}`}
                onClick={() => handleAnswer(index)}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={answers[trace] === index}
                  onChange={() => {}}
                />
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="exam-navigation">
        <button
          onClick={handlePrevious}
          disabled={trace === 0}
          className="btn btn-secondary"
        >
          Previous
        </button>

        <div className="question-dots">
          {currentExam.questions.map((_, index) => (
            <span
              key={index}
              className={`dot ${answers[index] !== null ? 'answered' : ''} ${index === trace ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TRACE', payload: index })}
            />
          ))}
        </div>

        {trace < currentExam.questions.length - 1 ? (
          <button onClick={handleNext} className="btn btn-primary">
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-success"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        )}
      </div>
    </div>
  );
}

export default TakeExam;
