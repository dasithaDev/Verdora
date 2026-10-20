import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Calendar,
  UtensilsCrossed,
  Users,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  X,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Search,
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
} from '../services/adminService';
import { getMenuItems } from '../services/menuService';
import './AdminDashboard.css';

export default function AdminDashboard({ onBackToCafe, currentUser }) {
  // Navigation Tabs: 'orders' | 'reservations' | 'menu' | 'tables'
  const [activeTab, setActiveTab] = useState('orders');

  // Dashboard Aggregated Stats
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Reservations State
  const [reservations, setReservations] = useState([]);
  const [reservationStatusFilter, setReservationStatusFilter] = useState('all');
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  // Menu Items State
  const [menuItems, setMenuItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  // Tables State
  const [tables, setTables] = useState([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  // Modal States
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Bowls',
    price: '',
    description: '',
    isAvailable: true,
  });
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch Stats
  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      showToast('Could not refresh stats');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // 2. Fetch Orders
  const loadOrders = async (status = orderStatusFilter) => {
    setIsLoadingOrders(true);
    try {
      const params = { limit: 50 };
      if (status !== 'all') params.status = status;
      const res = await getAdminOrders(params);
      setOrders(res.data.orders || []);
    } catch (err) {
      showToast('Could not load orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // 3. Fetch Reservations
  const loadReservations = async (status = reservationStatusFilter) => {
    setIsLoadingReservations(true);
    try {
      const params = { limit: 50 };
      if (status !== 'all') params.status = status;
      const res = await getAdminReservations(params);
      setReservations(res.data.reservations || []);
    } catch (err) {
      showToast('Could not load reservations');
    } finally {
      setIsLoadingReservations(false);
    }
  };

  // 4. Fetch Menu Catalog
  const loadMenu = async () => {
    setIsLoadingMenu(true);
    try {
      const res = await getMenuItems({ limit: 50 });
      setMenuItems(res.data.items || []);
    } catch (err) {
      showToast('Could not load menu items');
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // 5. Fetch Tables
  const loadTables = async () => {
    setIsLoadingTables(true);
    try {
      const res = await getAdminTables();
      setTables(res.data.tables || []);
    } catch (err) {
      showToast('Could not load tables');
    } finally {
      setIsLoadingTables(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadStats();
    loadOrders('all');
    loadReservations('all');
    loadMenu();
    loadTables();
  }, []);

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`);
      loadOrders(orderStatusFilter);
      loadStats();
    } catch (err) {
      const errMsg = err?.response?.data?.error?.message || err.message || 'Status transition failed';
      showToast(`❌ ${errMsg}`);
    }
  };

  // Handle Reservation Status Update
  const handleUpdateReservationStatus = async (resId, newStatus) => {
    try {
      await updateReservationStatus(resId, newStatus);
      showToast(`Reservation marked as ${newStatus}`);
      loadReservations(reservationStatusFilter);
      loadStats();
    } catch (err) {
      const errMsg = err?.response?.data?.error?.message || err.message || 'Status update failed';
      showToast(`❌ ${errMsg}`);
    }
  };

  // Handle Open Create/Edit Dish Modal
  const openDishModal = (dish = null) => {
    if (dish) {
      setEditingDish(dish);
      setDishForm({
        name: dish.name || '',
        category: dish.category || 'Bowls',
        price: dish.price || '',
        description: dish.description || '',
        isAvailable: dish.isAvailable !== undefined ? dish.isAvailable : true,
      });
    } else {
      setEditingDish(null);
      setDishForm({
        name: '',
        category: 'Bowls',
        price: '',
        description: '',
        isAvailable: true,
      });
    }
    setIsDishModalOpen(true);
  };

  // Handle Dish Form Submit
  const handleDishSubmit = async (e) => {
    e.preventDefault();
    if (!dishForm.name || !dishForm.price) {
      showToast('Please provide a dish name and price');
      return;
    }

    try {
      const payload = {
        name: dishForm.name,
        category: dishForm.category,
        price: Number(dishForm.price),
        description: dishForm.description,
        isAvailable: Boolean(dishForm.isAvailable),
      };

      if (editingDish) {
        await updateMenuItem(editingDish._id, payload);
        showToast(`Updated "${payload.name}" successfully! ✨`);
      } else {
        await createMenuItem(payload);
        showToast(`Created new dish "${payload.name}"! 🌿`);
      }

      setIsDishModalOpen(false);
      loadMenu();
      loadStats();
    } catch (err) {
      const errMsg = err?.response?.data?.error?.message || err.message || 'Action failed';
      showToast(`❌ ${errMsg}`);
    }
  };

  // Handle Soft-Delete Confirmation
  const confirmDeleteDish = async () => {
    if (!deleteConfirmTarget) return;
    try {
      await deleteMenuItem(deleteConfirmTarget._id);
      showToast(`Deactivated "${deleteConfirmTarget.name}" from public menu`);
      setDeleteConfirmTarget(null);
      loadMenu();
      loadStats();
    } catch (err) {
      showToast('Could not deactivate item');
    }
  };

  // Filtered Menu Items by search
  const filteredMenuItems = menuItems.filter((i) =>
    i.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
    i.category.toLowerCase().includes(menuSearch.toLowerCase())
  );

  return (
    <div className="vrd-admin-root">
      {/* 1. TOP HEADER BAR */}
      <header className="vrd-admin-header">
        <div className="vrd-admin-brand">
          <div className="vrd-admin-logo-badge">V</div>
          <div>
            <h1 className="vrd-admin-title">Verdora Operations Console</h1>
            <div className="vrd-admin-sub">Kitchen, Pantry & Floor Management</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            className="vrd-chip"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => {
              loadStats();
              if (activeTab === 'orders') loadOrders();
              if (activeTab === 'reservations') loadReservations();
              if (activeTab === 'menu') loadMenu();
            }}
            title="Refresh Real-Time Data"
          >
            <RefreshCw size={14} className={isLoadingStats ? 'vrd-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            className="vrd-chip"
            style={{ background: 'rgba(207, 161, 105, 0.15)', borderColor: 'var(--vrd-gold)', color: 'var(--vrd-gold)' }}
            onClick={onBackToCafe}
          >
            <ArrowLeft size={14} />
            <span>Back to Cafe</span>
          </button>
        </div>
      </header>

      <div className="container" style={{ padding: '0 24px' }}>
        {/* 2. METRIC SUMMARY CARDS */}
        <div className="vrd-kpi-grid">
          <div className="vrd-kpi-card">
            <div className="vrd-kpi-icon-wrap gold">
              <TrendingUp size={26} />
            </div>
            <div>
              <div className="vrd-kpi-label">Total Revenue</div>
              <div className="vrd-kpi-value">
                Rs. {(stats?.summary?.totalRevenue || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="vrd-kpi-card">
            <div className="vrd-kpi-icon-wrap emerald">
              <ShoppingBag size={26} />
            </div>
            <div>
              <div className="vrd-kpi-label">Active Kitchen Orders</div>
              <div className="vrd-kpi-value">
                {stats?.summary?.activeKitchenOrders || 0}
              </div>
            </div>
          </div>

          <div className="vrd-kpi-card">
            <div className="vrd-kpi-icon-wrap blue">
              <Calendar size={26} />
            </div>
            <div>
              <div className="vrd-kpi-label">Today's Bookings</div>
              <div className="vrd-kpi-value">
                {stats?.summary?.todayReservationsCount || 0}
              </div>
            </div>
          </div>

          <div className="vrd-kpi-card">
            <div className="vrd-kpi-icon-wrap purple">
              <UtensilsCrossed size={26} />
            </div>
            <div>
              <div className="vrd-kpi-label">Active Dishes</div>
              <div className="vrd-kpi-value">
                {stats?.summary?.activeMenuItems || 0} / {stats?.summary?.totalMenuItems || 0}
              </div>
            </div>
          </div>

          <div className="vrd-kpi-card">
            <div className="vrd-kpi-icon-wrap emerald">
              <Users size={26} />
            </div>
            <div>
              <div className="vrd-kpi-label">Registered Diners</div>
              <div className="vrd-kpi-value">
                {stats?.summary?.totalCustomers || 0}
              </div>
            </div>
          </div>
        </div>

        {/* 3. TABS NAVIGATION */}
        <div className="vrd-admin-tabs">
          <button
            className={`vrd-admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('orders');
              loadOrders();
            }}
          >
            <ShoppingBag size={18} />
            <span>Orders ({stats?.orders?.total || 0})</span>
          </button>

          <button
            className={`vrd-admin-tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('reservations');
              loadReservations();
            }}
          >
            <Calendar size={18} />
            <span>Table Bookings ({stats?.reservations?.total || 0})</span>
          </button>

          <button
            className={`vrd-admin-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('menu');
              loadMenu();
            }}
          >
            <UtensilsCrossed size={18} />
            <span>Menu Catalog ({stats?.menu?.total || 0})</span>
          </button>

          <button
            className={`vrd-admin-tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tables');
              loadTables();
            }}
          >
            <ShieldCheck size={18} />
            <span>Cafe Tables ({tables.length})</span>
          </button>
        </div>

        {/* ====================================================================
            TAB 1: LIVE ORDERS MANAGEMENT
            ==================================================================== */}
        {activeTab === 'orders' && (
          <div>
            <div className="vrd-admin-toolbar">
              <div className="vrd-filter-chips">
                {['all', 'placed', 'preparing', 'ready', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    className={`vrd-chip ${orderStatusFilter === st ? 'active' : ''}`}
                    onClick={() => {
                      setOrderStatusFilter(st);
                      loadOrders(st);
                    }}
                  >
                    {st.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingOrders ? (
              <div className="vrd-empty-state">
                <RefreshCw size={28} className="vrd-spin" style={{ margin: '0 auto 12px' }} />
                <p>Loading orders from database...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="vrd-empty-state">
                <ShoppingBag size={40} style={{ opacity: 0.4 }} />
                <h4>No orders found</h4>
                <p>There are no customer orders matching the status "{orderStatusFilter}".</p>
              </div>
            ) : (
              <div className="vrd-admin-card-list">
                {orders.map((ord) => (
                  <div key={ord._id} className="vrd-order-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
                          Order #{ord._id?.slice(-8).toUpperCase()}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: '#88998e', marginLeft: '12px' }}>
                          Customer: {ord.userId?.name || 'Walk-in Diner'} ({ord.userId?.email || 'N/A'})
                        </span>
                      </div>
                      <span className={`vrd-status-badge ${ord.status}`}>
                        {ord.status}
                      </span>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="vrd-order-item-line">
                          <span>{it.quantity}x {it.itemNameSnapshot}</span>
                          <span>Rs. {(it.unitPriceSnapshot * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', color: '#88998e', marginRight: '6px' }}>Total Amount:</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--vrd-emerald)' }}>
                          Rs. {(ord.totalAmount || ord.subtotal || 0).toLocaleString()}
                        </strong>
                      </div>

                      {/* State Transition Actions */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {ord.status === 'placed' && (
                          <button
                            className="vrd-btn-admin-action"
                            onClick={() => handleUpdateOrderStatus(ord._id, 'preparing')}
                          >
                            <span>Move To Preparing</span>
                          </button>
                        )}
                        {ord.status === 'preparing' && (
                          <button
                            className="vrd-btn-admin-action"
                            onClick={() => handleUpdateOrderStatus(ord._id, 'ready')}
                          >
                            <span>Mark Ready</span>
                          </button>
                        )}
                        {ord.status === 'ready' && (
                          <button
                            className="vrd-btn-admin-action"
                            onClick={() => handleUpdateOrderStatus(ord._id, 'completed')}
                          >
                            <span>Complete Order</span>
                          </button>
                        )}
                        {(ord.status === 'placed' || ord.status === 'preparing') && (
                          <button
                            className="vrd-btn-admin-delete"
                            onClick={() => handleUpdateOrderStatus(ord._id, 'cancelled')}
                          >
                            <span>Cancel Order</span>
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

        {/* ====================================================================
            TAB 2: TABLE RESERVATIONS MANAGEMENT
            ==================================================================== */}
        {activeTab === 'reservations' && (
          <div>
            <div className="vrd-admin-toolbar">
              <div className="vrd-filter-chips">
                {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    className={`vrd-chip ${reservationStatusFilter === st ? 'active' : ''}`}
                    onClick={() => {
                      setReservationStatusFilter(st);
                      loadReservations(st);
                    }}
                  >
                    {st.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingReservations ? (
              <div className="vrd-empty-state">
                <RefreshCw size={28} className="vrd-spin" style={{ margin: '0 auto 12px' }} />
                <p>Loading table bookings...</p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="vrd-empty-state">
                <Calendar size={40} style={{ opacity: 0.4 }} />
                <h4>No bookings found</h4>
                <p>No table reservations matching "{reservationStatusFilter}".</p>
              </div>
            ) : (
              <div className="vrd-admin-card-list">
                {reservations.map((resItem) => (
                  <div key={resItem._id} className="vrd-order-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
                          Ref #{resItem._id?.slice(-8).toUpperCase()}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: '#88998e', marginLeft: '12px' }}>
                          Guest: {resItem.userId?.name || 'Customer'} ({resItem.userId?.email || 'N/A'})
                        </span>
                      </div>
                      <span className={`vrd-status-badge ${resItem.status}`}>
                        {resItem.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.88rem', color: '#d1ddd4', marginBottom: '12px' }}>
                      <div>
                        <span style={{ color: '#888' }}>Date: </span>
                        <strong>{new Date(resItem.reservationDate).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888' }}>Time Slot: </span>
                        <strong>{resItem.startTime} - {resItem.endTime}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888' }}>Party: </span>
                        <strong>{resItem.guestCount} Guests</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888' }}>Allocated Table: </span>
                        <strong style={{ color: 'var(--vrd-emerald)' }}>
                          Table {resItem.tableId?.tableNumber || 'Assigned'} (Cap: {resItem.tableId?.capacity || 2})
                        </strong>
                      </div>
                    </div>

                    {resItem.specialRequest && (
                      <div style={{ fontSize: '0.8rem', color: '#9fb1a5', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '4px', marginBottom: '12px' }}>
                        <em>Note: {resItem.specialRequest}</em>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                      {resItem.status === 'confirmed' && (
                        <>
                          <button
                            className="vrd-btn-admin-action"
                            onClick={() => handleUpdateReservationStatus(resItem._id, 'completed')}
                          >
                            <span>Mark Completed / Seated</span>
                          </button>
                          <button
                            className="vrd-btn-admin-delete"
                            onClick={() => handleUpdateReservationStatus(resItem._id, 'cancelled')}
                          >
                            <span>Cancel Booking</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB 3: MENU CRUD CATALOG MANAGEMENT
            ==================================================================== */}
        {activeTab === 'menu' && (
          <div>
            <div className="vrd-admin-toolbar">
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} style={{ position: 'absolute', top: '10px', left: '12px', color: '#7d8f82' }} />
                <input
                  type="text"
                  className="vrd-input"
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                  placeholder="Search dishes or categories..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                />
              </div>

              <button
                className="vrd-btn-admin-action"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                onClick={() => openDishModal(null)}
              >
                <Plus size={16} />
                <span>Add Healthy Dish</span>
              </button>
            </div>

            {isLoadingMenu ? (
              <div className="vrd-empty-state">
                <RefreshCw size={28} className="vrd-spin" style={{ margin: '0 auto 12px' }} />
                <p>Loading menu items...</p>
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="vrd-empty-state">
                <UtensilsCrossed size={40} style={{ opacity: 0.4 }} />
                <h4>No dishes match search</h4>
                <p>Try modifying your search query or add a new recipe.</p>
              </div>
            ) : (
              <table className="vrd-admin-table-view">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenuItems.map((dish) => (
                    <tr key={dish._id}>
                      <td>
                        <strong>{dish.name}</strong>
                        {dish.description && (
                          <div style={{ fontSize: '0.78rem', color: '#7d8f82', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {dish.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="vrd-chip" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                          {dish.category}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--vrd-emerald)' }}>
                          Rs. {dish.price?.toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`vrd-status-badge ${dish.isAvailable ? 'ready' : 'cancelled'}`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {dish.isAvailable ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="vrd-btn-admin-action"
                            title="Edit dish"
                            onClick={() => openDishModal(dish)}
                          >
                            <Edit size={14} />
                            <span>Edit</span>
                          </button>
                          {dish.isAvailable && (
                            <button
                              className="vrd-btn-admin-delete"
                              title="Soft delete / deactivate dish"
                              onClick={() => setDeleteConfirmTarget(dish)}
                            >
                              <Trash2 size={14} />
                              <span>Deactivate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB 4: CAFE TABLES OVERVIEW
            ==================================================================== */}
        {activeTab === 'tables' && (
          <div>
            <div className="vrd-kpi-grid">
              {tables.map((t) => (
                <div key={t._id} className="vrd-kpi-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div className="vrd-kpi-icon-wrap emerald" style={{ width: '42px', height: '42px' }}>
                      <ShieldCheck size={20} />
                    </div>
                    <span className="vrd-status-badge ready">Operational</span>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                      Table {t.tableNumber}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#88998e', marginTop: '2px' }}>
                      Capacity: <strong>{t.capacity} Guests</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
          MODAL: ADD / EDIT DISH
          ==================================================================== */}
      {isDishModalOpen && (
        <div
          className="vrd-drawer-overlay"
          style={{ alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setIsDishModalOpen(false)}
        >
          <div className="vrd-admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="vrd-icon-btn"
              style={{ position: 'absolute', top: '16px', right: '16px' }}
              onClick={() => setIsDishModalOpen(false)}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '6px' }}>
              {editingDish ? 'Edit Menu Dish' : 'Add New Healthy Dish'}
            </h3>
            <p style={{ color: '#8fa194', fontSize: '0.85rem', marginBottom: '20px' }}>
              Create or modify dishes in the authoritative database catalog.
            </p>

            <form onSubmit={handleDishSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="vrd-form-group">
                <label>Dish / Drink Name</label>
                <input
                  type="text"
                  className="vrd-input"
                  placeholder="e.g. Amazonian Dragonfruit Bowl"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="vrd-form-group">
                  <label>Category</label>
                  <select
                    className="vrd-select"
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                  >
                    <option value="Bowls">Bowls</option>
                    <option value="Juices">Juices</option>
                    <option value="Toast">Toast</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div className="vrd-form-group">
                  <label>Price (LKR)</label>
                  <input
                    type="number"
                    className="vrd-input"
                    placeholder="e.g. 2100"
                    min="1"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="vrd-form-group">
                <label>Description & Ingredients</label>
                <textarea
                  className="vrd-input"
                  rows="3"
                  placeholder="Describe health benefits and ingredients..."
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="dishAvail"
                  checked={dishForm.isAvailable}
                  onChange={(e) => setDishForm({ ...dishForm, isAvailable: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--vrd-emerald)' }}
                />
                <label htmlFor="dishAvail" style={{ fontSize: '0.88rem', color: '#ffffff', cursor: 'pointer' }}>
                  Available in Customer Menu Tray
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="vrd-btn-outline"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setIsDishModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="vrd-btn-emerald"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {editingDish ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: DEACTIVATE / DELETE CONFIRMATION
          ==================================================================== */}
      {deleteConfirmTarget && (
        <div
          className="vrd-drawer-overlay"
          style={{ alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setDeleteConfirmTarget(null)}
        >
          <div className="vrd-admin-modal-box" style={{ maxWidth: '440px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>⚠️</div>
            <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '8px' }}>
              Confirm Deactivation
            </h3>
            <p style={{ color: '#9fa6a1', fontSize: '0.88rem', marginBottom: '24px' }}>
              Are you sure you want to deactivate <strong style={{ color: '#ffffff' }}>"{deleteConfirmTarget.name}"</strong>? It will be safely hidden from public customer ordering while preserving historical order logs.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="vrd-btn-outline"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setDeleteConfirmTarget(null)}
              >
                Keep Active
              </button>
              <button
                className="vrd-btn-admin-delete"
                style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                onClick={confirmDeleteDish}
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="vrd-toast">
          <CheckCircle size={18} color="var(--vrd-emerald)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
