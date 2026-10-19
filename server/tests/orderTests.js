import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../src/app.js';
import MenuItem from '../src/models/MenuItem.js';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';
import { config } from '../src/config/env.js';
import { generateToken } from '../src/middleware/authMiddleware.js';

dotenv.config();

const runOrderTests = async () => {
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
  let testAdminUser;
  let testCustomer1;
  let testCustomer2;

  try {
    await mongoose.connect(config.mongoUri);
    const testPort = 5092;
    server = app.listen(testPort);
    const baseUrl = `http://127.0.0.1:${testPort}/api/v1`;

    console.log('[Order Integration Tests] Testing ORD-01 through ORD-18...\n');

    const nonce = Date.now();
    const mockHash = '$2a$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890';

    // 1. Create real test users
    testAdminUser = await User.create({
      name: 'Order Admin Tester',
      email: `order_admin_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'admin',
    });

    testCustomer1 = await User.create({
      name: 'Order Customer One',
      email: `customer1_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'customer',
    });

    testCustomer2 = await User.create({
      name: 'Order Customer Two',
      email: `customer2_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'customer',
    });

    const adminToken = generateToken(testAdminUser._id.toString(), 'admin');
    const customer1Token = generateToken(testCustomer1._id.toString(), 'customer');
    const customer2Token = generateToken(testCustomer2._id.toString(), 'customer');

    // 2. Create seed menu items
    const availableItem1 = await MenuItem.create({
      name: `Artisan Flat White ${nonce}`,
      category: 'Beverages',
      price: 850,
      isAvailable: true,
    });
    createdItemIds.push(availableItem1._id);

    const availableItem2 = await MenuItem.create({
      name: `Organic Acai Bowl ${nonce}`,
      category: 'Bowls',
      price: 1650,
      isAvailable: true,
    });
    createdItemIds.push(availableItem2._id);

    const unavailableItem = await MenuItem.create({
      name: `Seasonal Truffle Toast ${nonce}`,
      category: 'Toast',
      price: 1950,
      isAvailable: false,
    });
    createdItemIds.push(unavailableItem._id);

    // =========================================================================
    // ORD-01: Call order creation without authentication -> 401
    // =========================================================================
    const res1 = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ menuItemId: availableItem1._id.toString(), quantity: 1 }],
      }),
    });
    const data1 = await res1.json();
    assert(res1.status === 401 && data1.success === false, 'ORD-01', 'Unauthenticated order creation rejected with 401');

    // =========================================================================
    // ORD-02: Submit empty cart -> 400
    // =========================================================================
    const res2 = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({ items: [] }),
    });
    const data2 = await res2.json();
    assert(res2.status === 400 && data2.success === false, 'ORD-02', 'Submitting empty items array rejected with 400');

    // =========================================================================
    // ORD-03: Invalid quantity (zero or negative) -> 400
    // =========================================================================
    const res3 = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        items: [{ menuItemId: availableItem1._id.toString(), quantity: 0 }],
      }),
    });
    const data3 = await res3.json();
    assert(res3.status === 400 && data3.success === false, 'ORD-03', 'Quantity of 0 rejected with 400');

    // =========================================================================
    // ORD-04: Submit fake client price/total -> Server ignores it and computes real total
    // =========================================================================
    const res4 = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        items: [
          {
            menuItemId: availableItem1._id.toString(),
            quantity: 2, // 2 * 850 = 1700
            price: 5, // Fake client price
          },
          {
            menuItemId: availableItem2._id.toString(),
            quantity: 1, // 1 * 1650 = 1650
            price: 10, // Fake client price
          },
        ],
        subtotal: 15, // Fake client subtotal
        notes: 'Extra hot with oat milk',
      }),
    });
    const data4 = await res4.json();
    const expectedSubtotal = 2 * 850 + 1 * 1650; // 3350
    assert(
      res4.status === 201 &&
        data4.success === true &&
        data4.data.subtotal === expectedSubtotal,
      'ORD-04',
      `Server computes authoritative total (${data4?.data?.subtotal} === ${expectedSubtotal}) ignoring client-sent fake total`
    );
    if (data4?.data?._id) createdOrderIds.push(data4.data._id);

    // =========================================================================
    // ORD-05: Verify immutable order item snapshots saved
    // =========================================================================
    const createdOrder = data4.data;
    const snap1 = createdOrder.items.find((i) => i.menuItemId === availableItem1._id.toString());
    assert(
      snap1 &&
        snap1.itemNameSnapshot === availableItem1.name &&
        snap1.unitPriceSnapshot === availableItem1.price &&
        snap1.quantity === 2,
      'ORD-05',
      'Order preserves exact immutable snapshot of item name and unit price'
    );

    // =========================================================================
    // ORD-06: Order unavailable item -> 400
    // =========================================================================
    const res6 = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        items: [{ menuItemId: unavailableItem._id.toString(), quantity: 1 }],
      }),
    });
    const data6 = await res6.json();
    assert(
      res6.status === 400 && data6.error.code === 'ITEM_UNAVAILABLE',
      'ORD-06',
      'Ordering item with isAvailable=false rejected with 400 ITEM_UNAVAILABLE'
    );

    // =========================================================================
    // ORD-07: Order non-existent menuItemId -> 400 ITEM_NOT_FOUND
    // =========================================================================
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res7 = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        items: [{ menuItemId: nonExistentId, quantity: 1 }],
      }),
    });
    const data7 = await res7.json();
    assert(
      res7.status === 400 && data7.error.code === 'ITEM_NOT_FOUND',
      'ORD-07',
      'Ordering non-existent menu item rejected with 400 ITEM_NOT_FOUND'
    );

    // =========================================================================
    // ORD-08: Order with malformed menuItemId -> 400 Validation Error
    // =========================================================================
    const res8 = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        items: [{ menuItemId: 'not-an-objectid', quantity: 1 }],
      }),
    });
    const data8 = await res8.json();
    assert(
      res8.status === 400 && data8.error.code === 'VALIDATION_ERROR',
      'ORD-08',
      'Malformed ObjectId in items array rejected with 400 VALIDATION_ERROR'
    );

    // =========================================================================
    // ORD-09: Customer views own orders list -> only own orders returned
    // =========================================================================
    const res9 = await fetch(`${baseUrl}/orders/my`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    const data9 = await res9.json();
    assert(
      res9.status === 200 &&
        data9.success === true &&
        Array.isArray(data9.data.orders) &&
        data9.data.orders.every((o) => o.userId.toString() === testCustomer1._id.toString()),
      'ORD-09',
      'Customer order history endpoint returns strictly own orders'
    );

    // =========================================================================
    // ORD-10: Customer A requests Customer B's order -> 403 Forbidden
    // =========================================================================
    const res10 = await fetch(`${baseUrl}/orders/${createdOrder._id}`, {
      headers: { Authorization: `Bearer ${customer2Token}` }, // Customer 2 trying to read Customer 1's order
    });
    const data10 = await res10.json();
    assert(
      res10.status === 403 && data10.error.code === 'FORBIDDEN',
      'ORD-10',
      'Customer A attempting to view Customer B order is blocked with 403 FORBIDDEN'
    );

    // =========================================================================
    // ORD-11: Customer views own order by ID -> 200 Success
    // =========================================================================
    const res11 = await fetch(`${baseUrl}/orders/${createdOrder._id}`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    const data11 = await res11.json();
    assert(
      res11.status === 200 &&
        data11.success === true &&
        data11.data._id === createdOrder._id,
      'ORD-11',
      'Customer successfully accesses own order details'
    );

    // =========================================================================
    // ORD-12: Non-admin calls admin orders list -> 403 Forbidden
    // =========================================================================
    const res12 = await fetch(`${baseUrl}/admin/orders`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    const data12 = await res12.json();
    assert(
      res12.status === 403 && data12.success === false,
      'ORD-12',
      'Customer attempting admin order list is blocked with 403'
    );

    // =========================================================================
    // ORD-13: Admin views all orders -> 200 Success
    // =========================================================================
    const res13 = await fetch(`${baseUrl}/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data13 = await res13.json();
    assert(
      res13.status === 200 &&
        data13.success === true &&
        Array.isArray(data13.data.orders) &&
        data13.data.orders.length > 0,
      'ORD-13',
      'Admin successfully queries all cafe orders with pagination metadata'
    );

    // =========================================================================
    // ORD-14: Admin changes status 'placed' -> 'preparing' -> 200
    // =========================================================================
    const res14 = await fetch(`${baseUrl}/admin/orders/${createdOrder._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'preparing' }),
    });
    const data14 = await res14.json();
    assert(
      res14.status === 200 && data14.data.status === 'preparing',
      'ORD-14',
      'Admin successfully transitions order status from placed to preparing'
    );

    // =========================================================================
    // ORD-15: Attempt forbidden status transition (e.g. preparing -> placed) -> 400
    // =========================================================================
    const res15 = await fetch(`${baseUrl}/admin/orders/${createdOrder._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'placed' }),
    });
    const data15 = await res15.json();
    assert(
      res15.status === 400 && data15.error.code === 'INVALID_STATUS_TRANSITION',
      'ORD-15',
      'Disallowed status transition (preparing -> placed) rejected with 400'
    );

    // =========================================================================
    // ORD-16: Customer cannot cancel order once preparation has begun -> 400
    // =========================================================================
    const res16 = await fetch(`${baseUrl}/orders/${createdOrder._id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    const data16 = await res16.json();
    assert(
      res16.status === 400 && data16.error.code === 'CANCELLATION_CUTOFF',
      'ORD-16',
      'Cancellation rejected with 400 once order has reached preparing status'
    );

    // =========================================================================
    // ORD-17: Create new order and cancel it while still in 'placed' status -> 200
    // =========================================================================
    const res17a = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        items: [{ menuItemId: availableItem1._id.toString(), quantity: 1 }],
      }),
    });
    const data17a = await res17a.json();
    const cancellableOrder = data17a.data;
    if (cancellableOrder?._id) createdOrderIds.push(cancellableOrder._id);

    const res17b = await fetch(`${baseUrl}/orders/${cancellableOrder._id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    const data17b = await res17b.json();
    assert(
      res17b.status === 200 && data17b.data.status === 'cancelled',
      'ORD-17',
      'Customer successfully cancels eligible order in placed status'
    );

    // =========================================================================
    // ORD-18: Admin filters orders by status query -> 200
    // =========================================================================
    const res18 = await fetch(`${baseUrl}/admin/orders?status=cancelled`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data18 = await res18.json();
    assert(
      res18.status === 200 &&
        Array.isArray(data18.data.orders) &&
        data18.data.orders.every((o) => o.status === 'cancelled'),
      'ORD-18',
      'Admin order list filters by status query parameter (?status=cancelled)'
    );
  } catch (err) {
    console.error('Test runner encountered an error:', err);
    failed++;
  } finally {
    // Cleanup created test records
    try {
      if (createdOrderIds.length > 0) {
        await Order.deleteMany({ _id: { $in: createdOrderIds } });
      }
      if (createdItemIds.length > 0) {
        await MenuItem.deleteMany({ _id: { $in: createdItemIds } });
      }
      if (testAdminUser?._id) await User.findByIdAndDelete(testAdminUser._id);
      if (testCustomer1?._id) await User.findByIdAndDelete(testCustomer1._id);
      if (testCustomer2?._id) await User.findByIdAndDelete(testCustomer2._id);
    } catch (cleanupErr) {
      console.warn('Test cleanup warning:', cleanupErr.message);
    }

    if (server) server.close();
    await mongoose.disconnect();

    console.log(`\n========================================`);
    console.log(`Order Integration Tests Summary:`);
    console.log(`Passed: ${passed} | Failed: ${failed}`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
};

runOrderTests();
