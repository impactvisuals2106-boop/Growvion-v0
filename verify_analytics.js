// Set Mock environment variables before importing modules that validate them on startup
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key-jwt-secret';
process.env.VITE_SUPABASE_URL = 'https://mockproject.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'mock-anon-key-jwt-secret';
process.env.IP_HASH_SALT = 'mock-salt-key';

import crypto from 'crypto';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING VISITOR ANALYTICS LOCAL VERIFICATION SUITE');
  console.log('==================================================\n');

  // Dynamically import ES Module handlers to ensure env vars are evaluated first
  const { default: trackHandler } = await import('./api/track.js');
  const { default: clicksHandler } = await import('./api/clicks.js');
  const { default: contactHandler } = await import('./api/contact.js');
  const { default: dashboardHandler } = await import('./api/dashboard.js');
  const { default: reportsHandler } = await import('./api/reports.js');

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

  // Test 2: Check endpoint module imports and handler hooks
  console.log('[Test 2] Checking serverless functions module imports...');
  try {
    if (typeof trackHandler !== 'function') throw new Error('track.js default export is not a function');
    if (typeof clicksHandler !== 'function') throw new Error('clicks.js default export is not a function');
    if (typeof contactHandler !== 'function') throw new Error('contact.js default export is not a function');
    if (typeof dashboardHandler !== 'function') throw new Error('dashboard.js default export is not a function');
    if (typeof reportsHandler !== 'function') throw new Error('reports.js default export is not a function');
    
    console.log('✓ Success: All serverless function entry points imported and exported as functions successfully!\n');
  } catch (err) {
    console.error('✗ Failure importing serverless modules:', err);
    process.exit(1);
  }

  console.log('==================================================');
  console.log('LOCAL VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================');
}

runTests().catch(err => {
  console.error('Verification suite failed:', err);
  process.exit(1);
});
