const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { requireLogin } = require('../middlewares/auth');
const { ensureTeacher } = require('../middlewares/ensureTeacher'); // 假設 isTeacher middleware 存在

// 建立任務
router.post('/assignments', requireLogin, assignmentController.createAssignment);
router.post('/api/assignments', requireLogin, assignmentController.createAssignment);

// 顯示任務詳情頁面
router.get('/assignments/:assignmentId/detail', requireLogin, assignmentController.showAssignmentDetail);

// API - 學生提交互評
router.post('/api/assignments/:assignmentId/reviews', requireLogin, assignmentController.submitReview);
// API - 老師提交所有成績
router.post('/api/assignments/:assignmentId/grades', requireLogin, ensureTeacher, assignmentController.submitGrades);
// API - 老師延長截止日期
router.patch('/api/assignments/:assignmentId/due-date', requireLogin, ensureTeacher, assignmentController.updateDueDate);

module.exports = router;