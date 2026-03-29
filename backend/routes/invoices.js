const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  generateInvoice,
  getAllInvoices,
  getInvoiceById,
  downloadInvoicePDF,
} = require('../controllers/invoiceController');

const router = express.Router();

// All invoice routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/invoices/generate
 * @desc    Generate a new invoice from project and time logs
 * @access  Private
 */
router.post('/generate', generateInvoice);

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices for logged-in user
 * @access  Private
 */
router.get('/', getAllInvoices);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get a single invoice by ID
 * @access  Private
 */
router.get('/:id', getInvoiceById);

/**
 * @route   GET /api/invoices/:id/download
 * @desc    Download invoice as PDF
 * @access  Private
 */
router.get('/:id/download', downloadInvoicePDF);

module.exports = router;
