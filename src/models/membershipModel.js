// src/models/membershipModel.js
const db = require('../utils/db');

const MembershipModel = {
    
  /**
   * 建立課程成員, 預設成員是學生, 預設建立者是老師
   *
   * @param {*} { user_id, classroom_id, role = 'student' }
   * @return {*} 
   */
  async create({ user_id, classroom_id, role = 'student' }) {
    const sql = `
      INSERT INTO memberships (user_id, classroom_id, role)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.execute(sql, [user_id, classroom_id, role]);
    return result.insertId;
  },

  /**
   * 用使用者 id 跟 教室 id 來尋找特定資料
   *
   * @param {*} user_id
   * @param {*} classroom_id
   * @return {*} 
   */
  async findByUserAndClassroom(user_id, classroom_id) {

    if (!classroom_id) {
      let sql = `
      SELECT * FROM memberships
      WHERE user_id = ?
      LIMIT 1
      `;
      const [rows] = await db.execute(sql, [user_id]);
      return rows[0] || null;
    };

    let sql = `
      SELECT * FROM memberships
      WHERE user_id = ? AND classroom_id = ?
      LIMIT 1
    `;

    const [rows] = await db.execute(sql, [user_id, classroom_id]);
    return rows[0] || null;
  },

  // async findAllByUser(user_id) {
  //   const sql = `
  //     SELECT m.*, c.name AS classroom_name, c.code AS classroom_code
  //     FROM memberships m
  //     JOIN classrooms c ON m.classroom_id = c.classroom_id
  //     WHERE m.user_id = ?
  //   `;
  //   const [rows] = await db.execute(sql, [user_id]);
  //   return rows;
  // },

  async findAllByClassroom(classroom_id) {
    const sql = `
      SELECT m.*, u.name AS user_name, u.email
      FROM memberships m
      JOIN users u ON m.user_id = u.user_id
      WHERE m.classroom_id = ?
    `;
    const [rows] = await db.execute(sql, [classroom_id]);
    return rows;
  },

  /**
   * 透過 user_id 查詢該使用者隸屬的所有教室, 並過濾掉已刪除的教室
   *
   * @param {number} user_id
   * @return {Array<object>}
   */
  async findClassroomsByUserId(user_id) {
    const sql = `
      SELECT c.*
      FROM classrooms as c
      INNER JOIN memberships as m ON m.classroom_id = c.classroom_id
      WHERE m.user_id = ? AND c.deleted_at IS NULL`;
    const [rows] = await db.execute(sql, [user_id]);
    return rows || null;
  },

  // async updateRole({ user_id, classroom_id, newRole }) {
  //   const sql = `
  //     UPDATE memberships
  //     SET role = ?
  //     WHERE user_id = ? AND classroom_id = ?
  //   `;
  //   const [result] = await db.execute(sql, [newRole, user_id, classroom_id]);
  //   return result.affectedRows > 0;
  // },

  // async remove(user_id, classroom_id) {
  //   const sql = `
  //     DELETE FROM memberships
  //     WHERE user_id = ? AND classroom_id = ?
  //   `;
  //   const [result] = await db.execute(sql, [user_id, classroom_id]);
  //   return result.affectedRows > 0;
  // },

  async findAllMembersById(id) {
    try{
      const sql = `
      SELECT m.*, u.name
      FROM memberships as m
      INNER JOIN users as u ON m.user_id = u.user_id
      WHERE m.classroom_id = ? AND m.deleted_at IS NULL
      `;

      // SELECT m.*, u.name, s.score
      // FROM memberships as m
      // INNER JOIN users as u ON m.user_id = u.user_id
      // left JOIN Scores as s ON m.user_id = s.evaluated_user_id
      // WHERE m.classroom_id = 7 AND m.deleted_at IS NULL
      const[membershipRows] = await db.query(sql, [id]);

      // console.log("membershipRows: ", membershipRows);
      return {memberdata: membershipRows || null };
    } catch(err) {
      throw(err);
    };
    
  },

  /**
   * 查詢該使用者是否存在於任何教室內
   *
   * @param {*} user_id
   * @return {*} 
   */
  async classroomExists(user_id) {
    const sql = `
      SELECT 1
      FROM memberships m
      WHERE m.user_id = ?
      LIMIT 1
    `;
    const [rows] = await db.execute(sql, [user_id]);
    return rows.length > 0;
  },

  /**
   * 軟刪除一筆成員紀錄 (設定 deleted_at 時間戳)
   *
   * @param {number} userId - 要被軟刪除的使用者 ID
   * @param {number} classroomId - 教室 ID
   * @returns {Promise<object>} - 資料庫操作結果
   */
  async softDelete (userId, classroomId){
    const sql = 'UPDATE memberships SET deleted_at = NOW() WHERE user_id = ? AND classroom_id = ? AND deleted_at IS NULL';
    const [result] = await db.execute(sql, [userId, classroomId]);
    return result;
  },
};

module.exports = MembershipModel;
