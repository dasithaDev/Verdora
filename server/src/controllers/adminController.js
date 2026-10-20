import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import CafeTable from '../models/CafeTable.js';
import { sendSuccess } from '../utils/response.js';

/**
 * GET /api/v1/admin/stats
 * Aggregates live cafe performance metrics for the admin dashboard
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // 1. Order Stats
    const [
      totalOrders,
      placedOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
      cancelledOrders,
      revenueAggregation,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'placed' }),
      Order.countDocuments({ status: 'preparing' }),
      Order.countDocuments({ status: 'ready' }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'cancelled' }),
      // Calculate revenue from non-cancelled orders
      Order.aggregate([
        { $match: { status: { $in: ['completed', 'ready', 'preparing', 'placed'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$subtotal' } } },
      ]),
      Order.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    const activeKitchenOrders = placedOrders + preparingOrders;

    // 2. Reservation Stats
    const [
      totalReservations,
      confirmedReservations,
      completedReservations,
      cancelledReservations,
      todayReservationsCount,
      recentReservations,
    ] = await Promise.all([
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: 'confirmed' }),
      Reservation.countDocuments({ status: 'completed' }),
      Reservation.countDocuments({ status: 'cancelled' }),
      Reservation.countDocuments({
        reservationDate: { $gte: startOfToday, $lte: endOfToday },
        status: 'confirmed',
      }),
      Reservation.find()
        .populate('userId', 'name email')
        .populate('tableId', 'tableNumber capacity')
        .sort({ reservationDate: -1, startTime: -1 })
        .limit(6),
    ]);

    // 3. Menu Item Stats
    const [totalMenuItems, activeMenuItems, categoriesAggregation] = await Promise.all([
      MenuItem.countDocuments(),
      MenuItem.countDocuments({ isAvailable: true }),
      MenuItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    // 4. User Stats
    const [totalUsers, totalCustomers, totalAdmins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    // 5. Table Stats
    const totalTables = await CafeTable.countDocuments({ isActive: true });

    return sendSuccess(res, 200, {
      summary: {
        totalRevenue,
        totalOrders,
        activeKitchenOrders,
        todayReservationsCount,
        confirmedReservations,
        totalMenuItems,
        activeMenuItems,
        totalCustomers,
        totalTables,
      },
      orders: {
        total: totalOrders,
        placed: placedOrders,
        preparing: preparingOrders,
        ready: readyOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        recent: recentOrders,
      },
      reservations: {
        total: totalReservations,
        confirmed: confirmedReservations,
        completed: completedReservations,
        cancelled: cancelledReservations,
        today: todayReservationsCount,
        recent: recentReservations,
      },
      menu: {
        total: totalMenuItems,
        active: activeMenuItems,
        categories: categoriesAggregation,
      },
      users: {
        total: totalUsers,
        customers: totalCustomers,
        admins: totalAdmins,
      },
    });
  } catch (error) {
    next(error);
  }
};
