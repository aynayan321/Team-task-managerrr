const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    let taskQuery = {};
    let projectQuery = {};
    if (req.user.role !== 'admin') {
      taskQuery.assignedTo = req.user._id;
      projectQuery.members = req.user._id;
    }
    const [totalTasks, completedTasks, inProgressTasks, pendingTasks, overdueTasks, totalProjects, recentTasks] = await Promise.all([
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'completed' }),
      Task.countDocuments({ ...taskQuery, status: 'in-progress' }),
      Task.countDocuments({ ...taskQuery, status: 'pending' }),
      Task.countDocuments({ ...taskQuery, status: { $ne: 'completed' }, dueDate: { $lt: now } }),
      Project.countDocuments(projectQuery),
      Task.find(taskQuery)
        .populate('assignedTo', 'name')
        .populate('project', 'name')
        .sort('-updatedAt')
        .limit(5)
    ]);
    const stats = { totalTasks, completedTasks, inProgressTasks, pendingTasks, overdueTasks, totalProjects, recentTasks };
    if (req.user.role === 'admin') {
      stats.totalUsers = await User.countDocuments();
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
