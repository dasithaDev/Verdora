import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Clock,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Heart,
  User,
  Star,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Leaf,
  UtensilsCrossed,
  Package,
  PackageOpen,
  Truck,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { getMenuItems } from '../services/menuService';
import { createOrder, getMyOrders, cancelOrder } from '../services/orderService';
import {
  createReservation as apiCreateReservation,
  getMyReservations as apiGetMyReservations,
  cancelReservation as apiCancelReservation,
} from '../services/reservationService';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe as apiGetMe } from '../services/authService';
import VerdoraDatePicker from './VerdoraDatePicker';
import './VerdoraCafe.css';

// Lightweight Social SVG Icons
const FacebookIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const InstagramIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const TwitterIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const YoutubeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// All dishes and pantry products are loaded dynamically from the live MongoDB database.


// Verdora Pillars
const VERDORA_PILLARS = [
  {
    id: 'p-1',
    icon: <Coffee size={32} />,
    title: 'Single-Origin Roasts',
    desc: 'High-altitude Arabica shade-grown beans roasted in micro-batches to highlight complex notes of berry and caramel.',
  },
  {
    id: 'p-2',
    icon: <Leaf size={32} />,
    title: 'Farm-To-Table Kitchen',
    desc: '100% refined-sugar-free, organic produce sourced from local bio-diverse farms within hours of harvesting.',
  },
  {
    id: 'p-3',
    icon: <Sparkles size={32} />,
    title: 'Cold-Pressed Juicery',
    desc: 'Hydraulic cold-press extraction preserving maximum live enzymes, phytonutrients, and natural vitality in every bottle.',
  },
  {
    id: 'p-4',
    icon: <ShieldCheck size={32} />,
    title: 'Precision Extraction',
    desc: 'Custom La Marzocco and Slayer commercial equipment dialed to 9-bar consistency and temperature stability.',
  },
];

// Guest Testimonials
const GUEST_TESTIMONIALS = [
  {
    id: 'gt-1',
    name: 'Nuwan Perera',
    role: 'Verified Regular & Tech Lead',
    avatar: 'NP',
    rating: 5,
    text: '“Verdora is the only cafe in Colombo where I can get authentic single-origin espresso and an açai bowl that rivals anything in Bali. The serene ambiance is unmatched.”',
  },
  {
    id: 'gt-2',
    name: 'Dr. Sarah Jenkins',
    role: 'Holistic Nutritionist',
    avatar: 'SJ',
    rating: 5,
    text: '“The commitment to clean, non-inflammatory ingredients is what sets Verdora apart. Their Green Goddess juice and sourdough tartine are staples in my weekly routine.”',
  },
  {
    id: 'gt-3',
    name: 'Kavinda Silva',
    role: 'Creative Director',
    avatar: 'KS',
    rating: 5,
    text: '“A true sanctuary for coffee aficionados. Whether catching up on work with high-speed WiFi or having a relaxed brunch, the hospitality and flavors never disappoint.”',
  },
];

// Wellness Journal Posts
const JOURNAL_POSTS = [
  {
    id: 'j-1',
    date: '20th March 2026',
    title: 'The Science of Clean Fuel: Why We Don’t Use Seed Oils',
    desc: 'Discover why our kitchen exclusively crafts with cold-pressed extra virgin olive oil, avocado oil, and grass-fed organic ghee.',
    image: '/images/avocado-toast.jpg',
  },
  {
    id: 'j-2',
    date: '14th March 2026',
    title: 'From Cherry to Cup: Sustainable Highland Coffee Farming',
    desc: 'How our direct partnerships with smallholder farmers support regenerative agriculture and deliver richer coffee flavors.',
    image: '/images/coffee-harvest.jpg',
  },
  {
    id: 'j-3',
    date: '8th March 2026',
    title: 'Optimizing Digestion With Cold-Pressed Morning Greens',
    desc: 'Our nutritionist breaks down the bioavailability of raw leafy greens and roots when gently pressed without heat friction.',
    image: '/images/green-juice.jpg',
  },
];

