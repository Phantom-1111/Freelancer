const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Client = require('../models/Client');
const TimeLog = require('../models/TimeLog');
const pdfMake = require('pdfmake');
const path = require('path');
const fs = require('fs');

// Create invoices directory if it doesn't exist
const invoiceDir = path.join(__dirname, '../invoices');
if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir);
}

const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../node_modules/pdfmake/build/fonts/Roboto/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../node_modules/pdfmake/build/fonts/Roboto/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '../node_modules/pdfmake/build/fonts/Roboto/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../node_modules/pdfmake/build/fonts/Roboto/Roboto-MediumItalic.ttf'),
  },
};

pdfMake.addFonts(fonts);

/**
 * Generate an invoice PDF
 * @param {object} invoiceData - Invoice data
 * @returns {string} - Path to generated PDF
 */
const generateInvoicePDF = (invoiceData) => {
  const {
    invoiceId,
    clientName,
    clientEmail,
    projectName,
    totalHours,
    hourlyRate,
    totalAmount,
    generatedDate,
  } = invoiceData;

  return new Promise((resolve, reject) => {
    try {
      const fileName = `invoice_${invoiceId}.pdf`;
      const filePath = path.join(invoiceDir, fileName);

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        defaultStyle: {
          font: 'Roboto',
          fontSize: 12,
        },
        content: [
          {
            text: 'INVOICE',
            style: 'invoiceTitle',
          },
          {
            columns: [
              [
                { text: 'Bill To:', style: 'sectionHeader' },
                { text: clientName },
                { text: clientEmail },
              ],
              [
                { text: `Invoice #: ${invoiceId}`, alignment: 'right' },
                { text: `Date: ${new Date(generatedDate).toLocaleDateString()}`, alignment: 'right' },
                { text: `Project: ${projectName}`, alignment: 'right' },
              ],
            ],
          },
          { text: ' ', margin: [0, 10] },
          {
            table: {
              headerRows: 1,
              widths: ['*', 70, 90, 90],
              body: [
                [
                  { text: 'Description', style: 'tableHeader' },
                  { text: 'Hours', style: 'tableHeader' },
                  { text: 'Rate ($/h)', style: 'tableHeader' },
                  { text: 'Amount', style: 'tableHeader' },
                ],
                [
                  'Hours Worked',
                  totalHours.toFixed(2),
                  `$${hourlyRate.toFixed(2)}`,
                  `$${totalAmount.toFixed(2)}`,
                ],
              ],
            },
            layout: {
              fillColor: function (rowIndex) {
                return rowIndex === 0 ? '#eeeeee' : null;
              },
            },
          },
          {
            columns: [
              { width: '*', text: '' },
              {
                width: 250,
                table: {
                  body: [
                    ['Sub Total', `$${totalAmount.toFixed(2)}`],
                    ['Total Amount Due', `$${totalAmount.toFixed(2)}`],
                  ],
                },
                layout: 'noBorders',
              },
            ],
            margin: [0, 10, 0, 0],
          },
          { text: ' ', margin: [0, 20] },
          {
            text: 'Thank you for your business!',
            style: 'footer',
          },
          {
            text: 'Payment is due within 30 days.',
            style: 'footer',
          },
        ],
        styles: {
          invoiceTitle: {
            fontSize: 26,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            margin: [0, 0, 0, 5],
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
          },
          footer: {
            fontSize: 10,
            italics: true,
            color: '#666666',
            alignment: 'center',
          },
        },
      };

      const pdfDoc = pdfMake.createPdf(docDefinition);

      pdfDoc
        .write(filePath)
        .then(() => resolve(fileName))
        .catch((err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate invoice from project and time logs
 * @route   POST /api/invoices/generate
 * @access  Private
 */
const generateInvoice = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.userId;

    // Validation
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    // Verify project belongs to this user
    const project = await Project.findOne({ _id: projectId, userId }).populate(
      'clientId'
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get all time logs for this project
    const timeLogs = await TimeLog.find({ projectId, userId });

    if (timeLogs.length === 0) {
      return res.status(400).json({
        message: 'No time logs found for this project',
      });
    }

    // Calculate totals
    const totalHours = timeLogs.reduce((sum, log) => sum + log.durationHours, 0);
    const hourlyRate = project.hourlyRate;
    const totalAmount = totalHours * hourlyRate;

    // Create invoice document
    const invoice = new Invoice({
      projectId,
      totalHours: parseFloat(totalHours.toFixed(2)),
      hourlyRate,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      userId,
    });

    await invoice.save();

    // Generate PDF
    const pdfFileName = await generateInvoicePDF({
      invoiceId: invoice._id.toString(),
      clientName: project.clientId.name,
      clientEmail: project.clientId.email,
      projectName: project.name,
      totalHours: parseFloat(totalHours.toFixed(2)),
      hourlyRate,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      generatedDate: invoice.generatedDate,
    });

    res.status(201).json({
      message: 'Invoice generated successfully',
      invoice: {
        ...invoice.toObject(),
        pdfFile: pdfFileName,
      },
    });
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ message: 'Error generating invoice' });
  }
};

/**
 * Get all invoices for logged-in user
 * @route   GET /api/invoices
 * @access  Private
 */
const getAllInvoices = async (req, res) => {
  try {
    const userId = req.userId;

    const invoices = await Invoice.find({ userId })
      .populate('projectId', 'name clientId')
      .populate({
        path: 'projectId',
        populate: {
          path: 'clientId',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      message: 'Invoices retrieved successfully',
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

/**
 * Get a single invoice by ID
 * @route   GET /api/invoices/:id
 * @access  Private
 */
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const invoice = await Invoice.findOne({ _id: id, userId })
      .populate('projectId', 'name clientId')
      .populate({
        path: 'projectId',
        populate: {
          path: 'clientId',
          select: 'name email company',
        },
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({
      message: 'Invoice retrieved successfully',
      invoice,
    });
  } catch (error) {
    console.error('Get invoice by ID error:', error);
    res.status(500).json({ message: 'Error fetching invoice' });
  }
};

/**
 * Download invoice PDF
 * @route   GET /api/invoices/:id/download
 * @access  Private
 */
const downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify invoice belongs to this user
    const invoice = await Invoice.findOne({ _id: id, userId });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const fileName = `invoice_${id}.pdf`;
    const filePath = path.join(invoiceDir, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'PDF file not found' });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // Stream file
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    stream.on('error', (err) => {
      console.error('PDF download error:', err);
      res.status(500).json({ message: 'Error downloading PDF' });
    });
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({ message: 'Error downloading invoice' });
  }
};

module.exports = {
  generateInvoice,
  getAllInvoices,
  getInvoiceById,
  downloadInvoicePDF,
};
