const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createProject, getProjects, getProject,
  updateProject, deleteProject, addMember, removeMember
} = require('../controllers/projectController');

router.route('/')
  .get(protect, getProjects)
  .post(protect, adminOnly, [
    body('name').trim().notEmpty().withMessage('Project name is required'),
  ], validate, createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, adminOnly, updateProject)
  .delete(protect, adminOnly, deleteProject);

router.route('/:id/members')
  .post(protect, adminOnly, [
    body('userId').notEmpty().withMessage('User ID is required'),
  ], validate, addMember);

router.delete('/:id/members/:userId', protect, adminOnly, removeMember);

module.exports = router;
