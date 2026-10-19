import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { config } from '../src/config/env.js';

dotenv.config();

const runAuthTests = async () => {
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

  try {
    await mongoose.connect(config.mongoUri);
    server = app.listen(5088);
    const baseUrl = 'http://127.0.0.1:5088/api/v1';
    console.log('[Auth Integration Tests] Testing AUTH-01 through AUTH-16...\n');

    // Unique timestamp for test data isolation
    const nonce = Date.now();
    const testEmail = `diner_${nonce}@verdora.local`;
    const testPassword = 'Password123!';

    // AUTH-01: Register with valid name, email, password
    console.log('--- Test Suite 1: Registration ---');
    const resAuth01 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Diner Persona',
        email: testEmail,
        password: testPassword,
      }),
    });
    const dataAuth01 = await resAuth01.json();
    assert(resAuth01.status === 201, 'AUTH-01', 'Registration succeeds with HTTP 201');
    assert(dataAuth01.success === true, 'AUTH-01', 'Response envelope contains success: true');
    assert(!!dataAuth01.data?.token, 'AUTH-01', 'Session token is returned');
    assert(dataAuth01.data?.user?.email === testEmail, 'AUTH-01', 'Safe user object returned with correct email');

    // AUTH-02: Register with an already-used email
    const resAuth02 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Diner',
        email: testEmail,
        password: testPassword,
      }),
    });
    const dataAuth02 = await resAuth02.json();
    assert(resAuth02.status === 409, 'AUTH-02', 'Duplicate email registration rejected with HTTP 409');
    assert(dataAuth02.error?.code === 'CONFLICT', 'AUTH-02', 'Error code is CONFLICT');

    // AUTH-03: Register with malformed email
    const resAuth03 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad Email',
        email: 'invalid-email-format',
        password: testPassword,
      }),
    });
    const dataAuth03 = await resAuth03.json();
    assert(resAuth03.status === 400, 'AUTH-03', 'Malformed email returns HTTP 400');
    assert(dataAuth03.error?.code === 'VALIDATION_ERROR', 'AUTH-03', 'Error code is VALIDATION_ERROR');

    // AUTH-04: Register with missing required fields
    const resAuth04 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Missing Password',
        email: `missing_${nonce}@verdora.local`,
      }),
    });
    assert(resAuth04.status === 400, 'AUTH-04', 'Missing required fields returns HTTP 400');

    // AUTH-05: Register with password below policy (< 8 chars)
    const resAuth05 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pass',
        email: `short_${nonce}@verdora.local`,
        password: 'short',
      }),
    });
    assert(resAuth05.status === 400, 'AUTH-05', 'Password under 8 characters returns HTTP 400');

    // AUTH-06: Inspect stored user record in database
    console.log('\n--- Test Suite 2: Password Storage & Role Security ---');
    const dbUser = await User.findOne({ email: testEmail });
    assert(dbUser !== null, 'AUTH-06', 'User persisted in MongoDB');
    assert(dbUser.passwordHash !== testPassword, 'AUTH-06', 'Password is not plaintext');
    assert(dbUser.passwordHash.startsWith('$2'), 'AUTH-06', 'Password is bcrypt hashed');

    // AUTH-07: Attempt public registration with role 'admin'
    const escalationEmail = `escalation_${nonce}@verdora.local`;
    const resAuth07 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Attempt',
        email: escalationEmail,
        password: testPassword,
        role: 'admin', // Attack payload
      }),
    });
    const dataAuth07 = await resAuth07.json();
    const dbEscalationUser = await User.findOne({ email: escalationEmail });
    assert(dataAuth07.data?.user?.role === 'customer', 'AUTH-07', 'Response reports role as customer');
    assert(dbEscalationUser.role === 'customer', 'AUTH-07', 'Database enforces role customer; escalation blocked');

    // AUTH-08: Login with valid credentials
    console.log('\n--- Test Suite 3: Login & Current User ---');
    const resAuth08 = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const dataAuth08 = await resAuth08.json();
    assert(resAuth08.status === 200, 'AUTH-08', 'Valid login succeeds with HTTP 200');
    assert(!!dataAuth08.data?.token, 'AUTH-08', 'Valid token issued on login');
    const customerToken = dataAuth08.data?.token;

    // AUTH-09: Login with incorrect password
    const resAuth09 = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword!',
      }),
    });
    const dataAuth09 = await resAuth09.json();
    assert(resAuth09.status === 401, 'AUTH-09', 'Incorrect password returns HTTP 401');
    assert(dataAuth09.error?.message === 'Invalid email or password.', 'AUTH-09', 'Generic error message returned');

    // AUTH-10: Login with unknown email
    const resAuth10 = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `nonexistent_${nonce}@verdora.local`,
        password: 'AnyPassword123!',
      }),
    });
    const dataAuth10 = await resAuth10.json();
    assert(resAuth10.status === 401, 'AUTH-10', 'Unknown email returns HTTP 401');
    assert(dataAuth10.error?.message === 'Invalid email or password.', 'AUTH-10', 'Generic error prevents account enumeration');

    // AUTH-11: Access protected route without authentication
    console.log('\n--- Test Suite 4: Session & Endpoint Protection ---');
    const resAuth11 = await fetch(`${baseUrl}/auth/me`);
    assert(resAuth11.status === 401, 'AUTH-11', 'Unauthenticated /me returns HTTP 401');

    // AUTH-13: Call current-user endpoint after login
    const resAuth13 = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const dataAuth13 = await resAuth13.json();
    assert(resAuth13.status === 200, 'AUTH-13', 'Authenticated /me returns HTTP 200');
    assert(dataAuth13.data?.user?.email === testEmail, 'AUTH-13', 'Correct profile returned');
    assert(dataAuth13.data?.user?.passwordHash === undefined, 'AUTH-13', 'Password hash excluded from profile');

    // AUTH-14: Logout endpoint
    const resAuth14 = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const dataAuth14 = await resAuth14.json();
    assert(resAuth14.status === 200, 'AUTH-14', 'Logout succeeds with HTTP 200');
    assert(dataAuth14.data?.message?.includes('Logged out'), 'AUTH-14', 'Returns clean logout confirmation');

    // AUTH-16: Ensure password hash is never exposed anywhere
    assert(dataAuth01.data?.user?.passwordHash === undefined, 'AUTH-16', 'Register response strips passwordHash');
    assert(dataAuth08.data?.user?.passwordHash === undefined, 'AUTH-16', 'Login response strips passwordHash');

    console.log('\n=======================================');
    console.log(` Results: ${passed} Passed, ${failed} Failed`);
    console.log('=======================================');

    // Clean up test accounts
    await User.deleteMany({ email: { $in: [testEmail, escalationEmail] } });

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('[Auth Test Error]:', error);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
};

runAuthTests();
