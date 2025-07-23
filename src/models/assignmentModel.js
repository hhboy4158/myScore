const db = require('../utils/db');

const assignmentModel = {
  /**
   * 建立一個新任務
   * @param {object} assignment - 任務資料
   * @returns {Promise<object>}
   */
  create: async (assignment) => {
    const [result] = await db.execute(
      'INSERT INTO assignments (classroom_id, name, description, type, due_date, anonymity_type, allow_self_assessment) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [assignment.classroom_id, assignment.name, assignment.description, assignment.type, assignment.due_date, assignment.anonymity_type, assignment.allow_self_assessment]
    );
    return { id: result.insertId, ...assignment };
  },

  /**
   * 根據教室 ID 尋找所有任務
   * @param {number} classroomId - 教室 ID
   * @returns {Promise<Array<object>>}
   */
  findByClassroomId: async (classroomId) => {
    const [rows] = await db.query(
      'SELECT * FROM assignments WHERE classroom_id = ? ORDER BY due_date DESC',
      [classroomId]
    );
    return rows;
  },

  /**
   * 根據 ID 尋找單一任務
   * @param {number} assignmentId - 任務 ID
   * @returns {Promise<object|undefined>}
   */
  findById: async (assignmentId) => {
    const [rows] = await db.query('SELECT * FROM assignments WHERE assignment_id = ?', [assignmentId]);
    return rows[0];
  },

  /**
   * 根據任務 ID 尋找其所有評分標準
   * @param {number} assignmentId - 任務 ID
   * @returns {Promise<Array<object>>}
   */
  findCriteriaByAssignmentId: async (assignmentId) => {
    const [rows] = await db.query('SELECT * FROM assignment_criteria WHERE assignment_id = ?', [assignmentId]);
    return rows;
  }
};

module.exports = assignmentModel;