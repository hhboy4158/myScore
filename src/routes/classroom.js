const express = require('express');
const router = express.Router();
const {redirectIfLoggedIn, requireLogin} = require('../middlewares/auth'); 
const { ensureClassroomMembership } = require('../middlewares/ensureClassroomMembership');
const classroomController = require('../controllers/classroomController');


// GET - 建立教室表單頁面, Create classroom from page
router.get('/classroom/create', requireLogin, classroomController.showCreateForm);


// GET - 我的教室頁面, My Classroom page
// router.get('/classroom/myclassroom', requireLogin, classroomController.showMYclassroomForm);


// GET - 教室代碼頁面, Current classroom page, find by classroom code 
router.get('/classroom/:classroomcode', requireLogin, ensureClassroomMembership, classroomController.showCurrentClassroom);

// DELETE - 刪除教室功能, Delete classroom post request
router.delete('/classroom/:classroomCode', requireLogin, classroomController.deleteClassroom);

// POST - 建立教室功能, Create classroom post request
router.post('/classroom/create', requireLogin, classroomController.createClassroom);

// GET - 根路徑(根路徑通常都放路由最後面): 教室功能總覽 (我是說建立或加入那一頁)
router.get('/classroom', requireLogin, classroomController.showclassroomForm);

// 路徑正確順序: 
// 1. 具體路徑  (像是 '/classroom/create'、'/classroom/myclassroom')
// 2. 動態路徑  (帶有參數, 像是 '/classroom/:classroomCode')
// 3. 根路徑    (最不具體, 像是 '/classroom')

// 因為 Express 路由的匹配順序是「從上到下」的
// 當 Express 收到一個請求時, 它會從定義的第一個路由開始依序往下檢查, 直到找到第一個匹配的路徑
// 所以把動態路由放在具體路由的後面, 可以確保具體路徑有最高優先權

module.exports = router;
