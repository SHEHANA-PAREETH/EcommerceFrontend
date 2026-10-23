import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import client, { errorMessage } from '../api/client'
import { getCategories } from '../api/catalog'
import { imageUrl, money } from '../api/format'
import { clearUser, selectCartCount } from '../store'
import { useUi } from '../context/Ui'
import { useDebounce, useFetch, useTheme } from '../hooks'
import Icon from './Icon'

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="Shopora home">
      <span className="logo-mark"><Icon name="cart" size={18} strokeWidth={2.2} /></span>
      <span>Shopora</span>
    </Link>
  )
}

function SearchBox({ autoFocus = false, onDone }) {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const [active, setActive] = useState(-1)
  const debounced = useDebounce(text.trim(), 250)
  const box = useRef(null)

  useEffect(() => {
    let alive = true
    if (debounced.length < 2) { setResults([]); return undefined }
    client.get('/product/suggest', { params: { q: debounced } }).then((res) => { if (alive) { setResults(res.data); setActive(-1) } }).catch(() => alive && setResults([]))
    return () => { alive = false }
  }, [debounced])

  useEffect(() => {
    const onDown = (event) => { if (box.current && !box.current.contains(event.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const go = (path) => { setOpen(false); setText(''); onDone?.(); navigate(path) }
  const submit = (event) => {
    event.preventDefault()
    if (active >= 0 && results[active]) return go(`/product/${results[active]._id}`)
    if (text.trim()) go(`/shop?q=${encodeURIComponent(text.trim())}`)
  }
  const onKey = (event) => {
    if (event.key === 'Escape') setOpen(false)
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActive((i) => Math.min(results.length - 1, i + 1)) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => Math.max(-1, i - 1)) }
  }
  const showList = open && debounced.length >= 2

  return (
    <form className="search" role="search" onSubmit={submit} ref={box}>
      <Icon name="search" size={20} className="search-icon" />
      <input
        type="search" value={text} autoFocus={autoFocus} autoComplete="off" placeholder="Search for products, brands and more"
        aria-label="Search products" role="combobox" aria-expanded={showList} aria-controls="search-results" aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `sr-${active}` : undefined}
        onChange={(event) => { setText(event.target.value); setOpen(true) }} onFocus={() => setOpen(true)} onKeyDown={onKey}
      />
      <button type="submit" className="search-go">Search</button>
      {showList && (
        <ul className="suggest" id="search-results" role="listbox">
          {results.length === 0 && <li className="suggest-empty">No matches for “{debounced}”</li>}
          {results.map((item, index) => (
            <li key={item._id} id={`sr-${index}`} role="option" aria-selected={index === active}>
              <button type="button" className={index === active ? 'on' : ''} onMouseDown={(event) => event.preventDefault()} onClick={() => go(`/product/${item._id}`)}>
                <img src={imageUrl(item.image)} alt="" loading="lazy" />
                <span className="suggest-name"><strong>{item.name}</strong><small>{item.brand}</small></span>
                <span className="suggest-price">{money(item.price)}</span>
              </button>
            </li>
          ))}
          {results.length > 0 && <li><button type="button" className="suggest-all" onMouseDown={(event) => event.preventDefault()} onClick={() => go(`/shop?q=${encodeURIComponent(debounced)}`)}>See all results for “{debounced}” <Icon name="arrow-right" size={16} /></button></li>}
        </ul>
      )}
    </form>
  )
}

function AccountMenu() {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useUi()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false) }
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  const signOut = async () => {
    setOpen(false)
    try { await client.post('/users/logout') } catch (error) { toast(errorMessage(error), 'error') }
    dispatch(clearUser())
    toast('You are signed out')
    navigate('/')
  }

  if (!user) {
    return (
      <div className="auth-links">
        <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
      </div>
    )
  }
  return (
    <div className="menu-wrap" ref={ref}>
      <button type="button" className="account-btn" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
        <span className="avatar" aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</span>
        <span className="account-name">{user.username.split(' ')[0]}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <div className="menu" role="menu" onClick={() => setOpen(false)}>
          <div className="menu-head"><strong>{user.username}</strong><small>{user.email}</small></div>
          <Link role="menuitem" to="/orders"><Icon name="package" size={18} /> My orders</Link>
          <Link role="menuitem" to="/wishlist"><Icon name="heart" size={18} /> Wishlist</Link>
          <Link role="menuitem" to="/account"><Icon name="user" size={18} /> Account settings</Link>
          {user.isAdmin && <Link role="menuitem" to="/admin"><Icon name="dashboard" size={18} /> Admin dashboard</Link>}
          <button type="button" role="menuitem" onClick={signOut}><Icon name="logout" size={18} /> Sign out</button>
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  const cartCount = useSelector(selectCartCount)
  const wishCount = useSelector((state) => state.wishlist.ids.length)
  const { openCart } = useUi()
  const [theme, toggleTheme] = useTheme()
  const categories = useFetch(getCategories, [])
  const [drawer, setDrawer] = useState(false)
  const [lifted, setLifted] = useState(false)

  useEffect(() => { setDrawer(false) }, [location.pathname, location.search])
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    if (!drawer) return undefined
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => { if (event.key === 'Escape') setDrawer(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey) }
  }, [drawer])

  return (
    <header className={`header ${lifted ? 'lifted' : ''}`}>
      <div className="announce">Free shipping over ₹999 <span>·</span> Easy 7-day returns<span className="wide-only"> <span>·</span> Secure payments</span></div>
      <div className="header-main container">
        <button type="button" className="icon-btn menu-toggle" onClick={() => setDrawer(true)} aria-label="Open menu"><Icon name="menu" size={24} /></button>
        <Logo />
        <div className="header-search"><SearchBox /></div>
        <nav className="header-actions" aria-label="Account and cart">
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={22} />
          </button>
          <span className="desktop-only"><AccountMenu /></span>
          <Link to="/wishlist" className="icon-btn has-badge" aria-label={`Wishlist, ${wishCount} items`}>
            <Icon name="heart" size={22} />{wishCount > 0 && <b className="badge-dot">{wishCount}</b>}
          </Link>
          <button type="button" className="icon-btn has-badge" onClick={openCart} aria-label={`Cart, ${cartCount} items`}>
            <Icon name="cart" size={22} />{cartCount > 0 && <b className="badge-dot">{cartCount}</b>}
          </button>
        </nav>
      </div>
      <div className="mobile-search container"><SearchBox /></div>

      <div className="catbar">
        <div className="container catbar-inner">
          <NavLink to="/shop" end className="cat cat-all"><Icon name="grid" size={16} /> All products</NavLink>
          <NavLink to="/shop?deals=1" className={() => `cat cat-deal ${location.search.includes('deals=1') ? 'active' : ''}`}><Icon name="bolt" size={16} /> Deals</NavLink>
          {(categories.data || []).map((category) => (
            <Link key={category._id} to={`/shop?category=${category._id}`} className={`cat ${location.search.includes(category._id) ? 'active' : ''}`}>{category.name}</Link>
          ))}
        </div>
      </div>

      {drawer && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setDrawer(false) }}>
          <aside className="drawer left" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="drawer-head"><Logo /><button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close menu"><Icon name="x" size={22} /></button></div>
            <div className="drawer-body">
              {user ? (
                <div className="drawer-user"><span className="avatar lg">{user.username.slice(0, 1).toUpperCase()}</span><div><strong>{user.username}</strong><small>{user.email}</small></div></div>
              ) : (
                <div className="drawer-auth"><Link to="/login" className="btn btn-primary">Sign in</Link><Link to="/register" className="btn btn-ghost">Create account</Link></div>
              )}
              <p className="drawer-title">Shop by category</p>
              <ul className="drawer-list">
                <li><Link to="/shop?deals=1"><Icon name="bolt" size={18} /> Today's deals</Link></li>
                <li><Link to="/shop"><Icon name="grid" size={18} /> All products</Link></li>
                {(categories.data || []).map((category) => <li key={category._id}><Link to={`/shop?category=${category._id}`}>{category.name}</Link></li>)}
              </ul>
              {user && (
                <>
                  <p className="drawer-title">Your account</p>
                  <ul className="drawer-list">
                    <li><Link to="/orders"><Icon name="package" size={18} /> My orders</Link></li>
                    <li><Link to="/wishlist"><Icon name="heart" size={18} /> Wishlist</Link></li>
                    <li><Link to="/account"><Icon name="user" size={18} /> Account settings</Link></li>
                    {user.isAdmin && <li><Link to="/admin"><Icon name="dashboard" size={18} /> Admin dashboard</Link></li>}
                    <li><SignOutRow onDone={() => setDrawer(false)} /></li>
                  </ul>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}

function SignOutRow({ onDone }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useUi()
  const out = async () => {
    try { await client.post('/users/logout') } catch (error) { toast(errorMessage(error), 'error') }
    dispatch(clearUser())
    onDone()
    toast('You are signed out')
    navigate('/')
  }
  return <button type="button" onClick={out}><Icon name="logout" size={18} /> Sign out</button>
}
