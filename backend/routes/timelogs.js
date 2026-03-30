const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  startTimeLog,
  pauseTimeLog,
  resumeTimeLog,
  stopTimeLog,
  createTimeLog,
  getAllTimeLogs,
  getTimeLogsByProject,
  getTimeLogById,
} = require('../controllers/timelogController');

const router = express.Router();

// All time log routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/timelogs/start
 * @desc    Start a timer for a project
 * @access  Private
 */
router.post('/start', startTimeLog);

/**
 * @route   PUT /api/timelogs/:id/pause
 * @desc    Pause a running timer
 * @access  Private
 */
router.put('/:id/pause', pauseTimeLog);

/**
 * @route   PUT /api/timelogs/:id/resume
 * @desc    Resume a paused timer
 * @access  Private
 */
router.put('/:id/resume', resumeTimeLog);

/**
 * @route   PUT /api/timelogs/:id/stop
 * @desc    Stop the timer and finalize the entry
 * @access  Private
 */
router.put('/:id/stop', stopTimeLog);

/**
 * @route   POST /api/timelogs
 * @desc    Create a new time log (manual entry)
 * @access  Private
 */
router.post('/', createTimeLog);

/**
 * @route   GET /api/timelogs
 * @desc    Get all time logs for logged-in user
 * @access  Private
 */
router.get('/', getAllTimeLogs);

/**
 * @route   GET /api/timelogs/:id
 * @desc    Get a single time log by ID
 * @access  Private
 */
router.get('/:id', getTimeLogById);

/**
 * @route   GET /api/timelogs/project/:projectId
 * @desc    Get all time logs for a specific project
 * @access  Private
 */
router.get('/project/:projectId', getTimeLogsByProject);

module.exports = router;
