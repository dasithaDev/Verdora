import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  User,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  AlertCircle,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { login, register, logout } from '../services/authService';
import './RouteGuard.css';

/**
 * Loading state indicator for session verification.
 */
function VerifyingSessionScreen({ message = 'Verifying security credentials...' }) {
  return (
    <div className="vrd-guard-root">
      <div className="vrd-guard-card vrd-guard-loading-card">
        <img src="/images/logo.png" alt="Verdora Logo" className="vrd-guard-brand-logo" />
        <RefreshCw size={32} className="vrd-spin vrd-guard-icon-spin" />
        <h3 className="vrd-guard-title" style={{ marginTop: '16px' }}>Verdora Sanctuary</h3>
        <p className="vrd-guard-desc">{message}</p>
      </div>
    </div>
  );
}

/**
 * Route Guard for Administrator routes (#admin).
 * Only users with role: 'admin' are permitted to access children.
 */
export function AdminGuard({
  currentUser,
  isAuthResolving,
  onAuthSuccess,
  onBackToCafe,
  onSwitchToProfile,
  onSignOut,
  children,
}) {
  const [email, setEmail] = useState('admin@verdora.local');
  const [password, setPassword] = useState('Admin123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (isAuthResolving) {
    return <VerifyingSessionScreen message="Verifying administrator security clearance... 🌿" />;
  }

  // Case 1: Permitted - User is authenticated and possesses the 'admin' role
  if (currentUser && currentUser.role === 'admin') {
    return <>{children}</>;
  }

  // Case 2: Forbidden (403) - User is authenticated, but is a regular customer or non-admin
  if (currentUser && currentUser.role !== 'admin') {
    const handleSwitchAccount = async () => {
      try {
        await logout();
      } catch {}
      if (onSignOut) onSignOut();
    };

    return (
      <div className="vrd-guard-root">
        <div className="vrd-guard-card vrd-guard-forbidden-card">
          <img src="/images/logo.png" alt="Verdora Logo" className="vrd-guard-brand-logo" />
          <div className="vrd-guard-icon-wrap forbidden">
            <ShieldAlert size={34} />
          </div>

          <span className="vrd-guard-badge forbidden">403 Forbidden</span>
          <h2 className="vrd-guard-title">Administrator Privileges Required</h2>
          
          <p className="vrd-guard-desc">
            You are currently authenticated as <strong>{currentUser.name}</strong> ({currentUser.email}), with account role{' '}
            <span className="vrd-role-chip">{currentUser.role}</span>.
          </p>

          <div className="vrd-guard-notice">
            The Verdora Operations Console contains restricted kitchen orders, inventory controls, table allocation, and financial analytics. Only authorized administrators are permitted to enter.
          </div>

          <div className="vrd-guard-actions">
            <button
              type="button"
              className="vrd-guard-btn-primary"
              onClick={onBackToCafe}
            >
              <ArrowLeft size={16} />
              <span>Return to Cafe Home</span>
            </button>

            {onSwitchToProfile && (
              <button
                type="button"
                className="vrd-guard-btn-secondary"
                onClick={onSwitchToProfile}
              >
                <User size={16} />
                <span>Go to My Profile</span>
              </button>
            )}

            <button
              type="button"
              className="vrd-guard-btn-ghost"
              onClick={handleSwitchAccount}
            >
              <LogOut size={15} />
              <span>Sign In with Admin Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Unauthorized (401) - User is a guest / not logged in
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await login({ email: email.trim(), password });
      const user = res?.data?.user || res?.data;

      if (!user) {
        throw new Error('Malformed authentication response from server.');
      }

      if (user.role !== 'admin') {
        setErrorMsg(`Authenticated as ${user.email}, but this account has role: '${user.role}'. Administrator credentials required.`);
        if (onAuthSuccess) onAuthSuccess(user);
        return;
      }

      if (onAuthSuccess) onAuthSuccess(user);
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err.message || 'Invalid administrator credentials.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vrd-guard-root">
      <div className="vrd-guard-card">
        <img src="/images/logo.png" alt="Verdora Logo" className="vrd-guard-brand-logo" />
        <div className="vrd-guard-icon-wrap admin">
          <ShieldCheck size={34} />
        </div>

        <span className="vrd-guard-badge admin">Secure Operations Portal</span>
        <h2 className="vrd-guard-title">Administrator Authentication</h2>
        <p className="vrd-guard-desc">
          Sign in with authorized administrator credentials to manage live kitchen orders, table allocation, dish catalogs, and cafe analytics.
        </p>

        {errorMsg && (
          <div className="vrd-guard-alert error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="vrd-guard-form">
          <div className="vrd-guard-field">
            <label>Admin Email</label>
            <div className="vrd-guard-input-wrap">
              <Mail size={16} className="vrd-guard-field-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@verdora.local"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="vrd-guard-field">
            <label>Security Password</label>
            <div className="vrd-guard-input-wrap">
              <Lock size={16} className="vrd-guard-field-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="vrd-guard-form-footer">
            <button
              type="submit"
              className="vrd-guard-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="vrd-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Authenticate as Admin</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="vrd-guard-btn-ghost"
              onClick={onBackToCafe}
              disabled={isLoading}
            >
              <ArrowLeft size={15} />
              <span>Return to Cafe Home</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Route Guard for Member routes (#profile).
 * Only authenticated users (any role) are permitted to access their profile.
 */
export function MemberGuard({
  currentUser,
  isAuthResolving,
  onAuthSuccess,
  onBackToCafe,
  children,
}) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('customer@verdora.local');
  const [password, setPassword] = useState('Customer123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (isAuthResolving) {
    return <VerifyingSessionScreen message="Verifying member sanctuary session... 🌿" />;
  }

  // Authenticated - User is logged in
  if (currentUser) {
    return <>{children}</>;
  }

  // Unauthorized - Guest requires authentication to view member sanctuary
  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      let res;
      if (isRegisterMode) {
        if (!name.trim()) throw new Error('Please enter your full name.');
        res = await register({ name: name.trim(), email: email.trim(), password });
      } else {
        res = await login({ email: email.trim(), password });
      }

      const user = res?.data?.user || res?.data;
      if (!user) throw new Error('Authentication response did not contain user data.');

      if (onAuthSuccess) onAuthSuccess(user);
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err.message || 'Authentication failed. Please verify your credentials.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vrd-guard-root">
      <div className="vrd-guard-card">
        <img src="/images/logo.png" alt="Verdora Logo" className="vrd-guard-brand-logo" />
        <div className="vrd-guard-icon-wrap member">
          <Sparkles size={34} />
        </div>

        <span className="vrd-guard-badge member">Member Sanctuary</span>
        <h2 className="vrd-guard-title">
          {isRegisterMode ? 'Create Your Member Account' : 'Member Sign In Required'}
        </h2>
        <p className="vrd-guard-desc">
          Sign in to view and customize your wellness profile, dietary preferences, avatar, table reservations, and order history.
        </p>

        {errorMsg && (
          <div className="vrd-guard-alert error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="vrd-guard-form">
          {isRegisterMode && (
            <div className="vrd-guard-field">
              <label>Full Name</label>
              <div className="vrd-guard-input-wrap">
                <User size={16} className="vrd-guard-field-icon" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kasun Fernando"
                />
              </div>
            </div>
          )}

          <div className="vrd-guard-field">
            <label>Email Address</label>
            <div className="vrd-guard-input-wrap">
              <Mail size={16} className="vrd-guard-field-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@verdora.local"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="vrd-guard-field">
            <label>Password</label>
            <div className="vrd-guard-input-wrap">
              <Lock size={16} className="vrd-guard-field-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          <div className="vrd-guard-form-footer">
            <button
              type="submit"
              className="vrd-guard-btn-primary member"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="vrd-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{isRegisterMode ? 'Register & Enter Profile' : 'Sign In to Profile'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="vrd-guard-toggle-mode-btn"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg(null);
              }}
            >
              {isRegisterMode
                ? 'Already a member? Sign in instead'
                : 'Need a wellness account? Register now'}
            </button>

            <button
              type="button"
              className="vrd-guard-btn-ghost"
              onClick={onBackToCafe}
              disabled={isLoading}
            >
              <ArrowLeft size={15} />
              <span>Return to Cafe Home</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
