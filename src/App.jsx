import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppDataProvider } from '@/context/AppDataContext'
import { ToastProvider } from '@/context/ToastContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/layout/ProtectedRoute'
import { PublicLayout } from '@/components/layout/PublicLayout'

import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import ForgotPassword from '@/pages/public/ForgotPassword'
import ResetPassword from '@/pages/public/ResetPassword'
import NotFound from '@/pages/NotFound'

import Dashboard from '@/pages/app/Dashboard'
import Transactions from '@/pages/app/Transactions'
import TransactionDetails from '@/pages/app/TransactionDetails'
import Transfer from '@/pages/app/Transfer'
import Beneficiaries from '@/pages/app/Beneficiaries'
import Cards from '@/pages/app/Cards'
import BillPayments from '@/pages/app/BillPayments'
import Notifications from '@/pages/app/Notifications'
import Profile from '@/pages/app/Profile'
import Security from '@/pages/app/Security'
import Statements from '@/pages/app/Statements'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Public marketing */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
            </Route>

            {/* Auth — each page renders its own AuthLayout copy so titles stay local */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPassword />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicOnlyRoute>
                  <ResetPassword />
                </PublicOnlyRoute>
              }
            />

            {/* Authenticated product */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppDataProvider>
                    <AppLayout />
                  </AppDataProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="transactions/:transactionId" element={<TransactionDetails />} />
              <Route path="transfer" element={<Transfer />} />
              <Route path="beneficiaries" element={<Beneficiaries />} />
              <Route path="cards" element={<Cards />} />
              <Route path="bills" element={<BillPayments />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
              <Route path="security" element={<Security />} />
              <Route path="statements" element={<Statements />} />
            </Route>

            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  )
}
