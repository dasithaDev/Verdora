import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import CafeTable from '../models/CafeTable.js';
import { sendSuccess, sendError } from '../utils/response.js';

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

    // 6. Analytics Charts Data computed directly from MongoDB
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [ordersByDay, fulfillmentByDay, categoryRankRaw] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            revenue: { $sum: '$subtotal' },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            fulfilled: {
              $sum: {
                $cond: [{ $in: ['$status', ['completed', 'ready']] }, 1, 0],
              },
            },
            cancelled: {
              $sum: {
                $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0],
              },
            },
          },
        },
      ]),
      MenuItem.aggregate([
        { $match: { isAvailable: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun indices

    const weeklyRevenue = weekOrder.map((dayIdx) => {
      const mongoDayOfWeek = dayIdx === 0 ? 1 : dayIdx + 1;
      const match = ordersByDay.find((d) => d._id === mongoDayOfWeek);
      return {
        month: dayNames[dayIdx],
        revenue: match ? match.revenue : 0,
        orders: match ? match.orders : 0,
      };
    });

    const fulfillmentRate = weekOrder.map((dayIdx) => {
      const mongoDayOfWeek = dayIdx === 0 ? 1 : dayIdx + 1;
      const match = fulfillmentByDay.find((d) => d._id === mongoDayOfWeek);
      return {
        day: dayNames[dayIdx],
        fulfilled: match ? match.fulfilled : 0,
        cancelled: match ? match.cancelled : 0,
      };
    });

    const categoryColorMap = {
      Bowls: 'hsl(38, 52%, 61%)',
      Juices: 'hsl(158, 64%, 35%)',
      Toast: 'hsl(38, 52%, 50%)',
      Snacks: 'hsl(140, 20%, 35%)',
      Beverages: 'hsl(158, 64%, 45%)',
    };

    const categoryRank = categoryRankRaw.map((cat) => ({
      category: cat._id,
      orders: cat.count,
      fill: categoryColorMap[cat._id] || 'hsl(158, 64%, 45%)',
    }));

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
      charts: {
        weeklyRevenue,
        fulfillmentRate,
        categoryRank,
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

/**
 * GET /api/v1/admin/users
 * List users/staff with filtering and pagination
 */
export const getAdminUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role && ['customer', 'admin', 'staff'].includes(role)) {
      filter.role = role;
    }
    if (search && typeof search === 'string') {
      const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ];
    }
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/users
 * Add a new employee / staff member / admin
 */
export const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'staff', avatar = '' } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Name must be at least 2 characters long.', [{ field: 'name' }]);
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'A valid email address is required.', [{ field: 'email' }]);
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Password must be at least 8 characters long.', [{ field: 'password' }]);
    }
    const validRoles = ['staff', 'admin', 'customer'];
    const assignedRole = validRoles.includes(role) ? role : 'staff';

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, 409, 'CONFLICT', 'A user with this email already exists.', [{ field: 'email' }]);
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      avatar: typeof avatar === 'string' ? avatar.trim() : '',
    });

    return sendSuccess(res, 201, {
      message: `${assignedRole.charAt(0).toUpperCase() + assignedRole.slice(1)} account created successfully.`,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/users/:id
 * Remove an employee / user account
 */
export const deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (String(req.user._id) === String(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'You cannot delete your own administrative account.');
    }
    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, 'NOT_FOUND', 'User account not found.');
    }
    await User.findByIdAndDelete(id);
    return sendSuccess(res, 200, { message: `Account "${user.name}" removed successfully.` });
  } catch (error) {
    next(error);
  }
};
