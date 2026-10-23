import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CartDrawer from './CartDrawer'
import ErrorBoundary from './ErrorBoundary'
import Footer from './Footer'
import Header from './Header'
import { Spinner } from './common'

export function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        {/* the key resets a crashed page when you navigate away */}
        <ErrorBoundary key={pathname}><Outlet /></ErrorBoundary>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

const Splash = () => <div className="splash"><Spinner label="Loading your session" /></div>

// pages that need a signed-in user; after signing in the person comes back here
export function RequireAuth() {
  const { user, ready } = useSelector((state) => state.auth)
  const location = useLocation()
  if (!ready) return <Splash />
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  return <Outlet />
}

export function RequireAdmin() {
  const { user, ready } = useSelector((state) => state.auth)
  const location = useLocation()
  if (!ready) return <Splash />
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  if (!user.isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}

// login and register are not for people who are already in
export function GuestOnly() {
  const { user, ready } = useSelector((state) => state.auth)
  const [params] = useSearchParams()
  if (!ready) return <Splash />
  const next = params.get('next')
  // only local paths: a crafted ?next=https://evil.example must not become an open redirect
  if (user) return <Navigate to={next && next.startsWith('/') && !next.startsWith('//') ? next : '/'} replace />
  return <Outlet />
}
