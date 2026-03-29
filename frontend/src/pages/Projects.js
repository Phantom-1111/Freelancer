import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    hourlyRate: '',
    status: 'active',
  });

  // Fetch projects and clients
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectRes, clientRes] = await Promise.all([
        api.get('/projects'),
        api.get('/clients'),
      ]);
      setProjects(projectRes.data.projects);
      setClients(clientRes.data.clients);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, formData);
        alert('Project updated successfully');
      } else {
        await api.post('/projects', formData);
        alert('Project created successfully');
      }

      setFormData({ name: '', clientId: '', hourlyRate: '', status: 'active' });
      setEditingId(null);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving project');
    }
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      clientId: project.clientId._id,
      hourlyRate: project.hourlyRate,
      status: project.status,
    });
    setEditingId(project._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        alert('Project deleted successfully');
        fetchData();
      } catch (err) {
        alert('Error deleting project');
      }
    }
  };

  const handleAddNew = () => {
    setFormData({ name: '', clientId: '', hourlyRate: '', status: 'active' });
    setEditingId(null);
    setShowModal(true);
  };

  if (loading) {
    return <div className="projects-container"><p>Loading...</p></div>;
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects</h1>
        <button onClick={handleAddNew} className="btn-add">
          + New Project
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Projects List */}
      <div className="projects-list">
        {projects.length === 0 ? (
          <p>No projects yet. Create one to get started!</p>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client</th>
                <th>Hourly Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td>{project.name}</td>
                  <td>{project.clientId.name}</td>
                  <td>${project.hourlyRate.toFixed(2)}</td>
                  <td>
                    <span className={`status status-${project.status}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(project)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingId ? 'Edit Project' : 'New Project'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Project Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="clientId">Client *</label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="hourlyRate">Hourly Rate ($) *</label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
