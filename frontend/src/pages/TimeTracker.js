import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/timetracker.css';

const TimeTracker = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [timerSessionId, setTimerSessionId] = useState(null);
  const [timerStatus, setTimerStatus] = useState('stopped'); // running, paused, stopped
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionAccumulatedSeconds, setSessionAccumulatedSeconds] = useState(0);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    projectId: '',
    startTime: '',
    endTime: '',
  });

  // Fetch projects and restore active timer state
  useEffect(() => {
    fetchProjects();
    checkActiveTimer();
  }, []);

  const checkActiveTimer = () => {
    const activeTimer = localStorage.getItem('activeTimer');
    if (activeTimer) {
      const { projectId, sessionId, status, startTime: storedStartTime, accumulatedSeconds } = JSON.parse(activeTimer);

      setSelectedProjectId(projectId);
      setTimerSessionId(sessionId);
      setTimerStatus(status);
      setSessionAccumulatedSeconds(accumulatedSeconds || 0);

      if (status === 'running' && storedStartTime) {
        setSessionStartTime(new Date(storedStartTime));
      }

      if (status !== 'running') {
        setElapsedSeconds(accumulatedSeconds || 0);
      }
    }
  };

  // Timer interval update when running
  useEffect(() => {
    let interval;
    if (timerStatus === 'running' && sessionStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const sessionSeconds = Math.floor((now - new Date(sessionStartTime)) / 1000);
        setElapsedSeconds(sessionAccumulatedSeconds + sessionSeconds);
      }, 1000);
    } else {
      setElapsedSeconds(sessionAccumulatedSeconds);
    }

    return () => clearInterval(interval);
  }, [timerStatus, sessionStartTime, sessionAccumulatedSeconds]);

  // Fetch time logs when selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchTimeLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const updateLocalStorage = (data) => {
    localStorage.setItem('activeTimer', JSON.stringify(data));
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('activeTimer');
  };

  const startTimer = async () => {
    if (!selectedProjectId) {
      alert('Please select a project first');
      return;
    }

    try {
      const response = await api.post('/timelogs/start', {
        projectId: selectedProjectId,
      });

      const timeLog = response.data.timeLog;

      setTimerSessionId(timeLog._id);
      setTimerStatus('running');
      setSessionStartTime(new Date(timeLog.startTime));
      setSessionAccumulatedSeconds(0);
      setElapsedSeconds(0);

      updateLocalStorage({
        sessionId: timeLog._id,
        projectId: selectedProjectId,
        status: 'running',
        startTime: timeLog.startTime,
        accumulatedSeconds: 0,
      });

      fetchTimeLogs();
    } catch (err) {
      console.error(err);
      alert('Error starting timer');
    }
  };

  const pauseTimer = async () => {
    if (!timerSessionId) {
      alert('No timer session active');
      return;
    }

    try {
      console.log('Pausing timer with ID:', timerSessionId);
      const response = await api.put(`/timelogs/${timerSessionId}/pause`);
      const timeLog = response.data.timeLog;

      setTimerStatus('paused');
      setSessionStartTime(null);
      setSessionAccumulatedSeconds(Math.round(timeLog.totalDuration * 60));
      setElapsedSeconds(Math.round(timeLog.totalDuration * 60));

      updateLocalStorage({
        sessionId: timerSessionId,
        projectId: selectedProjectId,
        status: 'paused',
        accumulatedSeconds: Math.round(timeLog.totalDuration * 60),
      });

      await fetchTimeLogs();
    } catch (err) {
      console.error('Error pausing timer:', err.response?.data || err.message);
      alert('Error pausing timer: ' + (err.response?.data?.message || err.message));
    }
  };

  const resumeTimer = async () => {
    if (!timerSessionId) {
      alert('No timer session to resume');
      return;
    }

    try {
      console.log('Resuming timer with ID:', timerSessionId);
      const response = await api.put(`/timelogs/${timerSessionId}/resume`);
      const timeLog = response.data.timeLog;

      setTimerStatus('running');
      setSessionStartTime(new Date(timeLog.startTime));

      updateLocalStorage({
        sessionId: timerSessionId,
        projectId: selectedProjectId,
        status: 'running',
        startTime: timeLog.startTime,
        accumulatedSeconds: Math.round(timeLog.totalDuration * 60),
      });

      await fetchTimeLogs();
    } catch (err) {
      console.error('Error resuming timer:', err.response?.data || err.message);
      alert('Error resuming timer: ' + (err.response?.data?.message || err.message));
    }
  };

  const stopTimer = async () => {
    if (!timerSessionId) {
      alert('No timer session to stop');
      return;
    }

    const description = window.prompt('Enter work description (optional)');
    
    // If user clicked Cancel on the prompt
    if (description === null) {
      return;
    }

    try {
      console.log('Stopping timer with ID:', timerSessionId);
      const response = await api.put(`/timelogs/${timerSessionId}/stop`, {
        description: description || '',
      });
      
      console.log('Stop timer response:', response.data);

      setTimerStatus('stopped');
      setTimerSessionId(null);
      setSessionStartTime(null);
      setSessionAccumulatedSeconds(0);
      setElapsedSeconds(0);

      clearLocalStorage();
      await fetchTimeLogs();

      alert('Timer stopped and saved successfully');
    } catch (err) {
      console.error('Error stopping timer:', err.response?.data || err.message);
      alert('Error stopping timer: ' + (err.response?.data?.message || err.message));
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
            disabled={timerStatus === 'running'}
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
          {timerStatus === 'stopped' && (
            <button onClick={startTimer} className="btn-start">
              Start
            </button>
          )}

          {timerStatus === 'running' && (
            <>
              <button onClick={pauseTimer} className="btn-pause">
                Pause
              </button>
              <button onClick={stopTimer} className="btn-stop">
                Stop
              </button>
            </>
          )}

          {timerStatus === 'paused' && (
            <>
              <button onClick={resumeTimer} className="btn-resume">
                Resume
              </button>
              <button onClick={stopTimer} className="btn-stop">
                Stop
              </button>
            </>
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
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {timeLogs.map((log) => (
                <tr key={log._id}>
                  <td>{log.startTime ? new Date(log.startTime).toLocaleString() : '-'}</td>
                  <td>{log.endTime ? new Date(log.endTime).toLocaleString() : '-'}</td>
                  <td>{log.durationHours ? log.durationHours.toFixed(2) : '0.00'}</td>
                  <td>{log.status || 'stopped'}</td>
                  <td>{log.description || '-'}</td>
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
