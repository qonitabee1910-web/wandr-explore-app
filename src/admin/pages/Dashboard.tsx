/**
 * Dashboard Analytics Page
 */

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Navigation2,
  DollarSign,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats, AnalyticsData } from '../types';
import './Dashboard.css';

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to real-time updates
    const subscription = dashboardService.subscribeToStats((updatedStats) => {
      setStats(updatedStats);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats
      const statsResponse = await dashboardService.getStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        throw new Error(statsResponse.error || 'Failed to fetch stats');
      }

      // Fetch analytics data
      const analyticsResponse = await dashboardService.getAnalyticsData(7);
      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalyticsData(analyticsResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCard[] = stats
    ? [
        {
          icon: <Navigation2 size={24} />,
          label: 'Total Rides',
          value: stats.totalRides.toLocaleString(),
          change: 12.5,
          trend: 'up',
        },
        {
          icon: <Users size={24} />,
          label: 'Active Users',
          value: stats.activeUsers.toLocaleString(),
          change: 8.2,
          trend: 'up',
        },
        {
          icon: <DollarSign size={24} />,
          label: 'Total Revenue',
          value: `Rp ${(stats.totalRevenue / 1000000).toFixed(2)}M`,
          change: 23.1,
          trend: 'up',
        },
        {
          icon: <CheckCircle2 size={24} />,
          label: 'Completed Rides',
          value: stats.completedRides.toLocaleString(),
          change: 5.3,
          trend: 'up',
        },
      ]
    : [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const chartData = [
    {
      name: 'Completed',
      value: stats?.completedRides || 0,
      percentage: stats ? ((stats.completedRides / stats.totalRides) * 100).toFixed(1) : 0,
    },
    {
      name: 'Canceled',
      value: stats?.canceledRides || 0,
      percentage: stats ? ((stats.canceledRides / stats.totalRides) * 100).toFixed(1) : 0,
    },
    {
      name: 'Pending',
      value: stats ? stats.totalRides - stats.completedRides - stats.canceledRides : 0,
      percentage: stats
        ? (((stats.totalRides - stats.completedRides - stats.canceledRides) / stats.totalRides) * 100).toFixed(1)
        : 0,
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="dashboard-header">
        <h1>Dashboard Analytics</h1>
        <p className="subtitle">Welcome back! Here's your business overview.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="alert-action">
            Try Again
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{card.label}</p>
              <h3 className="stat-value">{card.value}</h3>
              {card.change && (
                <div className={`stat-change ${card.trend}`}>
                  <TrendingUp size={16} />
                  <span>{card.change}% from last week</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Revenue & Rides Chart */}
        <div className="chart-card">
          <h2>Revenue & Rides Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="rides"
                stroke="#3b82f6"
                name="Rides"
                dot={{ fill: '#3b82f6', r: 5 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                name="Revenue"
                dot={{ fill: '#10b981', r: 5 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ride Status Distribution */}
        <div className="chart-card">
          <h2>Ride Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <h2>Key Performance Indicators</h2>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Pending Approvals</span>
            <span className="metric-value" style={{ color: '#f59e0b' }}>
              {stats?.pendingApprovals || 0}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total Drivers</span>
            <span className="metric-value" style={{ color: '#3b82f6' }}>
              {stats?.totalDrivers || 0}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total Shuttles</span>
            <span className="metric-value" style={{ color: '#8b5cf6' }}>
              {stats?.totalShuttles || 0}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Canceled Rate</span>
            <span className="metric-value" style={{ color: '#ef4444' }}>
              {stats ? ((stats.canceledRides / stats.totalRides) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="dashboard-actions">
        <button onClick={fetchDashboardData} className="btn btn-primary">
          <Clock size={18} />
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
