const express = require('express');
const router = express.Router();
const {ensureTeacher} = require('../middlewares/ensureTeacher');
const membershipController = require('../controllers/membershipController');

router.get('/membership',membershipController.showMembershipForm);

router.post('/membership', membershipController.joinClassroom);

router.delete('/membership/:classroomId/:userId', ensureTeacher, membershipController.handleRemoveMember);

module.exports = router;