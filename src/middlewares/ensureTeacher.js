// src/middlewares/ensureTeacher.js
const MembershipModel = require('../models/membershipModel');

/**
 * 確認該動作只有權限為老師才可以繼續執行
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
async function ensureTeacher(req, res, next) {
  const teacherId = req.user.user_id;
  const classroomId = req.params.classroomId || req.body.classroom_id;

  const record = await MembershipModel.findByUserAndClassroom(teacherId, classroomId);
  if (!record || record.role !== 'teacher') {
    return res.status(403).json({ success: false, message: '僅限老師操作' });
  }
  next();
};

module.exports = { ensureTeacher };