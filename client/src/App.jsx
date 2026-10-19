import React, { useState, useEffect } from 'react';
import { checkHealth } from './services/api';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState(null);

  const fetchHealthStatus = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const result = await checkHealth();
      setHealthData(result.data);
    } catch (err) {
      setHealthError(err.message || 'Failed to reach API server');
      setHealthData(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <header
        style={{
          borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(11, 19, 14, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
          }}
        >
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '800',
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              }}
            >
              V
            </div>
            <div>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
                VERDORA
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                }}
              >
                Healthy Cafe & Kitchen
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
              Phase 2: Models &amp; DB Complete
            </span>

            {/* Live API Status Indicator */}
            <div
              className={`badge ${
                healthData?.status === 'UP' ? 'badge-success' : healthError ? 'badge-warning' : 'badge-info'
              }`}
              style={{ cursor: 'pointer' }}
              onClick={fetchHealthStatus}
              title="Click to refresh health check"
            >
              <span
                className={`status-dot ${healthData?.status === 'UP' ? 'active' : 'inactive'}`}
              ></span>
              {loadingHealth ? 'Checking API...' : healthData?.status === 'UP' ? 'API Online' : 'API Connecting...'}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flex: 1, padding: '48px 24px' }}>
        {/* Hero Section */}
        <section className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px' }}>
          <div
            className="badge badge-info"
            style={{ marginBottom: '16px', display: 'inline-flex', padding: '6px 16px' }}
          >
            EE4207 Web Application Development Mini Project
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: '800',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #ffffff 40%, #86efac 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Nourish Your Body with Verdora
          </h1>
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '32px',
            }}
          >
            A full-stack organic cafe ordering and table reservation platform built with{' '}
            <strong style={{ color: '#fff' }}>React, Express, and MongoDB</strong>. Designed for optimal nutrition,
            seamless guest reservations, and effortless management.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              id="btn-refresh-health"
              onClick={fetchHealthStatus}
              disabled={loadingHealth}
            >
              <span>{loadingHealth ? 'Querying Health API...' : 'Test /api/v1/health'}</span>
            </button>
            <a
              href="http://localhost:5000/api/v1/health"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              id="link-api-raw"
            >
              Open Raw API Endpoint &rarr;
            </a>
          </div>
        </section>

        {/* Phase 0 Architecture & Health Dashboard Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            marginBottom: '48px',
          }}
        >
          {/* Card 1: Live API Health Telemetry */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Live System Diagnostics</h2>
              <span className="badge badge-success">Phase 0 Core</span>
            </div>

            {loadingHealth && !healthData && (
              <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>
                Connecting to Express API at <code>http://localhost:5000/api/v1/health</code>...
              </div>
            )}

            {healthError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fca5a5',
                  marginBottom: '16px',
                }}
              >
                <strong>Connection Alert:</strong> {healthError}.
                <div style={{ fontSize: '0.85rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
                  Ensure the Express server is running on port 5000.
                </div>
              </div>
            )}

            {healthData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Service Name:</span>
                  <strong style={{ color: '#fff' }}>{healthData.service}</strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <span className="badge badge-success" style={{ margin: 0 }}>
                    {healthData.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Uptime:</span>
                  <span style={{ color: '#fff', fontFamily: 'monospace' }}>
                    {Math.round(healthData.uptime)} seconds
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>MongoDB Layer:</span>
                  <span
                    className={
                      healthData.database?.connected ? 'badge badge-success' : 'badge badge-warning'
                    }
                    style={{ margin: 0 }}
                  >
                    {healthData.database?.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Environment:</span>
                  <span style={{ color: '#fff', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                    {healthData.environment}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Phase 0 Exit Criteria Checklist */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Phase 0 Exit Criteria</h2>
              <span className="badge badge-info">Verified</span>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  ✓
                </span>
                <span>Vite + React client initialized with modern UI design tokens</span>
              </li>

              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  ✓
                </span>
                <span>Node.js / Express server configured with Helmet & CORS</span>
              </li>

              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  ✓
                </span>
                <span>Health endpoint (<code>GET /api/v1/health</code>) operational</span>
              </li>

              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  ✓
                </span>
                <span>Git initialized, <code>.gitignore</code> and <code>.env.example</code> configured</span>
              </li>

              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  ✓
                </span>
                <span>Phase 1 (Requirements) &amp; Phase 2 (MongoDB Models) complete ✓</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-glass)',
          background: 'rgba(11, 19, 14, 0.95)',
          padding: '24px 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
        }}
      >
        <div className="container">
          Verdora Healthy Cafe System &copy; 2026 &mdash; Built with React, Express &amp; MongoDB
        </div>
      </footer>
    </div>
  );
}
