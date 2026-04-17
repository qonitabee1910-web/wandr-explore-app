/**
 * Settings Page
 * Configure payment gateways, email, and app settings
 */

import React, { useEffect, useState } from 'react';
import { settingsService } from '../services/settingsService';
import { AppSettings } from '../types/index';
import { ProtectedAdminPage } from '../context/AdminContext';

const Settings: React.FC = () => {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getAppSettings();
      setAppSettings(data.data || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch settings';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedAdminPage>
      <div style={{ padding: '24px' }}>
        <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '600' }}>Settings</h1>

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
          <button onClick={fetchSettings} style={{ marginLeft: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading settings...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
          {/* General Settings */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>General Settings</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                App Name
              </label>
              <input
                type="text"
                value={appSettings?.app_name || ''}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Version
              </label>
              <input
                type="text"
                value={appSettings?.app_version || ''}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
            <button
              onClick={() => console.log('Update general settings')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Save Changes
            </button>
          </div>

          {/* Pricing Settings */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Pricing Settings</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Currency
              </label>
              <input
                type="text"
                value={appSettings?.currency || 'IDR'}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Max Surge Multiplier
              </label>
              <input
                type="number"
                value={appSettings?.max_surge_multiplier || 3}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
            <button
              onClick={() => console.log('Update pricing settings')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Save Changes
            </button>
          </div>

          {/* Payment Configuration */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Payment Gateway</h2>
            <p style={{ marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
              Configure payment processors for handling transactions.
            </p>
            <button
              onClick={() => console.log('Configure payment gateway')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Configure
            </button>
          </div>

          {/* Email Configuration */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Email Settings</h2>
            <p style={{ marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
              Set up SMTP configuration for sending emails.
            </p>
            <button
              onClick={() => console.log('Configure email')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Configure
            </button>
          </div>

          {/* Maintenance Mode */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Maintenance</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={appSettings?.maintenance_mode || false}
                  readOnly
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Maintenance Mode</span>
              </label>
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                When enabled, only admins can access the application.
              </p>
            </div>
            <button
              onClick={() => console.log('Toggle maintenance mode')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Toggle
            </button>
          </div>

          {/* Notification Templates */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Notifications</h2>
            <p style={{ marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
              Manage email templates for system notifications.
            </p>
            <button
              onClick={() => console.log('Manage notification templates')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Manage Templates
            </button>
          </div>
        </div>
      )}
      </div>
    </ProtectedAdminPage>
  );
};

export default Settings;
