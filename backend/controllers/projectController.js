const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create project
// @route   POST /api/projects
// @access  Admin
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({ name, description, owner: req.user._id, members: [req.user._id] });
    await project.populate('owner', 'name email');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { members: req.user._id };
    }
    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email role')
      .sort('-createdAt');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { name, description, status } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email role');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Admin
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }
    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email role');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Admin
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }
    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();
    await project.populate('members', 'name email role');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, addMember, removeMember };
