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
        const token = searchParams.get('token_hash') || searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || !type) {
          navigate('/');
          return;
        }

        const { data, error: err } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (err) throw err;

        if (data.user) {
          setMessage('Email verified! Redirecting...');
          setTimeout(() => navigate('/'), 1500);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setMessage('');
        setTimeout(() => navigate('/login'), 3000);
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
          <div style={{ textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="auth-error">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
