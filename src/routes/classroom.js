const express = require('express');
const router = express.Router();
const {redirectIfLoggedIn, requireLogin} = require('../middlewares/auth'); 
const classroomController = require('../controllers/classroomController');

// 顯示建立教室表單
router.get('/classroom/create', redirectIfLoggedIn, classroomController.showCreateForm);

// 處理建立教室請求
router.post('/classroom/create', redirectIfLoggedIn, async (req, res) => {
  // 這裡可呼叫 service/controller 處理建立教室邏輯
  await classroomController.createClassroom(req.body, req.user)
  res.send('教室已建立（示範）');
});

module.exports = router;
