/**
 * Promos Management Page
 * Create and manage promotional codes
 */

import React, { useEffect, useState } from 'react';
import { promoService } from '../services/promoService';
import { Promo } from '../types/index';

const Promos: React.FC = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await promoService.getPromos();
      setPromos(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch promos';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Promo Management</h1>
        <button
          onClick={() => console.log('Create new promo')}
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
          + Create Promo
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
          <button onClick={fetchPromos} style={{ marginLeft: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading promos...
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Code</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Value</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Used</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                    No promos found
                  </td>
                </tr>
              ) : (
                promos.map((promo) => (
                  <tr key={promo.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#3b82f6' }}>{promo.code}</td>
                    <td style={{ padding: '12px' }}>{promo.name}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: '#fce7f3',
                          color: '#be185d',
                        }}
                      >
                        {promo.promo_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {promo.promo_type === 'percentage' ? `${promo.value}%` : `IDR ${promo.value}`}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {promo.used_count}/{promo.usage_limit || '∞'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor:
                            promo.status === 'active'
                              ? '#d1fae5'
                              : promo.status === 'inactive'
                              ? '#fee2e2'
                              : '#fef3c7',
                          color:
                            promo.status === 'active'
                              ? '#065f46'
                              : promo.status === 'inactive'
                              ? '#991b1b'
                              : '#92400e',
                        }}
                      >
                        {promo.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => console.log('Edit promo:', promo.id)}
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
  );
};

export default Promos;
