import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../src/app.js';
import MenuItem from '../src/models/MenuItem.js';
import User from '../src/models/User.js';
import { config } from '../src/config/env.js';
import { generateToken } from '../src/middleware/authMiddleware.js';

dotenv.config();

const runMenuTests = async () => {
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

  const createdItemIds = [];
  let testAdminUser;
  let testCustomerUser;

  try {
    await mongoose.connect(config.mongoUri);
    const testPort = 5089;
    server = app.listen(testPort);
    const baseUrl = `http://127.0.0.1:${testPort}/api/v1`;

    console.log('[Menu Integration Tests] Testing MENU-01 through MENU-15...\n');

    const nonce = Date.now();

    // 1. Setup real Admin and Customer users in DB for authentication middleware
    const mockHash = '$2a$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234567890'; // 60+ chars
    testAdminUser = await User.create({
      name: 'Menu Admin Tester',
      email: `menu_admin_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'admin',
    });

    testCustomerUser = await User.create({
      name: 'Menu Customer Tester',
      email: `menu_customer_${nonce}@verdora.local`,
      passwordHash: mockHash,
      role: 'customer',
    });

    const adminToken = generateToken(testAdminUser._id.toString(), 'admin');
    const customerToken = generateToken(testCustomerUser._id.toString(), 'customer');

    // Create test seed items in database for querying
    const seedItem1 = await MenuItem.create({
      name: `Acai Energy Bowl ${nonce}`,
      description: 'Acai berry puree topped with organic granola and banana',
      category: 'Bowls',
      price: 1450,
      isAvailable: true,
    });
    createdItemIds.push(seedItem1._id);

    const seedItem2 = await MenuItem.create({
      name: `Green Vitality Juice ${nonce}`,
      description: 'Cold-pressed kale, celery, green apple, and ginger',
      category: 'Juices',
      price: 850,
      isAvailable: true,
    });
    createdItemIds.push(seedItem2._id);

    const seedItem3 = await MenuItem.create({
      name: `Avocado Sourdough Toast ${nonce}`,
      description: 'Crushed avocado, chili flakes, sea salt on artisan sourdough',
      category: 'Toast',
      price: 1200,
      isAvailable: true,
    });
    createdItemIds.push(seedItem3._id);

    // --- Suite 1: Public Catalog, Filtering & Search ---
    console.log('--- Test Suite 1: Catalog Browsing & Search ---');

    // MENU-01: Public GET /menu returns available items
    const resMenu01 = await fetch(`${baseUrl}/menu`);
    const dataMenu01 = await resMenu01.json();
    assert(resMenu01.status === 200, 'MENU-01', 'Public GET /menu returns HTTP 200');
    assert(dataMenu01.success === true, 'MENU-01', 'Response contains standard envelope success: true');
    assert(Array.isArray(dataMenu01.data?.items), 'MENU-01', 'Catalog data contains items array');

    // MENU-02: Category filtering
    const resMenu02 = await fetch(`${baseUrl}/menu?category=Bowls`);
    const dataMenu02 = await resMenu02.json();
    assert(resMenu02.status === 200, 'MENU-02', 'Category filter returns HTTP 200');
    const allBowls = dataMenu02.data?.items.every((it) => it.category === 'Bowls');
    assert(allBowls, 'MENU-02', 'All returned items match category=Bowls');

    // MENU-03: Invalid category rejected
    const resMenu03 = await fetch(`${baseUrl}/menu?category=InvalidFastFood`);
    const dataMenu03 = await resMenu03.json();
    assert(resMenu03.status === 400, 'MENU-03', 'Invalid category rejected with HTTP 400');
    assert(dataMenu03.error?.code === 'VALIDATION_ERROR', 'MENU-03', 'Error code is VALIDATION_ERROR');

    // MENU-04: Search by name query (case-insensitive substring)
    const resMenu04 = await fetch(`${baseUrl}/menu?search=vitality`);
    const dataMenu04 = await resMenu04.json();
    assert(resMenu04.status === 200, 'MENU-04', 'Search query returns HTTP 200');
    const foundVitality = dataMenu04.data?.items.some((it) => it.name.includes('Vitality'));
    assert(foundVitality, 'MENU-04', 'Found search match for vitality item');

    // MENU-05: Sorting by price ascending
    const resMenu05 = await fetch(`${baseUrl}/menu?sortBy=price&order=asc&limit=20`);
    const dataMenu05 = await resMenu05.json();
    assert(resMenu05.status === 200, 'MENU-05', 'Sorted catalog returns HTTP 200');
    const prices = dataMenu05.data?.items.map((it) => it.price);
    const isSortedAsc = prices.slice(1).every((p, i) => p >= prices[i]);
    assert(isSortedAsc, 'MENU-05', 'Catalog items sorted in ascending price order');

    // MENU-06: Pagination parameters
    const resMenu06 = await fetch(`${baseUrl}/menu?page=1&limit=2`);
    const dataMenu06 = await resMenu06.json();
    assert(resMenu06.status === 200, 'MENU-06', 'Pagination query returns HTTP 200');
    assert(dataMenu06.data?.items.length <= 2, 'MENU-06', 'Items count respects limit=2');
    assert(dataMenu06.data?.pagination?.page === 1, 'MENU-06', 'Pagination envelope reports page=1');
    assert(dataMenu06.data?.pagination?.limit === 2, 'MENU-06', 'Pagination envelope reports limit=2');

    // --- Suite 2: Single Item Lookup ---
    console.log('\n--- Test Suite 2: Item Details & Error Handling ---');

    // MENU-07: Fetch single item by valid ID
    const resMenu07 = await fetch(`${baseUrl}/menu/${seedItem1._id}`);
    const dataMenu07 = await resMenu07.json();
    assert(resMenu07.status === 200, 'MENU-07', 'Valid item ID returns HTTP 200');
    assert(dataMenu07.data?.item?._id === seedItem1._id.toString(), 'MENU-07', 'Returned item ID matches requested ID');

    // MENU-08: Malformed ObjectId parameter rejected
    const resMenu08 = await fetch(`${baseUrl}/menu/123-not-an-id`);
    const dataMenu08 = await resMenu08.json();
    assert(resMenu08.status === 400, 'MENU-08', 'Malformed ObjectId parameter returns HTTP 400');
    assert(dataMenu08.error?.code === 'VALIDATION_ERROR', 'MENU-08', 'Error code is VALIDATION_ERROR');

    // MENU-09: Non-existent ObjectId returns 404
    const fakeId = new mongoose.Types.ObjectId();
    const resMenu09 = await fetch(`${baseUrl}/menu/${fakeId}`);
    const dataMenu09 = await resMenu09.json();
    assert(resMenu09.status === 404, 'MENU-09', 'Non-existent item ID returns HTTP 404');
    assert(dataMenu09.error?.code === 'NOT_FOUND', 'MENU-09', 'Error code is NOT_FOUND');

    // --- Suite 3: Admin Authorization & Creation ---
    console.log('\n--- Test Suite 3: Admin Authorization & Item Creation ---');

    const newDishPayload = {
      name: `Spirulina Protein Bowl ${nonce}`,
      description: 'Blue spirulina, chia pudding, mango slices, organic oats',
      category: 'Bowls',
      price: 1850,
      calories: 340,
      allergens: ['Nuts'],
    };

    // MENU-10: Unauthenticated POST rejected
    const resMenu10 = await fetch(`${baseUrl}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDishPayload),
    });
    assert(resMenu10.status === 401, 'MENU-10', 'Unauthenticated POST /menu returns HTTP 401');

    // MENU-11: Customer role forbidden from creating item
    const resMenu11 = await fetch(`${baseUrl}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify(newDishPayload),
    });
    assert(resMenu11.status === 403, 'MENU-11', 'Customer role POST /menu returns HTTP 403 (Forbidden)');

    // MENU-12: Admin role successfully creates new menu item
    const resMenu12 = await fetch(`${baseUrl}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newDishPayload),
    });
    const dataMenu12 = await resMenu12.json();
    assert(resMenu12.status === 201, 'MENU-12', 'Admin role POST /menu creates item with HTTP 201');
    assert(dataMenu12.data?.item?.name === newDishPayload.name, 'MENU-12', 'Created item contains accurate name');
    if (dataMenu12.data?.item?._id) {
      createdItemIds.push(dataMenu12.data.item._id);
    }
    const createdItemId = dataMenu12.data?.item?._id;

    // MENU-13: Validation rejection on negative price
    const resMenu13 = await fetch(`${baseUrl}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Item',
        category: 'Juices',
        price: -50,
      }),
    });
    assert(resMenu13.status === 400, 'MENU-13', 'Negative price rejected with HTTP 400');

    // --- Suite 4: Admin Update & Soft Deactivation ---
    console.log('\n--- Test Suite 4: Item Updates & Soft Deactivation ---');

    // MENU-14: Admin PATCH updates price and description
    const resMenu14 = await fetch(`${baseUrl}/menu/${createdItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 1950,
        description: 'Updated deluxe recipe with roasted pumpkin seeds',
      }),
    });
    const dataMenu14 = await resMenu14.json();
    assert(resMenu14.status === 200, 'MENU-14', 'Admin PATCH returns HTTP 200');
    assert(dataMenu14.data?.item?.price === 1950, 'MENU-14', 'Updated price reflected in response');
    assert(dataMenu14.data?.item?.description.includes('deluxe'), 'MENU-14', 'Updated description persisted');

    // MENU-15: Admin DELETE soft-deactivates item (isAvailable: false)
    const resMenu15 = await fetch(`${baseUrl}/menu/${createdItemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const dataMenu15 = await resMenu15.json();
    assert(resMenu15.status === 200, 'MENU-15', 'Admin DELETE returns HTTP 200');
    assert(dataMenu15.data?.item?.isAvailable === false, 'MENU-15', 'Item marked isAvailable: false');

    // Verify soft-deactivated item is excluded from public catalog
    const resPublicCatalog = await fetch(`${baseUrl}/menu?search=Spirulina`);
    const dataPublicCatalog = await resPublicCatalog.json();
    const foundDeactivated = dataPublicCatalog.data?.items.some(
      (it) => it._id === createdItemId.toString()
    );
    assert(!foundDeactivated, 'MENU-15', 'Deactivated item is excluded from public customer catalog');
  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  } finally {
    console.log('\n--- Test Teardown ---');
    if (createdItemIds.length > 0) {
      await MenuItem.deleteMany({ _id: { $in: createdItemIds } });
      console.log(`Cleaned up ${createdItemIds.length} test menu items.`);
    }
    const userCleanups = [];
    if (testAdminUser?._id) userCleanups.push(testAdminUser._id);
    if (testCustomerUser?._id) userCleanups.push(testCustomerUser._id);
    if (userCleanups.length > 0) {
      await User.deleteMany({ _id: { $in: userCleanups } });
      console.log(`Cleaned up ${userCleanups.length} test users.`);
    }
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
    console.log('Database connection closed.');

    console.log('\n=======================================');
    console.log(` Results: ${passed} Passed, ${failed} Failed`);
    console.log('=======================================\n');

    process.exit(failed > 0 ? 1 : 0);
  }
};

runMenuTests();
