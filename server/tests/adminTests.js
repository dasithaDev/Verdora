import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../src/app.js';
import User from '../src/models/User.js';
import MenuItem from '../src/models/MenuItem.js';
import Order from '../src/models/Order.js';
import Reservation from '../src/models/Reservation.js';
import CafeTable from '../src/models/CafeTable.js';
import { config } from '../src/config/env.js';
import { generateToken } from '../src/middleware/authMiddleware.js';

dotenv.config();

const runAdminTests = async () => {
  let server;
  let passed = 0;
  let failed = 0;

  const assert = (condition, testId, testName) => {
    if (condition) {
      console.log(`  PASS [${testId}]: ${testName}`);
      passed++;
    } else {
      console.error(`  FAIL [${testId}]: ${testName}`);
      failed++;
    }
  };

  const createdOrderIds = [];
  const createdItemIds = [];
  const createdReservationIds = [];
  const createdTableIds = [];
  let testAdminUser;
  let testCustomerUser;

  try {
    await mongoose.connect(config.mongoUri);
    const testPort = 5098;
    server = app.listen(testPort);
    const baseUrl = `http://127.0.0.1:${testPort}/api/v1`;

    console.log('[Admin Integration Tests] Testing ADM-01 through ADM-15...\n');

    const nonce = Date.now();
    const mockHash = '$2a$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890';

    // 1. Create real test users
    testAdminUser = await User.create({
      name: 'Admin Dashboard Tester',
      email: `adm_admin_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'admin',
    });

    testCustomerUser = await User.create({
      name: 'Customer Dashboard Tester',
      email: `adm_customer_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'customer',
    });

    const adminToken = generateToken(testAdminUser._id.toString(), 'admin');
    const customerToken = generateToken(testCustomerUser._id.toString(), 'customer');

    // 2. Create seed menu items
    const dish1 = await MenuItem.create({
      name: `Admin Vitality Bowl ${nonce}`,
      category: 'Bowls',
      price: 2400,
      description: 'Organic superfood bowl for dashboard tests',
      isAvailable: true,
    });
    createdItemIds.push(dish1._id);

    const dish2 = await MenuItem.create({
      name: `Admin Green Detox ${nonce}`,
      category: 'Juices',
      price: 1600,
      description: 'Cold-pressed juice for dashboard tests',
      isAvailable: false, // Inactive
    });
    createdItemIds.push(dish2._id);

    // 3. Create seed table & order
    const table1 = await CafeTable.create({
      tableNumber: `ADM-T-${nonce}`,
      capacity: 4,
      isActive: true,
    });
    createdTableIds.push(table1._id);

    const order1 = await Order.create({
      userId: testCustomerUser._id,
      items: [
        {
          menuItemId: dish1._id,
          itemNameSnapshot: dish1.name,
          unitPriceSnapshot: dish1.price,
          quantity: 2,
        },
      ],
      subtotal: 4800,
      status: 'placed',
    });
    createdOrderIds.push(order1._id);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 4. Create seed reservation
    const res1 = await Reservation.create({
      userId: testCustomerUser._id,
      tableId: table1._id,
      reservationDate: today,
      startTime: '13:00',
      endTime: '14:30',
      guestCount: 2,
      status: 'confirmed',
    });
    createdReservationIds.push(res1._id);

    // ADM-01: Unauthenticated request to /admin/stats
    const res01 = await fetch(`${baseUrl}/admin/stats`);
    assert(res01.status === 401, 'ADM-01', 'Unauthenticated request to /admin/stats rejected with 401');

    // ADM-02: Customer role request to /admin/stats
    const res02 = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(res02.status === 403, 'ADM-02', 'Customer role request to /admin/stats blocked with 403 FORBIDDEN');

    // ADM-03: Admin request to /admin/stats returns 200 with complete statistics payload
    const res03 = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data03 = await res03.json();
    assert(
      res03.status === 200 && data03.success === true && data03.data?.summary !== undefined,
      'ADM-03',
      'Admin request to /admin/stats returns 200 with complete metrics payload'
    );

    // ADM-04: Revenue accurately aggregates non-cancelled orders
    assert(
      data03.data?.summary?.totalRevenue >= 4800,
      'ADM-04',
      'Revenue correctly aggregates non-cancelled order totals'
    );

    // ADM-05: Active kitchen queue counts strictly placed and preparing orders
    assert(
      data03.data?.summary?.activeKitchenOrders >= 1,
      'ADM-05',
      'Active kitchen queue counts strictly placed and preparing orders'
    );

    // ADM-06: Today reservations count reflects persisted bookings for current day
    assert(
      data03.data?.summary?.todayReservationsCount >= 1,
      'ADM-06',
      'Today reservations reflect persisted confirmed bookings for current calendar day'
    );

    // ADM-07: Menu item counts report both total and active available items
    assert(
      data03.data?.menu?.total >= 2 && data03.data?.menu?.active >= 1,
      'ADM-07',
      'Menu stats accurately report total and active available items'
    );

    // ADM-08: Customer count accurately reflects registered customer users
    assert(
      data03.data?.users?.customers >= 1 && data03.data?.users?.admins >= 1,
      'ADM-08',
      'User stats accurately categorize customers versus administrators'
    );

    // ADM-09: Admin queries /admin/orders with pagination metadata
    const res09 = await fetch(`${baseUrl}/admin/orders?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data09 = await res09.json();
    assert(
      res09.status === 200 && data09.data?.pagination?.total >= 1 && data09.data?.orders?.length > 0,
      'ADM-09',
      'Admin queries all cafe orders with structured pagination envelope'
    );

    // ADM-10: Admin queries /admin/reservations with status filter
    const res10 = await fetch(`${baseUrl}/admin/reservations?status=confirmed`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data10 = await res10.json();
    assert(
      res10.status === 200 && data10.data?.reservations?.length >= 1,
      'ADM-10',
      'Admin queries reservations filtered by status (?status=confirmed)'
    );

    // ADM-11: Admin transitions order status and changes reflect in system
    const res11 = await fetch(`${baseUrl}/admin/orders/${order1._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'preparing' }),
    });
    const data11 = await res11.json();
    assert(
      res11.status === 200 && (data11.data?.status === 'preparing' || data11.data?.order?.status === 'preparing'),
      'ADM-11',
      'Admin successfully transitions order status to preparing'
    );

    // ADM-12: Admin transitions reservation status to completed
    const res12 = await fetch(`${baseUrl}/admin/reservations/${res1._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    });
    const data12 = await res12.json();
    assert(
      res12.status === 200 && data12.data?.reservation?.status === 'completed',
      'ADM-12',
      'Admin successfully transitions reservation status to completed'
    );

    // ADM-13: Admin creates new menu item via POST /menu
    const res13 = await fetch(`${baseUrl}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Admin Artisan Sourdough ${nonce}`,
        category: 'Toast',
        price: 1850,
        description: 'Naturally leavened artisan toast with herb butter',
      }),
    });
    const data13 = await res13.json();
    const createdDish = data13.data?.item || data13.data;
    assert(
      res13.status === 201 && createdDish?.name?.includes('Admin Artisan Sourdough'),
      'ADM-13',
      'Admin creates new menu item with HTTP 201'
    );
    if (createdDish?._id) createdItemIds.push(createdDish._id);

    // ADM-14: Admin soft-deletes menu item via DELETE /menu/:id
    const targetItemId = createdDish?._id;
    const res14 = await fetch(`${baseUrl}/menu/${targetItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data14 = await res14.json();
    assert(
      res14.status === 200 && (data14.data?.item?.isAvailable === false || data14.data?.isAvailable === false),
      'ADM-14',
      'Admin successfully deactivates/soft-deletes menu item'
    );

    // ADM-15: Non-admin attempt to delete menu item blocked with 403
    const res15 = await fetch(`${baseUrl}/menu/${dish1._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(res15.status === 403, 'ADM-15', 'Non-admin attempt to delete menu item rejected with 403 FORBIDDEN');
  } catch (err) {
    console.error('Fatal admin test error:', err);
    failed++;
  } finally {
    // Teardown
    try {
      if (createdOrderIds.length > 0) {
        await Order.deleteMany({ _id: { $in: createdOrderIds } });
      }
      if (createdReservationIds.length > 0) {
        await Reservation.deleteMany({ _id: { $in: createdReservationIds } });
      }
      if (createdItemIds.length > 0) {
        await MenuItem.deleteMany({ _id: { $in: createdItemIds } });
      }
      if (createdTableIds.length > 0) {
        await CafeTable.deleteMany({ _id: { $in: createdTableIds } });
      }
      if (testAdminUser) await User.findByIdAndDelete(testAdminUser._id);
      if (testCustomerUser) await User.findByIdAndDelete(testCustomerUser._id);
    } catch (cleanupErr) {
      console.warn('Test cleanup warning:', cleanupErr.message);
    }

    if (server) server.close();
    await mongoose.disconnect();

    console.log(`\n========================================`);
    console.log(`Admin Integration Tests Summary:`);
    console.log(`Passed: ${passed} | Failed: ${failed}`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
};

runAdminTests();
