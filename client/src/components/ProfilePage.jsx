import React, { useState } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
  LogOut,
  Save,
  KeyRound,
  Leaf,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { updateProfile, logout as apiLogout } from '../services/authService';
import './ProfilePage.css';

const DEFAULT_DIETARY_TAGS = [
  '100% Organic',
  'Cold-Pressed Juices',
  'Seed-Oil Free Kitchen',
  'Gluten-Free Preferent',
  'Oat & Nut Milk',
  'Artisan Pour-Over',
  'Low Carb / Keto',
  'Plant-Forward Superfoods',
];

export default function ProfilePage({
  currentUser,
  onBackToCafe,
  onSwitchToAdmin,
  onSwitchToOrders,
  onSwitchToBookings,
  onUserUpdate,
  onSignOut,
}) {
  // Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Lifestyle / Dietary Tags State (persisted locally)
  const [selectedTags, setSelectedTags] = useState(() => {
    try {
      const saved = localStorage.getItem('verdora_dietary_preferences');
      return saved ? JSON.parse(saved) : ['100% Organic', 'Seed-Oil Free Kitchen', 'Oat & Nut Milk'];
    } catch {
      return ['100% Organic', 'Seed-Oil Free Kitchen'];
    }
  });

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      try {
        localStorage.setItem('verdora_dietary_preferences', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Handle Name Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setProfileMessage({ type: 'error', text: 'Name must be at least 2 characters long.' });
      return;
    }

    try {
      setIsUpdatingName(true);
      setProfileMessage(null);
      const res = await updateProfile({ name: name.trim() });
      if (res?.data?.user) {
        if (onUserUpdate) onUserUpdate(res.data.user);
        setProfileMessage({ type: 'success', text: 'Profile name updated successfully! 🌿' });
      }
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err.message || 'Failed to update profile.';
      setProfileMessage({ type: 'error', text: msg });
    } finally {
      setIsUpdatingName(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await updateProfile({ currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Password successfully changed! 🔒' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err.message || 'Failed to update password.';
      setPasswordMessage({ type: 'error', text: msg });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Sign Out
  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    if (onSignOut) onSignOut();
    else if (onBackToCafe) onBackToCafe();
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'VD';

  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '2026';

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="vrd-profile-root">
      {/* 1. Header Bar */}
      <header className="vrd-profile-header">
        <button className="vrd-profile-btn-ghost" onClick={onBackToCafe}>
          <ArrowLeft size={16} />
          <span>Cafe Home</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              color: '#e5cfb8',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Verdora Member Sanctuary
          </span>
        </div>

        <div className="vrd-profile-nav-actions">
          {isAdmin && (
            <button className="vrd-profile-btn-gold" onClick={onSwitchToAdmin} title="Go to Admin Operations">
              <ShieldCheck size={16} />
              <span>Admin Dashboard</span>
            </button>
          )}
          <button className="vrd-profile-btn-ghost" onClick={handleLogout} title="Sign Out">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="vrd-profile-container">
        {/* 2. Hero Profile Banner */}
        <div className="vrd-profile-hero">
          <div className="vrd-profile-hero-left">
            <div className={`vrd-profile-avatar ${isAdmin ? 'admin-avatar' : ''}`}>
              {initials}
            </div>
            <div>
              <h1 className="vrd-profile-hero-name">{currentUser?.name || 'Verdora Member'}</h1>
              <div className="vrd-profile-hero-email">
                <Mail size={14} color="var(--vrd-emerald, #10b981)" />
                <span>{currentUser?.email || 'member@verdora.local'}</span>
              </div>
              <div className="vrd-profile-badge-row">
                {isAdmin ? (
                  <span className="vrd-role-badge admin">
                    <ShieldCheck size={12} />
                    System Administrator
                  </span>
                ) : (
                  <span className="vrd-role-badge customer">
                    <Sparkles size={12} />
                    Verified Wellness Member
                  </span>
                )}
                <span className="vrd-since-badge">Member since {memberSince}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {isAdmin && (
              <button
                className="vrd-profile-btn-gold"
                style={{ padding: '10px 22px', fontSize: '0.88rem' }}
                onClick={onSwitchToAdmin}
              >
                <ShieldCheck size={18} />
                <span>Operations Console</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Profile Content Grid */}
        <div className="vrd-profile-grid">
          {/* Card 1: Personal Details & Dietary Preferences */}
          <div className="vrd-profile-card">
            <div className="vrd-profile-card-header">
              <h3 className="vrd-profile-card-title">
                <User size={18} color="var(--vrd-gold, #cfa169)" />
                <span>Personal Information</span>
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                ● Active Profile
              </span>
            </div>

            {profileMessage && (
              <div className={`vrd-profile-alert ${profileMessage.type}`}>
                {profileMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="vrd-pform-group">
                <label>Full Display Name</label>
                <input
                  type="text"
                  className="vrd-pinput"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="vrd-pform-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="vrd-pinput"
                  value={currentUser?.email || ''}
                  disabled
                  title="Email cannot be changed directly for security reasons"
                />
                <span style={{ fontSize: '0.72rem', color: '#7d8781', marginTop: '4px', display: 'block' }}>
                  Primary account identifier (Verified)
                </span>
              </div>

              <div className="vrd-pform-group" style={{ marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Leaf size={14} color="#10b981" />
                  <span>Dietary & Wellness Preferences</span>
                </label>
                <div className="vrd-diet-tags">
                  {DEFAULT_DIETARY_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <span
                        key={tag}
                        className={`vrd-diet-tag ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleTag(tag)}
                        title="Click to toggle preference"
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: '22px' }}>
                <button type="submit" className="vrd-btn-save" disabled={isUpdatingName}>
                  {isUpdatingName ? (
                    <>
                      <RefreshCw size={16} className="vrd-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Profile Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Role Privileges & Quick Links */}
          <div className="vrd-profile-card">
            <div className="vrd-profile-card-header">
              <h3 className="vrd-profile-card-title">
                {isAdmin ? (
                  <>
                    <ShieldCheck size={18} color="var(--vrd-gold, #cfa169)" />
                    <span>Administrator Privileges</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} color="var(--vrd-emerald, #10b981)" />
                    <span>Account Activity & Shortcuts</span>
                  </>
                )}
              </h3>
            </div>

            {isAdmin ? (
              <div className="vrd-shortcut-list">
                <p style={{ fontSize: '0.86rem', color: '#9fa6a1', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  You have full executive administrative privileges to manage cafe orders, table bookings, and dish catalogs.
                </p>

                <div className="vrd-shortcut-item" onClick={onSwitchToAdmin}>
                  <div className="vrd-shortcut-left">
                    <div className="vrd-shortcut-icon">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="vrd-shortcut-text">
                      <strong>Executive Admin Console</strong>
                      <span>Real-time KPIs, revenue stats, and system metrics</span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#cfa169" />
                </div>

                <div className="vrd-shortcut-item" onClick={onSwitchToAdmin}>
                  <div className="vrd-shortcut-left">
                    <div className="vrd-shortcut-icon">
                      <Package size={18} />
                    </div>
                    <div className="vrd-shortcut-text">
                      <strong>Kitchen Order Dispatch</strong>
                      <span>Manage incoming tickets, update preparation states</span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#cfa169" />
                </div>

                <div className="vrd-shortcut-item" onClick={onSwitchToAdmin}>
                  <div className="vrd-shortcut-left">
                    <div className="vrd-shortcut-icon">
                      <Calendar size={18} />
                    </div>
                    <div className="vrd-shortcut-text">
                      <strong>Table Booking Allocations</strong>
                      <span>Review guest bookings, allocate tables, handle seatings</span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#cfa169" />
                </div>

                <div className="vrd-shortcut-item" onClick={onBackToCafe}>
                  <div className="vrd-shortcut-left">
                    <div className="vrd-shortcut-icon">
                      <Leaf size={18} />
                    </div>
                    <div className="vrd-shortcut-text">
                      <strong>Verdora Cafe Public View</strong>
                      <span>Preview client-facing menu, prices, and landing experience</span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#cfa169" />
                </div>
              </div>
            ) : (
              <div className="vrd-shortcut-list">
                <p style={{ fontSize: '0.86rem', color: '#9fa6a1', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Welcome to your Verdora account! Access your order history, upcoming reservations, or explore seasonal specials.
                </p>

                {onSwitchToOrders && (
                  <div className="vrd-shortcut-item" onClick={onSwitchToOrders}>
                    <div className="vrd-shortcut-left">
                      <div className="vrd-shortcut-icon">
                        <Package size={18} />
                      </div>
                      <div className="vrd-shortcut-text">
                        <strong>My Order History</strong>
                        <span>Track current orders and view past receipts</span>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#10b981" />
                  </div>
                )}

                {onSwitchToBookings && (
                  <div className="vrd-shortcut-item" onClick={onSwitchToBookings}>
                    <div className="vrd-shortcut-left">
                      <div className="vrd-shortcut-icon">
                        <Calendar size={18} />
                      </div>
                      <div className="vrd-shortcut-text">
                        <strong>My Table Reservations</strong>
                        <span>View upcoming cafe bookings and seating times</span>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#10b981" />
                  </div>
                )}

                <div className="vrd-shortcut-item" onClick={onBackToCafe}>
                  <div className="vrd-shortcut-left">
                    <div className="vrd-shortcut-icon">
                      <Leaf size={18} />
                    </div>
                    <div className="vrd-shortcut-text">
                      <strong>Explore Seasonal Menu</strong>
                      <span>Handcrafted organic roasts, bowls, and cold-pressed elixirs</span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#10b981" />
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Security & Password Update */}
          <div className="vrd-profile-card">
            <div className="vrd-profile-card-header">
              <h3 className="vrd-profile-card-title">
                <Lock size={18} color="var(--vrd-gold, #cfa169)" />
                <span>Security & Password</span>
              </h3>
            </div>

            {passwordMessage && (
              <div className={`vrd-profile-alert ${passwordMessage.type}`}>
                {passwordMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="vrd-pform-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="vrd-pinput"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="vrd-pform-group">
                <label>New Password (min 8 characters)</label>
                <input
                  type="password"
                  className="vrd-pinput"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              <div className="vrd-pform-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="vrd-pinput"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              <div style={{ marginTop: '22px' }}>
                <button type="submit" className="vrd-btn-save" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? (
                    <>
                      <RefreshCw size={16} className="vrd-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="vrd-security-meta">
              <div className="vrd-security-meta-item">
                <span>Session Protection</span>
                <span className="active">✓ HttpOnly Cookie Active</span>
              </div>
              <div className="vrd-security-meta-item">
                <span>Access Verification</span>
                <span className="active">✓ JWT Signed SHA-256</span>
              </div>
            </div>
          </div>

          {/* Card 4: Session & Sign Out */}
          <div className="vrd-profile-card">
            <div className="vrd-profile-card-header">
              <h3 className="vrd-profile-card-title">
                <LogOut size={18} color="#ef4444" />
                <span>Session Control</span>
              </h3>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#9fa6a1', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Signing out will terminate your authenticated session and clear your secure session cookies from this browser.
            </p>

            <div
              style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#fca5a5', fontSize: '0.85rem', marginBottom: '4px' }}>
                Current Authenticated Device
              </div>
              <div style={{ color: '#9fa6a1', fontSize: '0.78rem' }}>
                Signed in as <strong>{currentUser?.email}</strong> ({currentUser?.role})
              </div>
            </div>

            <button type="button" className="vrd-btn-danger-outline" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sign Out of Verdora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
