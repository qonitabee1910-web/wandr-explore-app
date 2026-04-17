/**
 * Dashboard Utilities
 * Helper functions for date handling, data export, and calculations
 */

import { AnalyticsData, DashboardStats } from '../types';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

/**
 * Generate predefined date ranges
 */
export const dateRangeOptions = {
  today: (now: Date = new Date()): DateRange => ({
    startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    label: 'Today',
  }),

  yesterday: (now: Date = new Date()): DateRange => {
    const start = new Date(now);
    start.setDate(now.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return {
      startDate: start,
      endDate: end,
      label: 'Yesterday',
    };
  },

  last7Days: (now: Date = new Date()): DateRange => ({
    startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    endDate: now,
    label: 'Last 7 days',
  }),

  last30Days: (now: Date = new Date()): DateRange => ({
    startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    endDate: now,
    label: 'Last 30 days',
  }),

  thisMonth: (now: Date = new Date()): DateRange => ({
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    label: 'This month',
  }),

  lastMonth: (now: Date = new Date()): DateRange => {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      startDate: start,
      endDate: end,
      label: 'Last month',
    };
  },

  thisYear: (now: Date = new Date()): DateRange => ({
    startDate: new Date(now.getFullYear(), 0, 1),
    endDate: new Date(now.getFullYear(), 11, 31),
    label: 'This year',
  }),
};

/**
 * Format date for display
 */
export const formatDateDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date for API requests (ISO string)
 */
export const formatDateISO = (date: Date): string => {
  return date.toISOString();
};

/**
 * Calculate trend between two values
 */
export const calculateTrend = (current: number, previous: number): { value: number; direction: 'up' | 'down' | 'stable' } => {
  if (previous === 0) {
    return { value: 0, direction: 'stable' };
  }
  const percentChange = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(percentChange),
    direction: percentChange > 2 ? 'up' : percentChange < -2 ? 'down' : 'stable',
  };
};

/**
 * Format currency (IDR)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format numbers with thousand separators
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Detect anomalies in analytics data
 * Uses simple Z-score method
 */
export const detectAnomalies = (data: AnalyticsData[], threshold: number = 2): number[] => {
  if (data.length < 2) return [];

  const values = data.map((d) => d.rides);
  const mean = values.reduce((a, b) => a + b) / values.length;
  const std = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2)) / values.length);

  if (std === 0) return [];

  return data
    .map((d, i) => {
      const zScore = Math.abs((d.rides - mean) / std);
      return zScore > threshold ? i : -1;
    })
    .filter((i) => i !== -1);
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value || '').replace(/"/g, '""');
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export analytics data to CSV
 */
export const exportAnalyticsToCSV = (
  data: AnalyticsData[],
  stats: DashboardStats | null,
  dateRange: DateRange
): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `dashboard-analytics-${dateRange.label.replace(/\s+/g, '-')}-${timestamp}`;

  // Prepare analytics data
  const analyticsRows = data.map((item) => ({
    Date: item.date,
    Rides: item.rides,
    Revenue: item.revenue,
    'Avg Fare': item.revenue / (item.rides || 1),
  }));

  // Add stats summary
  const summaryRows = stats
    ? [
        {},
        { Date: 'SUMMARY' },
        { Date: 'Total Rides', Rides: stats.totalRides },
        { Date: 'Completed Rides', Rides: stats.completedRides },
        { Date: 'Canceled Rides', Rides: stats.canceledRides },
        { Date: 'Total Revenue', Revenue: stats.totalRevenue },
        { Date: 'Active Users', Rides: stats.activeUsers },
        { Date: 'Total Drivers', Rides: stats.totalDrivers },
        { Date: 'Pending Approvals', Rides: stats.pendingApprovals },
      ]
    : [];

  exportToCSV([...analyticsRows, ...summaryRows], filename);
};

/**
 * Group analytics data by time period
 */
export const groupAnalyticsByPeriod = (data: AnalyticsData[], period: 'day' | 'week' | 'month'): AnalyticsData[] => {
  if (data.length === 0) return [];

  const grouped: { [key: string]: AnalyticsData } = {};

  data.forEach((item) => {
    const date = new Date(item.date);
    let key: string;

    if (period === 'day') {
      key = item.date;
    } else if (period === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      // month
      key = item.date.substring(0, 7);
    }

    if (!grouped[key]) {
      grouped[key] = { date: key, rides: 0, revenue: 0, users: 0, shuttles: 0 };
    }

    grouped[key].rides += item.rides;
    grouped[key].revenue += item.revenue;
    grouped[key].users += item.users ?? 0;
    grouped[key].shuttles += item.shuttles ?? 0;
  });

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Calculate metrics summary
 */
export const calculateMetricsSummary = (
  data: AnalyticsData[]
): {
  totalRides: number;
  totalRevenue: number;
  avgRidesPerDay: number;
  avgRevenuePerDay: number;
  peakDay: { date: string; rides: number };
} => {
  const totalRides = data.reduce((sum, item) => sum + item.rides, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgRidesPerDay = data.length > 0 ? totalRides / data.length : 0;
  const avgRevenuePerDay = data.length > 0 ? totalRevenue / data.length : 0;

  let peakDay = data[0] || { date: 'N/A', rides: 0 };
  data.forEach((item) => {
    if (item.rides > peakDay.rides) {
      peakDay = item;
    }
  });

  return {
    totalRides,
    totalRevenue,
    avgRidesPerDay,
    avgRevenuePerDay,
    peakDay,
  };
};
