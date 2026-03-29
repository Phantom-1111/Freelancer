const TimeLog = require('../models/TimeLog');
const Project = require('../models/Project');

/**
 * Create a new time log
 * @route   POST /api/timelogs
 * @access  Private
 */
const createTimeLog = async (req, res) => {
  try {
    const { projectId, startTime, endTime } = req.body;
    const userId = req.userId;

    // Validation
    if (!projectId || !startTime || !endTime) {
      return res.status(400).json({
        message: 'Project ID, start time, and end time are required',
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate times
    if (start >= end) {
      return res.status(400).json({
        message: 'Start time must be before end time',
      });
    }

    // Verify project belongs to this user
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Calculate duration in hours
    const durationMs = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);

    // Create time log
    const timeLog = new TimeLog({
      projectId,
      startTime: start,
      endTime: end,
      durationHours,
      userId,
    });

    await timeLog.save();

    res.status(201).json({
      message: 'Time log created successfully',
      timeLog,
    });
  } catch (error) {
    console.error('Create time log error:', error);
    res.status(500).json({ message: 'Error creating time log' });
  }
};

/**
 * Get all time logs for logged-in user
 * @route   GET /api/timelogs
 * @access  Private
 */
const getAllTimeLogs = async (req, res) => {
  try {
    const userId = req.userId;

    const timeLogs = await TimeLog.find({ userId })
      .populate('projectId', 'name hourlyRate')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Time logs retrieved successfully',
      count: timeLogs.length,
      timeLogs,
    });
  } catch (error) {
    console.error('Get time logs error:', error);
    res.status(500).json({ message: 'Error fetching time logs' });
  }
};

/**
 * Get time logs by project ID
 * @route   GET /api/timelogs/project/:projectId
 * @access  Private
 */
const getTimeLogsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    // Verify project belongs to this user
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const timeLogs = await TimeLog.find({ projectId, userId })
      .populate('projectId', 'name hourlyRate')
      .sort({ createdAt: -1 });

    // Calculate total hours
    const totalHours = timeLogs.reduce((sum, log) => sum + log.durationHours, 0);

    res.json({
      message: 'Time logs retrieved successfully',
      count: timeLogs.length,
      totalHours: parseFloat(totalHours.toFixed(2)),
      timeLogs,
    });
  } catch (error) {
    console.error('Get time logs by project error:', error);
    res.status(500).json({ message: 'Error fetching time logs' });
  }
};

/**
 * Get a single time log by ID
 * @route   GET /api/timelogs/:id
 * @access  Private
 */
const getTimeLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const timeLog = await TimeLog.findOne({ _id: id, userId }).populate(
      'projectId',
      'name hourlyRate'
    );

    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    res.json({
      message: 'Time log retrieved successfully',
      timeLog,
    });
  } catch (error) {
    console.error('Get time log by ID error:', error);
    res.status(500).json({ message: 'Error fetching time log' });
  }
};

module.exports = {
  createTimeLog,
  getAllTimeLogs,
  getTimeLogsByProject,
  getTimeLogById,
};
