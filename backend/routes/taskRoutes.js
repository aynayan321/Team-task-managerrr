const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { createTask, getTasks, getTask, updateTask, deleteTask } = require('../controllers/taskController');

router.route('/')
  .get(protect, getTasks)
  .post(protect, adminOnly, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('projectId').notEmpty().withMessage('Project is required'),
    body('assignedTo').notEmpty().withMessage('Assigned user is required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
  ], validate, createTask);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, adminOnly, deleteTask);

module.exports = router;
