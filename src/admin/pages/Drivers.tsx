/**
 * Drivers Management Page
 * Manage driver applications, approvals, and status
 */

import React, { useEffect, useState } from 'react';
import { driverService } from '../services/driverService';
import { Driver, DriverFilter } from '../types/index';
import { ProtectedAdminPage } from '../context/AdminContext';

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await driverService.getDrivers();
      setDrivers(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch drivers';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedAdminPage>
      <div style={{ padding: '24px' }}>
        <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '600' }}>
          Driver Management
        </h1>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          {error}
          <button onClick={fetchDrivers} style={{ marginLeft: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading drivers...
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Rating</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                    No drivers found
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>{driver.name}</td>
                    <td style={{ padding: '12px' }}>{driver.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor:
                            driver.status === 'approved'
                              ? '#d1fae5'
                              : driver.status === 'pending'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            driver.status === 'approved'
                              ? '#065f46'
                              : driver.status === 'pending'
                              ? '#92400e'
                              : '#991b1b',
                        }}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>⭐ {driver.rating}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => console.log('View driver:', driver.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </ProtectedAdminPage>
  );
};

export default Drivers;
