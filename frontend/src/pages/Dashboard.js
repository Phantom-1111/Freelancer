import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import api from '../utils/api';
import '../styles/dashboard.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalHours: 0,
    totalEarnings: 0,
    clientCount: 0,
    projectCount: 0,
  });
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data
        const [timeLogs, invoices, clients, projects] = await Promise.all([
          api.get('/timelogs'),
          api.get('/invoices'),
          api.get('/clients'),
          api.get('/projects'),
        ]);

        // Calculate stats
        const totalHours = timeLogs.data.timeLogs.reduce(
          (sum, log) => sum + log.durationHours,
          0
        );

        const totalEarnings = invoices.data.invoices.reduce(
          (sum, inv) => sum + inv.totalAmount,
          0
        );

        setStats({
          totalHours: parseFloat(totalHours.toFixed(2)),
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          clientCount: clients.data.count,
          projectCount: projects.data.count,
        });

        // Prepare chart data - Hours per project
        const projectHours = {};
        const projectEarnings = {};

        timeLogs.data.timeLogs.forEach((log) => {
          const projectName = log.projectId.name;
          projectHours[projectName] = (projectHours[projectName] || 0) + log.durationHours;
        });

        invoices.data.invoices.forEach((inv) => {
          const projectName = inv.projectId.name;
          projectEarnings[projectName] = (projectEarnings[projectName] || 0) + inv.totalAmount;
        });

        const projectLabels = Object.keys(projectHours);

        setChartData({
          hoursChart: {
            labels: projectLabels,
            datasets: [
              {
                label: 'Hours Worked',
                data: projectLabels.map((name) => projectHours[name]),
                backgroundColor: '#3498db',
                borderColor: '#2c3e50',
                borderWidth: 1,
              },
            ],
          },
          earningsChart: {
            labels: projectLabels,
            datasets: [
              {
                label: 'Earnings',
                data: projectLabels.map((name) => projectEarnings[name]),
                backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6']
                  .slice(0, projectLabels.length),
              },
            ],
          },
        });

        setError('');
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-container"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Hours</h3>
          <p className="stat-value">{stats.totalHours.toFixed(2)} hrs</p>
        </div>

        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p className="stat-value">${stats.totalEarnings.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <h3>Clients</h3>
          <p className="stat-value">{stats.clientCount}</p>
        </div>

        <div className="stat-card">
          <h3>Projects</h3>
          <p className="stat-value">{stats.projectCount}</p>
        </div>
      </div>

      {/* Charts */}
      {chartData && (
        <div className="charts-grid">
          <div className="chart-box">
            <h3>Hours per Project</h3>
            <Bar
              data={chartData.hoursChart}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>

          <div className="chart-box">
            <h3>Earnings Distribution</h3>
            <Pie
              data={chartData.earningsChart}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
