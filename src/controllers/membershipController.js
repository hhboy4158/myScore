// src/controllers/membershipController.js
const membershipsService = require('../services/membershipService');
const { ensureTeacher } = require('../middlewares/ensureTeacher');

exports.showMembershipForm = (req, res) => {
  res.render('membership', { title: 'myScore - 編輯成員', user: req.user});
};

/**
 * 加入教室功能
 *
 * @param {*} req
 * @param {object} res 
 */
exports.joinClassroom = async (req, res) => {
  const userId = req.user.user_id;
  const { classroomCode } = req.body;

  try {
    const result = await membershipsService.joinClassroom(userId, classroomCode);

    if (!result.success) {
      return res.json({ success: false, message: result.message });
    }

    res.json({
      success: true,
      classroom_name: result.classroom_name,
      classroom_code: classroomCode
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

/**
 * 踢除成員功能
 *
 * @param {*} req
 * @param {*} res
 * @return {*} 
 */
exports.kickMember = async (req, res) => {
  try {
    const teacherId = req.user.user_id;
    const { classroom_id, user_id: targetUserId } = req.body;

    // 可加上額外檢查：確認 req.user 有權限踢人
    const success = await Membership.remove(targetUserId, classroom_id);
    if (success) return res.json({ success: true });
    res.status(400).json({ success: false, message: '移除失敗或本身不在此課堂' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};