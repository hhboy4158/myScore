// src/sercvices/membershipService.js
const classroomModel = require('../models/classroomModel');
const membershipModel = require('../models/membershipModel');

/**
 * 加入教室功能
 *
 * @param {*} req
 * @param {object} res 
 */
exports.joinClassroom = async (userId, classroomCode) => {
  try {
    // 檢查教室是否存在
    const classroom = await classroomModel.findByCode(classroomCode);
    if (!classroom) {
      return { success: false, message: '你輸入的教室壓根就不存在' };
    }

    // 教室存在的話 再來檢查你是不是已經在這間教室裡了
    const existing = await membershipModel.findByUserAndClassroom(userId, classroom.classroom_id);
    if (existing) {
      return { success: false, message: '你已經在這間教室裡了 你也幫幫忙' };
    }

    // 教室存在、你也沒在教室裡, 才會把你加進去
    const insertId = await membershipModel.create({
      user_id: userId, 
      classroom_id: classroom.classroom_id, 
      role:"student"
    });

    // 要是沒有 insertId 代表在 insert 當中出了問題
    if (!insertId) {
      return {
        success: false,
        message: '加入教室時出了一些問題: ' + insertId
      };
    };

    // 上面都沒問題就回傳這個
    return {
      success: true,
      classroom_name: classroom.classroom_name
    };
  } catch (err) {
    return {
      success: false,
      message: '加入教室時出了不只一些問題, 錯誤: ' + err
    };
  }
};


/**
 * 從教室移除一名成員 (軟刪除)
 *
 * @param {number} targetUserId - 要被移除的使用者 ID
 * @param {number} classroomId - 教室 ID
 * @returns {Promise<boolean>} - 回傳操作是否成功
 */
exports.removeMember = async (targetUserId, classroomId) => {
  // 權限檢查已由 ensureTeacher 中介軟體處理。
  // 未來若有更複雜的商業邏輯 (例如：檢查是否在移除最後一位老師)，可以加在這裡。

  const result = await membershipModel.softDelete(targetUserId, classroomId);
  return result.affectedRows > 0;
};