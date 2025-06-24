const classroomService = require('../services/classroomService');

exports.showCreateForm = (req, res) => {
  res.render('classroom_create');
};

exports.createClassroom = async (req, res) => {
  try {
    const classroomId = await classroomService.createClassroom(req.body, req.user);
    res.send('教室已建立，ID: ' + classroomId);
  } catch (err) {
    res.status(400).send('建立失敗: ' + err.message);
  }
};
