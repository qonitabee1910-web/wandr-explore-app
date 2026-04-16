/**
 * Rides Monitoring Page
 * Monitor and track active and completed rides
 */

import React, { useEffect, useState } from 'react';
import { rideService } from '../services/rideService';
import { Ride } from '../types/index';

const Rides: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rideService.getRides();
      setRides(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rides';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '600' }}>
        Ride Monitoring
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
          <button onClick={fetchRides} style={{ marginLeft: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading rides...
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Ride ID</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>User</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Driver</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Fare</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rides.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                    No rides found
                  </td>
                </tr>
              ) : (
                rides.map((ride) => (
                  <tr key={ride.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontSize: '12px' }}>{ride.id.slice(0, 8)}</td>
                    <td style={{ padding: '12px' }}>{ride.user_id.slice(0, 8)}</td>
                    <td style={{ padding: '12px' }}>{ride.driver_id?.slice(0, 8) || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor:
                            ride.status === 'completed'
                              ? '#d1fae5'
                              : ride.status === 'active'
                              ? '#bfdbfe'
                              : '#fef3c7',
                          color:
                            ride.status === 'completed'
                              ? '#065f46'
                              : ride.status === 'active'
                              ? '#1e40af'
                              : '#92400e',
                        }}
                      >
                        {ride.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>IDR {ride.fare.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => console.log('View ride:', ride.id)}
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
                        Track
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
  );
};

export default Rides;
