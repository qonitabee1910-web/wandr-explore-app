/**
 * Enhanced Dashboard Analytics Page - Phase 2.1
 * Includes:
 * - Date range selector
 * - Chart interactions and drill-down
 * - CSV export functionality
 * - Real-time anomaly alerts
 * - Metrics summary
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
  Download,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats, AnalyticsData } from '../types';
import { ProtectedAdminPage } from '../context/AdminContext';
import { DateRangeSelector } from '../components/DateRangeSelector';
import {
  DateRange,
  dateRangeOptions,
  formatCurrency,
  formatNumber,
  exportAnalyticsToCSV,
  detectAnomalies,
  calculateMetricsSummary,
} from '../utils/dashboardUtils';
import './Dashboard.css';

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface AnomalyAlert {
  date: string;
  rides: number;
  severity: 'warning' | 'critical';
  message: string;
}

export const DashboardPage: React.FC = () => {
  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range state
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(dateRangeOptions.last7Days());

  // Interactive states
  const [selectedChartBar, setSelectedChartBar] = useState<string | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats for date range
      const statsResponse = await dashboardService.getStatsByDateRange(
        selectedDateRange.startDate,
        selectedDateRange.endDate
      );
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        throw new Error(statsResponse.error || 'Failed to fetch stats');
      }

      // Fetch analytics data for date range
      const analyticsResponse = await dashboardService.getAnalyticsDataByDateRange(
        selectedDateRange.startDate,
        selectedDateRange.endDate
      );
      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalyticsData(analyticsResponse.data);

        // Detect anomalies
        const anomalyIndices = detectAnomalies(analyticsResponse.data, 2);
        const detectedAnomalies: AnomalyAlert[] = anomalyIndices.map((idx) => {
          const data = analyticsResponse.data[idx];
          const avgRides =
            analyticsResponse.data.reduce((sum, d) => sum + d.rides, 0) /
            analyticsResponse.data.length;
          const deviation = ((data.rides - avgRides) / avgRides) * 100;

          return {
            date: data.date,
            rides: data.rides,
            severity: Math.abs(deviation) > 50 ? 'critical' : 'warning',
            message:
              deviation > 0
                ? `Spike: ${formatNumber(data.rides)} rides (${deviation.toFixed(0)}% above average)`
                : `Drop: ${formatNumber(data.rides)} rides (${Math.abs(deviation).toFixed(0)}% below average)`,
          };
        });

        setAnomalies(detectedAnomalies);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = dashboardService.subscribeToStats((updatedStats) => {
      setStats(updatedStats);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch when date range changes
  useEffect(() => {
    fetchDashboardData();
  }, [selectedDateRange]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      exportAnalyticsToCSV(analyticsData, stats, selectedDateRange);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const statCards: StatCard[] = stats
    ? [
        {
          icon: <Navigation2 size={24} />,
          label: 'Total Rides',
          value: formatNumber(stats.totalRides),
          change: 12.5,
          trend: 'up',
        },
        {
          icon: <Users size={24} />,
          label: 'Active Users',
          value: formatNumber(stats.activeUsers),
          change: 8.2,
          trend: 'up',
        },
        {
          icon: <DollarSign size={24} />,
          label: 'Total Revenue',
          value: formatCurrency(stats.totalRevenue),
          change: 23.1,
          trend: 'up',
        },
        {
          icon: <CheckCircle2 size={24} />,
          label: 'Completed Rides',
          value: formatNumber(stats.completedRides),
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
    <ProtectedAdminPage>
      <div className="dashboard-page">
        {/* Page Header with Controls */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Analytics</h1>
            <p className="subtitle">Welcome back! Here's your business overview.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <DateRangeSelector
              onRangeChange={(range) => setSelectedDateRange(range)}
              defaultRange="last7Days"
            />
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                opacity: isRefreshing ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isRefreshing) e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || analyticsData.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '6px',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                opacity: isExporting ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isExporting) e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
              }}
            >
              <Download size={16} />
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          </div>
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

        {/* Anomaly Alerts */}
        {showAnomalies && anomalies.length > 0 && (
          <div
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <AlertTriangle size={20} style={{ color: '#d97706', marginTop: '2px' }} />
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                    Anomalies Detected ({anomalies.length})
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#b45309' }}>
                    Unusual patterns found in your analytics data
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAnomalies(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b45309' }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '8px' }}>
              {anomalies.map((anomaly) => (
                <div
                  key={anomaly.date}
                  style={{
                    backgroundColor:
                      anomaly.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${anomaly.severity === 'critical' ? '#fca5a5' : '#fcd34d'}`,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '2px 6px',
                      backgroundColor:
                        anomaly.severity === 'critical' ? '#fee2e2' : '#fef08a',
                      color: anomaly.severity === 'critical' ? '#991b1b' : '#92400e',
                      borderRadius: '3px',
                      marginRight: '8px',
                    }}
                  >
                    {anomaly.severity.toUpperCase()}
                  </span>
                  <strong>{anomaly.date}:</strong> {anomaly.message}
                </div>
              ))}
            </div>
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
            <h2>Revenue & Rides Trend ({selectedDateRange.label})</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value) => [formatNumber(value as number), '']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rides"
                  stroke="#3b82f6"
                  name="Rides"
                  dot={{ fill: '#3b82f6', r: 5, cursor: 'pointer' }}
                  strokeWidth={2}
                  onClick={(data: any) => setSelectedChartBar(data.payload.date)}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  name="Revenue"
                  dot={{ fill: '#10b981', r: 5, cursor: 'pointer' }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
            {selectedChartBar && (
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                <strong>Selected Date:</strong> {selectedChartBar}
                {analyticsData.map((d) =>
                  d.date === selectedChartBar ? (
                    <div key={d.date} style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <span style={{ color: '#6b7280', fontSize: '13px' }}>Rides: </span>
                        <strong>{formatNumber(d.rides)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280', fontSize: '13px' }}>Revenue: </span>
                        <strong>{formatCurrency(d.revenue)}</strong>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}
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
        <h2>Metrics Summary ({selectedDateRange.label})</h2>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Total Rides</span>
            <span className="metric-value">{formatNumber(calculateMetricsSummary(analyticsData).totalRides)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total Revenue</span>
            <span className="metric-value">{formatCurrency(calculateMetricsSummary(analyticsData).totalRevenue)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Avg Rides/Day</span>
            <span className="metric-value">{formatNumber(Math.round(calculateMetricsSummary(analyticsData).avgRidesPerDay))}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Avg Revenue/Day</span>
            <span className="metric-value">{formatCurrency(calculateMetricsSummary(analyticsData).avgRevenuePerDay)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Peak Day</span>
            <span className="metric-value">{calculateMetricsSummary(analyticsData).peakDay.date}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>({formatNumber(calculateMetricsSummary(analyticsData).peakDay.rides)} rides)</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Pending Approvals</span>
            <span className="metric-value" style={{ color: '#f59e0b' }}>
              {stats?.pendingApprovals || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Additional KPIs */}
      <div className="key-metrics">
        <h2>Key Performance Indicators</h2>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Total Drivers</span>
            <span className="metric-value" style={{ color: '#3b82f6' }}>
              {formatNumber(stats?.totalDrivers || 0)}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total Shuttles</span>
            <span className="metric-value" style={{ color: '#8b5cf6' }}>
              {formatNumber(stats?.totalShuttles || 0)}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Canceled Rate</span>
            <span className="metric-value" style={{ color: '#ef4444' }}>
              {stats ? ((stats.canceledRides / stats.totalRides) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Completion Rate</span>
            <span className="metric-value" style={{ color: '#10b981' }}>
              {stats ? ((stats.completedRides / stats.totalRides) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DashboardPage;
