const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  createTimeLog,
  getAllTimeLogs,
  getTimeLogsByProject,
  getTimeLogById,
} = require('../controllers/timelogController');

const router = express.Router();

// All time log routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/timelogs
 * @desc    Create a new time log
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
