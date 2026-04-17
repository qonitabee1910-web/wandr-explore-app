/**
 * Auth Callback Page
 * Handles Supabase auth callback (email confirmation, password reset, etc.)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import './Auth.css';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing authentication...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token from the URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || !type) {
          // This is expected if coming from base redirect
          navigate('/');
          return;
        }

        // Exchange the token for a session
        const { data, error: err } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as 'email' | 'recovery' | 'invite' | 'magiclink' | 'email_change',
        });

        if (err) {
          throw err;
        }

        if (data.user) {
          setMessage('Email verified successfully! Redirecting...');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        setError(message);
        setMessage('');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>PYU-GO</h1>
          <p className="auth-subtitle">Processing...</p>
        </div>

        {message && (
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            <p>{message}</p>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #e5e7eb', 
              borderTopColor: '#3b82f6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '16px auto'
            }} />
          </div>
        )}

        {error && (
          <div className="auth-error">
            <span>{error}</span>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              Redirecting to login...
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;
