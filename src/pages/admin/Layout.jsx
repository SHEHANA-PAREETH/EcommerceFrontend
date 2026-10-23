import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Logo } from '../../components/Header'
import Icon from '../../components/Icon'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useTheme } from '../../hooks'

const NAV = [
  ['/admin', 'Dashboard', 'dashboard', true],
  ['/admin/products', 'Products', 'package'],
  ['/admin/categories', 'Categories', 'tag'],
  ['/admin/orders', 'Orders', 'cart'],
  ['/admin/users', 'Customers', 'users'],
]

export default function AdminLayout() {
  const user = useSelector((state) => state.auth.user)
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [theme, toggleTheme] = useTheme()
  useEffect(() => setOpen(false), [pathname])

  return (
    <div className="admin">
      <a className="skip" href="#admin-main">Skip to content</a>
      <aside className={`admin-side ${open ? 'open' : ''}`} aria-label="Admin navigation">
        <div className="admin-brand"><Logo to="/admin" /><span className="pill">Admin</span></div>
        <nav>
          {NAV.map(([to, label, icon, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}><Icon name={icon} size={19} /> {label}</NavLink>)}
        </nav>
        <div className="admin-side-foot">
          <Link to="/" className="admin-link"><Icon name="store" size={19} /> View store</Link>
        </div>
      </aside>
      {open && <button type="button" className="admin-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="admin-body">
        <header className="admin-top">
          <button type="button" className="icon-btn admin-burger" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" size={24} /></button>
          <span className="admin-top-title">Store admin</span>
          <div className="admin-top-right">
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme"><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={21} /></button>
            <span className="avatar" title={user?.email}>{user?.username?.slice(0, 1).toUpperCase()}</span>
          </div>
        </header>
        <main id="admin-main" className="admin-main"><ErrorBoundary key={pathname}><Outlet /></ErrorBoundary></main>
      </div>
    </div>
  )
}
