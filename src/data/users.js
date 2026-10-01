/**
 * Seed profile for the bank's review account, plus the accounts it holds.
 * `server/seed.js` uses this record to create the account reviewers sign in with.
 */
export const USER = {
  id: 'usr_01',
  firstName: 'Alex',
  lastName: 'Morgan',
  middleName: 'R.',
  email: 'alex.morgan@northstarbank-demo.com',
  phone: '+1 (415) 555-0147',
  dateOfBirth: '1991-04-18',
  gender: 'Male',
  ssn: '***-**-4371',
  /**
   * Customer-facing identity verification state. One of:
   * verified · pending · under_review · action_required
   * (`config/verification.js` holds the matching labels.)
   */
  verificationStatus: 'verified',
  address: {
    street: '1450 Market Street',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    postalCode: '94103',
  },
  employment: {
    occupation: 'Product Designer',
    employer: 'Northwind Labs',
    monthlyIncome: 145000,
  },
  tier: 'Premier',
  customerSince: '2019-08-02',
  referralCode: 'NORTWEST-ALX-2026',
  profilePhoto: null,
  security: {
    twoFactorEnabled: true,
    twoFactorChannel: 'Authenticator app',
    biometricEnabled: true,
    transactionPin: true,
    emailAlerts: true,
    loginAlerts: true,
    cardAlerts: false,
    marketing: false,
  },
}

export function fullName(user = USER) {
  return `${user.firstName} ${user.lastName}`
}

export const ACCOUNTS = [
  {
    id: 'acc_main',
    name: 'Freedom Checking',
    type: 'checking',
    number: '0123456789',
    currency: 'USD',
    balance: 28450.75,
    ledgerBalance: 29120.75,
    available: 27850.75,
    primary: true,
    bank: 'Nortwest Bank',
    openedOn: '2019-08-02',
    interestRate: 0.01,
    limits: { dailyTransfer: 20000 },
  },
  {
    id: 'acc_current',
    name: 'Premier Savings',
    type: 'savings',
    number: '0455120983',
    currency: 'USD',
    balance: 64218.4,
    ledgerBalance: 65518.4,
    available: 62968.4,
    primary: false,
    bank: 'Nortwest Bank',
    openedOn: '2021-02-11',
    interestRate: 0.04,
    limits: { dailyTransfer: 50000 },
  },
  {
    id: 'acc_usd',
    name: 'Travel Rewards',
    type: 'credit',
    number: '0987612345',
    currency: 'USD',
    balance: 4820.35,
    ledgerBalance: 4820.35,
    available: 4820.35,
    primary: false,
    bank: 'Nortwest Bank',
    openedOn: '2022-06-30',
    interestRate: 0.0,
    limits: { dailyTransfer: 10000 },
  },
]
