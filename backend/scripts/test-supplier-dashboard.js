/**
 * Supplier Dashboard Endpoint Tester
 * ====================================
 * Tests ALL endpoints used by the supplier dashboard tabs:
 *   - Dashboard (stats + recent deliveries)
 *   - Tea Production
 *   - Payment Processing
 *   - Inventory & Advances
 *   - Leaf Supply Inbox
 *
 * Usage:
 *   node scripts/test-supplier-dashboard.js <email> <password>
 *
 * Example:
 *   node scripts/test-supplier-dashboard.js supplier@example.com password123
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api';
const [, , EMAIL, PASSWORD] = process.argv;

if (!EMAIL || !PASSWORD) {
  console.error('\n❌  Usage: node scripts/test-supplier-dashboard.js <email> <password>\n');
  process.exit(1);
}

// ─── HTTP helper ────────────────────────────────────────────────────────────

function request(method, path, { body, token } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ─── Reporting helpers ───────────────────────────────────────────────────────

const PASS = '✅';
const FAIL = '❌';
const WARN = '⚠️ ';

let totalPass = 0;
let totalFail = 0;

function printSection(title) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(60));
}

function check(label, { status, body }, options = {}) {
  const {
    expectStatus = 200,
    expectSuccess = true,
    expectArray,       // key in body that must be an array
    expectCount,       // { key, label } – logs how many records returned
    expectFields = [], // fields to print from first item
    supplierIdField,   // if set, verifies every item's this field equals ownSupplierId
    ownSupplierId,
  } = options;

  const statusOk = status === expectStatus;
  const successOk = !expectSuccess || body?.success === true;
  const pass = statusOk && successOk;

  if (pass) {
    totalPass++;
    console.log(`  ${PASS}  ${label}  (HTTP ${status})`);
  } else {
    totalFail++;
    console.log(`  ${FAIL}  ${label}  (HTTP ${status}, success=${body?.success})`);
    if (body?.message) console.log(`         message: ${body.message}`);
  }

  // Log count info
  if (expectCount) {
    const arr = body?.[expectCount.key];
    const count = Array.isArray(arr) ? arr.length : (body?.totalElements ?? '?');
    console.log(`         ${expectCount.label}: ${count}`);
  }

  // Log sample fields
  if (expectFields.length > 0 && body) {
    const item = Array.isArray(body?.content) ? body.content[0]
                : Array.isArray(body?.data)    ? body.data[0]
                : body?.data;
    if (item) {
      const parts = expectFields.map((f) => `${f}=${JSON.stringify(item[f])}`).join(', ');
      console.log(`         sample: ${parts}`);
    }
  }

  // Isolation check — ensure every returned record belongs to THIS supplier
  if (supplierIdField && ownSupplierId && pass) {
    const arr = body?.content || body?.data || [];
    const items = Array.isArray(arr) ? arr : [];

    if (items.length === 0) {
      console.log(`         ${WARN} No records returned — isolation N/A`);
    } else {
      const alien = items.filter((item) => {
        const sid = item[supplierIdField];
        if (!sid) return false; // field missing, skip
        const sidStr = typeof sid === 'object' ? String(sid._id || sid) : String(sid);
        return sidStr !== String(ownSupplierId);
      });

      if (alien.length === 0) {
        console.log(`         ${PASS} Isolation OK — all ${items.length} records belong to this supplier`);
      } else {
        totalFail++;
        console.log(`         ${FAIL} Isolation FAIL — ${alien.length}/${items.length} records from OTHER suppliers`);
        alien.slice(0, 2).forEach((a) => {
          console.log(`              alien supplierId: ${JSON.stringify(a[supplierIdField])}`);
        });
      }
    }
  }

  return { status, body, pass };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🍃  Supplier Dashboard — Endpoint Test Suite');
  console.log(`    Target: ${BASE_URL}`);
  console.log(`    Email:  ${EMAIL}`);

  // ── Step 1: Login ──────────────────────────────────────────────────────────
  printSection('STEP 1 — Authenticate');

  const loginRes = await request('POST', '/auth/login', {
    body: { email: EMAIL, password: PASSWORD },
  });

  const { pass: loginOk } = check('POST /auth/login', loginRes, {
    expectStatus: 200,
    expectSuccess: true,
  });

  if (!loginOk) {
    console.log('\n❌  Cannot continue — login failed. Check credentials.\n');
    process.exit(1);
  }

  const token = loginRes.body?.token || loginRes.body?.data?.token;
  if (!token) {
    console.log('\n❌  Login succeeded but no token in response:\n', JSON.stringify(loginRes.body, null, 2));
    process.exit(1);
  }
  console.log(`         token: ${token.slice(0, 40)}...`);

  // ── Step 2: Resolve supplier profile ──────────────────────────────────────
  printSection('STEP 2 — Resolve Supplier Profile');

  const meRes = await request('GET', '/suppliers/me', { token });
  const { pass: meOk } = check('GET /suppliers/me', meRes, {
    expectStatus: 200,
    expectSuccess: true,
    expectFields: ['_id', 'name', 'supplierCode', 'status'],
  });

  if (!meOk) {
    console.log('\n❌  Cannot continue — supplier profile not found.\n');
    process.exit(1);
  }

  const supplier = meRes.body?.data;
  const supplierId = supplier?._id;
  console.log(`         supplierId : ${supplierId}`);
  console.log(`         name       : ${supplier?.name}`);
  console.log(`         status     : ${supplier?.status}`);

  // ── Step 3: Dashboard Tab ─────────────────────────────────────────────────
  printSection('STEP 3 — Dashboard Tab');

  // Statistics
  const statsRes = await request('GET', `/suppliers/${supplierId}/statistics`, { token });
  check('GET /suppliers/:id/statistics', statsRes, {
    expectStatus: 200,
    expectSuccess: true,
  });
  if (statsRes.body?.success) {
    const d = statsRes.body.data;
    console.log(`         teaLeaf.totalNetWeight : ${d?.teaLeaf?.totalNetWeight ?? 0} kg`);
    console.log(`         payments.totalPaid     : Rs. ${d?.payments?.totalPaid ?? 0}`);
    console.log(`         advances.totalAdvances : Rs. ${d?.advances?.totalAdvances ?? 0}`);
  }

  // Recent deliveries (limit=5)
  const deliveriesRes = await request(
    'GET',
    `/tea-leaf-entries/supplier/${supplierId}?limit=5`,
    { token }
  );
  check('GET /tea-leaf-entries/supplier/:id?limit=5', deliveriesRes, {
    expectStatus: 200,
    expectSuccess: true,
    expectCount: { key: 'content', label: 'recent deliveries' },
    supplierIdField: 'supplierId',
    ownSupplierId: supplierId,
  });

  // ── Step 4: Tea Production Tab ────────────────────────────────────────────
  printSection('STEP 4 — Tea Production Tab');

  const productionRes = await request(
    'GET',
    `/tea-leaf-entries/supplier/${supplierId}`,
    { token }
  );
  check('GET /tea-leaf-entries/supplier/:id (all)', productionRes, {
    expectStatus: 200,
    expectSuccess: true,
    expectCount: { key: 'content', label: 'tea leaf entries' },
    expectFields: ['date', 'weight', 'netWeight', 'netAmount'],
    supplierIdField: 'supplierId',
    ownSupplierId: supplierId,
  });

  // ── Step 5: Payment Processing Tab ───────────────────────────────────────
  printSection('STEP 5 — Payment Processing Tab');

  const paymentsRes = await request(
    'GET',
    `/payments/supplier/${supplierId}`,
    { token }
  );
  check('GET /payments/supplier/:id', paymentsRes, {
    expectStatus: 200,
    expectSuccess: true,
    expectCount: { key: 'content', label: 'payment records' },
    expectFields: ['finalAmount', 'paymentStatus', 'paymentMethod'],
    supplierIdField: 'supplierId',
    ownSupplierId: supplierId,
  });

  // ── Step 6: Inventory & Advances Tab ─────────────────────────────────────
  printSection('STEP 6 — Inventory & Advances Tab');

  const advancesRes = await request(
    'GET',
    `/advances/supplier/${supplierId}`,
    { token }
  );
  check('GET /advances/supplier/:id', advancesRes, {
    expectStatus: 200,
    expectSuccess: true,
    expectCount: { key: 'content', label: 'advance records' },
    expectFields: ['advanceType', 'status', 'amount'],
    supplierIdField: 'supplierId',
    ownSupplierId: supplierId,
  });

  // ── Step 7: Leaf Supply Inbox Tab ─────────────────────────────────────────
  printSection('STEP 7 — Leaf Supply Inbox Tab');

  const inboxRes = await request('GET', '/leaf-supply-requests/inbox', { token });
  check('GET /leaf-supply-requests/inbox', inboxRes, {
    expectStatus: 200,
    expectSuccess: true,
    expectCount: { key: 'content', label: 'inbox requests' },
    expectFields: ['status', 'requestedKg', 'requestedForAt'],
    // Inbox is auth-scoped: no supplierId field on items, isolation is guaranteed by backend
  });

  if (inboxRes.body?.success) {
    const items = inboxRes.body?.content || [];
    if (items.length > 0) {
      const alienItems = items.filter(
        (r) => String(r.supplierId?._id || r.supplierId) !== String(supplierId)
      );
      if (alienItems.length === 0) {
        console.log(`         ${PASS} Isolation OK — all ${items.length} inbox items belong to this supplier`);
      } else {
        console.log(`         ${FAIL} Isolation FAIL — ${alienItems.length} inbox items belong to other suppliers`);
      }
    } else {
      console.log(`         ${WARN} Inbox is empty — isolation N/A`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  printSection('SUMMARY');
  console.log(`  ✅  Passed : ${totalPass}`);
  console.log(`  ❌  Failed : ${totalFail}`);
  console.log(
    `\n  ${totalFail === 0 ? '🎉  All endpoints passed!' : '⚠️   Some endpoints failed — see output above.'}\n`
  );
  process.exit(totalFail === 0 ? 0 : 1);
}

run().catch((err) => {
  console.error('\n❌  Unexpected error:', err.message || err);
  process.exit(1);
});
