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

const runSecurityTests = async () => {
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
  const createdReservationIds = [];
  const createdUserIds = [];
  const createdItemIds = [];
  const createdTableIds = [];

  try {
    await mongoose.connect(config.mongoUri);
    const testPort = 5099;
    server = app.listen(testPort);
    const baseUrl = `http://127.0.0.1:${testPort}/api/v1`;

    console.log('[Security & Boundary Tests] Testing SEC-01 through SEC-16...\n');

    const nonce = Date.now();
    const mockHash = '$2a$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890';

    // Seed test personas
    const userVictim = await User.create({
      name: 'Victim Customer',
      email: `victim_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'customer',
    });
    createdUserIds.push(userVictim._id);

    const userAttacker = await User.create({
      name: 'Attacker Customer',
      email: `attacker_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'customer',
    });
    createdUserIds.push(userAttacker._id);

    const userAdmin = await User.create({
      name: 'Verified Admin',
      email: `admin_sec_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'admin',
    });
    createdUserIds.push(userAdmin._id);

    const tokenVictim = generateToken(userVictim._id, 'customer');
    const tokenAttacker = generateToken(userAttacker._id, 'customer');
    const tokenAdmin = generateToken(userAdmin._id, 'admin');

    // Seed menu item and table for victim order & reservation
    const testItem = await MenuItem.create({
      name: `Secure Dish ${nonce}`,
      category: 'Bowls',
      price: 1800,
      description: 'Organic bowl for security testing',
      isAvailable: true,
    });
    createdItemIds.push(testItem._id);

    const testTable = await CafeTable.create({
      tableNumber: Math.floor(Math.random() * 8000) + 1000,
      capacity: 4,
      isAvailable: true,
    });
    createdTableIds.push(testTable._id);

    // Seed Victim Order
    const victimOrder = await Order.create({
      userId: userVictim._id,
      items: [
        {
          menuItemId: testItem._id,
          itemNameSnapshot: testItem.name,
          unitPriceSnapshot: testItem.price,
          quantity: 2,
        },
      ],
      subtotal: 3600,
      totalAmount: 3600,
      status: 'placed',
    });
    createdOrderIds.push(victimOrder._id);

    // Seed Victim Reservation
    const victimReservation = await Reservation.create({
      userId: userVictim._id,
      tableId: testTable._id,
      reservationDate: '2026-11-20',
      startTime: '13:00',
      endTime: '14:30',
      guestCount: 2,
      status: 'confirmed',
    });
    createdReservationIds.push(victimReservation._id);

    // =========================================================================
    // SECTION 1: Privilege Escalation & Registration Hardening
    // =========================================================================
    console.log('--- Suite 1: Registration Role Escalation Defense ---');

    // SEC-01: Public register with role: 'admin' must default to 'customer'
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sneaky User',
        email: `sneaky_${nonce}@verdora.local`,
        password: 'Password123!',
        role: 'admin',
      }),
    });
    const regData = await regRes.json();
    if (regData.data?.user?._id) createdUserIds.push(regData.data.user._id);
    assert(
      regRes.status === 201 && regData.data?.user?.role === 'customer',
      'SEC-01',
      'Public registration payload specifying role:admin is forced to customer'
    );

    // SEC-02 & SEC-03: Unauthenticated access rejection
    console.log('\n--- Suite 2: Unauthenticated Access Control ---');
    const unauthOrderRes = await fetch(`${baseUrl}/orders/my`);
    assert(unauthOrderRes.status === 401, 'SEC-02', 'Unauthenticated GET /orders/my rejected with HTTP 401');

    const unauthResRes = await fetch(`${baseUrl}/reservations/my`);
    assert(unauthResRes.status === 401, 'SEC-03', 'Unauthenticated GET /reservations/my rejected with HTTP 401');

    // =========================================================================
    // SECTION 2: Insecure Direct Object Reference (IDOR) Protection
    // =========================================================================
    console.log('\n--- Suite 3: Insecure Direct Object Reference (IDOR) Defense ---');

    // SEC-04: Attacker Customer querying Victim Customer's order
    const idorOrderGetRes = await fetch(`${baseUrl}/orders/${victimOrder._id}`, {
      headers: { Authorization: `Bearer ${tokenAttacker}` },
    });
    assert(
      idorOrderGetRes.status === 403,
      'SEC-04',
      'Customer A attempting to view Customer B order returns HTTP 403 Forbidden'
    );

    // SEC-05: Attacker Customer querying Victim Customer's reservation
    const idorResGetRes = await fetch(`${baseUrl}/reservations/${victimReservation._id}`, {
      headers: { Authorization: `Bearer ${tokenAttacker}` },
    });
    assert(
      idorResGetRes.status === 403,
      'SEC-05',
      'Customer A attempting to view Customer B reservation returns HTTP 403 Forbidden'
    );

    // SEC-06: Attacker Customer cancelling Victim Customer's order
    const idorOrderCancelRes = await fetch(`${baseUrl}/orders/${victimOrder._id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenAttacker}` },
    });
    assert(
      idorOrderCancelRes.status === 403,
      'SEC-06',
      'Customer A attempting to cancel Customer B order is blocked with HTTP 403'
    );

    // SEC-07: Attacker Customer updating Victim Customer's reservation
    const idorResEditRes = await fetch(`${baseUrl}/reservations/${victimReservation._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAttacker}`,
      },
      body: JSON.stringify({ guestCount: 4 }),
    });
    assert(
      idorResEditRes.status === 403,
      'SEC-07',
      'Customer A attempting to edit Customer B reservation is blocked with HTTP 403'
    );

    // =========================================================================
    // SECTION 3: Administrative Route Protection (RBAC)
    // =========================================================================
    console.log('\n--- Suite 4: Administrative Route Access Controls (RBAC) ---');

    // SEC-08: Customer accessing /admin/stats
    const customerStatsRes = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${tokenAttacker}` },
    });
    assert(customerStatsRes.status === 403, 'SEC-08', 'Customer accessing GET /admin/stats returns HTTP 403');

    // SEC-09: Customer accessing /admin/orders
    const customerOrdersRes = await fetch(`${baseUrl}/admin/orders`, {
      headers: { Authorization: `Bearer ${tokenAttacker}` },
    });
    assert(customerOrdersRes.status === 403, 'SEC-09', 'Customer accessing GET /admin/orders returns HTTP 403');

    // SEC-10: Customer accessing /admin/reservations
    const customerReservationsRes = await fetch(`${baseUrl}/admin/reservations`, {
      headers: { Authorization: `Bearer ${tokenAttacker}` },
    });
    assert(customerReservationsRes.status === 403, 'SEC-10', 'Customer accessing GET /admin/reservations returns HTTP 403');

    // SEC-11: Customer accessing /admin/tables
    const customerTablesRes = await fetch(`${baseUrl}/admin/tables`, {
      headers: { Authorization: `Bearer ${tokenAttacker}` },
    });
    assert(customerTablesRes.status === 403, 'SEC-11', 'Customer accessing GET /admin/tables returns HTTP 403');

    // =========================================================================
    // SECTION 4: Input Sanitization, NoSQL Injections & Defensive Headers
    // =========================================================================
    console.log('\n--- Suite 5: Input Sanitization, Header Hardening & Secret Protection ---');

    // SEC-12: Malformed non-24 hex ObjectId param returns HTTP 400
    const malformedIdRes = await fetch(`${baseUrl}/menu/malformed_id_123`);
    const malformedData = await malformedIdRes.json();
    assert(
      malformedIdRes.status === 400 && malformedData.error?.code === 'VALIDATION_ERROR',
      'SEC-12',
      'Malformed ObjectId parameter rejected with structured 400 VALIDATION_ERROR'
    );

    // SEC-13: NoSQL query operator injection safely handled without crashing
    const injectionRes = await fetch(`${baseUrl}/menu?search[$gt]=`);
    assert(
      injectionRes.status === 200,
      'SEC-13',
      'NoSQL injection attempt in query params handled safely without internal server error'
    );

    // SEC-14: Excessive pagination limit capped to 50 max
    const excessiveLimitRes = await fetch(`${baseUrl}/menu?limit=5000`);
    const excessiveData = await excessiveLimitRes.json();
    assert(
      excessiveLimitRes.status === 200 && excessiveData.data?.pagination?.limit === 50,
      'SEC-14',
      'Excessive pagination limit (limit=5000) automatically bounded to 50 max'
    );

    // SEC-15: Helmet defensive security headers present
    const headersRes = await fetch(`${baseUrl}/menu`);
    const xContentType = headersRes.headers.get('x-content-type-options');
    assert(
      xContentType === 'nosniff',
      'SEC-15',
      'Helmet security header X-Content-Type-Options: nosniff verified on HTTP responses'
    );

    // SEC-16: Auth response strips passwordHash
    assert(
      regData.data?.user?.passwordHash === undefined && regData.data?.user?.password === undefined,
      'SEC-16',
      'User serialization completely strips password and passwordHash from API responses'
    );

    console.log('\n========================================');
    console.log(`Security Integration Tests Summary:`);
    console.log(`Passed: ${passed} | Failed: ${failed}`);
    console.log('========================================\n');
  } catch (err) {
    console.error('Fatal security test execution failure:', err);
    failed++;
  } finally {
    // Teardown test artifacts
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
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }

    if (server) {
      server.close();
    }
    await mongoose.disconnect();

    if (failed > 0) {
      process.exit(1);
    }
  }
};

runSecurityTests();
