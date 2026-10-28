# EarnPro - Modern Micro-Earning Platform 🇮🇳

EarnPro is a modern, mobile-first micro-earning platform built with React, TypeScript, Tailwind CSS, Express, and an ACID-compliant transactional financial ledger.

---

## 🌟 Key Features

1. **Mobile-First Responsive Design**:
   - Ergonomic mobile bottom navigation for Android and smartphones.
   - Blue, indigo/purple, and crisp slate/white palette.
   - Instant Dark & Light mode toggle.
   - Bilingual support: English and Hindi (हिन्दी) throughout the app.
   - Indian Rupee (₹) currency formatting.

2. **Server-Side Financial Ledger & Wallet**:
   - Available balance, pending balance, lifetime earned, and total withdrawn.
   - Double-spend prevention: Funds are immediately reserved into pending status upon withdrawal request.
   - Negative balances are strictly disallowed.
   - Safe refund mechanism: If an administrator rejects an invalid UPI request, reserved funds are atomically credited back with an immutable audit transaction.

3. **Earning Task Marketplace**:
   - **Daily Streak Check-in**: Progressive 7-day cash bonuses up to ₹15 with celebration animations.
   - **Educational Quizzes**: Financial literacy and cybersecurity awareness challenges auto-graded on the server (requiring ≥75% score).
   - **Verified Surveys**: Consumer fintech research with multi-question validations.
   - **App Testing & Sponsored Tasks**: Manual proof review workflow with device specifications and feedback.

4. **Referral Program**:
   - Unique alphanumeric referral codes and instant WhatsApp / Telegram share links.
   - Anti-Abuse Qualification: Referrer is only rewarded once the invited user completes their first verified task, preventing fake bot accounts.

5. **Withdrawal System**:
   - Instant UPI ID (VPA) or Direct Indian Bank Transfer (IMPS/NEFT).
   - Minimum ₹50, Maximum ₹10,000 per request.
   - Zero processing fees.
   - Status tracking: Pending → Under Review → Approved → Paid (with UTR reference) / Rejected (with safe refund).
   - Security guarantee: App never asks for UPI PIN, ATM PIN, or banking passwords.

6. **Admin Control Center**:
   - Role-based authorization enforced by server middleware.
   - Dashboard statistics: Total users, active earners, total rewards issued, pending payouts.
   - Review task submissions: Approve (atomically credits reward) or Reject with notes.
   - Review withdrawals: Approve, mark as Paid with UTR reference, or Reject with refund.
   - User account status management (Active, Suspended, Blocked).
   - Task management: Add, edit, activate/pause earning tasks.
   - Global in-app announcements broadcasting.
   - Audit trail of all administrative operations.
   - One-click CSV exports for users, transactions, withdrawals, and submissions.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js & Express REST API (`server.ts`).
- **Database**: ACID-compliant JSON ledger persistence engine (`server/storage.ts`) with atomic write updates.
- **Security**: Cryptographic password hashing (`scryptSync` + unique salt) and stateless HMAC-SHA256 session tokens.

---

## 🔑 Default Accounts (Demo Mode)

| Account | Email | Password | Role | Features |
|---|---|---|---|---|
| **Demo User (Rahul)** | `rahul.sharma@example.com` | `EarnPro@123` | User | Balance ₹125, Day 3 streak, UPI history |
| **Administrator** | `admin@earnpro.in` | `Admin@123` | Admin | Full control panel, UTR recording, CSV exports |

*Tip: You can switch between User and Admin instantly using the 1-Click Demo switcher in the profile dropdown or login modal.*

---

## 🚀 Running the Application & Tests

```bash
# Install dependencies
npm install

# Start the full-stack development server (Express on port 3000 + Vite middleware)
npm run dev

# Run automated financial ledger & anti-fraud tests
npm run test

# Build for production
npm run build
```
