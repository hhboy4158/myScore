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
exports.handleRemoveMember = async (req, res) => {
  const { classroomId, userId } = req.params;
  const requestingUserId = req.user.user_id;

  try {
    // 權限檢查已由 ensureTeacher 中介軟體完成
    // 這裡可以加上額外邏輯，例如：老師不能移除自己
    if (Number(userId) === requestingUserId) {
      return res.status(400).json({ success: false, message: '你不能移除自己' });
    }

    const wasRemoved = await membershipsService.removeMember(userId, classroomId);
    if (wasRemoved) return res.json({ success: true });

    res.status(404).json({ success: false, message: '找不到該成員或已被移除' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '伺服器發生錯誤' });
  }
};