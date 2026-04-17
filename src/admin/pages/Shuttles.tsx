/**
 * Shuttles Management Page
 * Manage shuttles, routes, and schedules
 */

import React, { useEffect, useState } from 'react';
import { shuttleService } from '../services/shuttleService';
import { Shuttle } from '../types/index';
import { ProtectedAdminPage } from '../context/AdminContext';

const Shuttles: React.FC = () => {
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShuttles();
  }, []);

  const fetchShuttles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shuttleService.getShuttles();
      setShuttles(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch shuttles';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedAdminPage>
      <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Shuttle Management</h1>
        <button
          onClick={() => console.log('Create new shuttle')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          + Add Shuttle
        </button>
      </div>

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
          <button onClick={fetchShuttles} style={{ marginLeft: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading shuttles...
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>License Plate</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Capacity</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shuttles.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                    No shuttles found
                  </td>
                </tr>
              ) : (
                shuttles.map((shuttle) => (
                  <tr key={shuttle.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>{shuttle.name}</td>
                    <td style={{ padding: '12px' }}>{shuttle.license_plate}</td>
                    <td style={{ padding: '12px' }}>{shuttle.capacity}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: shuttle.status === 'active' ? '#d1fae5' : '#f3f4f6',
                          color: shuttle.status === 'active' ? '#065f46' : '#374151',
                        }}
                      >
                        {shuttle.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => console.log('Edit shuttle:', shuttle.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginRight: '8px',
                        }}
                      >
                        Edit
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

export default Shuttles;
