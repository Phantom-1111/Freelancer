import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/invoices.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // Fetch invoices and projects
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoiceRes, projectRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/projects'),
      ]);
      setInvoices(invoiceRes.data.invoices);
      setProjects(projectRes.data.projects);
    } catch (err) {
      setError('Failed to load invoices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();

    if (!selectedProjectId) {
      alert('Please select a project');
      return;
    }

    try {
      setGeneratingInvoice(true);
      await api.post('/invoices/generate', {
        projectId: selectedProjectId,
      });

      alert('Invoice generated successfully');
      setSelectedProjectId('');
      setShowGenerateModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });

      // Create blob link element
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      alert('Error downloading PDF');
      console.error(err);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      await api.put(`/invoices/${invoiceId}/status`, { status: 'Paid' });
      alert('Invoice marked as Paid');
      fetchData();
    } catch (err) {
      alert('Error updating invoice status');
      console.error(err);
    }
  };

  const handleSendInvoice = async (invoiceId) => {
    try {
      await api.post(`/invoices/${invoiceId}/email`);
      alert('Invoice email sent successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending invoice email');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="invoices-container"><p>Loading...</p></div>;
  }

  return (
    <div className="invoices-container">
      <div className="invoices-header">
        <h1>Invoices</h1>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn-add"
        >
          + Generate Invoice
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Invoices List */}
      <div className="invoices-list">
        {invoices.length === 0 ? (
          <p>No invoices yet. Create one from your time logs!</p>
        ) : (
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Project</th>
                <th>Client</th>
                <th>Hours</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const status = invoice.status || 'Pending';
                const statusColor =
                  status === 'Paid' ? '#2ecc71' : status === 'Overdue' ? '#e74c3c' : '#f1c40f';

                // Handle null projectId (deleted project)
                if (!invoice.projectId) {
                  return null;
                }

                const projectName = invoice.projectId.name || 'Unknown Project';
                const clientName = invoice.projectId.clientId?.name || 'Unknown Client';

                return (
                  <tr key={invoice._id}>
                    <td>{invoice._id.substring(0, 8)}...</td>
                    <td>{projectName}</td>
                    <td>{clientName}</td>
                    <td>{invoice.totalHours.toFixed(2)}</td>
                    <td>${invoice.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: statusColor }}>
                        {status}
                      </span>
                    </td>
                    <td>{new Date(invoice.generatedDate).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleDownloadPDF(invoice._id)} className="btn-download">
                        Download PDF
                      </button>
                      <button onClick={() => handleMarkPaid(invoice._id)} className="btn-paid">
                        Mark as Paid
                      </button>
                      <button onClick={() => handleSendInvoice(invoice._id)} className="btn-email">
                        Send Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Generate Invoice Modal */}
      {showGenerateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Generate Invoice</h2>

            <form onSubmit={handleGenerateInvoice}>
              <div className="form-group">
                <label htmlFor="projectSelect">Select Project *</label>
                <select
                  id="projectSelect"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                >
                  <option value="">Choose a project...</option>
                  {projects.map((project) => {
                    const clientName = project.clientId?.name || 'Unknown Client';
                    return (
                      <option key={project._id} value={project._id}>
                        {project.name} ({clientName})
                      </option>
                    );
                  })}
                </select>
              </div>

              <p className="info-text">
                Invoice will be generated based on all time logs for the selected project.
              </p>

              <div className="modal-actions">
                <button
                  type="submit"
                  disabled={generatingInvoice}
                  className="btn-submit"
                >
                  {generatingInvoice ? 'Generating...' : 'Generate'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
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

export default Invoices;
