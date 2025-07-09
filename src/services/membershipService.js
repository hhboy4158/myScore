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
