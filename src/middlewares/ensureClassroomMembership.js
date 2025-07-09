// middlewares/ensureClassroomMembership.js
const classroomModel = require('../models/classroomModel');
const membershipModel = require('../models/membershipModel');
/**
 * 確認該動作只有此課堂的成員才可以繼續執行
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
async function ensureClassroomMembership(req, res, next) {
  const userId = req.user.user_id; 
  const classroomCode = req.params.classroomcode;

  try {
    // 透過 classroomCode 尋找教室資料
    const classroom = await classroomModel.findByCode(classroomCode);

    if (!classroom) {
      return res.status(404).render('error', { 
        user: req.user,
        title: 'Error - myScore', 
        errorCode: 404, 
        errorStatus: 'Not Found',
        description: '該教室不存在', 
      });
      
    }
    
    // 驗證使用者是否為該教室成員
    const membership = await membershipModel.findByUserAndClassroom(userId, classroom.classroom_id);
    
    if (!membership) {
      return res.status(403).render('error', { 
        user: req.user,
        title: 'Error - myScore', 
        errorCode: 403, 
        errorStatus: 'Forbidden',
        description: '你還沒加入這間教室'
      });
    }

    // 如果通過驗證，把完整的教室資料存進 req 供後續的 controller 使用
    req.classroom = classroom;

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).render('error', { 
      user: req.user,
      title: 'Error - myScore', 
      errorCode: 500, 
      errorStatus: 'Internal Server Error',
      description: '伺服器內部錯誤',
    });
  }
};

module.exports = { ensureClassroomMembership };
