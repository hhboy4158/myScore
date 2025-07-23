const db = require('../utils/db');
const assignmentModel = require('../models/assignmentModel');
const scoreModel = require('../models/scoreModel');

// const assignmentService = {
exports.create = async (assignmentData) => {
//   create: async (assignmentData) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. 插入主任務資料到 assignments 表
      const {
        classroomId,
        taskName,
        taskDescription,
        taskType,
        taskDueDate,
        anonymityType,
        allowSelfAssessment,
        criteria
      } = assignmentData;

      
      const assignmentToCreate = {
        classroom_id: classroomId,
        name: taskName,
        description: taskDescription,
        type: taskType,
        due_date: taskDueDate,
        anonymity_type: anonymityType,
        allow_self_assessment: allowSelfAssessment
      };
      
      // 呼叫 model
      const newAssignment = await assignmentModel.create(assignmentToCreate);
      const newAssignmentId = newAssignment.id;

      // 2. 遍歷評分標準並插入到 assignment_criteria 表
      if (criteria && criteria.length > 0) {
        const criteriaSql = 'INSERT INTO assignment_criteria (assignment_id, name, max_score) VALUES ?';
        const criteriaValues = criteria.map(c => [newAssignmentId, c.name, c.max_score]);
        await connection.query(criteriaSql, [criteriaValues]);
      }

      await connection.commit();
      return { success: true, assignmentId: newAssignmentId };
    } catch (error) {
      await connection.rollback();
      console.error('Error creating assignment:', error);
      throw error; // 將錯誤向上拋出，由 controller 處理
    } finally {
      connection.release();
    }
  };
exports.getByClassroomId = async (classroomId) => {
//   getByClassroomId: async (classroomId) => {
    try {
      return await assignmentModel.findByClassroomId(classroomId);
    } catch (error) {
      console.error('Error fetching assignments by classroom ID:', error);
      throw error;
    }
  };
exports.getAssignmentDetails = async (assignmentId) => {
    try {
      const assignment = await assignmentModel.findById(assignmentId);
      if (!assignment) {
        return null;
      }
      const criteria = await assignmentModel.findCriteriaByAssignmentId(assignmentId);
      return { assignment, criteria };
    } catch (error) {
      console.error(`Error fetching details for assignment ${assignmentId}:`, error);
      throw error;
    }
  };

exports.submitReview = async (reviewData) => {
    const { assignmentId, reviewerId, evaluatedUserId, scores } = reviewData;    
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      if (!scores || !Array.isArray(scores) || scores.length === 0) {
        throw new Error('Scores data is empty or invalid.');
      }

      // 準備批次插入的資料
      // 資料格式需要是陣列的陣列, e.g., [[1, 2, 3, 4, 10], [1, 2, 5, 6, 20]]
      const scoreValues = scores.map(s => {
        if (s.criterionId === undefined || s.score === undefined) {
          throw new Error('Each score must have a criterionId and a score.');
        }
        return [
            assignmentId,
            reviewerId,
            evaluatedUserId,
            s.criterionId,
            s.score
        ];
      });

      const result = await scoreModel.upsert(scoreValues, connection);

      await connection.commit();
      console.log(`Review submitted successfully for assignment ${assignmentId}. ${result.affectedRows} rows affected.`);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      await connection.rollback();
      console.error(`Error submitting review for assignment ${assignmentId}:`, error);
      throw error;
    }
    finally {
      connection.release();
    }
  };

exports.getScoresByReviewer = async (assignmentId, reviewerId) => {
    try {
        const scores = await scoreModel.findByReviewerAndAssignment(assignmentId, reviewerId);

        // 從資料庫取得的資料是陣列，我們將其轉換為巢狀物件，方便在模板中快速查找。
        // 格式: { evaluatedUserId: { criterionId: score } }
        // 例如: { 12: { 1: 5, 2: 6 }, 15: { 1: 7, 2: 8 } }
        const scoresMap = {};
        scores.forEach(scoreRecord => {
            if (!scoresMap[scoreRecord.evaluated_user_id]) {
                scoresMap[scoreRecord.evaluated_user_id] = {};
            }
            scoresMap[scoreRecord.evaluated_user_id][scoreRecord.criterion_id] = scoreRecord.score;
        });

        return scoresMap;
    } catch (error) {
        console.error(`Error fetching scores for reviewer ${reviewerId} in assignment ${assignmentId}:`, error);
        throw error;
    }
};

exports.updateDueDate = async(assignmentId, newDueDate) => {
    const query = 'UPDATE assignments SET due_date = ? WHERE assignment_id = ?';
    try {
        const [result] = await db.query(query, [newDueDate, assignmentId]);
        if (result.affectedRows === 0) {
            // 如果沒有任何行被更新，表示找不到該任務
            throw new Error('找不到指定的任務或更新失敗');
        }
        return { success: true };
    } catch (error) {
        console.error('更新截止日期時資料庫出錯:', error);
        // 拋出一個更通用的錯誤訊息給前端
        throw new Error('更新截止日期失敗');
    }
};