//router/route.js

import { Router } from "express";
import * as controller from '../controllers/controller.js';

const router = Router();

// ============ AUTH ROUTES ============
router.post('/auth/signup', controller.signup);
router.post('/auth/login', controller.login);

// ============ FACULTY ROUTES ============
router.post('/faculty/exam', controller.createExam);
router.get('/faculty/exams/:facultyId', controller.getFacultyExams);
router.delete('/faculty/exam/:examId', controller.deleteExam);
router.get('/faculty/exam/:examId/results', controller.getExamResults);

// ============ STUDENT ROUTES ============
router.get('/student/exam/:accessKey', controller.getExamByKey);
router.post('/student/exam/submit', controller.submitExam);
router.get('/student/results/:studentId', controller.getStudentResults);

export default router;