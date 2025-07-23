const assignmentService = require('../services/assignmentService');
const membershipModel = require('../models/membershipModel');

const assignmentController = {
  /**
   * 建立任務
   */
  createAssignment: async (req, res, next) => {
    try {
      // 簡單的驗證
      const { classroomId, taskName, taskDueDate, criteria } = req.body;
      if (!classroomId || !taskName || !taskDueDate || !criteria || criteria.length === 0) {
        return res.status(400).json({ success: false, message: '缺少必要欄位' });
      }

      // 呼叫 service 處理業務邏輯
      const result = await assignmentService.create(req.body);

      if (result.success) {
        res.status(201).json({ success: true, message: '任務建立成功', assignmentId: result.assignmentId });
      } else {
        // 理論上 service 拋出錯誤會直接進到 catch
        res.status(500).json({ success: false, message: '任務建立失敗' });
      }
    } catch (error) {
      // 將錯誤傳遞給錯誤處理 middleware
      next(error);
    }
  },

  /**
   * 顯示任務頁面
   */
  showAssignmentDetail: async (req, res, next) => {
    try {
      const { assignmentId } = req.params;
      const reviewerId = req.user.user_id;

      const details = await assignmentService.getAssignmentDetails(assignmentId);

      if (!details || !details.assignment) {
        const err = new Error('找不到指定的任務');
        err.status = 404;
        return next(err);
      }

      const { assignment, criteria } = details;

      // 為了安全起見，我們需要確保使用者是此任務所屬教室的成員
      const classroomId = assignment.classroom_id;
      const membership = await membershipModel.findByUserAndClassroom(reviewerId, classroomId);

      if (!membership) {
        const err = new Error('您沒有權限查看此任務');
        err.status = 403;
        return next(err);
      }

      const userRole = membership.role;
      const isPastDue = new Date(assignment.due_date) < new Date();

      const allMembers = await membershipModel.findAllByClassroom(classroomId);
      const existingScores = await assignmentService.getScoresByReviewer(assignmentId, reviewerId);

      res.render('assignmentDetail', {
        title: `任務 - ${assignment.name}`,
        user: req.user,
        userRole: userRole,
        assignment: assignment,
        isPastDue: isPastDue,
        criteria: criteria,
        evaluatedUsers: allMembers.filter(m => m.user_id !== reviewerId), // 排除自己
        scores: existingScores // 傳遞分數 Map 到模板
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 接收學生提交的互評
   */
  submitReview: async (req, res, next) => {
    try {
      console.log("--- [Controller] 收到學生互評請求 ---");
      console.log("req.params:", req.params);
      console.log("req.user:", req.user);
      console.log("req.body:", req.body);

      // 從請求中解構出需要的資料
      const { assignmentId } = req.params;
      // 關鍵！確認 req.user 和 user_id 是否存在
      const reviewerId = req.user ? req.user.user_id : undefined;
      const { evaluatedUserId, scores } = req.body;

      // 檢查收到的資料
      if (!assignmentId || !reviewerId || !evaluatedUserId || !scores) {
        console.error("Controller收到的學生評分資料不完整");
        return res.status(400).json({ success: false, message: "請求資料不完整" });
      }

      console.log(`[Controller] 學生評分資料驗證通過: 作業ID=${assignmentId}, 評分者ID=${reviewerId}, 被評者ID=${evaluatedUserId}`);

      // 呼叫 Service 處理業務邏輯
      await assignmentService.submitReview({
        assignmentId,
        reviewerId,
        evaluatedUserId,
        scores
      });
      res.status(200).json({ success: true, message: "評分已成功提交！" });
    } catch (error) {
      // 如果 req.user 不存在，這裡會拋出錯誤
      console.error("[Controller] 處理學生互評時發生錯誤:", error);
      next(error);
    }
  },

  /**
   * 接收老師提交的成績
   */
  submitGrades: async (req, res, next) => {
    try {
      console.log("--- [Controller] 收到老師成績請求 ---");
      console.log("req.params:", req.params);
      console.log("req.user:", req.user);
      console.log("req.body:", req.body);

      const { assignmentId } = req.params;
      const teacherId = req.user ? req.user.user_id : undefined;
      const { scoresByStudent } = req.body;

      if (!assignmentId || !teacherId || !scoresByStudent) {
        console.error("Controller收到的老師成績資料不完整");
        return res.status(400).json({ success: false, message: "請求資料不完整" });
      }

      console.log(`[Controller] 老師成績資料驗證通過: 作業ID=${assignmentId}, 老師ID=${teacherId}`);

      // 呼叫 Service 處理業務邏輯
      await assignmentService.submitGrades({
        assignmentId,
        teacherId,
        scoresByStudent
      });
      res.status(200).json({ success: true, message: "所有成績已成功儲存！" });
    } catch (error) {
      console.error("[Controller] 處理老師成績時發生錯誤:", error);
      next(error);
    }
  },
  updateDueDate: async (req, res, next) => {
    try {
        const { assignmentId } = req.params;
        const { dueDate } = req.body;

        if (!dueDate) {
            return res.status(400).json({ message: '缺少截止日期' });
        }

        // 呼叫 service 函式來更新資料庫
        await assignmentService.updateDueDate(assignmentId, dueDate);

        res.status(200).json({ message: '截止日期已成功更新' });
    } catch (error) {
        next(error);
    }
  },
};

module.exports = assignmentController;