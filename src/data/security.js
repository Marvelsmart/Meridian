/** Login activity + active device sessions for the security centre. */
export const LOGIN_ACTIVITY = [
  {
    id: 'log_01',
    device: 'Chrome · Windows 11',
    browser: 'Chrome 133',
    location: 'San Francisco, CA',
    ip: '204.198.31.118',
    signedInAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    status: 'current',
  },
  {
    id: 'log_02',
    device: 'Northstar iOS · iPhone 15 Pro',
    browser: 'Mobile app 4.2.1',
    location: 'New York, NY',
    ip: '198.51.100.20',
    signedInAt: new Date(Date.now() - 29 * 3600 * 1000).toISOString(),
    status: 'successful',
  },
  {
    id: 'log_03',
    device: 'Chrome · macOS Sonoma',
    browser: 'Chrome 132',
    location: 'Austin, TX',
    ip: '198.51.100.90',
    signedInAt: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
    status: 'successful',
  },
  {
    id: 'log_04',
    device: 'Unknown device',
    browser: 'Firefox 128',
    location: 'Denver, CO',
    ip: '203.0.113.7',
    signedInAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    status: 'failed',
    note: 'Incorrect password · attempt blocked',
  },
  {
    id: 'log_05',
    device: 'Northstar Android · Pixel 8',
    browser: 'Mobile app 4.1.9',
    location: 'Seattle, WA',
    ip: '198.51.100.14',
    signedInAt: new Date(Date.now() - 190 * 3600 * 1000).toISOString(),
    status: 'successful',
  },
]

export const ACTIVE_SESSIONS = [
  {
    id: 'ses_01',
    device: 'Chrome on Windows 11',
    platform: 'Web browser',
    location: 'San Francisco, CA',
    lastActiveAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    current: true,
    trusted: true,
  },
  {
    id: 'ses_02',
    device: 'iPhone 15 Pro',
    platform: 'iOS 18 · Northstar app',
    location: 'New York, NY',
    lastActiveAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    current: false,
    trusted: true,
  },
  {
    id: 'ses_03',
    device: 'MacBook Air',
    platform: 'Chrome on macOS',
    location: 'Austin, TX',
    lastActiveAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    current: false,
    trusted: false,
  },
]

export const SECURITY_TIPS = [
  {
    id: 'tip_01',
    title: 'Never share your transaction PIN',
    body: 'Northstar staff will never ask for your PIN, OTP or password — on any channel.',
  },
  {
    id: 'tip_02',
    title: 'Verify before you authorise',
    body: 'Check the recipient name, account number and amount on the confirmation screen.',
  },
  {
    id: 'tip_03',
    title: 'Review your sessions monthly',
    body: 'Log out of devices you no longer use and keep 2FA switched on.',
  },
]

export const TWO_FACTOR_METHODS = [
  {
    id: 'authenticator',
    label: 'Authenticator app',
    description: 'Codes from Google Authenticator, Authy or 1Password.',
    recommended: true,
  },
  {
    id: 'sms',
    label: 'SMS one-time codes',
    description: 'Sent to +1 (415) ••• •••• 147.',
    recommended: false,
  },
  {
    id: 'email',
    label: 'Email one-time codes',
    description: 'Sent to alex.morgan@northstarbank-demo.com.',
    recommended: false,
  },
]
