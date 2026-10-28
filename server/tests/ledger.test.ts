import assert from 'assert';
import { storage, hashPassword, verifyPassword } from '../storage.ts';

async function runTests() {
  console.log('--- STARTING EARNPRO AUTOMATED FINANCIAL & INTEGRITY TESTS ---');

  // Test 1: Password Cryptography
  console.log('Test 1: Password Hashing & Verification...');
  const pass = 'SecretP@ss2026';
  const hashed = hashPassword(pass);
  assert(hashed.hash !== pass, 'Password must not be stored in plain text');
  assert(verifyPassword(pass, hashed.hash), 'Password verification must pass for correct password');
  assert(!verifyPassword('WrongPass', hashed.hash), 'Password verification must fail for incorrect password');
  console.log('✓ Password hashing and verification passed');

  // Test 2: Double-spend prevention & fund reservation
  console.log('Test 2: Double-Spend & Fund Reservation...');
  const demoUser = storage.findUserByEmail('rahul.sharma@example.com');
  assert(demoUser, 'Demo user must exist');
  const initialWallet = storage.getWallet(demoUser.id);
  const initialAvail = initialWallet.availableBalance;
  const initialPending = initialWallet.pendingBalance;

  // Attempt overdraft (more than available)
  try {
    storage.requestWithdrawal(demoUser.id, initialAvail + 1000, 'upi', { upiId: 'rahul@upi' });
    assert.fail('Should have thrown insufficient balance error');
  } catch (err: any) {
    assert(err.message.includes('Insufficient available balance'), 'Expected insufficient balance error');
  }

  // Request valid withdrawal (e.g., ₹50)
  const reqAmount = 50;
  if (initialAvail >= reqAmount) {
    const wdReq = storage.requestWithdrawal(demoUser.id, reqAmount, 'upi', { upiId: 'rahul@upi' });
    const afterWallet = storage.getWallet(demoUser.id);
    assert.strictEqual(afterWallet.availableBalance, Number((initialAvail - reqAmount).toFixed(2)), 'Available balance must be decremented');
    assert.strictEqual(afterWallet.pendingBalance, Number((initialPending + reqAmount).toFixed(2)), 'Pending balance must be incremented (reserved)');

    // Test 3: Safe refund on rejection
    console.log('Test 3: Safe Refund on Rejection...');
    const admin = storage.findUserByEmail('admin@earnpro.in')!;
    storage.processWithdrawal(wdReq.id, 'reject', admin.id, undefined, 'Invalid UPI ID test');
    const refundedWallet = storage.getWallet(demoUser.id);
    assert.strictEqual(refundedWallet.availableBalance, initialAvail, 'Available balance must be safely restored');
    assert.strictEqual(refundedWallet.pendingBalance, initialPending, 'Pending balance must be cleared');
    console.log('✓ Safe refund upon rejection passed');
  }

  // Test 4: Anti-fraud quiz grading server-side
  console.log('Test 4: Server-Side Quiz Auto-Grading & Reward Verification...');
  const quizTask = storage.getTaskById('task_quiz_fin_01');
  assert(quizTask, 'Quiz task must exist');

  // Create an isolated test earner for repeatable testing
  const testEarner = storage.createUser({
    email: `test_earner_${Date.now()}@example.com`,
    passwordHash: 'hash123',
    fullName: 'Test Earner',
    role: 'user',
    status: 'active',
    emailVerified: true,
    referralCode: `T${Date.now().toString().slice(-5)}`,
  });

  // Passing submission
  const passAnswers = [1, 0, 2, 0]; // Correct answers based on quiz
  const passResult = storage.submitTask(testEarner.id, quizTask.id, { quizAnswers: passAnswers });
  assert.strictEqual(passResult.autoApproved, true, 'Quiz with 100% score must be auto-approved');
  assert.strictEqual(passResult.rewardCredited, quizTask.rewardAmount, 'Reward must match task reward amount');
  console.log('✓ Server-side auto-quiz grading passed');

  // Test 5: Daily Limit Enforcement
  console.log('Test 5: Anti-Fraud Daily Limit Enforcement...');
  try {
    storage.submitTask(testEarner.id, quizTask.id, { quizAnswers: passAnswers });
    assert.fail('Should have blocked submission due to daily limit');
  } catch (err: any) {
    assert(err.message.includes('Daily limit'), 'Expected daily limit error');
  }
  console.log('✓ Daily limit anti-fraud check passed');

  console.log('--- ALL AUTOMATED FINANCIAL & INTEGRITY TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
