const express = require('express');
const router = express.Router();
const { list } = require('../controllers/assignmentController');

router.get('/', list);

module.exports = router;