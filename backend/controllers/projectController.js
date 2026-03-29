const Project = require('../models/Project');
const Client = require('../models/Client');

/**
 * Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res) => {
  try {
    const { name, clientId, hourlyRate, status } = req.body;
    const userId = req.userId;

    // Validation
    if (!name || !clientId || !hourlyRate) {
      return res.status(400).json({ message: 'Name, client, and hourly rate are required' });
    }

    // Verify client belongs to this user
    const client = await Client.findOne({ _id: clientId, userId });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Create project
    const project = new Project({
      name,
      clientId,
      hourlyRate,
      status: status || 'active',
      userId,
    });

    await project.save();

    // Populate client details
    await project.populate('clientId');

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
};

/**
 * Get all projects for logged-in user
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res) => {
  try {
    const userId = req.userId;

    const projects = await Project.find({ userId })
      .populate('clientId')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Projects retrieved successfully',
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

/**
 * Get a single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const project = await Project.findOne({ _id: id, userId }).populate('clientId');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project retrieved successfully',
      project,
    });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
};

/**
 * Update a project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, clientId, hourlyRate, status } = req.body;

    const project = await Project.findOne({ _id: id, userId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // If clientId is being updated, verify it belongs to this user
    if (clientId) {
      const client = await Client.findOne({ _id: clientId, userId });
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      project.clientId = clientId;
    }

    // Update fields
    if (name) project.name = name;
    if (hourlyRate !== undefined) project.hourlyRate = hourlyRate;
    if (status) project.status = status;

    await project.save();
    await project.populate('clientId');

    res.json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
};

/**
 * Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const project = await Project.findOneAndDelete({ _id: id, userId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project deleted successfully',
      project,
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
