const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');

const router = express.Router();

// All client routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/clients
 * @desc    Create a new client
 * @access  Private
 */
router.post('/', createClient);

/**
 * @route   GET /api/clients
 * @desc    Get all clients for logged-in user
 * @access  Private
 */
router.get('/', getClients);

/**
 * @route   GET /api/clients/:id
 * @desc    Get a single client by ID
 * @access  Private
 */
router.get('/:id', getClientById);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update a client
 * @access  Private
 */
router.put('/:id', updateClient);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete a client
 * @access  Private
 */
router.delete('/:id', deleteClient);

module.exports = router;
