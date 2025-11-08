// components/CreateExam.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CreateExam.css';

function CreateExam() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    passingMarks: 40
  });
  
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = parseInt(value);
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title) {
      setError('Exam title is required');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question) {
        setError(`Question ${i + 1} is empty`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j]) {
          setError(`Question ${i + 1}, Option ${j + 1} is empty`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      const examData = {
        ...formData,
        facultyId: user.id,
        facultyName: user.name,
        questions,
        totalMarks: questions.length,
        passingMarks: Math.ceil(questions.length * (formData.passingMarks / 100))
      };

      const response = await axios.post('http://localhost:8080/api/faculty/exam', examData);
      alert(`Exam created successfully! Access Key: ${response.data.exam.accessKey}`);
      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-exam-container">
      <div className="create-exam-header">
        <h1>Create New Exam</h1>
        <button onClick={() => navigate('/faculty/dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-exam-form">
        <div className="exam-info-section">
          <h2>Exam Information</h2>
          
          <div className="form-group">
            <label>Exam Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Final Exam - Computer Science"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the exam"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Passing Percentage (%)</label>
              <input
                type="number"
                name="passingMarks"
                value={formData.passingMarks}
                onChange={handleChange}
                min="1"
                max="100"
                required
              />
            </div>
          </div>
        </div>

        <div className="questions-section">
          <div className="questions-header">
            <h2>Questions</h2>
            <button type="button" onClick={addQuestion} className="btn btn-sm btn-primary">
              + Add Question
            </button>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-card">
              <div className="question-header">
                <h3>Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="btn btn-sm btn-danger"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                  placeholder="Enter your question"
                  rows="2"
                  required
                />
              </div>

              <div className="options-grid">
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="form-group">
                    <label>Option {oIndex + 1} *</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Correct Answer *</label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                  required
                >
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? 'Creating Exam...' : 'Create Exam'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateExam;
