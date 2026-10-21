import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Calendar,
  UtensilsCrossed,
  LayoutGrid,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  X,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Search,
  User,
  Users,
} from 'lucide-react';
import {
  getDashboardStats,
  getAdminOrders,
  updateOrderStatus,
  getAdminReservations,
  updateReservationStatus,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAdminTables,
  createAdminTable,
  updateAdminTable,
  deleteAdminTable,
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
} from '../services/adminService';
import { getMenuItems } from '../services/menuService';
import Dashboard from './ui/dashboard-4';
import './AdminDashboard.css';

export default function AdminDashboard({ onBackToCafe, onSwitchToProfile, currentUser }) {
  const [activeTab, setActiveTab] = useState('analytics');

  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const [reservations, setReservations] = useState([]);
  const [reservationStatusFilter, setReservationStatusFilter] = useState('all');
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  const [menuItems, setMenuItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  const [tables, setTables] = useState([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  // Table Management State
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableForm, setTableForm] = useState({ tableNumber: '', capacity: 4, isActive: true });
  const [deleteTableConfirmTarget, setDeleteTableConfirmTarget] = useState(null);

  // Employees / Staff State
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'staff', avatar: '' });
  const [deleteUserConfirmTarget, setDeleteUserConfirmTarget] = useState(null);

  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishForm, setDishForm] = useState({ name: '', category: 'Bowls', price: '', description: '', imageUrl: '', isAvailable: true });
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch { showToast('Could not refresh stats'); }
    finally { setIsLoadingStats(false); }
  };

  const loadOrders = async (status = orderStatusFilter) => {
    setIsLoadingOrders(true);
    try {
      const params = { limit: 50 };
      if (status !== 'all') params.status = status;
      const res = await getAdminOrders(params);
      setOrders(res.data.orders || []);
    } catch { showToast('Could not load orders'); }
    finally { setIsLoadingOrders(false); }
  };

  const loadReservations = async (status = reservationStatusFilter) => {
    setIsLoadingReservations(true);
    try {
      const params = { limit: 50 };
      if (status !== 'all') params.status = status;
      const res = await getAdminReservations(params);
      setReservations(res.data.reservations || []);
    } catch { showToast('Could not load reservations'); }
    finally { setIsLoadingReservations(false); }
  };

  const loadMenu = async () => {
    setIsLoadingMenu(true);
    try {
      const res = await getMenuItems({ limit: 50, includeUnavailable: 'true' });
      setMenuItems(res.data.items || []);
    } catch { showToast('Could not load menu items'); }
    finally { setIsLoadingMenu(false); }
  };

  const loadTables = async () => {
    setIsLoadingTables(true);
    try {
      const res = await getAdminTables();
      setTables(res.data.tables || []);
    } catch { showToast('Could not load tables'); }
    finally { setIsLoadingTables(false); }
  };

  const loadUsers = async (role = userRoleFilter) => {
    setIsLoadingUsers(true);
    try {
      const params = { limit: 50 };
      if (role !== 'all') params.role = role;
      const res = await getAdminUsers(params);
      setUsers(res.data.users || []);
    } catch { showToast('Could not load staff directory'); }
    finally { setIsLoadingUsers(false); }
  };

  useEffect(() => {
    loadStats();
    loadOrders('all');
    loadReservations('all');
    loadMenu();
    loadTables();
    loadUsers('all');
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`);
      loadOrders(orderStatusFilter);
      loadStats();
    } catch (err) {
      showToast(err?.response?.data?.error?.message || err.message || 'Status transition failed');
    }
  };

  const handleUpdateReservationStatus = async (resId, newStatus) => {
    try {
      await updateReservationStatus(resId, newStatus);
      showToast(`Reservation marked as ${newStatus}`);
      loadReservations(reservationStatusFilter);
      loadStats();
    } catch (err) {
      showToast(err?.response?.data?.error?.message || err.message || 'Status update failed');
    }
  };

  const openDishModal = (dish = null) => {
    if (dish) {
      setEditingDish(dish);
      setDishForm({
        name: dish.name || '',
        category: dish.category || 'Bowls',
        price: dish.price || '',
        description: dish.description || '',
        imageUrl: dish.imageUrl || '',
        isAvailable: dish.isAvailable !== undefined ? dish.isAvailable : true,
      });
    } else {
      setEditingDish(null);
      setDishForm({
        name: '',
        category: 'Bowls',
        price: '',
        description: '',
        imageUrl: '/images/hero-coffee.jpg',
        isAvailable: true,
      });
    }
    setIsDishModalOpen(true);
  };

  const handleDishSubmit = async (e) => {
    e.preventDefault();
    if (!dishForm.name || !dishForm.price) { showToast('Please provide a dish name and price'); return; }
    try {
      const payload = {
        name: dishForm.name,
        category: dishForm.category,
        price: Number(dishForm.price),
        description: dishForm.description,
        imageUrl: dishForm.imageUrl ? dishForm.imageUrl.trim() : '',
        isAvailable: Boolean(dishForm.isAvailable),
      };
      if (editingDish) {
        await updateMenuItem(editingDish._id, payload);
        showToast(`Updated "${payload.name}" successfully`);
      } else {
        await createMenuItem(payload);
        showToast(`Created "${payload.name}" successfully`);
      }
      setIsDishModalOpen(false);
      loadMenu();
      loadStats();
    } catch (err) {
      showToast(err?.response?.data?.error?.message || err.message || 'Action failed');
    }
  };

  const confirmDeleteDish = async () => {
    if (!deleteConfirmTarget) return;
    try {
      await deleteMenuItem(deleteConfirmTarget._id);
      showToast(`Deactivated "${deleteConfirmTarget.name}" from public menu`);
      setDeleteConfirmTarget(null);
      loadMenu();
      loadStats();
    } catch { showToast('Could not deactivate item'); }
  };

  // ── Table Management Handlers ──
  const openTableModal = (table = null) => {
    if (table) {
      setEditingTable(table);
      setTableForm({
        tableNumber: table.tableNumber || '',
        capacity: table.capacity || 4,
        isActive: table.isActive !== undefined ? table.isActive : true,
      });
    } else {
      setEditingTable(null);
      setTableForm({
        tableNumber: `T-${String(tables.length + 1).padStart(2, '0')}`,
        capacity: 4,
        isActive: true,
      });
    }
    setIsTableModalOpen(true);
  };

  const handleTableSubmit = async (e) => {
    e.preventDefault();
    if (!tableForm.tableNumber) { showToast('Please specify a table number'); return; }
    try {
      const payload = {
        tableNumber: tableForm.tableNumber.trim(),
        capacity: Number(tableForm.capacity),
        isActive: Boolean(tableForm.isActive),
      };
      if (editingTable) {
        await updateAdminTable(editingTable._id, payload);
        showToast(`Table ${payload.tableNumber} updated successfully`);
      } else {
        await createAdminTable(payload);
        showToast(`Table ${payload.tableNumber} created successfully`);
      }
      setIsTableModalOpen(false);
      loadTables();
      loadStats();
    } catch (err) {
      showToast(err?.response?.data?.error?.message || err.message || 'Table action failed');
    }
  };

  const confirmDeleteTable = async () => {
    if (!deleteTableConfirmTarget) return;
    try {
      await deleteAdminTable(deleteTableConfirmTarget._id);
      showToast(`Table ${deleteTableConfirmTarget.tableNumber} removed`);
      setDeleteTableConfirmTarget(null);
      loadTables();
      loadStats();
    } catch (err) {
      showToast(err?.response?.data?.error?.message || 'Could not delete table');
    }
  };

  // ── Employee / Staff Handlers ──
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) {
      showToast('Please fill all required member details');
      return;
    }
    try {
      await createAdminUser(userForm);
      showToast(`Team member "${userForm.name}" created successfully`);
      setIsUserModalOpen(false);
      setUserForm({ name: '', email: '', password: '', role: 'staff', avatar: '' });
      loadUsers(userRoleFilter);
      loadStats();
    } catch (err) {
      showToast(err?.response?.data?.error?.message || err.message || 'Could not create member');
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserConfirmTarget) return;
    try {
      await deleteAdminUser(deleteUserConfirmTarget._id);
      showToast(`Account "${deleteUserConfirmTarget.name}" removed`);
      setDeleteUserConfirmTarget(null);
      loadUsers(userRoleFilter);
      loadStats();
    } catch (err) {
      showToast(err?.response?.data?.error?.message || 'Could not remove member');
    }
  };

  const filteredMenuItems = menuItems.filter((i) =>
    i.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
    i.category.toLowerCase().includes(menuSearch.toLowerCase())
  );

  return (
    <div className="vrd-admin-root">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="vrd-admin-header">
        <div className="vrd-admin-brand">
          <img src="/images/logo.png" alt="Verdora Logo" className="vrd-admin-logo-img" />
          <div>
            <div className="vrd-admin-title-row">
              <h1 className="vrd-admin-title">VERDORA OPERATIONS</h1>
              <span className="vrd-admin-live-badge">
                <span className="vrd-pulse-dot" />
                Live
              </span>
            </div>
            <div className="vrd-admin-sub">Executive Culinary & Floor Management</div>
          </div>
        </div>

        <div className="vrd-admin-header-actions">
          <button
            className="vrd-header-btn sync"
            onClick={() => {
              loadStats();
              if (activeTab === 'orders') loadOrders();
              if (activeTab === 'reservations') loadReservations();
              if (activeTab === 'menu') loadMenu();
              if (activeTab === 'tables') loadTables();
              if (activeTab === 'employees') loadUsers();
            }}
          >
            <RefreshCw size={14} className={isLoadingStats ? 'vrd-spin' : ''} />
            <span>Sync</span>
          </button>

          {onSwitchToProfile && (
            <button className="vrd-header-btn profile" onClick={onSwitchToProfile}>
              <User size={14} />
              <span>Profile</span>
            </button>
          )}

          <button className="vrd-header-btn back" onClick={onBackToCafe}>
            <ArrowLeft size={14} />
            <span>Back to Cafe</span>
          </button>
        </div>
      </header>

      {/* ── TAB NAV ─────────────────────────────────────────────────────── */}
      <div className="vrd-nav-container">
        <nav className="vrd-segmented-nav">
          {[
            { id: 'analytics',    icon: <TrendingUp size={15} />,     label: 'Overview',       count: null },
            { id: 'orders',       icon: <ShoppingBag size={15} />,    label: 'Kitchen Orders', count: stats?.orders?.total ?? orders.length },
            { id: 'reservations', icon: <Calendar size={15} />,       label: 'Bookings',       count: stats?.reservations?.total ?? reservations.length },
            { id: 'menu',         icon: <UtensilsCrossed size={15} />, label: 'Menu Catalog',   count: stats?.menu?.total ?? menuItems.length },
            { id: 'tables',       icon: <LayoutGrid size={15} />,     label: 'Cafe Tables',    count: tables.length },
            { id: 'employees',    icon: <Users size={15} />,          label: 'Team & Staff',   count: users.length },
          ].map(({ id, icon, label, count }) => (
            <button
              key={id}
              className={`vrd-tab-pill ${activeTab === id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(id);
                if (id === 'orders') loadOrders();
                if (id === 'reservations') loadReservations();
                if (id === 'menu') loadMenu();
                if (id === 'tables') loadTables();
                if (id === 'employees') loadUsers();
              }}
            >
              {icon}
              <span>{label}</span>
              {count !== null && <span className="vrd-tab-count-badge">{count}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="vrd-admin-main">

        {/* TAB: Analytics */}
        {activeTab === 'analytics' && (
          <Dashboard
            stats={stats}
            onAddDish={() => openDishModal(null)}
            onViewOrders={() => { setActiveTab('orders'); loadOrders(); }}
            onViewBookings={() => { setActiveTab('reservations'); loadReservations(); }}
          />
        )}

        {/* TAB: Orders */}
        {activeTab === 'orders' && (
          <div>
            <div className="vrd-section-header">
              <div>
                <h2 className="vrd-section-title">Kitchen Orders</h2>
                <p className="vrd-section-subtitle">Manage live customer orders through the kitchen pipeline</p>
              </div>
            </div>

            <div className="vrd-admin-toolbar">
              <div className="vrd-filter-chips">
                {['all', 'placed', 'preparing', 'ready', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    className={`vrd-chip ${orderStatusFilter === st ? 'active' : ''}`}
                    onClick={() => { setOrderStatusFilter(st); loadOrders(st); }}
                  >
                    {st === 'all' ? 'All Orders' : st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingOrders ? (
              <div className="vrd-empty-state">
                <RefreshCw size={28} className="vrd-spin vrd-empty-icon" />
                <p style={{ marginTop: '12px' }}>Loading kitchen orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="vrd-empty-state">
                <ShoppingBag size={40} className="vrd-empty-icon" />
                <h4>No orders found</h4>
                <p>No orders match the status "{orderStatusFilter}".</p>
              </div>
            ) : (
              <div className="vrd-card-grid">
                {orders.map((ord) => (
                  <div key={ord._id} className="vrd-ticket-card">
                    <div className="vrd-card-head">
                      <div>
                        <div className="vrd-card-id">Order #{ord._id?.slice(-8).toUpperCase()}</div>
                        <div className="vrd-card-sub">
                          {ord.userId?.name || 'Walk-in Diner'} · {ord.userId?.email || 'N/A'}
                        </div>
                      </div>
                      <span className={`vrd-badge ${ord.status}`}>{ord.status}</span>
                    </div>

                    <div>
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="vrd-item-line">
                          <span>{it.quantity}× {it.itemNameSnapshot}</span>
                          <span>Rs. {(it.unitPriceSnapshot * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="vrd-card-foot">
                      <div>
                        <div className="vrd-card-total-label">Order Total</div>
                        <div className="vrd-card-total-value">
                           Rs. {(ord.subtotal || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="vrd-card-actions">
                        {ord.status === 'placed' && (
                          <button className="vrd-btn primary" onClick={() => handleUpdateOrderStatus(ord._id, 'preparing')}>
                            Start Prep
                          </button>
                        )}
                        {ord.status === 'preparing' && (
                          <button className="vrd-btn primary" onClick={() => handleUpdateOrderStatus(ord._id, 'ready')}>
                            Mark Ready
                          </button>
                        )}
                        {ord.status === 'ready' && (
                          <button className="vrd-btn primary" onClick={() => handleUpdateOrderStatus(ord._id, 'completed')}>
                            Complete
                          </button>
                        )}
                        {(ord.status === 'placed' || ord.status === 'preparing') && (
                          <button className="vrd-btn danger" onClick={() => handleUpdateOrderStatus(ord._id, 'cancelled')}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Reservations */}
        {activeTab === 'reservations' && (
          <div>
            <div className="vrd-section-header">
              <div>
                <h2 className="vrd-section-title">Table Bookings</h2>
                <p className="vrd-section-subtitle">View and manage all customer table reservations</p>
              </div>
            </div>

            <div className="vrd-admin-toolbar">
              <div className="vrd-filter-chips">
                {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    className={`vrd-chip ${reservationStatusFilter === st ? 'active' : ''}`}
                    onClick={() => { setReservationStatusFilter(st); loadReservations(st); }}
                  >
                    {st === 'all' ? 'All Bookings' : st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingReservations ? (
              <div className="vrd-empty-state">
                <RefreshCw size={28} className="vrd-spin vrd-empty-icon" />
                <p style={{ marginTop: '12px' }}>Loading table bookings...</p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="vrd-empty-state">
                <Calendar size={40} className="vrd-empty-icon" />
                <h4>No bookings found</h4>
                <p>No reservations match the status "{reservationStatusFilter}".</p>
              </div>
            ) : (
              <div className="vrd-card-grid">
                {reservations.map((res) => (
                  <div key={res._id} className="vrd-ticket-card">
                    <div className="vrd-card-head">
                      <div>
                        <div className="vrd-card-id">{res.userId?.name || 'Guest'}</div>
                        <div className="vrd-card-sub">{res.userId?.email || 'No email'}</div>
                      </div>
                      <span className={`vrd-badge ${res.status}`}>{res.status}</span>
                    </div>

                    <div className="vrd-info-rows">
                      <div className="vrd-info-row">
                        <Clock size={14} color="#cfa169" />
                        <span>
                          {res.reservationDate ? res.reservationDate : '—'} · <strong>{res.startTime}</strong> – <strong>{res.endTime}</strong>
                        </span>
                      </div>
                      <div className="vrd-info-row">
                        <Users size={14} color="#10b981" />
                        <span>Party size: <strong>{res.guestCount} guests</strong></span>
                      </div>
                      <div className="vrd-info-row">
                        <ShieldCheck size={14} color="#cfa169" />
                        <span>
                          Table <strong>{res.tableId?.tableNumber ?? '—'}</strong>
                          {res.tableId?.capacity && <> · capacity {res.tableId.capacity}</>}
                        </span>
                      </div>
                      {res.specialRequest && (
                        <div className="vrd-info-row">
                          <span style={{ color: '#8da191', fontSize: 'var(--fs-xs)' }}>
                            Note: {res.specialRequest}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="vrd-card-foot">
                      <span className="vrd-card-ref">Ref #{res._id?.slice(-6).toUpperCase()}</span>
                      <div className="vrd-card-actions">
                        {res.status === 'confirmed' && (
                          <button className="vrd-btn primary" onClick={() => handleUpdateReservationStatus(res._id, 'completed')}>
                            Seat Party
                          </button>
                        )}
                        {res.status === 'confirmed' && (
                          <button className="vrd-btn danger" onClick={() => handleUpdateReservationStatus(res._id, 'cancelled')}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Menu Catalog */}
        {activeTab === 'menu' && (
          <div>
            <div className="vrd-section-header">
              <div>
                <h2 className="vrd-section-title">Menu Catalog</h2>
                <p className="vrd-section-subtitle">Manage dishes, beverages and their availability</p>
              </div>
              <button className="vrd-btn primary lg" onClick={() => openDishModal(null)}>
                <Plus size={15} />
                <span>Add Dish</span>
              </button>
            </div>

            <div className="vrd-admin-toolbar">
              <div className="vrd-search-wrapper">
                <Search size={15} className="vrd-search-icon" />
                <input
                  type="text"
                  className="vrd-search-input"
                  placeholder="Search by name or category..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                />
              </div>
            </div>

            {isLoadingMenu ? (
              <div className="vrd-empty-state">
                <RefreshCw size={28} className="vrd-spin vrd-empty-icon" />
                <p style={{ marginTop: '12px' }}>Loading menu catalog...</p>
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="vrd-empty-state">
                <UtensilsCrossed size={40} className="vrd-empty-icon" />
                <h4>No dishes found</h4>
                <p>Try a different search term or add a new recipe.</p>
              </div>
            ) : (
              <div className="vrd-table-wrap">
                <table className="vrd-data-table">
                  <thead>
                    <tr>
                      <th>Dish</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMenuItems.map((dish) => (
                      <tr key={dish._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={dish.imageUrl || '/images/hero-coffee.jpg'}
                              alt={dish.name}
                              className="vrd-dish-thumb"
                              onError={(e) => { e.currentTarget.src = '/images/hero-coffee.jpg'; }}
                            />
                            <div>
                              <div className="vrd-table-dish-name">{dish.name}</div>
                              {dish.description && (
                                <div className="vrd-table-dish-desc">{dish.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="vrd-chip" style={{ pointerEvents: 'none' }}>{dish.category}</span>
                        </td>
                        <td>
                          <span className="vrd-table-price">Rs. {dish.price?.toLocaleString()}</span>
                        </td>
                        <td>
                          <span className={`vrd-badge ${dish.isAvailable ? 'active' : 'inactive'}`}>
                            {dish.isAvailable ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="vrd-table-actions">
                            <button className="vrd-btn primary" onClick={() => openDishModal(dish)}>
                              <Edit size={13} /> Edit
                            </button>
                            {dish.isAvailable && (
                              <button className="vrd-btn danger" onClick={() => setDeleteConfirmTarget(dish)}>
                                <Trash2 size={13} /> Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: Tables */}
        {activeTab === 'tables' && (
          <div>
            <div className="vrd-section-header">
              <div>
                <h2 className="vrd-section-title">Cafe Tables</h2>
                <p className="vrd-section-subtitle">Floor plan overview — {tables.length} table{tables.length !== 1 ? 's' : ''} configured</p>
              </div>
              <button className="vrd-btn primary lg" onClick={() => openTableModal(null)}>
                <Plus size={15} />
                <span>Add Table</span>
              </button>
            </div>

            {isLoadingTables ? (
              <div className="vrd-empty-state">
                <RefreshCw size={28} className="vrd-spin vrd-empty-icon" />
                <p style={{ marginTop: '12px' }}>Loading floor plan...</p>
              </div>
            ) : tables.length === 0 ? (
              <div className="vrd-empty-state">
                <LayoutGrid size={40} className="vrd-empty-icon" />
                <h4>No tables found</h4>
                <p>Click "Add Table" to configure your cafe floor plan.</p>
              </div>
            ) : (
              <div className="vrd-floor-grid">
                {tables.map((t) => (
                  <div key={t._id} className="vrd-floor-card">
                    <div className="vrd-floor-card-head">
                      <div className="vrd-floor-icon">
                        <ShieldCheck size={18} />
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className={`vrd-badge ${t.isActive ? 'active' : 'inactive'}`}>
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          className="vrd-btn primary"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          title="Edit Table"
                          onClick={() => openTableModal(t)}
                        >
                          <Edit size={11} />
                        </button>
                        <button
                          className="vrd-btn danger"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          title="Delete Table"
                          onClick={() => setDeleteTableConfirmTarget(t)}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="vrd-floor-table-num">Table {t.tableNumber}</div>
                      <div className="vrd-floor-table-cap">
                        Capacity: <strong>{t.capacity} guests</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Employees & Staff */}
        {activeTab === 'employees' && (
          <div>
            <div className="vrd-section-header">
              <div>
                <h2 className="vrd-section-title">Team & Staff</h2>
                <p className="vrd-section-subtitle">Manage cafe floor staff, baristas, and administrators</p>
              </div>
              <button className="vrd-btn primary lg" onClick={() => setIsUserModalOpen(true)}>
                <Plus size={15} />
                <span>Add Staff Member</span>
              </button>
            </div>

            <div className="vrd-admin-toolbar">
              <div className="vrd-filter-chips">
                {['all', 'staff', 'admin', 'customer'].map((role) => (
                  <button
                    key={role}
                    className={`vrd-chip ${userRoleFilter === role ? 'active' : ''}`}
                    onClick={() => { setUserRoleFilter(role); loadUsers(role); }}
                  >
                    {role === 'all' ? 'All Accounts' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="vrd-empty-state">
                <RefreshCw size={28} className="vrd-spin vrd-empty-icon" />
                <p style={{ marginTop: '12px' }}>Loading staff directory...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="vrd-empty-state">
                <Users size={40} className="vrd-empty-icon" />
                <h4>No team members found</h4>
                <p>No accounts match the role "{userRoleFilter}".</p>
              </div>
            ) : (
              <div className="vrd-table-wrap">
                <table className="vrd-data-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="vrd-user-thumb" />
                            ) : (
                              <div className={`vrd-user-avatar-initials ${u.role === 'admin' ? 'admin' : ''}`}>
                                {u.name ? u.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                              </div>
                            )}
                            <div>
                              <div className="vrd-table-dish-name">{u.name}</div>
                              {currentUser?._id === u._id && (
                                <span className="vrd-chip" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>Current User</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--c-text-sub)' }}>{u.email}</span>
                        </td>
                        <td>
                          <span className={`vrd-badge ${u.role === 'admin' ? 'preparing' : u.role === 'staff' ? 'active' : 'placed'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: 'var(--c-text-muted)' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </span>
                        </td>
                        <td>
                          <div className="vrd-table-actions">
                            {currentUser?._id !== u._id ? (
                              <button className="vrd-btn danger" onClick={() => setDeleteUserConfirmTarget(u)}>
                                <Trash2 size={13} /> Remove
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>Protected</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MODAL: Add / Edit Dish ──────────────────────────────────────── */}
      {isDishModalOpen && (
        <div className="vrd-modal-overlay" onClick={() => setIsDishModalOpen(false)}>
          <div className="vrd-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="vrd-modal-close" onClick={() => setIsDishModalOpen(false)}>
              <X size={16} />
            </button>

            <h3 className="vrd-modal-title">
              {editingDish ? 'Edit Recipe' : 'Add New Dish'}
            </h3>
            <p className="vrd-modal-desc">
              {editingDish ? 'Update the details for this menu item.' : 'Create a new dish or beverage in the live catalog.'}
            </p>

            <form className="vrd-form" onSubmit={handleDishSubmit}>
              <div className="vrd-field">
                <label className="vrd-label">Dish / Beverage Name</label>
                <input
                  type="text"
                  className="vrd-input"
                  placeholder="e.g. Amazonian Dragonfruit Super-Bowl"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  required
                />
              </div>

              {/* Dish Image Input with Live Preview & Quick Presets */}
              <div className="vrd-field">
                <label className="vrd-label">Dish Image (URL or Local Path)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="vrd-input"
                    placeholder="e.g. /images/highland-espresso.jpg"
                    value={dishForm.imageUrl}
                    onChange={(e) => setDishForm({ ...dishForm, imageUrl: e.target.value })}
                  />
                  {dishForm.imageUrl && (
                    <img
                      src={dishForm.imageUrl}
                      alt="Preview"
                      className="vrd-dish-modal-preview"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
                {/* Presets Gallery */}
                <div className="vrd-preset-chips">
                  <span className="vrd-preset-label">Presets:</span>
                  {[
                    { label: 'Espresso', path: '/images/highland-espresso.jpg' },
                    { label: 'Latte', path: '/images/vanilla-oat-latte.jpg' },
                    { label: 'Nitro Cold Brew', path: '/images/nitrogen-cold-brew.jpg' },
                    { label: 'Matcha', path: '/images/matcha-latte.jpg' },
                    { label: 'Açai Bowl', path: '/images/acai-super-bowl.jpg' },
                    { label: 'Pitaya Bowl', path: '/images/pitaya-chia-bowl.jpg' },
                    { label: 'Quinoa Bowl', path: '/images/quinoa-protein-bowl.jpg' },
                    { label: 'Green Juice', path: '/images/green-juice.jpg' },
                    { label: 'Avo Toast', path: '/images/avocado-toast.jpg' },
                    { label: 'Mushroom Toast', path: '/images/mushroom-truffle-toast.jpg' },
                    { label: 'Cashews', path: '/images/truffle-cashews.jpg' },
                    { label: 'Truffles', path: '/images/cacao-matcha-truffles.jpg' },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.path}
                      className={`vrd-preset-btn ${dishForm.imageUrl === p.path ? 'active' : ''}`}
                      onClick={() => setDishForm({ ...dishForm, imageUrl: p.path })}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="vrd-field-row">
                <div className="vrd-field">
                  <label className="vrd-label">Category</label>
                  <select
                    className="vrd-select"
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                  >
                    <option value="Bowls">Bowls</option>
                    <option value="Toast">Toast</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Juices">Juices</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div className="vrd-field">
                  <label className="vrd-label">Price (Rs.)</label>
                  <input
                    type="number"
                    className="vrd-input"
                    placeholder="e.g. 1850"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="vrd-field">
                <label className="vrd-label">Description</label>
                <textarea
                  className="vrd-textarea"
                  placeholder="Organic ingredients, preparation notes..."
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                />
              </div>

              <div className="vrd-checkbox-row">
                <input
                  type="checkbox"
                  id="dishAvailableCheckbox"
                  checked={dishForm.isAvailable}
                  onChange={(e) => setDishForm({ ...dishForm, isAvailable: e.target.checked })}
                />
                <label className="vrd-checkbox-label" htmlFor="dishAvailableCheckbox">
                  Available in live menu ordering
                </label>
              </div>

              <div className="vrd-form-actions">
                <button type="button" className="vrd-btn ghost" onClick={() => setIsDishModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="vrd-btn primary lg">
                  {editingDish ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Add / Edit Table ─────────────────────────────────────── */}
      {isTableModalOpen && (
        <div className="vrd-modal-overlay" onClick={() => setIsTableModalOpen(false)}>
          <div className="vrd-modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <button className="vrd-modal-close" onClick={() => setIsTableModalOpen(false)}>
              <X size={16} />
            </button>

            <h3 className="vrd-modal-title">
              {editingTable ? 'Edit Table' : 'Add Cafe Table'}
            </h3>
            <p className="vrd-modal-desc">
              Configure table number and seating capacity for dine-in reservations.
            </p>

            <form className="vrd-form" onSubmit={handleTableSubmit}>
              <div className="vrd-field">
                <label className="vrd-label">Table Number / Label</label>
                <input
                  type="text"
                  className="vrd-input"
                  placeholder="e.g. T-13"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  required
                />
              </div>

              <div className="vrd-field">
                <label className="vrd-label">Guest Capacity (Seats)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="vrd-input"
                  placeholder="e.g. 4"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                  required
                />
              </div>

              <div className="vrd-checkbox-row">
                <input
                  type="checkbox"
                  id="tableActiveCheckbox"
                  checked={tableForm.isActive}
                  onChange={(e) => setTableForm({ ...tableForm, isActive: e.target.checked })}
                />
                <label className="vrd-checkbox-label" htmlFor="tableActiveCheckbox">
                  Table is active & available for reservations
                </label>
              </div>

              <div className="vrd-form-actions">
                <button type="button" className="vrd-btn ghost" onClick={() => setIsTableModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="vrd-btn primary lg">
                  {editingTable ? 'Update Table' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Add Staff Member ─────────────────────────────────────── */}
      {isUserModalOpen && (
        <div className="vrd-modal-overlay" onClick={() => setIsUserModalOpen(false)}>
          <div className="vrd-modal-box" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <button className="vrd-modal-close" onClick={() => setIsUserModalOpen(false)}>
              <X size={16} />
            </button>

            <h3 className="vrd-modal-title">Add Staff Member</h3>
            <p className="vrd-modal-desc">
              Register a new barista, floor manager, or admin to the Verdora team.
            </p>

            <form className="vrd-form" onSubmit={handleUserSubmit}>
              <div className="vrd-field">
                <label className="vrd-label">Full Name</label>
                <input
                  type="text"
                  className="vrd-input"
                  placeholder="e.g. Kasun Fernando"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="vrd-field">
                <label className="vrd-label">Email Address</label>
                <input
                  type="email"
                  className="vrd-input"
                  placeholder="e.g. kasun@verdora.local"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="vrd-field">
                <label className="vrd-label">Temporary Password</label>
                <input
                  type="password"
                  className="vrd-input"
                  placeholder="Min 6 characters"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="vrd-field">
                <label className="vrd-label">System Role</label>
                <select
                  className="vrd-select"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="staff">Staff (Floor / Kitchen Operations)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="vrd-field">
                <label className="vrd-label">Avatar Image URL (Optional)</label>
                <input
                  type="text"
                  className="vrd-input"
                  placeholder="e.g. /images/hero-coffee.jpg"
                  value={userForm.avatar}
                  onChange={(e) => setUserForm({ ...userForm, avatar: e.target.value })}
                />
              </div>

              <div className="vrd-form-actions">
                <button type="button" className="vrd-btn ghost" onClick={() => setIsUserModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="vrd-btn primary lg">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Delete Table Confirm ─────────────────────────────────── */}
      {deleteTableConfirmTarget && (
        <div className="vrd-modal-overlay" onClick={() => setDeleteTableConfirmTarget(null)}>
          <div className="vrd-modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="vrd-confirm-icon-row">
              <div className="vrd-confirm-icon">
                <AlertTriangle size={20} />
              </div>
              <h3 className="vrd-confirm-title">Delete Table?</h3>
            </div>
            <p className="vrd-confirm-body">
              Are you sure you want to remove Table <strong>"{deleteTableConfirmTarget.tableNumber}"</strong>?
            </p>
            <div className="vrd-form-actions">
              <button className="vrd-btn ghost" onClick={() => setDeleteTableConfirmTarget(null)}>
                Keep Table
              </button>
              <button className="vrd-btn danger" onClick={confirmDeleteTable}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Delete User Confirm ──────────────────────────────────── */}
      {deleteUserConfirmTarget && (
        <div className="vrd-modal-overlay" onClick={() => setDeleteUserConfirmTarget(null)}>
          <div className="vrd-modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="vrd-confirm-icon-row">
              <div className="vrd-confirm-icon">
                <AlertTriangle size={20} />
              </div>
              <h3 className="vrd-confirm-title">Remove Team Member?</h3>
            </div>
            <p className="vrd-confirm-body">
              Are you sure you want to remove <strong>"{deleteUserConfirmTarget.name}"</strong> ({deleteUserConfirmTarget.email})?
            </p>
            <div className="vrd-form-actions">
              <button className="vrd-btn ghost" onClick={() => setDeleteUserConfirmTarget(null)}>
                Keep Member
              </button>
              <button className="vrd-btn danger" onClick={confirmDeleteUser}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Deactivate Confirm ───────────────────────────────────── */}
      {deleteConfirmTarget && (
        <div className="vrd-modal-overlay" onClick={() => setDeleteConfirmTarget(null)}>
          <div className="vrd-modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="vrd-confirm-icon-row">
              <div className="vrd-confirm-icon">
                <AlertTriangle size={20} />
              </div>
              <h3 className="vrd-confirm-title">Deactivate Dish?</h3>
            </div>
            <p className="vrd-confirm-body">
              Are you sure you want to deactivate{' '}
              <strong>"{deleteConfirmTarget.name}"</strong>? It will immediately be removed from the public menu.
            </p>
            <div className="vrd-form-actions">
              <button className="vrd-btn ghost" onClick={() => setDeleteConfirmTarget(null)}>
                Keep Active
              </button>
              <button className="vrd-btn danger" onClick={confirmDeleteDish}>
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ───────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="vrd-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
