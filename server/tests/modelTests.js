import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, MenuItem, CafeTable, Reservation, Order } from '../src/models/index.js';
import { config } from '../src/config/env.js';

dotenv.config();

const runModelTests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Model Tests] Running schema & validation tests...\n');

    // TEST 1: User Safe Serialization & Hash
    console.log('--- Test Suite 1: User Model ---');
    const tempEmail = `test_${Date.now()}@verdora.local`;
    const plainPass = 'Secret123!';
    const passwordHash = await User.hashPassword(plainPass);
    const testUser = new User({
      name: 'Test Persona',
      email: tempEmail,
      passwordHash,
      role: 'customer',
    });
    await testUser.validate();
    const serializedUser = testUser.toJSON();
    assert(serializedUser.passwordHash === undefined, 'toJSON strips passwordHash field');
    assert(await testUser.matchPassword(plainPass), 'matchPassword correctly validates password');
    assert(!(await testUser.matchPassword('WrongPass')), 'matchPassword rejects incorrect password');

    // TEST 2: User Invalid Email Rejection
    const invalidEmailUser = new User({
      name: 'Bad Email',
      email: 'not-an-email',
      passwordHash: 'dummyhashwhichislongenough1234567890123456789012345678901234567890',
    });
    let emailErrorCaught = false;
    try {
      await invalidEmailUser.validate();
    } catch (err) {
      emailErrorCaught = !!err.errors['email'];
    }
    assert(emailErrorCaught, 'Rejects malformed email address');

    // TEST 3: MenuItem Price Validation
    console.log('\n--- Test Suite 2: MenuItem Model ---');
    const negativePriceItem = new MenuItem({
      name: 'Negative Bowl',
      category: 'Bowls',
      price: -50,
    });
    let priceErrorCaught = false;
    try {
      await negativePriceItem.validate();
    } catch (err) {
      priceErrorCaught = !!err.errors['price'];
    }
    assert(priceErrorCaught, 'Rejects negative menu item price');

    const validItem = new MenuItem({
      name: 'Valid Energy Smoothie',
      category: 'Juices',
      price: 850,
    });
    await validItem.validate();
    assert(validItem.isAvailable === true, 'Defaults isAvailable to true');

    // TEST 4: CafeTable Capacity Boundary
    console.log('\n--- Test Suite 3: CafeTable Model ---');
    const zeroCapTable = new CafeTable({
      tableNumber: 'T-99',
      capacity: 0,
    });
    let tableErrorCaught = false;
    try {
      await zeroCapTable.validate();
    } catch (err) {
      tableErrorCaught = !!err.errors['capacity'];
    }
    assert(tableErrorCaught, 'Rejects zero/negative table capacity');

    // TEST 5: Order validation
    console.log('\n--- Test Suite 4: Order Model ---');

    // 5a: Empty items array must be rejected
    const emptyOrder = new Order({
      userId: new mongoose.Types.ObjectId(),
      items: [],
      subtotal: 500,
    });
    let orderItemsErrorCaught = false;
    try {
      await emptyOrder.validate();
    } catch (err) {
      orderItemsErrorCaught = !!err.errors['items'];
    }
    assert(orderItemsErrorCaught, 'Rejects order with empty items array');

    // 5b: Zero subtotal must be rejected (min 0.01)
    const zeroSubtotalOrder = new Order({
      userId: new mongoose.Types.ObjectId(),
      items: [
        {
          menuItemId: new mongoose.Types.ObjectId(),
          itemNameSnapshot: 'Test Item',
          unitPriceSnapshot: 500,
          quantity: 1,
        },
      ],
      subtotal: 0,
    });
    let subtotalErrorCaught = false;
    try {
      await zeroSubtotalOrder.validate();
    } catch (err) {
      subtotalErrorCaught = !!err.errors['subtotal'];
    }
    assert(subtotalErrorCaught, 'Rejects order with zero subtotal');

    // TEST 6: Reservation Time Formatting
    console.log('\n--- Test Suite 5: Reservation Model ---');
    const badTimeReservation = new Reservation({
      userId: new mongoose.Types.ObjectId(),
      tableId: new mongoose.Types.ObjectId(),
      reservationDate: new Date(),
      startTime: '25:99', // invalid
      endTime: '13:00',
      guestCount: 2,
    });
    let timeErrorCaught = false;
    try {
      await badTimeReservation.validate();
    } catch (err) {
      timeErrorCaught = !!err.errors['startTime'];
    }
    assert(timeErrorCaught, 'Rejects malformed 24-hour time format');

    console.log('\n=======================================');
    console.log(` Results: ${passed} Passed, ${failed} Failed`);
    console.log('=======================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('[Model Test Error]:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runModelTests();
