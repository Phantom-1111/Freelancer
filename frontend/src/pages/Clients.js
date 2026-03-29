import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
  });

  // Fetch clients
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      setClients(response.data.clients);
    } catch (err) {
      setError('Failed to load clients');
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
        await api.put(`/clients/${editingId}`, formData);
        alert('Client updated successfully');
      } else {
        await api.post('/clients', formData);
        alert('Client added successfully');
      }

      setFormData({ name: '', email: '', company: '' });
      setEditingId(null);
      setShowModal(false);
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving client');
    }
  };

  const handleEdit = (client) => {
    setFormData({
      name: client.name,
      email: client.email,
      company: client.company,
    });
    setEditingId(client._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${id}`);
        alert('Client deleted successfully');
        fetchClients();
      } catch (err) {
        alert('Error deleting client');
      }
    }
  };

  const handleAddNew = () => {
    setFormData({ name: '', email: '', company: '' });
    setEditingId(null);
    setShowModal(true);
  };

  if (loading) {
    return <div className="clients-container"><p>Loading...</p></div>;
  }

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h1>Clients</h1>
        <button onClick={handleAddNew} className="btn-add">
          + Add Client
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Clients List */}
      <div className="clients-list">
        {clients.length === 0 ? (
          <p>No clients yet. Add one to get started!</p>
        ) : (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id}>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.company || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(client)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client._id)}
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
            <h2>{editingId ? 'Edit Client' : 'Add Client'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
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
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? 'Update' : 'Add'}
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

export default Clients;
