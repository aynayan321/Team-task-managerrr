const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create task
// @route   POST /api/tasks
// @access  Admin
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, priority } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isMember = project.members.some(m => m.toString() === assignedTo);
    if (!isMember) return res.status(400).json({ message: 'Assigned user is not a project member' });
    const task = await Task.create({
      title, description, project: projectId,
      assignedTo, createdBy: req.user._id, dueDate, priority
    });
    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'name');
    await task.populate('createdBy', 'name');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, projectId } = req.query;
    let query = {};
    if (req.user.role !== 'admin') {
      query.assignedTo = req.user._id;
    }
    if (status) query.status = status;
    if (projectId) query.project = projectId;
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role !== 'admin' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isAssigned) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Members can only update status
    if (req.user.role === 'member') {
      if (req.body.status) task.status = req.body.status;
    } else {
      const { title, description, assignedTo, dueDate, priority, status } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo) task.assignedTo = assignedTo;
      if (dueDate) task.dueDate = dueDate;
      if (priority) task.priority = priority;
      if (status) task.status = status;
    }
    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'name');
    await task.populate('createdBy', 'name');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
