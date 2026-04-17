/**
 * Login Page
 * User and Admin login
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './Auth.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginType = searchParams.get('type') || 'user'; // 'user' or 'admin'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (authError) throw authError;

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Check if user is admin (if trying to login as admin)
      if (loginType === 'admin') {
        const { data: userRole, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (roleError || !userRole || !['admin', 'super_admin', 'moderator'].includes(userRole.role)) {
          await supabase.auth.signOut();
          throw new Error('Access denied. Admin credentials required.');
        }

        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const goToSignup = () => {
    navigate(`/signup?type=${loginType}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>PYU-GO</h1>
          <p className="auth-subtitle">
            {loginType === 'admin' ? 'Admin Login' : 'Login'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button onClick={goToSignup} className="link-button">
              Sign up
            </button>
          </p>
        </div>

        {loginType !== 'admin' && (
          <div className="auth-footer">
            <p>
              Admin?{' '}
              <button
                onClick={() => navigate('/login?type=admin')}
                className="link-button"
              >
                Login as admin
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
