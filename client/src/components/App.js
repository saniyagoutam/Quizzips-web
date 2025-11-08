//components/App.js

import React from 'react';
import '../styles/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux';

/** import components */
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import FacultyDashboard from './FacultyDashboard';
import StudentDashboard from './StudentDashboard';
import CreateExam from './CreateExam';
import TakeExam from './TakeExam';
import ExamResults from './ExamResults';
import ViewResults from './ViewResults';

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* Faculty Routes */}
                    <Route path="/faculty/dashboard" element={
                      <ProtectedRoute requiredRole="faculty">
                        <FacultyDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/faculty/create-exam" element={
                      <ProtectedRoute requiredRole="faculty">
                        <CreateExam />
                      </ProtectedRoute>
                    } />
                    <Route path="/faculty/exam/:examId/results" element={
                      <ProtectedRoute requiredRole="faculty">
                        <ViewResults />
                      </ProtectedRoute>
                    } />
                    
                    {/* Student Routes */}
                    <Route path="/student/dashboard" element={
                      <ProtectedRoute requiredRole="student">
                        <StudentDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/student/exam/:accessKey" element={
                      <ProtectedRoute requiredRole="student">
                        <TakeExam />
                      </ProtectedRoute>
                    } />
                    <Route path="/student/results" element={
                      <ProtectedRoute requiredRole="student">
                        <ExamResults />
                      </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;