import {
  ArrowLeftRight,
  Banknote,
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  Grid2x2,
  Home,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  Upload,
  UserRound,
  Users,
  Wifi,
  ReceiptText,
} from 'lucide-react'

/** Grouped sidebar navigation (desktop). */
export const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
      { label: 'Transactions', to: '/app/transactions', icon: ArrowLeftRight },
      { label: 'Statements', to: '/app/statements', icon: FileText },
    ],
  },
  {
    title: 'Move money',
    items: [
      { label: 'Transfer', to: '/app/transfer', icon: Send },
      { label: 'Beneficiaries', to: '/app/beneficiaries', icon: Users },
      { label: 'Bill payments', to: '/app/bills', icon: ReceiptText },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'Cards', to: '/app/cards', icon: CreditCard },
      { label: 'Notifications', to: '/app/notifications', icon: Bell },
      { label: 'Profile', to: '/app/profile', icon: UserRound },
      { label: 'Security', to: '/app/security', icon: ShieldCheck },
    ],
  },
]

/** Bottom tab bar (mobile) — five touch-friendly destinations. */
export const MOBILE_NAV = [
  { label: 'Home', to: '/app/dashboard', icon: Home },
  { label: 'Activity', to: '/app/transactions', icon: ArrowLeftRight },
  { label: 'Transfer', to: '/app/transfer', icon: Send, primary: true },
  { label: 'Cards', to: '/app/cards', icon: CreditCard },
  { label: 'More', icon: Grid2x2, action: 'more' },
]

/** Everything that does not fit in the mobile tab bar. */
export const MOBILE_MORE_LINKS = [
  { label: 'Beneficiaries', to: '/app/beneficiaries', icon: Users, description: 'Saved recipients' },
  { label: 'Bill payments', to: '/app/bills', icon: ReceiptText, description: 'Electricity, TV, internet' },
  { label: 'Utilities', to: '/app/bills', icon: Wifi, description: 'Electric, water, internet' },
  { label: 'Statements', to: '/app/statements', icon: FileText, description: 'Download & export' },
  { label: 'Notifications', to: '/app/notifications', icon: Bell, description: 'Alerts & updates' },
  { label: 'Profile', to: '/app/profile', icon: UserRound, description: 'Personal information' },
  { label: 'Security', to: '/app/security', icon: ShieldCheck, description: 'Password, 2FA, sessions' },
]

/** Dashboard quick actions — the 8 primary jobs to be done. */
export const QUICK_ACTIONS = [
  { label: 'Send Money', icon: Send, to: '/app/transfer', description: 'To any Northstar account' },
  { label: 'Transfer', icon: Landmark, to: '/app/transfer?mode=other-bank', description: 'To other banks' },
  { label: 'Add Money', icon: Upload, action: 'deposit', description: 'Fund your account' },
  { label: 'Withdraw', icon: Banknote, action: 'withdraw', description: 'Cash at any ATM' },
  { label: 'Pay Bills', icon: ReceiptText, to: '/app/bills', description: 'Utilities & TV' },
  { label: 'Cards', icon: CreditCard, to: '/app/cards', description: 'Manage & freeze' },
  { label: 'Cards', icon: CreditCard, to: '/app/cards', description: 'Freeze & limits' },
]

export const DASHBOARD_LINKS = [
  { label: 'Spending insights', to: '/app/statements', icon: BarChart3 },
  { label: 'Savings vault', to: '/app/beneficiaries', icon: PiggyBank },
  { label: 'Settings', to: '/app/profile', icon: Settings },
]
