export type Language = 'en' | 'hi';

export interface Translations {
  appName: string;
  tagline: string;
  dashboard: string;
  tasks: string;
  wallet: string;
  referrals: string;
  withdrawals: string;
  admin: string;
  profile: string;
  notifications: string;
  logout: string;
  login: string;
  register: string;
  welcomeBack: string;
  availableBalance: string;
  pendingBalance: string;
  totalEarned: string;
  totalWithdrawn: string;
  dailyStreak: string;
  claimDailyCheckin: string;
  claimedToday: string;
  dayStreak: string;
  quickActions: string;
  recentTransactions: string;
  noTransactions: string;
  allTasks: string;
  quizzes: string;
  surveys: string;
  appTesting: string;
  sponsored: string;
  promos: string;
  startTask: string;
  completed: string;
  underReview: string;
  reward: string;
  mins: string;
  dailyTaskLimit: string;
  dailyLimitReached: string;
  tasksCompletedToday: string;
  resetsTomorrow: string;
  dailyProgressTitle: string;
  remainingQuota: string;
  withdrawNow: string;
  requestWithdrawal: string;
  selectPaymentMethod: string;
  upiId: string;
  bankTransfer: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  withdrawalAmount: string;
  minWithdrawalNote: string;
  noFee: string;
  submitRequest: string;
  withdrawalHistory: string;
  referralTitle: string;
  referralSubtitle: string;
  yourReferralCode: string;
  copyCode: string;
  codeCopied: string;
  shareViaWhatsapp: string;
  invitedFriends: string;
  earnedFromReferrals: string;
  howItWorks: string;
  step1: string;
  step2: string;
  step3: string;
  adminPanel: string;
  totalUsers: string;
  activeUsers: string;
  pendingTasks: string;
  pendingWithdrawalsCount: string;
  approve: string;
  reject: string;
  markPaid: string;
  enterUtr: string;
  adminNotes: string;
  termsAndConditions: string;
  privacyPolicy: string;
  earningRules: string;
  withdrawalPolicy: string;
  transparencyNotice: string;
  deleteAccount: string;
  contactSupport: string;
  lightMode: string;
  darkMode: string;
  saveToGoogleDrive: string;
  saveStatementToDrive: string;
  saveReportToDrive: string;
  googleDriveConnected: string;
  connectGoogleDrive: string;
  confirmDriveUpload: string;
  driveUploadSuccess: string;
  openInGoogleDrive: string;
  disconnectDrive: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'EarnPro',
    tagline: 'Smart & Secure Micro-Earning Platform',
    dashboard: 'Dashboard',
    tasks: 'Tasks & Quizzes',
    wallet: 'Wallet & Ledger',
    referrals: 'Refer & Earn',
    withdrawals: 'Withdraw Cash',
    admin: 'Admin Center',
    profile: 'Profile',
    notifications: 'Notifications',
    logout: 'Log Out',
    login: 'Log In',
    register: 'Create Account',
    welcomeBack: 'Welcome back',
    availableBalance: 'Available Balance',
    pendingBalance: 'Pending Balance',
    totalEarned: 'Lifetime Earnings',
    totalWithdrawn: 'Total Withdrawn',
    dailyStreak: 'Daily Streak',
    claimDailyCheckin: 'Claim Daily Check-in',
    claimedToday: 'Checked in Today',
    dayStreak: 'Day Streak',
    quickActions: 'Quick Actions',
    recentTransactions: 'Recent Transactions',
    noTransactions: 'No transactions yet. Complete your first task to start earning!',
    allTasks: 'All Tasks',
    quizzes: 'Quizzes',
    surveys: 'Surveys',
    appTesting: 'App Testing',
    sponsored: 'Sponsored',
    promos: 'Promotions',
    startTask: 'Start Task',
    completed: 'Completed',
    underReview: 'Under Review',
    reward: 'Reward',
    mins: 'mins',
    dailyTaskLimit: 'Daily Limit',
    dailyLimitReached: 'Daily Limit Reached',
    tasksCompletedToday: 'completed today',
    resetsTomorrow: 'Resets at midnight',
    dailyProgressTitle: 'Daily Task Quota & Activity',
    remainingQuota: 'remaining today',
    withdrawNow: 'Withdraw Funds',
    requestWithdrawal: 'Request Payout',
    selectPaymentMethod: 'Select Payment Method',
    upiId: 'UPI ID (e.g. name@okhdfcbank)',
    bankTransfer: 'Direct Bank Transfer (IMPS/NEFT)',
    accountHolder: 'Account Holder Name',
    accountNumber: 'Bank Account Number',
    ifscCode: 'IFSC Code',
    bankName: 'Bank Name',
    withdrawalAmount: 'Withdrawal Amount (₹)',
    minWithdrawalNote: 'Minimum withdrawal: ₹50. Maximum per request: ₹10,000.',
    noFee: 'Zero processing fee for all users.',
    submitRequest: 'Submit Withdrawal Request',
    withdrawalHistory: 'Withdrawal History',
    referralTitle: 'Invite Friends, Earn ₹25 Each',
    referralSubtitle: 'Share your referral link. When your friend completes their first verified task, you both get rewarded!',
    yourReferralCode: 'Your Referral Code',
    copyCode: 'Copy Code',
    codeCopied: 'Referral code copied to clipboard!',
    shareViaWhatsapp: 'Share via WhatsApp',
    invitedFriends: 'Invited Friends',
    earnedFromReferrals: 'Referral Rewards Earned',
    howItWorks: 'How Referral Works',
    step1: '1. Share your unique invite code with friends or family.',
    step2: '2. They register and complete at least 1 verified quiz or survey.',
    step3: '3. ₹25 bonus is credited directly to your available wallet balance!',
    adminPanel: 'Admin Control Center',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    pendingTasks: 'Pending Submissions',
    pendingWithdrawalsCount: 'Pending Withdrawals',
    approve: 'Approve',
    reject: 'Reject',
    markPaid: 'Mark as Paid (Disburse)',
    enterUtr: 'Enter UTR / Bank Reference No.',
    adminNotes: 'Admin Notes (Optional)',
    termsAndConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    earningRules: 'Earning Rules',
    withdrawalPolicy: 'Withdrawal Policy',
    transparencyNotice: 'Transparency & Funding Disclosure',
    deleteAccount: 'Request Account Deletion',
    contactSupport: 'Contact Support',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    saveToGoogleDrive: 'Save to Google Drive',
    saveStatementToDrive: 'Save Statement to Drive',
    saveReportToDrive: 'Save Report to Drive',
    googleDriveConnected: 'Google Drive Connected',
    connectGoogleDrive: 'Connect Google Drive',
    confirmDriveUpload: 'Save to your Google Drive?',
    driveUploadSuccess: 'File successfully saved to your Google Drive!',
    openInGoogleDrive: 'Open in Google Drive',
    disconnectDrive: 'Disconnect Drive',
  },
  hi: {
    appName: 'EarnPro',
    tagline: 'स्मार्ट और सुरक्षित कमाई का प्लेटफॉर्म',
    dashboard: 'डैशबोर्ड',
    tasks: 'टास्क और क्विज',
    wallet: 'वॉलेट लेजर',
    referrals: 'रेफर और कमाएं',
    withdrawals: 'पैसे निकालें (UPI)',
    admin: 'एडमिन पैनल',
    profile: 'प्रोफाइल',
    notifications: 'सूचनाएं',
    logout: 'लॉग आउट',
    login: 'लॉग इन',
    register: 'नया खाता बनाएं',
    welcomeBack: 'वापसी पर स्वागत है',
    availableBalance: 'उपलब्ध बैलेंस',
    pendingBalance: 'पेंडिंग बैलेंस',
    totalEarned: 'कुल कमाई',
    totalWithdrawn: 'कुल निकासी',
    dailyStreak: 'दैनिक स्ट्रीक',
    claimDailyCheckin: 'डेली चेक-इन क्लेम करें',
    claimedToday: 'आज का चेक-इन हो गया',
    dayStreak: 'दिन की स्ट्रीक',
    quickActions: 'त्वरित कार्य',
    recentTransactions: 'हाल के लेनदेन',
    noTransactions: 'अभी तक कोई लेनदेन नहीं। कमाई शुरू करने के लिए पहला टास्क पूरा करें!',
    allTasks: 'सभी टास्क',
    quizzes: 'क्विज (प्रश्नोत्तरी)',
    surveys: 'सर्वे',
    appTesting: 'ऐप टेस्टिंग',
    sponsored: 'प्रायोजित',
    promos: 'प्रचार',
    startTask: 'टास्क शुरू करें',
    completed: 'पूर्ण हुआ',
    underReview: 'समीक्षाधीन',
    reward: 'इनाम',
    mins: 'मिनट',
    dailyTaskLimit: 'दैनिक सीमा',
    dailyLimitReached: 'दैनिक सीमा पूरी हुई',
    tasksCompletedToday: 'आज पूर्ण हुए',
    resetsTomorrow: 'रात 12 बजे रीसेट होगा',
    dailyProgressTitle: 'दैनिक कार्य कोटा और प्रगति',
    remainingQuota: 'आज शेष कोटा',
    withdrawNow: 'पैसे निकालें',
    requestWithdrawal: 'निकासी अनुरोध भेजें',
    selectPaymentMethod: 'भुगतान का तरीका चुनें',
    upiId: 'यूपीआई आईडी (उदा. name@okaxis)',
    bankTransfer: 'सीधे बैंक ट्रांसफर',
    accountHolder: 'खाताधारक का नाम',
    accountNumber: 'बैंक खाता संख्या',
    ifscCode: 'आईएफएससी (IFSC) कोड',
    bankName: 'बैंक का नाम',
    withdrawalAmount: 'निकासी राशि (₹)',
    minWithdrawalNote: 'न्यूनतम निकासी: ₹50. अधिकतम प्रति अनुरोध: ₹10,000.',
    noFee: 'सभी उपयोगकर्ताओं के लिए 0% प्रोसेसिंग फीस।',
    submitRequest: 'निकासी अनुरोध सबमिट करें',
    withdrawalHistory: 'निकासी का इतिहास',
    referralTitle: 'मित्रों को जोड़ें, प्रत्येक पर ₹25 कमाएं',
    referralSubtitle: 'अपना रेफरल लिंक शेयर करें। जब आपका मित्र पहला टास्क पूरा करेगा, तब दोनों को बोनस मिलेगा!',
    yourReferralCode: 'आपका रेफरल कोड',
    copyCode: 'कोड कॉपी करें',
    codeCopied: 'रेफरल कोड कॉपी हो गया!',
    shareViaWhatsapp: 'व्हाट्सएप पर शेयर करें',
    invitedFriends: 'आमंत्रित मित्र',
    earnedFromReferrals: 'रेफरल से अर्जित कमाई',
    howItWorks: 'रेफरल कैसे काम करता है',
    step1: '1. अपने दोस्तों या परिवार के साथ अपना अनूठा इनवाइट कोड साझा करें।',
    step2: '2. वे रजिस्टर करें और कम से कम 1 सत्यापित क्विज या सर्वे पूरा करें।',
    step3: '3. ₹25 का बोनस सीधे आपके उपलब्ध वॉलेट बैलेंस में जुड़ जाएगा!',
    adminPanel: 'एडमिन कंट्रोल सेंटर',
    totalUsers: 'कुल उपयोगकर्ता',
    activeUsers: 'सक्रिय उपयोगकर्ता',
    pendingTasks: 'लंबित टास्क',
    pendingWithdrawalsCount: 'लंबित निकासी',
    approve: 'स्वीकृत करें',
    reject: 'अस्वीकृत करें',
    markPaid: 'भुगतान पूरा दर्ज करें (Paid)',
    enterUtr: 'UTR या बैंक संदर्भ संख्या दर्ज करें',
    adminNotes: 'एडमिन टिप्पणी (वैकल्पिक)',
    termsAndConditions: 'नियम और शर्तें',
    privacyPolicy: 'गोपनीयता नीति',
    earningRules: 'कमाई के नियम',
    withdrawalPolicy: 'निकासी नीति',
    transparencyNotice: 'पारदर्शिता और फंडिंग विवरण',
    deleteAccount: 'खाता हटाने का अनुरोध',
    contactSupport: 'सपोर्ट से संपर्क करें',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    saveToGoogleDrive: 'गूगल ड्राइव में सेव करें',
    saveStatementToDrive: 'ड्राइव में स्टेटमेंट डाउनलोड करें',
    saveReportToDrive: 'ड्राइव में रिपोर्ट डाउनलोड करें',
    googleDriveConnected: 'गूगल ड्राइव कनेक्टेड',
    connectGoogleDrive: 'गूगल ड्राइव कनेक्ट करें',
    confirmDriveUpload: 'क्या आप इसे अपने गूगल ड्राइव में सेव करना चाहते हैं?',
    driveUploadSuccess: 'फ़ाइल आपके गूगल ड्राइव में सफलतापूर्वक सेव हो गई!',
    openInGoogleDrive: 'गूगल ड्राइव में खोलें',
    disconnectDrive: 'ड्राइव डिस्कनेक्ट करें',
  },
};

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}
