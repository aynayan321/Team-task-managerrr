const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getUsers, getUser } = require('../controllers/userController');
router.get('/', protect, adminOnly, getUsers);
router.get('/:id', protect, adminOnly, getUser);
module.exports = router;
