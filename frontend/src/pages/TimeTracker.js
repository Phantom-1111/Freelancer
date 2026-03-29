import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/timetracker.css';

const TimeTracker = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    projectId: '',
    startTime: '',
    endTime: '',
  });

  // Fetch projects
  useEffect(() => {
    fetchProjects();
    checkActiveTimer();
  }, []);

  // Check for active timer on mount
  const checkActiveTimer = () => {
    const activeTimer = localStorage.getItem('activeTimer');
    if (activeTimer) {
      const { projectId, startTime: storedStartTime } = JSON.parse(activeTimer);
      const start = new Date(storedStartTime);
      const now = new Date();
      const elapsed = Math.floor((now - start) / 1000);
      
      setSelectedProjectId(projectId);
      setIsRunning(true);
      setStartTime(start);
      setElapsedSeconds(elapsed);
    }
  };

  // Timer interval
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Fetch time logs when project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchTimeLogs();
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      setProjects(response.data.projects);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeLogs = async () => {
    if (!selectedProjectId) return;

    try {
      const response = await api.get(`/timelogs/project/${selectedProjectId}`);
      setTimeLogs(response.data.timeLogs);
    } catch (err) {
      console.error('Error fetching time logs:', err);
    }
  };

  const handleStartTimer = () => {
    if (!selectedProjectId) {
      alert('Please select a project first');
      return;
    }
    const start = new Date();
    setIsRunning(true);
    setStartTime(start);
    setElapsedSeconds(0);
    
    // Store in localStorage
    localStorage.setItem('activeTimer', JSON.stringify({
      projectId: selectedProjectId,
      startTime: start.toISOString(),
    }));
  };

  const handleStopTimer = async () => {
    setIsRunning(false);

    const endTime = new Date();
    const start = startTime;

    try {
      await api.post('/timelogs', {
        projectId: selectedProjectId,
        startTime: start.toISOString(),
        endTime: endTime.toISOString(),
      });

      alert('Time log saved successfully');
      setElapsedSeconds(0);
      setStartTime(null);
      localStorage.removeItem('activeTimer');
      fetchTimeLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving time log');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/timelogs', {
        projectId: manualFormData.projectId,
        startTime: new Date(manualFormData.startTime).toISOString(),
        endTime: new Date(manualFormData.endTime).toISOString(),
      });

      alert('Manual time log saved successfully');
      setManualFormData({ projectId: '', startTime: '', endTime: '' });
      setShowManualModal(false);
      fetchTimeLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving time log');
    }
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="timetracker-container"><p>Loading...</p></div>;
  }

  return (
    <div className="timetracker-container">
      <h1>Time Tracker</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Timer Section */}
      <div className="timer-section">
        <div className="project-selector">
          <label htmlFor="projectSelect">Select Project: </label>
          <select
            id="projectSelect"
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setElapsedSeconds(0);
            }}
            disabled={isRunning}
          >
            <option value="">Choose a project...</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name} - ${project.hourlyRate}/hr
              </option>
            ))}
          </select>
        </div>

        <div className="timer-display">
          <div className="time">{formatTime(elapsedSeconds)}</div>
        </div>

        <div className="timer-buttons">
          {!isRunning ? (
            <button onClick={handleStartTimer} className="btn-start">
              Start
            </button>
          ) : (
            <button onClick={handleStopTimer} className="btn-stop">
              Stop
            </button>
          )}
          <button
            onClick={() => setShowManualModal(true)}
            className="btn-manual"
          >
            Manual Entry
          </button>
        </div>
      </div>

      {/* Time Logs */}
      <div className="timelogs-section">
        <h2>Time Logs</h2>
        {timeLogs.length === 0 ? (
          <p>No time logs yet for this project.</p>
        ) : (
          <table className="timelogs-table">
            <thead>
              <tr>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Duration (hrs)</th>
              </tr>
            </thead>
            <tbody>
              {timeLogs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.startTime).toLocaleString()}</td>
                  <td>{new Date(log.endTime).toLocaleString()}</td>
                  <td>{log.durationHours.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Manual Time Entry</h2>

            <form onSubmit={handleManualSubmit}>
              <div className="form-group">
                <label htmlFor="manualProjectId">Project *</label>
                <select
                  id="manualProjectId"
                  name="projectId"
                  value={manualFormData.projectId}
                  onChange={handleManualChange}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startTime">Start Time *</label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={manualFormData.startTime}
                  onChange={handleManualChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Time *</label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={manualFormData.endTime}
                  onChange={handleManualChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
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

export default TimeTracker;
