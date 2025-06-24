const classroomModel = require('../models/classroomModel');

// create classroom
exports.createClassroom = async (classroomData, user) => {
  if (!classroomData.name || !user) throw new Error('缺少必要資訊');
  // 可以在這裡加更多邏輯（如權限檢查）
  const classroomId = await classroomModel.create(classroomData.name, user.id);
  return classroomId;
};