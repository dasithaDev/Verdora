import React, { useState } from 'react';
import { ShieldCheck, Leaf, Lock } from 'lucide-react';
import { login as apiLogin, register as apiRegister } from '../services/authService';

/**
 * AdminGuard — renders an auth wall if the current user is not an admin.
 * Children are rendered only when currentUser.role === 'admin'.
 * While session is still resolving (isAuthResolving), shows a loading state.
 */
export function AdminGuard({ currentUser, isAuthResolving, onAuthSuccess, onBackToCafe, children }) {
  if (isAuthResolving) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Leaf size={24} color="#10b981" />
            <span style={styles.brand}>VERDORA</span>
          </div>
          <p style={styles.muted}>Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <AccessDeniedScreen
        reason={!currentUser ? 'unauthenticated' : 'forbidden'}
        onAuthSuccess={onAuthSuccess}
        onBackToCafe={onBackToCafe}
      />
    );
  }

  return children;
}

/**
 * MemberGuard — renders an auth wall if the user is not logged in.
 * Any authenticated role (customer, admin, staff) passes through.
 */
export function MemberGuard({ currentUser, isAuthResolving, onAuthSuccess, onBackToCafe, children }) {
  if (isAuthResolving) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Leaf size={24} color="#10b981" />
            <span style={styles.brand}>VERDORA</span>
          </div>
          <p style={styles.muted}>Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AccessDeniedScreen
        reason="unauthenticated"
        onAuthSuccess={onAuthSuccess}
        onBackToCafe={onBackToCafe}
      />
    );
  }

  return children;
}

/** Shared inline auth/denied screen used by both guards */
function AccessDeniedScreen({ reason, onAuthSuccess, onBackToCafe }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          {reason === 'forbidden'
            ? <ShieldCheck size={26} color="#cfa169" />
            : <Lock size={26} color="#10b981" />}
          <span style={styles.brand}>VERDORA</span>
        </div>
        <p style={styles.message}>
          {reason === 'forbidden'
            ? 'Admin access required. Your account does not have permission to view this page.'
            : 'Please sign in to continue.'}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button style={styles.btnBack} onClick={onBackToCafe}>← Back to Cafe</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0c120e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(207,161,105,0.2)',
    borderRadius: 12,
    padding: '40px 48px',
    textAlign: 'center',
    maxWidth: 440,
    width: '90vw',
  },
  brand: {
    color: '#e5cfb8',
    fontWeight: 800,
    fontSize: '1.1rem',
    letterSpacing: '0.1em',
    fontFamily: "'Outfit', sans-serif",
  },
  message: {
    color: '#8da191',
    fontSize: '0.92rem',
    lineHeight: 1.6,
    margin: 0,
  },
  muted: {
    color: '#8da191',
    fontSize: '0.88rem',
    margin: 0,
  },
  btnBack: {
    background: 'rgba(207,161,105,0.12)',
    border: '1px solid rgba(207,161,105,0.4)',
    color: '#cfa169',
    padding: '9px 22px',
    borderRadius: 24,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.82rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '0.04em',
  },
};
