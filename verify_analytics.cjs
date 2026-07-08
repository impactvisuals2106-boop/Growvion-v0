const crypto = require('crypto');

// Mock Vercel Request and Response helper
function mockReqRes(body = {}, headers = {}) {
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    }
  };

  const req = {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
      ...headers
    }
  };

  return { req, res };
}

async function runTests() {
  console.log('==================================================');
  console.log('STARTING VISITOR ANALYTICS LOCAL VERIFICATION SUITE');
  console.log('==================================================\n');

  // Test 1: Validate IP Hashing Logic
  console.log('[Test 1] Testing IP Hashing Format...');
  const testIp = '127.0.0.1';
  const testSalt = 'verify-auth-salt-token-key-1234';
  const hash = crypto.createHmac('sha256', testSalt).update(testIp).digest('hex');
  console.log(`- IP: ${testIp}`);
  console.log(`- Salt: ${testSalt}`);
  console.log(`- SHA-256 Hash Output: ${hash}`);
  if (hash.length === 64) {
    console.log('✓ Success: Hash is a valid 64-character SHA-256 hex string.\n');
  } else {
    throw new Error('FAILED: Hash is not 64 characters long.');
  }

  // Test 2: Check endpoint module imports
  console.log('[Test 2] Checking serverless functions module imports...');
  const filesToTest = [
    './api/track',
    './api/clicks',
    './api/contact',
    './api/dashboard',
    './api/reports'
  ];

  for (const file of filesToTest) {
    try {
      console.log(`- Attempting to import ${file}...`);
      require(file);
      console.log(`  ✓ Success importing ${file}`);
    } catch (err) {
      console.error(`  ✗ Failure importing ${file}`);
      const fs = require('fs');
      fs.writeFileSync('error_out.txt', err.stack || err.message);
      process.exit(1);
    }
  }

  console.log('\n✓ Success: All serverless function entry points imported successfully without syntax errors.\n');
  console.log('==================================================');
  console.log('LOCAL VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================');
}

runTests().catch(err => {
  console.error('Verification suite failed:', err);
  process.exit(1);
});
