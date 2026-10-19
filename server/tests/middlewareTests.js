import express from 'express';
import cookieParser from 'cookie-parser';
import { sanitizeInput } from '../src/middleware/sanitize.js';
import { requireRole } from '../src/middleware/authMiddleware.js';
import { validateObjectId, validatePagination, validateRequiredBody } from '../src/middleware/validate.js';
import { notFoundHandler, errorHandler } from '../src/middleware/errorMiddleware.js';
import { sendSuccess } from '../src/utils/response.js';

// Setup an isolated test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(sanitizeInput);

  // Public route
  app.get('/test/public', (req, res) => {
    sendSuccess(res, 200, { message: 'Public OK' });
  });

  // Mock protected route
  app.get(
    '/test/protected',
    (req, res, next) => {
      // Mock protect decoding for unit testing without live DB dependency
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      }
      if (authHeader.includes('invalid_token')) {
        return res.status(401).json({ success: false, error: { code: 'TOKEN_INVALID' } });
      }
      if (authHeader.includes('customer_token')) {
        req.user = { id: 'cust1', role: 'customer' };
      } else if (authHeader.includes('admin_token')) {
        req.user = { id: 'adm1', role: 'admin' };
      }
      next();
    },
    requireRole('admin'),
    (req, res) => {
      sendSuccess(res, 200, { message: 'Admin Access Granted' });
    }
  );

  // Validate ObjectId route
  app.get('/test/item/:id', validateObjectId('id'), (req, res) => {
    sendSuccess(res, 200, { id: req.params.id });
  });

  // Validate Pagination route
  app.get('/test/items', validatePagination, (req, res) => {
    sendSuccess(res, 200, req.pagination);
  });

  // Validate Required Body route
  app.post('/test/required-body', validateRequiredBody(['name', 'email']), (req, res) => {
    sendSuccess(res, 200, { received: req.body });
  });

  // Sanitization test endpoint
  app.post('/test/sanitize', (req, res) => {
    sendSuccess(res, 200, req.body);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

// Simple in-memory HTTP test runner using Node fetch
const runMiddlewareTests = async () => {
  const app = createTestApp();
  let server;
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
    server = app.listen(5099);
    const baseUrl = 'http://127.0.0.1:5099';
    console.log('[Middleware Tests] Starting security & validation tests...\n');

    // TEST 1: 404 Not Found JSON shape
    console.log('--- Test Suite 1: Error Contracts ---');
    const res404 = await fetch(`${baseUrl}/non-existent-route`);
    const data404 = await res404.json();
    assert(res404.status === 404, 'Unknown route returns HTTP 404 status');
    assert(data404.success === false, '404 response has success: false');
    assert(data404.error?.code === 'NOT_FOUND', '404 response has code: NOT_FOUND');

    // TEST 2: NoSQL Injection Sanitization
    console.log('\n--- Test Suite 2: Sanitization Middleware ---');
    const resSanitize = await fetch(`${baseUrl}/test/sanitize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        normalField: 'salad',
        $where: 'malicious operator',
        'nested.field': 'illegal dot key',
      }),
    });
    const dataSanitize = await resSanitize.json();
    assert(dataSanitize.data.$where === undefined, 'Strips $ operator keys from body');
    assert(dataSanitize.data['nested.field'] === undefined, 'Strips dot-notation keys from body');
    assert(dataSanitize.data.normalField === 'salad', 'Preserves legitimate payload fields');

    // TEST 3: Auth & RBAC Guards
    console.log('\n--- Test Suite 3: Auth & Role Guards ---');
    const resNoToken = await fetch(`${baseUrl}/test/protected`);
    const dataNoToken = await resNoToken.json();
    assert(resNoToken.status === 401, 'Protected route without token returns 401');
    assert(dataNoToken.error?.code === 'UNAUTHORIZED', 'Missing token returns code: UNAUTHORIZED');

    const resInvalidToken = await fetch(`${baseUrl}/test/protected`, {
      headers: { Authorization: 'Bearer invalid_token' },
    });
    const dataInvalidToken = await resInvalidToken.json();
    assert(resInvalidToken.status === 401, 'Invalid token returns 401');
    assert(dataInvalidToken.error?.code === 'TOKEN_INVALID', 'Invalid token returns code: TOKEN_INVALID');

    const resCustomer = await fetch(`${baseUrl}/test/protected`, {
      headers: { Authorization: 'Bearer customer_token' },
    });
    const dataCustomer = await resCustomer.json();
    assert(resCustomer.status === 403, 'Customer accessing admin route returns 403');
    assert(dataCustomer.error?.code === 'FORBIDDEN', 'Accessing admin route returns code: FORBIDDEN');

    const resAdmin = await fetch(`${baseUrl}/test/protected`, {
      headers: { Authorization: 'Bearer admin_token' },
    });
    const dataAdmin = await resAdmin.json();
    assert(resAdmin.status === 200, 'Admin token successfully accesses admin route');
    assert(dataAdmin.data?.message === 'Admin Access Granted', 'Returns success payload for authorized role');

    // TEST 4: Request Validation
    console.log('\n--- Test Suite 4: Request Validators ---');
    const resBadId = await fetch(`${baseUrl}/test/item/not-a-mongo-id`);
    const dataBadId = await resBadId.json();
    assert(resBadId.status === 400, 'Malformed ObjectId param returns 400');
    assert(dataBadId.error?.code === 'VALIDATION_ERROR', 'Malformed ObjectId returns code: VALIDATION_ERROR');

    const resGoodId = await fetch(`${baseUrl}/test/item/67b43a9f1a2b3c4d5e6f7001`);
    assert(resGoodId.status === 200, 'Valid 24-hex ObjectId succeeds');

    const resPagination = await fetch(`${baseUrl}/test/items?page=2&limit=999`);
    const dataPagination = await resPagination.json();
    assert(dataPagination.data.page === 2, 'Parses page query parameter');
    assert(dataPagination.data.limit === 50, 'Caps excessive limit query parameter to 50 max');

    // TEST 5: Required Body Validation
    console.log('\n--- Test Suite 5: Required Body Validator ---');
    const resMissingBody = await fetch(`${baseUrl}/test/required-body`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Saman' }), // missing 'email'
    });
    const dataMissingBody = await resMissingBody.json();
    assert(resMissingBody.status === 400, 'Missing required field returns 400');
    assert(dataMissingBody.error?.code === 'VALIDATION_ERROR', 'Missing required field returns code: VALIDATION_ERROR');
    assert(
      dataMissingBody.error?.details?.some((d) => d.field === 'email'),
      'Error details identify the missing field'
    );

    const resValidBody = await fetch(`${baseUrl}/test/required-body`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Saman', email: 'saman@verdora.local' }),
    });
    assert(resValidBody.status === 200, 'Complete required body passes validation');

    console.log('\n=======================================');
    console.log(` Results: ${passed} Passed, ${failed} Failed`);
    console.log('=======================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('[Test Runner Error]:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
};

runMiddlewareTests();
