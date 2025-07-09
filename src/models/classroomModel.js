// src/models/classroomModel.js
const db = require('../utils/db');

module.exports = {
  /**
   * 建立教室
   *
   * @param {*} { name, code, creator_user_id }
   * @return {*} - classroom_id, name, code, creator_user_id
   */
  async create({ name, code, creator_user_id }) {
    const [result] = await db.query(
      `INSERT INTO classrooms (name, code, creator_user_id) VALUES (?, ?, ?)`,
      [name, code, creator_user_id]
    );
    return {
      classroom_id: result.insertId,
      name,
      code,
      creator_user_id
    };
  },

  /**
   * 刪除教室
   *
   * @param {*} { classroomCode }
   * @return {*} - classroom_id, name, code, creator_user_id
   */
  async deleteClassroom(classroomCode) {
    const sql = `
      UPDATE classrooms
      SET deleted_at = NOW()
      WHERE code = ? AND deleted_at IS NULL;
    `; 
    // 註: 額外新增 AND deleted_at IS NULL 條件, 避免重複刪到本來就被刪掉的資料

    // 假設 db.query 回傳 [results, fields]
    const [result] = await db.query(sql, [classroomCode]);

    // 必須回傳 result，這樣 Service 層才能判斷操作是否成功
    return result;
  },

  /**
   * 查詢教室 by code
   *
   * @param {string} code
   * @return {*} 
   */
  async findByCode(code) {
    const sql = `SELECT * FROM classrooms WHERE code = ? AND deleted_at IS NULL LIMIT 1`;
    const [rows] = await db.query(sql, [code]);
    return rows[0] || null;
  },

  /**
   * 查詢教室及成員 by code *註: 這是縫合怪 通通寫一起好像不太妙 貌似沒人用這玩意
   *
   * @param {string} code
   * @return {*} 
   */
  async findWithMembersByCode(code) {
    try{
      console.log('model findByCode get code: ', code);
      const sql = `
        SELECT * FROM classrooms
        WHERE code = ? AND deleted_at IS NULL
        LIMIT 1
      `;
      const [classroomRows] = await db.query(sql, [code]);

      const sql2 = `
      SELECT * FROM memberships WHERE classroom_id = ?
      `;
      const[membershipRows] = await db.query(sql2, [classroomRows[0].classroom_id]);

      console.log("classroomRows: ", classroomRows[0]);
      console.log("membershipRows: ", membershipRows);
      return {classroomdata: classroomRows[0] || null, memberdata: membershipRows || null };
    } catch(err) {
      throw(err);
    };
    
  },

  /**
   * 檢查代碼是否重複 是就 return true, 否就 false
   * 
   * @param {string} code
   * @return {boolean} 
   */
  async codeExists(code) {
    const [rows] = await db.query(
      `SELECT 1 FROM classrooms WHERE code = ? LIMIT 1`,
      [code]
    );
    return rows.length > 0;
  }
};
