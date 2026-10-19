import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../src/app.js';
import User from '../src/models/User.js';
import CafeTable from '../src/models/CafeTable.js';
import Reservation from '../src/models/Reservation.js';
import { config } from '../src/config/env.js';
import { generateToken } from '../src/middleware/authMiddleware.js';

dotenv.config();

const runReservationTests = async () => {
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

  const createdReservationIds = [];
  const createdTableIds = [];
  let testAdminUser;
  let testCustomer1;
  let testCustomer2;

  try {
    await mongoose.connect(config.mongoUri);
    const testPort = 5095;
    server = app.listen(testPort);
    const baseUrl = `http://127.0.0.1:${testPort}/api/v1`;

    console.log('[Reservation Integration Tests] Testing RES-01 through RES-18...\n');

    const nonce = Date.now();
    const mockHash = '$2a$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890';

    // 1. Create real test users
    testAdminUser = await User.create({
      name: 'Res Admin Tester',
      email: `res_admin_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'admin',
    });

    testCustomer1 = await User.create({
      name: 'Res Customer One',
      email: `res_customer1_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'customer',
    });

    testCustomer2 = await User.create({
      name: 'Res Customer Two',
      email: `res_customer2_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'customer',
    });

    const adminToken = generateToken(testAdminUser._id.toString(), 'admin');
    const customer1Token = generateToken(testCustomer1._id.toString(), 'customer');
    const customer2Token = generateToken(testCustomer2._id.toString(), 'customer');

    // 2. Create seed tables
    const tableSmall = await CafeTable.create({
      tableNumber: `T-SM-${nonce}`,
      capacity: 2,
      isActive: true,
    });
    createdTableIds.push(tableSmall._id);

    const tableLarge = await CafeTable.create({
      tableNumber: `T-LG-${nonce}`,
      capacity: 6,
      isActive: true,
    });
    createdTableIds.push(tableLarge._id);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const validDateStr = tomorrow.toISOString().split('T')[0];

    // RES-01: Create valid reservation for available slot
    const res01 = await fetch(`${baseUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        reservationDate: validDateStr,
        startTime: '10:00',
        endTime: '11:30',
        guestCount: 2,
        tableId: tableSmall._id.toString(),
        specialRequest: 'Window seat if available',
      }),
    });
    const data01 = await res01.json();
    assert(
      res01.status === 201 && data01.data?.status === 'confirmed',
      'RES-01',
      'Customer creates valid reservation for available slot'
    );
    if (data01.data?._id) createdReservationIds.push(data01.data._id);

    // RES-02: Reserve a date in the past
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    const res02 = await fetch(`${baseUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        reservationDate: pastDateStr,
        startTime: '12:00',
        guestCount: 2,
      }),
    });
    assert(res02.status === 400, 'RES-02', 'Booking date in the past rejected with 400');

    // RES-03: Reserve outside cafe opening hours (< 08:00)
    const res03 = await fetch(`${baseUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        reservationDate: validDateStr,
        startTime: '06:30',
        guestCount: 2,
      }),
    });
    assert(res03.status === 400, 'RES-03', 'Booking outside cafe opening hours rejected with 400');

    // RES-04: Guest count zero or negative
    const res04 = await fetch(`${baseUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        reservationDate: validDateStr,
        startTime: '12:00',
        guestCount: 0,
      }),
    });
    assert(res04.status === 400, 'RES-04', 'Guest count of 0 rejected with 400');

    // RES-05: Guest count exceeds table capacity
    const res05 = await fetch(`${baseUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        reservationDate: validDateStr,
        startTime: '14:00',
        endTime: '15:30',
        guestCount: 4,
        tableId: tableSmall._id.toString(), // capacity is only 2
      }),
    });
    assert(res05.status === 400, 'RES-05', 'Guest count exceeding table capacity rejected with 400 INSUFFICIENT_CAPACITY');

    // RES-06: Create overlapping reservation for same table (conflict)
    // TableSmall is already booked 10:00 - 11:30 by RES-01
    const res06 = await fetch(`${baseUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer2Token}`,
      },
      body: JSON.stringify({
        reservationDate: validDateStr,
        startTime: '10:30',
        endTime: '12:00',
        guestCount: 2,
        tableId: tableSmall._id.toString(),
      }),
    });
    const data06 = await res06.json();
    assert(
      res06.status === 409 && data06.error?.code === 'RESERVATION_CONFLICT',
      'RES-06',
      'Overlapping reservation for the same table rejected with 409 RESERVATION_CONFLICT'
    );

    // RES-07: Create reservation for adjacent non-overlapping slot on same table
    // 11:30 - 13:00 on TableSmall does NOT overlap with 10:00 - 11:30
    const res07 = await fetch(`${baseUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer2Token}`,
      },
      body: JSON.stringify({
        reservationDate: validDateStr,
        startTime: '11:30',
        endTime: '13:00',
        guestCount: 2,
        tableId: tableSmall._id.toString(),
      }),
    });
    const data07 = await res07.json();
    assert(
      res07.status === 201 && data07.data?.status === 'confirmed',
      'RES-07',
      'Adjacent non-overlapping slot succeeds with 201'
    );
    if (data07.data?._id) createdReservationIds.push(data07.data._id);

    // RES-08: Smart table allocation (no tableId provided)
    const res08 = await fetch(`${baseUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        reservationDate: validDateStr,
        startTime: '18:00',
        guestCount: 5, // Requires tableLarge (capacity 6)
      }),
    });
    const data08 = await res08.json();
    // tableId is populated: { _id, tableNumber, capacity }
    assert(
      res08.status === 201 && Number(data08.data?.tableId?.capacity) >= 5,
      'RES-08',
      'Smart table allocation assigns table matching capacity requirements'
    );
    if (data08.data?._id) createdReservationIds.push(data08.data._id);

    // RES-09: Customer lists own reservations
    const res09 = await fetch(`${baseUrl}/reservations/my`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    const data09 = await res09.json();
    // getMyReservations does NOT populate userId — it's the raw ObjectId string in JSON
    const allBelongToCustomer1 = data09.data?.reservations?.every(
      (r) => r.userId?.toString() === testCustomer1._id.toString()
    );
    assert(
      res09.status === 200 && allBelongToCustomer1 && data09.data?.reservations?.length >= 2,
      'RES-09',
      'Customer lists strictly own reservations'
    );

    // RES-10: Customer requests another customer reservation
    const targetResId = data01.data._id;
    const res10 = await fetch(`${baseUrl}/reservations/${targetResId}`, {
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert(res10.status === 403, 'RES-10', 'Accessing another customer reservation blocked with 403 FORBIDDEN');

    // RES-11: Customer requests own reservation
    const res11 = await fetch(`${baseUrl}/reservations/${targetResId}`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    const data11 = await res11.json();
    assert(res11.status === 200 && data11.data?._id === targetResId, 'RES-11', 'Customer successfully views own reservation details');

    // RES-12: Customer edits own eligible reservation
    const res12 = await fetch(`${baseUrl}/reservations/${targetResId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        specialRequest: 'Updated: Celebrating anniversary table',
      }),
    });
    const data12 = await res12.json();
    assert(
      res12.status === 200 && data12.data?.specialRequest === 'Updated: Celebrating anniversary table',
      'RES-12',
      'Customer edits own eligible reservation successfully'
    );

    // RES-13: Customer attempts to edit another customer reservation
    const res13 = await fetch(`${baseUrl}/reservations/${targetResId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer2Token}`,
      },
      body: JSON.stringify({ specialRequest: 'Hacked note' }),
    });
    assert(res13.status === 403, 'RES-13', 'Editing another customer reservation blocked with 403 FORBIDDEN');

    // RES-14: Customer cancels own reservation
    const res14 = await fetch(`${baseUrl}/reservations/${targetResId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    const data14 = await res14.json();
    assert(
      res14.status === 200 && data14.data?.reservation?.status === 'cancelled',
      'RES-14',
      'Customer successfully cancels confirmed reservation'
    );

    // RES-15: Cancel already-cancelled reservation
    const res15 = await fetch(`${baseUrl}/reservations/${targetResId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert(res15.status === 400, 'RES-15', 'Cancelling already-cancelled reservation rejected with 400 ALREADY_CANCELLED');

    // RES-16: Admin queries all cafe reservations with pagination & status filter
    const res16 = await fetch(`${baseUrl}/admin/reservations?status=cancelled`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data16 = await res16.json();
    assert(
      res16.status === 200 && data16.data?.pagination?.total >= 1,
      'RES-16',
      'Admin queries all cafe reservations filtered by status (?status=cancelled)'
    );

    // RES-17: Admin transitions status from confirmed to completed
    const confirmedResId = data07.data._id;
    const res17 = await fetch(`${baseUrl}/admin/reservations/${confirmedResId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    });
    const data17 = await res17.json();
    assert(
      res17.status === 200 && data17.data?.reservation?.status === 'completed',
      'RES-17',
      'Admin successfully updates reservation status from confirmed to completed'
    );

    // RES-18: Disallowed transition from completed to confirmed
    const res18 = await fetch(`${baseUrl}/admin/reservations/${confirmedResId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'confirmed' }),
    });
    assert(res18.status === 400, 'RES-18', 'Disallowed status transition (completed -> confirmed) rejected with 400');
  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    // Teardown
    try {
      if (createdReservationIds.length > 0) {
        await Reservation.deleteMany({ _id: { $in: createdReservationIds } });
      }
      if (createdTableIds.length > 0) {
        await CafeTable.deleteMany({ _id: { $in: createdTableIds } });
      }
      if (testAdminUser) await User.findByIdAndDelete(testAdminUser._id);
      if (testCustomer1) await User.findByIdAndDelete(testCustomer1._id);
      if (testCustomer2) await User.findByIdAndDelete(testCustomer2._id);
    } catch (cleanupErr) {
      console.warn('Test cleanup error:', cleanupErr.message);
    }

    if (server) server.close();
    await mongoose.disconnect();

    console.log(`\n========================================`);
    console.log(`Reservation Integration Tests Summary:`);
    console.log(`Passed: ${passed} | Failed: ${failed}`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
};

runReservationTests();
