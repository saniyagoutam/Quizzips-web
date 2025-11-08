// controllers/controller.js
import User from '../models/userSchema.js';
import Exam from '../models/examSchema.js';
import Result from '../models/resultSchema.js';

// ============ AUTH CONTROLLERS ============

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user (in production, hash the password!)
    const user = new User({
      name,
      email,
      password, // WARNING: In production, use bcrypt to hash this!
      role
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find user
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password (in production, use bcrypt.compare!)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// ============ EXAM CONTROLLERS (Faculty) ============

export const createExam = async (req, res) => {
  try {
    const { title, description, facultyId, facultyName, questions, duration, totalMarks, passingMarks } = req.body;

    // Validation
    if (!title || !facultyId || !facultyName || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Generate unique access key
    const accessKey = Math.random().toString(36).substring(2, 10).toUpperCase();

    const exam = new Exam({
      title,
      description,
      facultyId,
      facultyName,
      accessKey,
      questions,
      duration: duration || 30,
      totalMarks: totalMarks || questions.length,
      passingMarks: passingMarks || Math.ceil(questions.length * 0.4)
    });

    await exam.save();

    res.status(201).json({
      message: 'Exam created successfully',
      exam: {
        id: exam._id,
        title: exam.title,
        accessKey: exam.accessKey,
        totalQuestions: exam.questions.length,
        duration: exam.duration
      }
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

export const getFacultyExams = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const exams = await Exam.find({ facultyId }).select('-questions.correctAnswer').sort({ createdAt: -1 });

    res.status(200).json({ exams });
  } catch (error) {
    console.error('Get faculty exams error:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    await Exam.findByIdAndDelete(examId);
    await Result.deleteMany({ examId });

    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
};

export const getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;

    const results = await Result.find({ examId }).sort({ score: -1, submittedAt: 1 });
    const exam = await Exam.findById(examId).select('title totalMarks passingMarks');

    res.status(200).json({ 
      exam,
      results 
    });
  } catch (error) {
    console.error('Get exam results error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

// ============ EXAM CONTROLLERS (Student) ============

export const getExamByKey = async (req, res) => {
  try {
    const { accessKey } = req.params;

    const exam = await Exam.findOne({ accessKey, isActive: true }).select('-questions.correctAnswer');

    if (!exam) {
      return res.status(404).json({ error: 'Invalid access key or exam is inactive' });
    }

    res.status(200).json({ exam });
  } catch (error) {
    console.error('Get exam by key error:', error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
};

export const submitExam = async (req, res) => {
  try {
    const { examId, studentId, studentName, studentEmail, answers } = req.body;

    // Validation
    if (!examId || !studentId || !studentName || !studentEmail || !answers) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if already submitted
    const existingResult = await Result.findOne({ examId, studentId });
    if (existingResult) {
      return res.status(400).json({ error: 'You have already submitted this exam' });
    }

    // Get exam with correct answers
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Calculate score
    let score = 0;
    exam.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const percentage = (score / exam.questions.length) * 100;
    const passed = score >= exam.passingMarks;

    // Save result
    const result = new Result({
      examId,
      examTitle: exam.title,
      studentId,
      studentName,
      studentEmail,
      answers,
      score,
      totalQuestions: exam.questions.length,
      percentage: percentage.toFixed(2),
      passed
    });

    await result.save();

    res.status(201).json({
      message: 'Exam submitted successfully',
      result: {
        score,
        totalQuestions: exam.questions.length,
        percentage: percentage.toFixed(2),
        passed
      }
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
};

export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    const results = await Result.find({ studentId }).sort({ submittedAt: -1 });

    res.status(200).json({ results });
  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};