export default function VerdoraCafe({
  onSwitchToCatalog,
  onSwitchToAdmin,
  onSwitchToProfile,
  onAuthSuccess,
  currentUser: propCurrentUser,
}) {
  // Navigation & Scroll
  const [activeSection, setActiveSection] = useState('home');

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist State
  const [wishlist, setWishlist] = useState([]);

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  // Menu Category Filter
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Table Booking Form State
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    email: '',
    phone: '',
    date: '',
    time: '6:30 PM',
    guests: '2 Persons (Table for Two)',
    tableType: 'Indoor Botanical Corner',
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  // Form Validation States
  const [bookingErrors, setBookingErrors] = useState({});
  const [bookingTouched, setBookingTouched] = useState({});
  const [authErrors, setAuthErrors] = useState({});
  const [authTouched, setAuthTouched] = useState({});

  // Real-time Field Validator for Table Reservations
  const validateBookingField = (field, val) => {
    switch (field) {
      case 'firstName': {
        const trimmed = (val || '').trim();
        if (!trimmed) return 'Full Name is required.';
        if (trimmed.length < 2) return 'Full Name must be at least 2 characters.';
        if (!/^[a-zA-Z\s'.\-]+$/.test(trimmed)) return 'Name should contain letters and spaces only.';
        return '';
      }
      case 'email': {
        const trimmed = (val || '').trim();
        if (!trimmed) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          return 'Please enter a valid email address (e.g. name@example.com).';
        }
        return '';
      }
      case 'phone': {
        const trimmed = (val || '').trim();
        if (!trimmed) return 'Phone number is required.';
        const digits = trimmed.replace(/[^0-9]/g, '');
        if (digits.length < 9 || digits.length > 15) {
          return 'Enter a valid phone number (9-15 digits, e.g. +94 77 123 4567).';
        }
        return '';
      }
      case 'date': {
        if (!val) return 'Please select a reservation date.';
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${d}`;
        if (val < todayStr) return 'Reservation date cannot be in the past.';
        return '';
      }
      default:
        return '';
    }
  };

  const validateAllBooking = () => {
    const errs = {
      firstName: validateBookingField('firstName', bookingForm.firstName),
      email: validateBookingField('email', bookingForm.email),
      phone: validateBookingField('phone', bookingForm.phone),
      date: validateBookingField('date', bookingForm.date),
    };
    const active = {};
    Object.keys(errs).forEach((k) => {
      if (errs[k]) active[k] = errs[k];
    });
    setBookingErrors(active);
    return active;
  };

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(propCurrentUser || null);

  useEffect(() => {
    if (propCurrentUser !== undefined) {
      setCurrentUser(propCurrentUser);
    }
  }, [propCurrentUser]);

  // Orders State (Phase 06)
  const [dbMenuItems, setDbMenuItems] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrderConfirmed, setPlacedOrderConfirmed] = useState(null);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Reservation States (Phase 07)
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [isReservationsModalOpen, setIsReservationsModalOpen] = useState(false);
  const [customerReservations, setCustomerReservations] = useState([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Restore authenticated session & fetch real menu items on mount
  useEffect(() => {
    apiGetMe()
      .then((res) => {
        const userData = res?.data?.user || res?.data;
        if (userData && (userData.role || userData.name)) {
          setCurrentUser(userData);
        }
      })
      .catch(() => {
        // Guest user
      });

    getMenuItems({ limit: 100 })
      .then((res) => {
        if (res?.data?.items?.length) {
          setDbMenuItems(res.data.items);
        }
      })
      .catch((err) => console.warn('Could not fetch DB items:', err));
  }, []);

  // Add Item to Cart
  const addToCart = (item) => {
    setCart((prev) => {
      const itemId = item._id || item.id;
      const existing = prev.find((i) => (i._id || i.id) === itemId);
      if (existing) {
        return prev.map((i) => ((i._id || i.id) === itemId ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, _id: itemId, id: itemId, qty: 1 }];
    });
    showToast(`Added ${item.name || item.title} to your tray!`);
  };

  // Update Cart Qty
  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          const itemId = item._id || item.id;
          if (itemId === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Toggle Wishlist
  const toggleWishlist = (item) => {
    setWishlist((prev) => {
      const itemId = item._id || item.id;
      const exists = prev.some((i) => (i._id || i.id) === itemId);
      if (exists) {
        showToast('Removed from favorites');
        return prev.filter((i) => (i._id || i.id) !== itemId);
      } else {
        showToast(`Saved ${item.title || item.name} to favorites.`);
        return [...prev, item];
      }
    });
  };

  // Cart Totals in LKR
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Handle Order Checkout (Phase 06 Lifecycle)
  const handleCheckout = async () => {
    if (!currentUser) {
      setIsCartOpen(false);
      setAuthMode('login');
      setIsAuthOpen(true);
      showToast('Please sign in or register to place your order.');
      return;
    }

    if (cart.length === 0) {
      showToast('Your order tray is empty!');
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Map cart items to authoritative MongoDB Item IDs
      const orderItems = cart.map((cartItem) => ({
        menuItemId: cartItem._id || cartItem.id,
        quantity: cartItem.qty,
      }));

      const res = await createOrder({ items: orderItems, notes: '' });
      setPlacedOrderConfirmed(res.data);
      setCart([]);
      setIsCartOpen(false);
      showToast(`Order placed successfully! Reference #${res.data._id.slice(-6).toUpperCase()}`);
    } catch (err) {
      const errMsg = err?.response?.data?.error?.message || err.message || 'Failed to place order';
      showToast(errMsg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Handle Opening Order History Modal
  const handleOpenOrdersModal = async () => {
    setIsOrdersModalOpen(true);
    setIsLoadingOrders(true);
    try {
      const res = await getMyOrders({ limit: 20 });
      setCustomerOrders(res.data.orders || []);
    } catch (err) {
      showToast('Could not load orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Handle Order Cancellation by Customer
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      showToast('Order cancelled successfully.');
      const res = await getMyOrders({ limit: 20 });
      setCustomerOrders(res.data.orders || []);
    } catch (err) {
      const errMsg = err?.response?.data?.error?.message || err.message || 'Could not cancel order';
      showToast(errMsg);
    }
  };

  // Handle Real Table Booking Submission (Phase 07)
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthMode('login');
      setIsAuthOpen(true);
      showToast('Please sign in or register to reserve a table.');
      return;
    }

    // Validate all fields
    setBookingTouched({ firstName: true, email: true, phone: true, date: true });
    const errors = validateAllBooking();
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      showToast(firstError);
      return;
    }

    // Map time slot to 24-hr format
    const timeMap = {
      '8:30 AM': '08:30',
      '10:30 AM': '10:30',
      '1:00 PM': '13:00',
      '4:00 PM': '16:00',
      '6:30 PM': '18:30',
      '8:00 PM': '20:00',
    };
    const startTime = timeMap[bookingForm.time] || '18:30';

    // Parse guest count e.g. "2 Persons (Table for Two)" -> 2
    const guestMatch = bookingForm.guests.match(/^(\d+)/);
    const guestCount = guestMatch ? parseInt(guestMatch[1], 10) : 2;

    setIsSubmittingBooking(true);
    try {
      const res = await apiCreateReservation({
        reservationDate: bookingForm.date,
        startTime,
        guestCount,
        specialRequest: `${bookingForm.tableType} - Guest: ${bookingForm.firstName} (${bookingForm.phone})`,
      });

      const confirmedData = res.data;
      setBookingConfirmed({
        ticketId: 'VRD-' + confirmedData._id.slice(-6).toUpperCase(),
        firstName: bookingForm.firstName || currentUser?.name || 'Valued Guest',
        date: bookingForm.date,
        time: bookingForm.time,
        guests: bookingForm.guests,
        tableType: confirmedData.tableId?.tableNumber
          ? `Table ${confirmedData.tableId.tableNumber} (${bookingForm.tableType})`
          : bookingForm.tableType,
        ...confirmedData,
      });
      setBookingErrors({});
      setBookingTouched({});
      showToast(`Table reserved! Reference: VRD-${confirmedData._id.slice(-6).toUpperCase()}`);
    } catch (err) {
      const errMsg = err?.response?.data?.error?.message || err.message || 'Could not complete reservation';
      showToast(errMsg);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Handle Opening Customer Reservations History Modal
  const handleOpenReservationsModal = async () => {
    setIsReservationsModalOpen(true);
    setIsLoadingReservations(true);
    try {
      const res = await apiGetMyReservations();
      setCustomerReservations(res.data.reservations || []);
    } catch (err) {
      showToast('Could not load reservations');
    } finally {
      setIsLoadingReservations(false);
    }
  };

  // Handle Cancelling a Customer Reservation
  const handleCancelReservation = async (reservationId) => {
    try {
      await apiCancelReservation(reservationId);
      showToast('Reservation cancelled successfully.');
      const res = await apiGetMyReservations();
      setCustomerReservations(res.data.reservations || []);
    } catch (err) {
      const errMsg = err?.response?.data?.error?.message || err.message || 'Could not cancel reservation';
      showToast(errMsg);
    }
  };

  // Handle Real Auth Submission (Login or Register)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthTouched({ name: true, email: true, password: true });
    const errs = {};

    if (authMode === 'register') {
      const trimmedName = (authForm.name || '').trim();
      if (!trimmedName) errs.name = 'Full Name is required.';
      else if (trimmedName.length < 2) errs.name = 'Full Name must be at least 2 characters.';
    }

    const trimmedEmail = (authForm.email || '').trim();
    if (!trimmedEmail) errs.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!authForm.password) {
      errs.password = 'Password is required.';
    } else if (authMode === 'register' && authForm.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }

    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs);
      showToast(Object.values(errs)[0]);
      return;
    }
    setAuthErrors({});

    try {
      let res;
      if (authMode === 'login') {
        res = await apiLogin({ email: trimmedEmail, password: authForm.password });
      } else {
        res = await apiRegister({ name: authForm.name.trim(), email: trimmedEmail, password: authForm.password });
      }

      const userData = res?.data?.user || res?.data;
      const userName = userData?.name || 'Member';
      showToast(authMode === 'login' ? `Welcome back, ${userName}!` : `Account created! Welcome to Verdora, ${userName}!`);

      setCurrentUser(userData);
      if (onAuthSuccess) onAuthSuccess(userData);
      setIsAuthOpen(false);
      setShowAuthPassword(false);
      setAuthForm({ name: '', email: '', password: '' });
      setAuthErrors({});
      setAuthTouched({});
    } catch (err) {
      const errMsg = err?.response?.data?.error?.message || err.message || 'Authentication failed';
      showToast(errMsg);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await apiLogout();
    } catch (e) {}
    setCurrentUser(null);
    if (onAuthSuccess) onAuthSuccess(null);
    showToast('You have signed out of Verdora.');
  };

  // Handle Newsletter
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const trimmed = (newsletterEmail || '').trim();
    if (!trimmed) {
      showToast('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      showToast('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    showToast('Subscribed! Welcome to the Verdora Wellness Club.');
    setNewsletterEmail('');
  };

  // Smooth Scroll to Section
  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered Menu Items (purely live from MongoDB database)
  const filteredMenu =
    selectedCategory === 'All'
      ? dbMenuItems
      : dbMenuItems.filter((item) => item.category === selectedCategory);

  // Take-Home Roastery & Pantry Items from Database
  const pantryProducts = dbMenuItems.filter(
    (item) =>
      item.name.includes('Beans') ||
      item.name.includes('Granola') ||
      item.name.includes('Concentrate') ||
      item.name.includes('Tin') ||
      item.name.includes('Cashews') ||
      item.name.includes('Bites')
  ).slice(0, 4);

  return (
    <div className="verdora-page">
      {/* ====================================================================
          1. TOP BAR (Hours, Location, Socials, Cart, Wishlist, Auth)
          ==================================================================== */}
      <div className="vrd-topbar">
        <div className="container vrd-topbar-inner">
          <div className="vrd-topbar-left">
            <div className="vrd-topbar-item">
              <Clock size={14} color="var(--vrd-gold)" />
              <span>Mon - Fri: 8:00 - 21:00 / Weekends: 8:00 - 22:00</span>
            </div>
            <div className="vrd-topbar-item" style={{ opacity: 0.85 }}>
              <MapPin size={14} color="var(--vrd-emerald)" />
              <span>42 Lotus Grove Blvd, Colombo 07</span>
            </div>
            <div className="vrd-topbar-socials">
              <a href="#social" title="Facebook"><FacebookIcon size={14} /></a>
              <a href="#social" title="Instagram"><InstagramIcon size={14} /></a>
              <a href="#social" title="Twitter"><TwitterIcon size={14} /></a>
              <a href="#social" title="YouTube"><YoutubeIcon size={14} /></a>
            </div>
          </div>

          <div className="vrd-topbar-right">
            {/* Wishlist & Shopping Cart only for guests / regular customers */}
            {currentUser?.role !== 'admin' && (
              <>
                <button
                  className="vrd-icon-btn"
                  title="Favorites"
                  onClick={() => showToast(`You have ${wishlist.length} items in your wishlist.`)}
                >
                  <Heart size={18} />
                  {wishlist.length > 0 && (
                    <span className="vrd-badge-count">{wishlist.length}</span>
                  )}
                </button>

                <button
                  className="vrd-icon-btn"
                  title="Shopping Cart Tray"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingBag size={18} />
                  {cartItemCount > 0 && (
                    <span className="vrd-badge-count">{cartItemCount}</span>
                  )}
                </button>
              </>
            )}

            {/* Authenticated User Actions & Profile */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Regular Customers Only: My Orders & My Bookings */}
                {currentUser.role !== 'admin' && (
                  <>
                    <button
                      className="vrd-btn-login"
                      style={{ padding: '6px 14px', fontSize: '0.75rem', gap: '6px' }}
                      title="View My Order History"
                      onClick={handleOpenOrdersModal}
                    >
                      <Package size={14} />
                      <span>My Orders</span>
                    </button>
                    <button
                      className="vrd-btn-login"
                      style={{ padding: '6px 14px', fontSize: '0.75rem', gap: '6px' }}
                      title="View My Table Reservations"
                      onClick={handleOpenReservationsModal}
                    >
                      <Calendar size={14} />
                      <span>My Bookings</span>
                    </button>
                  </>
                )}

                {/* Admins Only: Direct Dashboard Button */}
                {currentUser.role === 'admin' && (
                  <button
                    className="vrd-btn-login"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.75rem',
                      gap: '6px',
                      background: 'rgba(207, 161, 105, 0.16)',
                      borderColor: 'var(--vrd-gold)',
                      color: 'var(--vrd-gold)',
                      fontWeight: 700,
                    }}
                    title="Access Operations & Admin Analytics"
                    onClick={onSwitchToAdmin}
                  >
                    <ShieldCheck size={14} />
                    <span>Dashboard</span>
                  </button>
                )}

                {/* Profile Button - Replaces Login/SignUp Button */}
                <button
                  className="vrd-btn-login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#ffffff',
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onClick={onSwitchToProfile}
                  title="View and Edit Your Profile"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="avatar"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid var(--vrd-emerald)',
                      }}
                    />
                  ) : (
                    <User size={14} color="var(--vrd-emerald)" />
                  )}
                  <span>Profile</span>
                  {currentUser.role === 'admin' && (
                    <span
                      style={{
                        fontSize: '0.62rem',
                        padding: '1px 5px',
                        borderRadius: '6px',
                        background: 'rgba(207, 161, 105, 0.3)',
                        color: 'var(--vrd-gold)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        marginLeft: '2px',
                      }}
                    >
                      Admin
                    </span>
                  )}
                </button>

                {/* Sign Out Button */}
                <button
                  className="vrd-btn-login"
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.72rem',
                    opacity: 0.75,
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                  onClick={handleSignOut}
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                className="vrd-btn-login"
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthOpen(true);
                }}
              >
                Login or Sign Up
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. STICKY MAIN NAVBAR
          ==================================================================== */}
      <header className="vrd-navbar">
        <div className="container vrd-nav-inner">
          {/* Logo (Directly connects to Home) */}
          <div
            className="vrd-logo"
            onClick={() => scrollTo('home')}
            title="Verdora - Return to Top"
            role="button"
            tabIndex={0}
          >
            <img src="/images/logo.png" alt="Verdora Logo" className="vrd-logo-img" />
            <div className="vrd-logo-brand">
              <div className="vrd-logo-text">VERDORA</div>
              <span className="vrd-logo-tagline">Healthy Cafe & Kitchen</span>
            </div>
          </div>

          {/* Navigation Links - In Admin mode, ONLY show Dashboard & Profile */}
          <nav className="vrd-nav-links">
            {currentUser?.role === 'admin' ? (
              <>
                <button
                  className="vrd-nav-admin-btn active"
                  style={{
                    color: 'var(--vrd-gold)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(207, 161, 105, 0.16)',
                    padding: '8px 22px',
                    borderRadius: '24px',
                    border: '1px solid rgba(207, 161, 105, 0.5)',
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                  }}
                  onClick={onSwitchToAdmin}
                  title="Open Admin Dashboard"
                >
                  <ShieldCheck size={16} />
                  <span>Dashboard</span>
                </button>

                <button
                  className="vrd-nav-admin-btn"
                  style={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(16, 185, 129, 0.16)',
                    padding: '8px 22px',
                    borderRadius: '24px',
                    border: '1px solid rgba(16, 185, 129, 0.45)',
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                  }}
                  onClick={onSwitchToProfile}
                  title="Open Admin Profile"
                >
                  <User size={16} color="var(--vrd-emerald)" />
                  <span>Profile</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className={activeSection === 'about' ? 'active' : ''}
                  onClick={() => scrollTo('about')}
                >
                  Our Story
                </button>
                <button
                  className={activeSection === 'menu' ? 'active' : ''}
                  onClick={() => scrollTo('menu')}
                >
                  Menu
                </button>
                <button
                  className={activeSection === 'booking' ? 'active' : ''}
                  onClick={() => scrollTo('booking')}
                >
                  Reservations
                </button>
                <button
                  className={activeSection === 'shop' ? 'active' : ''}
                  onClick={() => scrollTo('shop')}
                >
                  Pantry Shop
                </button>
                <button
                  className={activeSection === 'blog' ? 'active' : ''}
                  onClick={() => scrollTo('blog')}
                >
                  Journal
                </button>
                <button
                  className={activeSection === 'contact' ? 'active' : ''}
                  onClick={() => scrollTo('contact')}
                >
                  Visit Us
                </button>
              </>
            )}
          </nav>

          {/* Right Action: Hotline & Book Table CTA for Customers / Console CTA for Admin */}
          <div className="vrd-nav-right">
            {currentUser?.role === 'admin' ? (
              <button
                className="vrd-btn-book-nav"
                style={{
                  background: 'linear-gradient(135deg, #cfa169, #b58950)',
                  color: '#0c120e',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: 'none',
                  padding: '9px 24px',
                  borderRadius: '24px',
                  boxShadow: '0 4px 14px rgba(207, 161, 105, 0.3)',
                  cursor: 'pointer',
                }}
                onClick={onSwitchToAdmin}
                title="Go to Admin Operations Console"
              >
                <ShieldCheck size={16} />
                <span>Admin Console →</span>
              </button>
            ) : (
              <>
                <a href="tel:+94112345678" className="vrd-nav-hotline" title="Call Reservations Hotline">
                  <Phone size={13} />
                  <span>+94 11 234 5678</span>
                </a>

                <button
                  className="vrd-btn-book-nav"
                  onClick={() => scrollTo('booking')}
                >
                  <Calendar size={14} />
                  <span>Book Table</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ====================================================================
          3. HERO / SLIDER SECTION
          ==================================================================== */}
      <section id="home" className="vrd-hero">
        <div className="container">
          <div className="vrd-hero-grid">
            <div className="vrd-hero-content">
              <h5>
                <span className="dot"></span> Welcome To Verdora Cafe & Kitchen
              </h5>
              <h1>
                Nourish Your Body With <span className="gold">Botanical Plates</span> &{' '}
                <span className="crema">Artisan Coffee</span>
              </h1>
              <p>
                Handcrafted single-origin roasts, silky oat flat whites, and nutrient-dense superfood bowls crafted
                from 100% whole, organic ingredients. Step inside your daily wellness sanctuary.
              </p>
              <div className="vrd-hero-btns">
                <button
                  className="vrd-btn-hero-primary"
                  onClick={() => scrollTo('booking')}
                >
                  <Calendar size={18} /> Book A Table
                </button>
                <button
                  className="vrd-btn-hero-outline"
                  onClick={() => scrollTo('menu')}
                >
                  <UtensilsCrossed size={18} /> Explore Our Menu
                </button>
              </div>
            </div>

            {/* Visual Showcase Card */}
            <div className="vrd-hero-visual">
              <div className="vrd-hero-cup-card">
                <div className="vrd-hero-img-frame">
                  <img src="/images/hero-coffee.jpg" alt="Verdora Artisan Vanilla Oat Latte" />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
                  Artisan Vanilla Oat Latte
                </h3>
                <p style={{ color: 'var(--vrd-text-muted)', fontSize: '0.9rem' }}>
                  Double Ristretto • Sprouted Oat Cream • Madagascar Vanilla
                </p>

                {/* Floating Badges */}
                <div className="vrd-hero-floating-badge top-right">
                  <Star size={18} color="#eab308" fill="#eab308" />
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>4.95 Rating</strong>
                    <div style={{ fontSize: '0.7rem', color: '#9fa6a1' }}>2,400+ Happy Guests</div>
                  </div>
                </div>

                <div className="vrd-hero-floating-badge bottom-left">
                  <Leaf size={18} color="var(--vrd-emerald)" />
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>100% Organic</strong>
                    <div style={{ fontSize: '0.7rem', color: '#9fa6a1' }}>Seed-Oil Free Kitchen</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. ABOUT US / OUR STORY SECTION
          ==================================================================== */}
      <section id="about" className="vrd-about-section">
        <div className="container">
          <div className="vrd-about-grid">
            {/* Visual Box */}
            <div className="vrd-about-visual">
              <div className="vrd-about-img-box" style={{ overflow: 'hidden' }}>
                <img
                  src="/images/cafe-interior.jpg"
                  alt="Verdora Cafe Interior"
                  className="vrd-about-img-bg"
                />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h3 style={{ fontSize: '1.6rem', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                    The Verdora Philosophy
                  </h3>
                  <p style={{ color: '#e2ece4', maxWidth: '320px', marginTop: '10px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                    Mindful living starts with vibrant nourishment. We combine third-wave specialty roasting with nutrient-rich botanical breakfast cuisine.
                  </p>
                </div>
                <div className="vrd-about-experience-badge">
                  <strong>100%</strong>
                  <span>Organic • Whole Foods • Ethical Trade</span>
                </div>
              </div>
            </div>

            {/* About Content */}
            <div className="vrd-about-content">
              <div className="vrd-section-title text-left" style={{ marginBottom: '24px' }}>
                <span className="vrd-sub-badge">
                  <span className="dot"></span> Our Story & Roots
                </span>
                <h2>Crafted For Wellness, Brewed With Passion</h2>
              </div>
              <p>
                Verdora was created to prove that wholesome, plant-forward cuisine and world-class specialty coffee
                belong at the very same table. We partner with heritage micro-farms across the highlands to source
                uncompromised single-origin coffee beans and farm-fresh botanicals.
              </p>
              <p>
                Every bowl is assembled with intention: no refined sugars, no industrial seed oils, and zero artificial
                preservatives. Just crisp organic greens, cold-pressed elixirs, and espresso shots with a velvety crema that wakes your senses.
              </p>

              <div className="vrd-about-meta">
                <div className="vrd-signature">
                  <span className="vrd-signature-script">Dasitha Nayanapriya</span>
                  <span className="vrd-signature-title">Founder & Executive Kitchen Lead</span>
                </div>

                <button
                  className="vrd-btn-primary"
                  onClick={() => scrollTo('menu')}
                >
                  Explore Our Creations
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. FEATURES SECTION ("What We Offer")
          ==================================================================== */}
      <section id="features" className="vrd-features-section vrd-light-section">
        <div className="container">
          <div className="vrd-section-title">
            <span className="vrd-sub-badge">
              <span className="dot"></span> What We Offer
            </span>
            <h2>Pure Quality In Every Detail</h2>
            <p>
              Every element of Verdora is designed to elevate your day — from morning espresso rituals to nourishing
              brunch bowls and calming herbal infusions.
              <br />
              <br />
            </p>
          </div>

          <div className="vrd-features-grid">
            {VERDORA_PILLARS.map((pillar) => (
              <div key={pillar.id} className="vrd-feature-card">
                <div className="vrd-feature-icon">{pillar.icon}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
                <span
                  className="vrd-feature-link"
                  style={{ cursor: 'pointer' }}
                  onClick={() => scrollTo('menu')}
                >
                  Discover Menu <ArrowRight size={14} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. TABLE RESERVATIONS SECTION ("Reserve Your Table at Verdora")
          ==================================================================== */}
      <section id="booking" className="vrd-booking-section">
        <div className="container">
          <div className="vrd-booking-box">
            {/* Booking Form */}
            <div className="vrd-booking-form-wrap">
              <div className="vrd-section-title text-left">
                <span className="vrd-sub-badge">
                  <span className="dot"></span> Table Reservations
                </span>
                <h2>Reserve Your Spot at Verdora</h2>
                <p>Join us for breakfast, working coffee sessions, or an intimate weekend brunch.</p>
              <br/>
              </div>

              <form onSubmit={handleBookingSubmit} className="vrd-form-grid">
                <div className="vrd-form-group full-width">
                  <label htmlFor="booking-name">Full Name *</label>
                  <input
                    id="booking-name"
                    type="text"
                    className={`vrd-input ${bookingTouched.firstName && bookingErrors.firstName ? 'error' : ''}`}
                    placeholder="e.g. Dasitha Bandara"
                    value={bookingForm.firstName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBookingForm({ ...bookingForm, firstName: val });
                      if (bookingTouched.firstName) {
                        setBookingErrors((prev) => ({ ...prev, firstName: validateBookingField('firstName', val) }));
                      }
                    }}
                    onBlur={() => {
                      setBookingTouched((prev) => ({ ...prev, firstName: true }));
                      setBookingErrors((prev) => ({ ...prev, firstName: validateBookingField('firstName', bookingForm.firstName) }));
                    }}
                    required
                  />
                  {bookingTouched.firstName && bookingErrors.firstName && (
                    <span className="vrd-field-error">
                      <AlertCircle size={13} /> {bookingErrors.firstName}
                    </span>
                  )}
                </div>

                <div className="vrd-form-group">
                  <label htmlFor="booking-email">Email Address *</label>
                  <input
                    id="booking-email"
                    type="email"
                    className={`vrd-input ${bookingTouched.email && bookingErrors.email ? 'error' : ''}`}
                    placeholder="name@example.com"
                    value={bookingForm.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBookingForm({ ...bookingForm, email: val });
                      if (bookingTouched.email) {
                        setBookingErrors((prev) => ({ ...prev, email: validateBookingField('email', val) }));
                      }
                    }}
                    onBlur={() => {
                      setBookingTouched((prev) => ({ ...prev, email: true }));
                      setBookingErrors((prev) => ({ ...prev, email: validateBookingField('email', bookingForm.email) }));
                    }}
                    required
                  />
                  {bookingTouched.email && bookingErrors.email && (
                    <span className="vrd-field-error">
                      <AlertCircle size={13} /> {bookingErrors.email}
                    </span>
                  )}
                </div>

                <div className="vrd-form-group">
                  <label htmlFor="booking-phone">Phone Number *</label>
                  <input
                    id="booking-phone"
                    type="tel"
                    className={`vrd-input ${bookingTouched.phone && bookingErrors.phone ? 'error' : ''}`}
                    placeholder="+94 77 123 4567"
                    value={bookingForm.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBookingForm({ ...bookingForm, phone: val });
                      if (bookingTouched.phone) {
                        setBookingErrors((prev) => ({ ...prev, phone: validateBookingField('phone', val) }));
                      }
                    }}
                    onBlur={() => {
                      setBookingTouched((prev) => ({ ...prev, phone: true }));
                      setBookingErrors((prev) => ({ ...prev, phone: validateBookingField('phone', bookingForm.phone) }));
                    }}
                    required
                  />
                  {bookingTouched.phone && bookingErrors.phone && (
                    <span className="vrd-field-error">
                      <AlertCircle size={13} /> {bookingErrors.phone}
                    </span>
                  )}
                </div>

                <div className="vrd-form-group">
                  <label htmlFor="booking-date">Reservation Date *</label>
                  <VerdoraDatePicker
                    id="booking-date"
                    value={bookingForm.date}
                    error={bookingTouched.date && !!bookingErrors.date}
                    onChange={(dateStr) => {
                      setBookingForm({ ...bookingForm, date: dateStr });
                      setBookingTouched((prev) => ({ ...prev, date: true }));
                      setBookingErrors((prev) => ({ ...prev, date: validateBookingField('date', dateStr) }));
                    }}
                    onBlur={() => {
                      setBookingTouched((prev) => ({ ...prev, date: true }));
                      setBookingErrors((prev) => ({ ...prev, date: validateBookingField('date', bookingForm.date) }));
                    }}
                    placeholder="Choose reservation date..."
                    required
                  />
                  {bookingTouched.date && bookingErrors.date && (
                    <span className="vrd-field-error">
                      <AlertCircle size={13} /> {bookingErrors.date}
                    </span>
                  )}
                </div>

                <div className="vrd-form-group">
                  <label>Time Slot</label>
                  <select
                    className="vrd-select"
                    value={bookingForm.time}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, time: e.target.value })
                    }
                  >
                    <option value="8:30 AM">8:30 AM (Early Brew & Breakfast)</option>
                    <option value="10:30 AM">10:30 AM (Mid-Morning Brunch)</option>
                    <option value="1:00 PM">1:00 PM (Healthy Lunch & Bowls)</option>
                    <option value="4:00 PM">4:00 PM (Afternoon Specialty Tea)</option>
                    <option value="6:30 PM">6:30 PM (Sunset Tasting)</option>
                    <option value="8:00 PM">8:00 PM (Dinner & Dessert)</option>
                  </select>
                </div>

                <div className="vrd-form-group">
                  <label>Number Of Guests</label>
                  <select
                    className="vrd-select"
                    value={bookingForm.guests}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, guests: e.target.value })
                    }
                  >
                    <option value="1 Person (Solo Work Bar)">1 Person (Solo Work Bar)</option>
                    <option value="2 Persons (Table for Two)">2 Persons (Table for Two - T-01)</option>
                    <option value="4 Persons (Garden Table)">4 Persons (Garden Table - T-03)</option>
                    <option value="6 Persons (Banquette)">6 Persons (Botanical Banquette - T-06)</option>
                    <option value="8 Persons (Private Lounge)">8 Persons (Verdora Lounge - T-08)</option>
                  </select>
                </div>

                <div className="vrd-form-group">
                  <label>Seating Preference</label>
                  <select
                    className="vrd-select"
                    value={bookingForm.tableType}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, tableType: e.target.value })
                    }
                  >
                    <option value="Indoor Botanical Corner">Indoor Botanical Corner</option>
                    <option value="Sunlit Window Bar">Sunlit Window Bar</option>
                    <option value="Covered Garden Patio">Covered Garden Patio</option>
                  </select>
                </div>

                <div className="full-width" style={{ marginTop: '12px' }}>
                  <button
                    type="submit"
                    className="vrd-btn-emerald"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={isSubmittingBooking}
                  >
                    {isSubmittingBooking ? (
                      <>
                        <RefreshCw size={18} className="vrd-spin" />
                        <span>Allocating Table & Reserving...</span>
                      </>
                    ) : (
                      <>
                        <Calendar size={18} />
                        <span>Confirm Table Reservation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Visual Box */}
            <div className="vrd-booking-visual" style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                src="/images/cafe-interior.jpg"
                alt="Verdora Cafe Experience"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.35,
                }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                  Verdora Cafe Experience
                </h3>
                <p style={{ color: '#e2ece4', fontSize: '0.92rem', maxWidth: '300px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                  Natural timber tables, lush indoor greenery, low-decibel jazz, ergonomic power outlets, and fiber WiFi.
                </p>
                <div
                  style={{
                    marginTop: '28px',
                    padding: '14px 22px',
                    background: 'rgba(16, 185, 129, 0.25)',
                    border: '1px solid var(--vrd-emerald)',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: '#ffffff',
                    fontWeight: 700,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  Instant SMS & Email Confirmation
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. OUR MENU SECTION ("What We Have In Here")
          Classic Dotted-Leader Cafe Layout for Verdora
          ==================================================================== */}
      <section id="menu" className="vrd-menu-section">
        <div className="container">
          <div className="vrd-section-title">
            <span className="vrd-sub-badge">
              <span className="dot"></span> Signature Cafe Menu
            </span>
            <h2>What We Have In Here</h2>
            <p>
              Explore our handcrafted coffee extractions, cold-pressed botanical juices, warm nourish bowls, and wholesome snacks.
            <br/>
            <br/>
            </p>
          </div>

          {/* Category Tabs */}
          <div className="vrd-category-tabs">
            {['All', 'Beverages', 'Bowls', 'Juices', 'Toast', 'Snacks'].map((cat) => (
              <button
                key={cat}
                className={`vrd-cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dotted Menu Grid */}
          <div className="vrd-dotted-menu-grid">
            {filteredMenu.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#8da191' }}>
                <UtensilsCrossed size={36} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                <p>No dishes found in category "{selectedCategory}".</p>
              </div>
            ) : (
              filteredMenu.map((item) => (
                <div key={item._id || item.id} className="vrd-meal-item">
                  <img
                    src={item.imageUrl || item.image || '/images/hero-coffee.jpg'}
                    alt={item.name}
                    className="vrd-menu-thumb"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="vrd-meal-info">
                    <div className="vrd-meal-title">
                      <span>{item.name}</span>
                    </div>
                    <div className="vrd-meal-desc">{item.description || item.desc}</div>
                  </div>

                  <div className="vrd-meal-dots"></div>

                  <div className="vrd-meal-right">
                    <div style={{ textAlign: 'right' }}>
                      <div className="vrd-meal-price">Rs. {(item.price || 0).toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9fa6a1' }}>
                        (${(((item.price || 0) / 300)).toFixed(2)})
                      </div>
                    </div>
                    <button
                      className="vrd-btn-add-mini"
                      title="Add to tray"
                      onClick={() => addToCart(item)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Action: Toggle into Full Catalog */}
          <div style={{ textAlign: 'center' }}>
            <button
              className="vrd-btn-outline"
              onClick={onSwitchToCatalog}
              style={{ padding: '14px 38px' }}
            >
              Open Full Interactive Database Catalog (with Allergen Badges & Live Search) <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. ONLINE SHOP SECTION ("Verdora Pantry & Roastery")
          ==================================================================== */}
      <section id="shop" className="vrd-shop-section vrd-light-section">
        <div className="container">
          <div className="vrd-section-title">
            <span className="vrd-sub-badge">
              <span className="dot"></span> Verdora Roastery & Pantry
            </span>
            <h2>Take Verdora Home With You</h2>
            <p>
              Small-batch freshly roasted coffee beans, activated granolas, and ceremonial matcha tins delivered to your door.
            <br/>
            <br/>
            </p>
          </div>

          <div className="vrd-products-grid">
            {pantryProducts.map((prod) => {
              const prodId = prod._id || prod.id;
              const isFav = wishlist.some((i) => (i._id || i.id) === prodId);
              return (
                <div key={prodId} className="vrd-product-card">
                  <div className="vrd-product-thumb">
                    <img src={prod.imageUrl || prod.image || '/images/hero-coffee.jpg'} alt={prod.name || prod.title} />
                    <span className="vrd-product-tag">{prod.category}</span>

                    <button
                      className="vrd-icon-btn"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        padding: '6px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        color: isFav ? '#ef4444' : '#5c665f',
                      }}
                      onClick={() => toggleWishlist(prod)}
                    >
                      <Heart size={16} fill={isFav ? '#ef4444' : 'none'} />
                    </button>

                    <div className="vrd-product-action">
                      <button
                        className="vrd-btn-add-cart"
                        onClick={() => addToCart(prod)}
                      >
                        Add To Order Tray
                      </button>
                    </div>
                  </div>

                  <div className="vrd-product-info">
                    <h4 className="vrd-product-title">{prod.name || prod.title}</h4>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
                      {prod.description || prod.category}
                    </div>
                    <div className="vrd-product-price">
                      <span className="old">Rs. {Math.round((prod.price || 0) * 1.15).toLocaleString()}</span>
                      <span>Rs. {(prod.price || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. SKILL & WELLNESS METRICS SECTION ("Ingredients We Use")
          ==================================================================== */}
      <section className="vrd-skills-section">
        <div className="container">
          <div className="vrd-skills-grid">
            <div className="vrd-skills-content">
              <span className="vrd-sub-badge" style={{ color: '#f7ede6' }}>
                <span className="dot" style={{ background: '#f7ede6' }}></span> Our Standard
              </span>
              <h2>Ingredients We Care About</h2>
              <p>
                From traceably sourced high-canopy coffee cherries to microgreens grown without chemical sprays, we adhere to the strictest standards in holistic gastronomy.
              </p>

              {/* Progress Bars */}
              <div className="vrd-skill-item">
                <div className="vrd-skill-header">
                  <span>Certified Organic & Biodynamic Produce</span>
                  <span>98%</span>
                </div>
                <div className="vrd-skill-track">
                  <div className="vrd-skill-bar" style={{ width: '98%' }}></div>
                </div>
              </div>

              <div className="vrd-skill-item">
                <div className="vrd-skill-header">
                  <span>Direct-Trade Highland Arabica Coffee</span>
                  <span>100%</span>
                </div>
                <div className="vrd-skill-track">
                  <div className="vrd-skill-bar" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="vrd-skill-item">
                <div className="vrd-skill-header">
                  <span>Zero Industrial Seed Oils & Refined Sugars</span>
                  <span>100%</span>
                </div>
                <div className="vrd-skill-track">
                  <div className="vrd-skill-bar" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            {/* Visual Box */}
            <div>
              <div className="vrd-roast-card">
                <div className="vrd-roast-img-frame">
                  <img
                    src="/images/coffee-roast.jpg"
                    alt="Artisan Coffee Roasting in Colombo"
                  />
                  <span className="vrd-roast-badge">Small-Batch Roastery</span>
                </div>
                <div className="vrd-roast-info">
                  <h3>Hand-Roasted in Colombo</h3>
                  <p>
                    Small batch micro-roasting daily at our Colombo roastery, ensuring you enjoy peak aromatic complexity within 14 days of roast date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          10. GUEST TESTIMONIALS SECTION
          ==================================================================== */}
      <section className="vrd-testi-section">
        <div className="container">
          <div className="vrd-section-title">
            <span className="vrd-sub-badge">
              <span className="dot"></span> Guest Experiences
            </span>
            <h2>What Our Community Says</h2>
            <p>Read authentic feedback from regular guests, specialty roaster critics, and health food advocates.</p>
            <br/>
          </div>

          <div className="vrd-testi-grid">
            {GUEST_TESTIMONIALS.map((t) => (
              <div key={t.id} className="vrd-testi-card">
                <div className="vrd-testi-author">
                  <div className="vrd-testi-avatar">{t.avatar}</div>
                  <div className="vrd-testi-info">
                    <h6>{t.name}</h6>
                    <span>{t.role}</span>
                  </div>
                </div>

                <div className="vrd-testi-stars">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="var(--vrd-gold)" color="var(--vrd-gold)" />
                  ))}
                </div>

                <p>{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          11. WELLNESS JOURNAL & BLOG SECTION
          ==================================================================== */}
      <section id="blog" className="vrd-blog-section">
        <div className="container">
          <div className="vrd-section-title">
            <span className="vrd-sub-badge">
              <span className="dot"></span> Verdora Journal
            </span>
            <h2>Latest Stories & Brewing Guides</h2>
            <p>Explore articles written by our executive chefs, wellness consultants, and senior coffee baristas.</p>
          <br/>
          </div>

          <div className="vrd-blog-grid">
            {JOURNAL_POSTS.map((post) => (
              <div key={post.id} className="vrd-blog-card">
                <div className="vrd-blog-thumb" style={{ overflow: 'hidden' }}>
                  <img
                    src={post.image}
                    alt={post.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="vrd-blog-body">
                  <div className="vrd-blog-date">{post.date}</div>
                  <h4>{post.title}</h4>
                  <p>{post.desc}</p>
                  <span
                    className="vrd-feature-link"
                    style={{ cursor: 'pointer' }}
                    onClick={() => showToast(`Reading "${post.title}"`)}
                  >
                    Read Journal Entry <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          12. NEWSLETTER SECTION
          ==================================================================== */}
      <section className="vrd-newsletter-section vrd-light-section">
        <div className="container">
          <div className="vrd-section-title">
            <span className="vrd-sub-badge">
              <span className="dot"></span> Wellness Newsletter
            </span>
            <h2>Get Seasonal Specials & Roaster Notes</h2>
            <p>
              Join the Verdora Circle. Receive secret seasonal menu previews, weekly wellness discounts, and invite-only coffee cupping sessions.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="vrd-newsletter-form">
            <input
              type="email"
              className="vrd-newsletter-input"
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit" className="vrd-btn-subscribe">
              Join Circle
            </button>
          </form>
        </div>
      </section>

      {/* ====================================================================
          13. CAFE GALLERY GRID
          ==================================================================== */}
      <section className="vrd-gallery-section">
        <div className="vrd-gallery-grid">
          {[
            { title: 'Artisan Latte Art', sub: 'Single Origin Ristretto', img: '/images/hero-coffee.jpg' },
            { title: 'Amazonian Açai Bowl', sub: 'Fresh Superfoods', img: '/images/acai-bowl.jpg' },
            { title: 'Sourdough Tartine', sub: 'Slow Wild Ferment', img: '/images/avocado-toast.jpg' },
            { title: 'Cold-Pressed Juicery', sub: 'Raw Living Nutrients', img: '/images/green-juice.jpg' },
          ].map((item, idx) => (
            <div key={idx} className="vrd-gallery-item">
              <img src={item.img} alt={item.title} />
              <div className="vrd-gallery-overlay">
                <h4 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{item.title}</h4>
                <p style={{ color: 'var(--vrd-emerald)', fontSize: '0.85rem' }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          14. FOOTER
          ==================================================================== */}
      <footer id="contact" className="vrd-footer">
        <div className="container">
          <div className="vrd-footer-grid">
            {/* Column 1: Brand & Contact Info */}
            <div className="vrd-footer-widget">
              <div className="vrd-logo" style={{ marginBottom: '20px' }} onClick={() => scrollTo('home')} title="Verdora Home">
                <img src="/images/logo.png" alt="Verdora Logo" className="vrd-logo-img" />
                <div className="vrd-logo-brand">
                  <div className="vrd-logo-text">VERDORA</div>
                  <span className="vrd-logo-tagline">Healthy Cafe & Kitchen</span>
                </div>
              </div>

              <ul className="vrd-footer-contact-list">
                <li>
                  <Phone size={18} />
                  <span>
                    <strong>+94 11 234 5678</strong>
                    <br />
                    Toll-Free Reservations: 1800-VERDORA
                  </span>
                </li>
                <li>
                  <Mail size={18} />
                  <span>
                    hello@verdoracafe.com
                    <br />
                    orders@verdoracafe.com
                  </span>
                </li>
                <li>
                  <MapPin size={18} />
                  <span>
                    42 Lotus Grove Boulevard,
                    <br />
                    Colombo 07, Sri Lanka
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 2: Quick Links */}
            <div className="vrd-footer-widget">
              <h3>Quick Navigation</h3>
              <ul className="vrd-footer-links">
                <li><button onClick={() => scrollTo('home')}>Home Page</button></li>
                <li><button onClick={() => scrollTo('about')}>Our Story</button></li>
                <li><button onClick={() => scrollTo('features')}>What We Offer</button></li>
                <li><button onClick={() => scrollTo('menu')}>Cafe Menu</button></li>
                <li><button onClick={() => scrollTo('booking')}>Book A Table</button></li>
                <li><button onClick={() => scrollTo('shop')}>Pantry Store</button></li>
                <li><button onClick={() => scrollTo('blog')}>Wellness Journal</button></li>
              </ul>
            </div>

            {/* Column 3: Location Card */}
            <div className="vrd-footer-widget">
              <h3>Our Flagship Cafe</h3>
              <div className="vrd-footer-map-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <MapPin size={20} color="var(--vrd-emerald)" />
                  <div>
                    <strong style={{ color: '#ffffff' }}>Verdora Sanctuary - Colombo 07</strong>
                    <div style={{ fontSize: '0.78rem', color: '#9fa6a1' }}>Open Daily 8:00 AM - 10:00 PM</div>
                  </div>
                </div>
                <div
                  style={{
                    background: '#131b15',
                    padding: '16px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#c7d4c9',
                    border: '1px dashed rgba(16, 185, 129, 0.3)',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="var(--vrd-emerald)" /> 42 Lotus Grove Blvd, Colombo 07
                  </span>
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--vrd-gold)', fontWeight: 700 }}
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="vrd-copyright-bar">
          <div className="container vrd-copyright-inner">
            <div>
              Copyright © {new Date().getFullYear()} Verdora Cafe & Kitchen. All rights reserved.
            </div>
            <div className="vrd-topbar-socials">
              <a href="#social"><FacebookIcon size={16} /></a>
              <a href="#social"><InstagramIcon size={16} /></a>
              <a href="#social"><TwitterIcon size={16} /></a>
              <a href="#social"><YoutubeIcon size={16} /></a>
            </div>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          SLIDE-OVER CART DRAWER
          ==================================================================== */}
      {isCartOpen && (
        <div className="vrd-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="vrd-cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="vrd-drawer-header">
              <h3>
                <ShoppingBag size={20} color="var(--vrd-emerald)" />
                Your Order Tray ({cartItemCount})
              </h3>
              <button
                className="vrd-icon-btn"
                onClick={() => setIsCartOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="vrd-drawer-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--vrd-text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <ShoppingBag size={56} color="var(--vrd-emerald)" style={{ opacity: 0.85 }} />
                  </div>
                  <h4>Your order tray is empty</h4>
                  <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
                    Select artisan coffees, fresh bowls, or wellness juices from the menu.
                  </p>
                  <button
                    className="vrd-btn-emerald"
                    style={{ marginTop: '20px' }}
                    onClick={() => {
                      setIsCartOpen(false);
                      scrollTo('menu');
                    }}
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const itemId = item._id || item.id;
                  return (
                    <div key={itemId} className="vrd-cart-item">
                      <div>
                        <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.95rem' }}>
                          {item.name || item.title}
                        </strong>
                        <span style={{ color: 'var(--vrd-gold)', fontSize: '0.85rem' }}>
                          Rs. {(item.price || 0).toLocaleString()} each
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="vrd-cart-qty-ctrl">
                          <button
                            className="vrd-icon-btn"
                            onClick={() => updateQty(itemId, -1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                            {item.qty}
                          </span>
                          <button
                            className="vrd-icon-btn"
                            onClick={() => updateQty(itemId, 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          className="vrd-icon-btn"
                          style={{ color: '#ef4444' }}
                          title="Remove"
                          onClick={() => updateQty(itemId, -item.qty)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="vrd-drawer-footer">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--vrd-text-muted)' }}>Subtotal</span>
                  <span style={{ fontWeight: 700 }}>Rs. {cartSubtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--vrd-text-muted)' }}>Service & Tax (5%)</span>
                  <span style={{ fontWeight: 700 }}>Rs. {Math.round(cartSubtotal * 0.05).toLocaleString()}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    marginBottom: '20px',
                    color: 'var(--vrd-emerald)',
                  }}
                >
                  <span>Total Amount</span>
                  <span>Rs. {Math.round(cartSubtotal * 1.05).toLocaleString()}</span>
                </div>

                <button
                  className="vrd-btn-emerald"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleCheckout}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <RefreshCw size={18} className="vrd-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Proceed To Checkout</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          TABLE RESERVATION CONFIRMATION TICKET MODAL
          ==================================================================== */}
      {bookingConfirmed && (
        <div
          className="vrd-drawer-overlay"
          style={{ alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setBookingConfirmed(null)}
        >
          <div className="vrd-modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="vrd-icon-btn"
              style={{ position: 'absolute', top: '16px', right: '16px' }}
              onClick={() => setBookingConfirmed(null)}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 12px' }}>
                <img src="/images/logo.png" alt="Verdora Logo" className="vrd-modal-brand-logo" style={{ margin: '0 auto' }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  background: 'rgba(16, 185, 129, 0.25)',
                  border: '2px solid var(--vrd-emerald)',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--vrd-emerald)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  backdropFilter: 'blur(4px)',
                }}>
                  <CheckCircle2 size={15} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.6rem', color: 'var(--vrd-emerald)', margin: '4px 0 6px' }}>
                Table Reserved at Verdora!
              </h3>
              <p style={{ color: 'var(--vrd-text-muted)', fontSize: '0.9rem' }}>
                We have saved your table and look forward to welcoming you.
              </p>
            </div>

            <div
              style={{
                background: '#0d1610',
                border: '1px dashed var(--vrd-emerald)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#888' }}>Reservation Code:</span>
                <strong style={{ color: 'var(--vrd-gold)' }}>{bookingConfirmed.ticketId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#888' }}>Guest Name:</span>
                <strong>{bookingConfirmed.firstName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#888' }}>Date & Time:</span>
                <strong>{bookingConfirmed.date} at {bookingConfirmed.time}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#888' }}>Party Size:</span>
                <strong>{bookingConfirmed.guests}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Seating Area:</span>
                <strong style={{ color: 'var(--vrd-emerald)' }}>{bookingConfirmed.tableType}</strong>
              </div>
            </div>

            <button
              className="vrd-btn-emerald"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setBookingConfirmed(null)}
            >
              Save Reservation & Close
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          LIVE ORDER CONFIRMATION & TRACKING MODAL (Phase 06)
          ==================================================================== */}
      {placedOrderConfirmed && (
        <div
          className="vrd-drawer-overlay"
          style={{ alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setPlacedOrderConfirmed(null)}
        >
          <div className="vrd-modal-box" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <button
              className="vrd-icon-btn"
              style={{ position: 'absolute', top: '16px', right: '16px' }}
              onClick={() => setPlacedOrderConfirmed(null)}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 10px' }}>
                <img src="/images/logo.png" alt="Verdora Logo" className="vrd-modal-brand-logo" style={{ margin: '0 auto' }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  background: 'rgba(16, 185, 129, 0.25)',
                  border: '2px solid var(--vrd-emerald)',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--vrd-emerald)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  backdropFilter: 'blur(4px)',
                }}>
                  <CheckCircle2 size={15} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.6rem', color: 'var(--vrd-emerald)', marginBottom: '4px' }}>
                Order Received!
              </h3>
              <p style={{ color: 'var(--vrd-text-muted)', fontSize: '0.88rem' }}>
                Order Ref: <strong style={{ color: 'var(--vrd-gold)' }}>#{placedOrderConfirmed._id?.slice(-8).toUpperCase()}</strong>
              </p>
            </div>

            {/* Stepper Tracker */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0', position: 'relative' }}>
              {[
                { key: 'placed', label: 'Placed', icon: <Package size={16} /> },
                { key: 'preparing', label: 'Kitchen', icon: <UtensilsCrossed size={16} /> },
                { key: 'ready', label: 'Ready', icon: <Sparkles size={16} /> },
                { key: 'completed', label: 'Served', icon: <CheckCircle size={16} /> },
              ].map((step, idx) => {
                const orderStatus = placedOrderConfirmed.status;
                const statusOrder = ['placed', 'preparing', 'ready', 'completed'];
                const currentIdx = statusOrder.indexOf(orderStatus);
                const isPassed = currentIdx >= idx;
                const isActive = orderStatus === step.key;

                return (
                  <div key={step.key} style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        margin: '0 auto 6px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isActive ? 'var(--vrd-emerald)' : isPassed ? 'rgba(16, 185, 129, 0.25)' : '#1a271e',
                        border: `2px solid ${isPassed ? 'var(--vrd-emerald)' : '#334438'}`,
                        color: isPassed ? '#ffffff' : '#77887e',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {step.icon}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--vrd-emerald)' : '#88998e' }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Items Snapshot Card */}
            <div
              style={{
                background: '#0d1610',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Order Summary (Immutable Snapshot)
              </div>
              {placedOrderConfirmed.items?.map((it, idx) => (
                <div key={idx} className="vrd-order-item-line">
                  <span>{it.quantity}x {it.itemNameSnapshot}</span>
                  <span style={{ fontWeight: 600 }}>Rs. {(it.unitPriceSnapshot * it.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #1a271e', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--vrd-emerald)' }}>
                <span>Total Amount:</span>
                <span>Rs. {placedOrderConfirmed.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="vrd-btn-gold"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  setPlacedOrderConfirmed(null);
                  handleOpenOrdersModal();
                }}
              >
                <Package size={16} />
                <span>View All Orders</span>
              </button>
              <button
                className="vrd-btn-emerald"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setPlacedOrderConfirmed(null)}
              >
                <span>Continue Dining</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          CUSTOMER ORDERS HISTORY MODAL (Phase 06)
          ==================================================================== */}
      {isOrdersModalOpen && (
        <div
          className="vrd-drawer-overlay"
          style={{ alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setIsOrdersModalOpen(false)}
        >
          <div
            className="vrd-modal-box"
            style={{ maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={22} color="var(--vrd-emerald)" />
                <h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>My Order History</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="vrd-icon-btn"
                  title="Refresh Orders"
                  onClick={handleOpenOrdersModal}
                  disabled={isLoadingOrders}
                >
                  <RefreshCw size={18} className={isLoadingOrders ? 'vrd-spin' : ''} />
                </button>
                <button className="vrd-icon-btn" onClick={() => setIsOrdersModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {isLoadingOrders ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--vrd-text-muted)' }}>
                <RefreshCw size={24} className="vrd-spin" style={{ marginBottom: '12px' }} />
                <p>Loading your orders...</p>
              </div>
            ) : customerOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--vrd-text-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <PackageOpen size={48} color="var(--vrd-emerald)" style={{ opacity: 0.85 }} />
                </div>
                <h4 style={{ color: '#ffffff', marginBottom: '8px' }}>No orders yet</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                  Explore our nourishing organic menu and place your first table order!
                </p>
                <button
                  className="vrd-btn-emerald"
                  style={{ margin: '0 auto' }}
                  onClick={() => {
                    setIsOrdersModalOpen(false);
                    scrollTo('menu');
                  }}
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {customerOrders.map((ord) => (
                  <div key={ord._id} className="vrd-order-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                          Order #{ord._id?.slice(-8).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#88998e', marginTop: '2px' }}>
                          {new Date(ord.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                      <span className={`vrd-status-badge ${ord.status}`}>
                        {ord.status}
                      </span>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="vrd-order-item-line">
                          <span>{it.quantity}x {it.itemNameSnapshot}</span>
                          <span style={{ fontWeight: 600 }}>Rs. {(it.unitPriceSnapshot * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#88998e', marginRight: '6px' }}>Total:</span>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--vrd-emerald)' }}>
                          Rs. {ord.totalAmount?.toLocaleString()}
                        </strong>
                      </div>

                      {ord.status === 'placed' && (
                        <button
                          className="vrd-btn-cancel-order"
                          onClick={() => handleCancelOrder(ord._id)}
                          title="Cancel order before preparation begins"
                        >
                          <X size={14} />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          CUSTOMER RESERVATIONS HISTORY MODAL (Phase 07)
          ==================================================================== */}
      {isReservationsModalOpen && (
        <div
          className="vrd-drawer-overlay"
          style={{ alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setIsReservationsModalOpen(false)}
        >
          <div
            className="vrd-modal-box"
            style={{ maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={22} color="var(--vrd-emerald)" />
                <h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>My Table Reservations</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="vrd-icon-btn"
                  title="Refresh Reservations"
                  onClick={handleOpenReservationsModal}
                  disabled={isLoadingReservations}
                >
                  <RefreshCw size={18} className={isLoadingReservations ? 'vrd-spin' : ''} />
                </button>
                <button className="vrd-icon-btn" onClick={() => setIsReservationsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {isLoadingReservations ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--vrd-text-muted)' }}>
                <RefreshCw size={24} className="vrd-spin" style={{ marginBottom: '12px' }} />
                <p>Loading your reservations...</p>
              </div>
            ) : customerReservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--vrd-text-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <Calendar size={48} color="var(--vrd-emerald)" style={{ opacity: 0.85 }} />
                </div>
                <h4 style={{ color: '#ffffff', marginBottom: '8px' }}>No reservations found</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                  Reserve a table for your next healthy meal, coffee tasting, or casual meeting.
                </p>
                <button
                  className="vrd-btn-emerald"
                  style={{ margin: '0 auto' }}
                  onClick={() => {
                    setIsReservationsModalOpen(false);
                    scrollTo('booking');
                  }}
                >
                  Book a Table Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {customerReservations.map((resItem) => (
                  <div key={resItem._id} className="vrd-order-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                          Ref #VRD-{resItem._id?.slice(-6).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#88998e', marginTop: '2px' }}>
                          Booked on: {new Date(resItem.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`vrd-status-badge ${resItem.status}`}>
                        {resItem.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.88rem', color: '#d1ddd4', marginBottom: '12px' }}>
                      <div>
                        <span style={{ color: '#888' }}>Date: </span>
                        <strong>{new Date(resItem.reservationDate).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888' }}>Time: </span>
                        <strong>{resItem.startTime} - {resItem.endTime}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888' }}>Party Size: </span>
                        <strong>{resItem.guestCount} {resItem.guestCount === 1 ? 'Guest' : 'Guests'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888' }}>Table: </span>
                        <strong style={{ color: 'var(--vrd-emerald)' }}>
                          {resItem.tableId?.tableNumber ? `Table ${resItem.tableId.tableNumber}` : 'Allocated on arrival'}
                        </strong>
                      </div>
                    </div>

                    {resItem.specialRequest && (
                      <div style={{ fontSize: '0.8rem', color: '#9fb1a5', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px', marginBottom: '12px' }}>
                        <em>Note: {resItem.specialRequest}</em>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                      {resItem.status === 'confirmed' && (
                        <button
                          className="vrd-btn-cancel-order"
                          onClick={() => handleCancelReservation(resItem._id)}
                          title="Cancel your reservation"
                        >
                          <X size={14} />
                          <span>Cancel Booking</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          AUTH MODAL (Login / Sign Up)
          ==================================================================== */}
      {isAuthOpen && (
        <div
          className="vrd-drawer-overlay"
          style={{ alignItems: 'center', justifyContent: 'center' }}
          onClick={() => {
            setIsAuthOpen(false);
            setShowAuthPassword(false);
          }}
        >
          <div className="vrd-modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="vrd-icon-btn"
              style={{ position: 'absolute', top: '16px', right: '16px' }}
              onClick={() => {
                setIsAuthOpen(false);
                setShowAuthPassword(false);
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <img
                src="/images/logo.png"
                alt="Verdora Logo"
                className="vrd-auth-modal-logo"
                style={{
                  width: '68px',
                  height: '68px',
                  objectFit: 'contain',
                  margin: '0 auto 12px',
                  display: 'block',
                  filter: 'drop-shadow(0 6px 16px rgba(16, 185, 129, 0.35))',
                }}
              />
              <h3 style={{ fontSize: '1.5rem', color: '#ffffff' }}>
                {authMode === 'login' ? 'Sign In to Verdora' : 'Join the Verdora Circle'}
              </h3>
              <p style={{ color: 'var(--vrd-text-muted)', fontSize: '0.85rem' }}>
                {authMode === 'login'
                  ? 'Access your orders, favorites, and table reservations'
                  : 'Unlock exclusive member rewards and table booking perks'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {authMode === 'register' && (
                <div className="vrd-form-group">
                  <label htmlFor="auth-name">Full Name *</label>
                  <input
                    id="auth-name"
                    type="text"
                    className={`vrd-input ${authTouched.name && authErrors.name ? 'error' : ''}`}
                    placeholder="e.g. Dasitha Bandara"
                    value={authForm.name}
                    onChange={(e) => {
                      setAuthForm({ ...authForm, name: e.target.value });
                      if (authTouched.name && authErrors.name) {
                        setAuthErrors((prev) => ({ ...prev, name: '' }));
                      }
                    }}
                    required
                  />
                  {authTouched.name && authErrors.name && (
                    <span className="vrd-field-error">
                      <AlertCircle size={13} /> {authErrors.name}
                    </span>
                  )}
                </div>
              )}

              <div className="vrd-form-group">
                <label htmlFor="auth-email">Email Address *</label>
                <input
                  id="auth-email"
                  type="email"
                  className={`vrd-input ${authTouched.email && authErrors.email ? 'error' : ''}`}
                  placeholder="name@example.com"
                  value={authForm.email}
                  onChange={(e) => {
                    setAuthForm({ ...authForm, email: e.target.value });
                    if (authTouched.email && authErrors.email) {
                      setAuthErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  required
                />
                {authTouched.email && authErrors.email && (
                  <span className="vrd-field-error">
                    <AlertCircle size={13} /> {authErrors.email}
                  </span>
                )}
              </div>

              <div className="vrd-form-group">
                <label htmlFor="auth-password">Password {authMode === 'register' ? '(min 8 characters) *' : '*'}</label>
                <div className="vrd-password-wrapper">
                  <input
                    id="auth-password"
                    type={showAuthPassword ? 'text' : 'password'}
                    className={`vrd-input ${authTouched.password && authErrors.password ? 'error' : ''}`}
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => {
                      setAuthForm({ ...authForm, password: e.target.value });
                      if (authTouched.password && authErrors.password) {
                        setAuthErrors((prev) => ({ ...prev, password: '' }));
                      }
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="vrd-password-toggle-btn"
                    onClick={() => setShowAuthPassword((prev) => !prev)}
                    aria-label={showAuthPassword ? 'Hide password' : 'Show password'}
                    title={showAuthPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {authTouched.password && authErrors.password && (
                  <span className="vrd-field-error">
                    <AlertCircle size={13} /> {authErrors.password}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="vrd-btn-emerald"
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.85rem', color: '#999' }}>
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <span
                    style={{ color: 'var(--vrd-gold)', cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthPassword(false);
                    }}
                  >
                    Sign Up
                  </span>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <span
                    style={{ color: 'var(--vrd-gold)', cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthPassword(false);
                    }}
                  >
                    Sign In
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TOAST NOTIFICATION
          ==================================================================== */}
      {toastMessage && (
        <div className="vrd-toast">
          <CheckCircle size={18} color="var(--vrd-emerald)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
