// src/controllers/classroomController.js
const classroomService = require('../services/classroomService');

/**
 * 課程選單頁面 *棄用*
 */
exports.showMYclassroomForm = async (req, res) => {
  const hasClassroom = await classroomService.hasClassroom(req.user.user_id);
  console.log("showclassroomForm: ", hasClassroom)
  res.render('myclassroom', { title: 'myScore - 課程', user: req.user, hasClassroom: hasClassroom});
};

/**
 * 建立課堂頁面
 */
exports.showCreateForm = (req, res) => {
  res.render('classroom_create', { title: 'myScore - 建立課堂', user: req.user});
};

/**
 * myclassroom - 我的課堂頁面
 */
exports.showclassroomForm = async (req, res) => {
  console.log("Controller showMYclassroomForm getted: ", req.user.user_id);
  try{
    const classroomData = await classroomService.showMyClassroomData(req.user.user_id);

    // console.log("Controller showMYclassroomForm getted Service Data: ",classroomData);

    res.render('classroom', { title: 'myScore - 我的教室', user: req.user, classrooms: classroomData});
  } catch(err) {
    console.error('顯示 我的課堂頁面 失敗:', err);
    console.log('res object:', res);
  };
};

/**
 * 透過代碼查詢教室頁面
 */
exports.showCurrentClassroom = async (req, res) => {
  try{
    // 教室資料已由 ensureClassroomMembership 中介軟體提供 
    // 所以不用再跟 model 要資料了
    const classroomData = req.classroom;

    // 透過 Service 取得成員資料
    const memberData = await classroomService.getMembersByClassroomId(classroomData.classroom_id);

    res.render('currentClassroom', { 
      title: '教室 - '+ classroomData.name, 
      classroomData: classroomData, 
      memberData: memberData,
      user: req.user
    });
  } catch(err){
    console.error('controller showCurrentClassroom error: ', err);
    res.status(500).render('error', {
      user: req.user,
      title: 'Error - myScore',
      errorCode: 500,
      errorStatus: 'Internal Server Error',
      description: '讀取教室資料時發生錯誤'
    });
  };
};

/**
 * 建立教室功能, 把資料丟到 Service, 這裡只會確認成不成功
 *
 * @param {*} req
 * @param {object} res {(布林值)成功訊息: success, (物件)教室資料: classroom: {classroom_id, name, code, creator_user_id}}
 */
exports.createClassroom = async (req, res) => {
  try {
    const userId = req.user.user_id; 
    const { name } = req.body;

    // console.log('req.body:', req.body); // Debugging 正常來說應該會長這樣: req.body: { name: 'a certain class name' }
    // console.log('User ID:', userId); // Debugging
    // console.log('Classroom Name:', name); // Debugging

    const classroom = await classroomService.createClassroom({ name, creatorUserId: userId });
    // console.log("classroom: ", classroom); // Debugging
    res.status(200).json({ success: true, classroom_code: classroom.code });
  } catch (err) {
    console.error('建立教室失敗:', err); 
    res.status(500).json({ success: false, message: '建立教室失敗' });
  };
};

/**
 * 刪除教室功能
 * 回傳 http code 跟一些應該用不到但姑且還是寫進去以備不時之需的資料
 */
exports.deleteClassroom = async (req, res) => {
  try {
    const { classroomCode } = req.params;

    const wasDeleted = await classroomService.deleteClassroom(classroomCode);

    if (!wasDeleted) {
      // 如果回傳 false 代表找不到該教室
      return res.status(404).json({
        success: false,
        message: `找不到班級代碼為 ${classroomCode} 的班級`
      });
    }

    // res.status(204).send(); 
    res.status(200).json({
      success: true,
      message: `班級 ${classroomCode} 已成功標記為刪除`
    });

  } catch (err) {
    // catch service 或 model 層的 err
    console.error(`刪除班級 ${req.params.classroomCode} 時發生錯誤:`, err);
    res.status(500).json({
      success: false,
      message: '刪除班級時發生伺服器內部錯誤',
      error: err.message 
    });
  };
};
