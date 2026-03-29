const Client = require('../models/Client');

/**
 * Create a new client
 * @route   POST /api/clients
 * @access  Private
 */
const createClient = async (req, res) => {
  try {
    const { name, email, company } = req.body;
    const userId = req.userId;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if client already exists for this user
    const existingClient = await Client.findOne({ email, userId });
    if (existingClient) {
      return res.status(400).json({ message: 'Client with this email already exists' });
    }

    // Create client
    const client = new Client({
      name,
      email,
      company: company || '',
      userId,
    });

    await client.save();

    res.status(201).json({
      message: 'Client created successfully',
      client,
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Error creating client' });
  }
};

/**
 * Get all clients for logged-in user
 * @route   GET /api/clients
 * @access  Private
 */
const getClients = async (req, res) => {
  try {
    const userId = req.userId;

    const clients = await Client.find({ userId }).sort({ createdAt: -1 });

    res.json({
      message: 'Clients retrieved successfully',
      count: clients.length,
      clients,
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Error fetching clients' });
  }
};

/**
 * Get a single client by ID
 * @route   GET /api/clients/:id
 * @access  Private
 */
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const client = await Client.findOne({ _id: id, userId });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({
      message: 'Client retrieved successfully',
      client,
    });
  } catch (error) {
    console.error('Get client by ID error:', error);
    res.status(500).json({ message: 'Error fetching client' });
  }
};

/**
 * Update a client
 * @route   PUT /api/clients/:id
 * @access  Private
 */
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, email, company } = req.body;

    const client = await Client.findOne({ _id: id, userId });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Update fields
    if (name) client.name = name;
    if (email) client.email = email;
    if (company !== undefined) client.company = company;

    await client.save();

    res.json({
      message: 'Client updated successfully',
      client,
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Error updating client' });
  }
};

/**
 * Delete a client
 * @route   DELETE /api/clients/:id
 * @access  Private
 */
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const client = await Client.findOneAndDelete({ _id: id, userId });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({
      message: 'Client deleted successfully',
      client,
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Error deleting client' });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
};
