const TimeLog = require('../models/TimeLog');
const Project = require('../models/Project');

/**
 * Start a timer (new running time log)
 * @route   POST /api/timelogs/start
 * @access  Private
 */
const startTimeLog = async (req, res) => {
  try {
    const { projectId, description } = req.body;
    const userId = req.userId;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const timeLog = new TimeLog({
      projectId,
      startTime: new Date(),
      status: 'running',
      totalDuration: 0,
      durationHours: 0,
      description: description || '',
      userId,
    });

    await timeLog.save();

    res.status(201).json({ message: 'Timer started', timeLog });
  } catch (error) {
    console.error('Start time log error:', error);
    res.status(500).json({ message: 'Error starting timer' });
  }
};

/**
 * Pause a running timer
 * @route   PUT /api/timelogs/:id/pause
 * @access  Private
 */
const pauseTimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const timeLog = await TimeLog.findOne({ _id: id, userId });
    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    if (timeLog.status !== 'running' || !timeLog.startTime) {
      return res.status(400).json({ message: 'Only running timers can be paused' });
    }

    const now = new Date();
    const elapsedMinutes = (now - new Date(timeLog.startTime)) / (1000 * 60);
    const newTotalDuration = timeLog.totalDuration + elapsedMinutes;

    timeLog.totalDuration = newTotalDuration;
    timeLog.durationHours = parseFloat((newTotalDuration / 60).toFixed(2));
    timeLog.startTime = null;
    timeLog.endTime = now;
    timeLog.status = 'paused';

    await timeLog.save();

    res.json({ message: 'Timer paused', timeLog });
  } catch (error) {
    console.error('Pause time log error:', error);
    res.status(500).json({ message: 'Error pausing timer' });
  }
};

/**
 * Resume a paused timer
 * @route   PUT /api/timelogs/:id/resume
 * @access  Private
 */
const resumeTimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const timeLog = await TimeLog.findOne({ _id: id, userId });
    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    if (timeLog.status !== 'paused') {
      return res.status(400).json({ message: 'Only paused timers can be resumed' });
    }

    timeLog.status = 'running';
    timeLog.startTime = new Date();
    timeLog.endTime = null;

    await timeLog.save();

    res.json({ message: 'Timer resumed', timeLog });
  } catch (error) {
    console.error('Resume time log error:', error);
    res.status(500).json({ message: 'Error resuming timer' });
  }
};

/**
 * Stop a timer and finalize entry
 * @route   PUT /api/timelogs/:id/stop
 * @access  Private
 */
const stopTimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const userId = req.userId;

    console.log('Stopping timer - ID:', id, 'UserID:', userId, 'Description:', description);

    const timeLog = await TimeLog.findOne({ _id: id, userId });
    if (!timeLog) {
      console.log('Time log not found for ID:', id);
      return res.status(404).json({ message: 'Time log not found' });
    }

    console.log('Found time log:', timeLog._id, 'Status:', timeLog.status);

    if (timeLog.status === 'stopped') {
      return res.status(400).json({ message: 'Timer is already stopped' });
    }

    const now = new Date();
    let totalDuration = timeLog.totalDuration;

    if (timeLog.status === 'running' && timeLog.startTime) {
      const elapsedMinutes = (now - new Date(timeLog.startTime)) / (1000 * 60);
      console.log('Elapsed minutes:', elapsedMinutes);
      totalDuration += elapsedMinutes;
    }

    timeLog.totalDuration = totalDuration;
    timeLog.durationHours = parseFloat((totalDuration / 60).toFixed(2));
    timeLog.startTime = null;
    timeLog.endTime = now;
    timeLog.status = 'stopped';

    if (description !== undefined && description !== '') {
      timeLog.description = description;
    }

    console.log('Saving time log with total duration:', totalDuration, 'hours:', timeLog.durationHours);
    await timeLog.save();

    console.log('Time log saved successfully');
    res.json({ message: 'Timer stopped', timeLog });
  } catch (error) {
    console.error('Stop time log error - Full error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error stopping timer: ' + error.message });
  }
};

/**
 * Create a new time log
 * @route   POST /api/timelogs
 * @access  Private
 */
const createTimeLog = async (req, res) => {
  try {
    const { projectId, startTime, endTime, description } = req.body;
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
  startTimeLog,
  pauseTimeLog,
  resumeTimeLog,
  stopTimeLog,
  createTimeLog,
  getAllTimeLogs,
  getTimeLogsByProject,
  getTimeLogById,
};
