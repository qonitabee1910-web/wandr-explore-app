/**
 * Ads Management Page
 * Create and manage advertisements and campaigns
 */

import React, { useEffect, useState } from 'react';
import { adsService } from '../services/adsService';
import { Advertisement } from '../types/index';

const Ads: React.FC = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adsService.getAds();
      setAds(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch ads';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Ads Management</h1>
        <button
          onClick={() => console.log('Create new ad')}
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
          + Create Ad
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
          <button onClick={fetchAds} style={{ marginLeft: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading ads...
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Placement</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Impressions</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Clicks</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>CTR</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                    No ads found
                  </td>
                </tr>
              ) : (
                ads.map((ad) => (
                  <tr key={ad.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>{ad.title}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                        }}
                      >
                        {ad.placement}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{ad.ad_type}</td>
                    <td style={{ padding: '12px' }}>{ad.impressions.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{ad.clicks.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{ad.ctr?.toFixed(2)}%</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: ad.status === 'active' ? '#d1fae5' : '#f3f4f6',
                          color: ad.status === 'active' ? '#065f46' : '#374151',
                        }}
                      >
                        {ad.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => console.log('View ad:', ad.id)}
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
  );
};

export default Ads;
