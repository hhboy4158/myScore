// const { expect } = require('vitest');
const ClassroomModel = require('../models/classroomModel');
const MembershipModel = require('../models/membershipModel');
const { generateClassCode } = require('../utils/codeUtil');
const {} = require('./../utils/errors');
/**
 * 建立教室服務
 *
 * @param {*} { name, req.user.user_id }
 * @return {object} classroom: {classroom_id, name, code, creator_user_id}
 */
exports.createClassroom = async ({ name, creatorUserId }) => {
  try{
    const code = await generateUniqueCode();
    const classroom = await ClassroomModel.create({
      name,
      code,
      creator_user_id: creatorUserId,
    });
    await MembershipModel.create({
      user_id: creatorUserId,
      classroom_id: classroom.classroom_id,
      role: 'teacher',
    });
    return classroom;
  } catch(err) {
    throw(err);
  }
};

/**
 * 刪除教室服務
 *
 * @param {*} { classroomCode }
 * @return {object} classroom: {classroom_id, name, code, creator_user_id}
 */
exports.deleteClassroom = async (classroomCode) => {
  // Service 層不需要 try...catch，讓錯誤自然拋到 Controller 層統一處理
  // 這樣可以保持 Service 的乾淨，專注於商業邏輯
  
  const result = await ClassroomModel.deleteClassroom(classroomCode);

  // 商業邏輯：檢查資料庫操作是否真的影響了資料列
  // result.affectedRows > 0 表示 UPDATE 語句成功更新了一筆或多筆資料
  // 如果 classroomCode 不存在，affectedRows 會是 0
  return result.affectedRows > 0;
};

/**
 * 顯示所有我隸屬的教室
 *
 * @param {*} { name, creatorUserId }
 * @return {object} classroom: {classroom_id, name, code, creator_user_id}
 */
exports.showMyClassroomData = async (user_id) => {
  try{
    // console.log("Service showMyClassroomData getted: ", user_id);

    // classroomData = {classroomdata, memberdata}
    const classroomData = await MembershipModel.findClassroomsByUserId(user_id);
    // console.log("Service showMyClassroomData will return: ", classroomData);    
    return classroomData;
  } catch(err) {
    throw(err);
  };
};

/**
 * 透過教室 ID 尋找教室內的所有成員資料
 *
 * @param {number} classroomId
 * @return {Array<object>} memberdata
 */
exports.getMembersByClassroomId = async (classroomId) => {
  try{
    const memberdata = await MembershipModel.findAllByClassroom(classroomId);
    return memberdata;
  } catch(err) {
    throw(err);
  };
};

/**
 * 檢查你有沒有教室 有教室就 true
 *
 * @param {*} { user_id }
 * @return {bool} true / false
 */
exports.hasClassroom = async (user_id) => {
  try{
    // console.log("Service classroomIsEmpty getted: ", user_id);
    const classroomData = await MembershipModel.findClassroomsByUserId(user_id);
    // console.log("Service classroomIsEmpty will return: ", classroomData.length === 0); 
    return classroomData.length != 0 ;
  } catch(err) {
    throw(err);
  };
};

/**
 * 唯一教室代碼產生器 把生出來的 code 丟進資料庫裡找有沒有重複
 *
 * @return {string} code
 */
async function generateUniqueCode() {
  let code;
  let exists = true;
  while (exists) {
    code = generateClassCode(8); // 隨機 8 碼
    exists = await ClassroomModel.codeExists({ code }); // 用 ORM 或 SQL 查詢
  }
  return code;
}