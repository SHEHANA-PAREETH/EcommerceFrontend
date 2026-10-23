import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import client, { errorMessage } from '../api/client'
import { clearWishlist, loadSession, setUser } from '../store'
import { useUi } from '../context/Ui'
import { useFetch, useTitle } from '../hooks'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import { Breadcrumbs, Empty, ProductSkeletons } from '../components/common'

// ---------- wishlist ----------
export function Wishlist() {
  useTitle('Wishlist')
  const ids = useSelector((state) => state.wishlist.ids)
  const dispatch = useDispatch()
  const { confirm, toast } = useUi()
  const key = ids.join(',')
  const list = useFetch(() => (ids.length ? client.post('/product/byids', { ids }).then((res) => res.data) : Promise.resolve([])), [key])

  // ids of products that no longer exist are dropped
  const products = ids.map((id) => (list.data || []).find((p) => p._id === id)).filter(Boolean)
  const clear = async () => {
    if (await confirm({ title: 'Clear your wishlist?', message: 'All saved items will be removed.', confirmLabel: 'Clear wishlist', danger: true })) { dispatch(clearWishlist()); toast('Wishlist cleared') }
  }

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
      <div className="section-head"><div><h1 className="page-title">Your wishlist</h1><p className="muted">{ids.length} saved item{ids.length === 1 ? '' : 's'}</p></div>{ids.length > 0 && <button type="button" className="link-btn danger" onClick={clear}>Clear all</button>}</div>
      {ids.length === 0 ? (
        <Empty icon="heart" title="Nothing saved yet" action={<Link to="/shop" className="btn btn-primary btn-lg">Discover products</Link>}>Tap the heart on any product to keep it here for later.</Empty>
      ) : list.loading && !list.data ? <div className="pgrid"><ProductSkeletons count={Math.min(ids.length, 8)} /></div>
        : <div className="pgrid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>}
    </div>
  )
}

// ---------- account settings ----------
export default function Account() {
  useTitle('Account settings')
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const { toast } = useUi()
  const [form, setForm] = useState({ username: user.username, email: user.email, currentPassword: '', password: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const set = (name) => (event) => setForm((f) => ({ ...f, [name]: event.target.value }))
  const sensitive = form.email.trim().toLowerCase() !== user.email || form.password

  const save = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password && form.password !== form.confirm) return setError('The new passwords do not match')
    setBusy(true)
    try {
      const body = { username: form.username, email: form.email }
      if (form.password) body.password = form.password
      if (sensitive) body.currentPassword = form.currentPassword
      const { data } = await client.put('/users/profile', body)
      dispatch(setUser(data))
      setForm((f) => ({ ...f, currentPassword: '', password: '', confirm: '' }))
      toast('Your account was updated')
    } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }

  return (
    <div className="container page narrow">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Account settings' }]} />
      <h1 className="page-title">Account settings</h1>
      <form className="panel" onSubmit={save} noValidate>
        <h2>Profile</h2>
        <div className="form-grid">
          <label className="field"><span>Full name</span><input value={form.username} onChange={set('username')} autoComplete="name" required /></label>
          <label className="field"><span>Email</span><input type="email" value={form.email} onChange={set('email')} autoComplete="email" required /></label>
        </div>
        <h2>Change password</h2>
        <p className="muted small">Leave blank to keep your current password.</p>
        <div className="form-grid">
          <label className="field"><span>New password</span><input type={show ? 'text' : 'password'} value={form.password} onChange={set('password')} autoComplete="new-password" placeholder="At least 8 characters, with a letter and a number" /></label>
          <label className="field"><span>Confirm new password</span><input type={show ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} autoComplete="new-password" /></label>
        </div>
        {sensitive && (
          <label className="field"><span>Current password <small>(needed to change your email or password)</small></span>
            <input type={show ? 'text' : 'password'} value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" required />
          </label>
        )}
        <label className="check"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords</label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  )
}

// ---------- sign in / sign up ----------
export function AuthPage({ mode }) {
  const register = mode === 'register'
  useTitle(register ? 'Create account' : 'Sign in')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { toast } = useUi()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const next = params.get('next')
  const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
  const set = (name) => (event) => setForm((f) => ({ ...f, [name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (register && form.password.length < 8) return setError('Password must be at least 8 characters')
    setBusy(true)
    try {
      const { data } = await client.post(register ? '/users' : '/users/auth', register ? form : { email: form.email, password: form.password })
      dispatch(setUser(data))
      dispatch(loadSession())
      toast(register ? `Welcome to Shopora, ${data.username.split(' ')[0]}!` : `Welcome back, ${data.username.split(' ')[0]}`)
      navigate(target, { replace: true })
    } catch (e) { setError(errorMessage(e)); setBusy(false) }
  }

  return (
    <div className="auth">
      <div className="auth-art" aria-hidden="true">
        <div className="auth-art-inner">
          <span className="eyebrow">Shopora</span>
          <h2>{register ? 'Join thousands of happy shoppers' : 'Good to see you again'}</h2>
          <ul>
            <li><Icon name="truck" size={20} /> Free delivery over ₹999</li>
            <li><Icon name="return" size={20} /> 7-day easy returns</li>
            <li><Icon name="heart" size={20} /> Save favourites to your wishlist</li>
            <li><Icon name="package" size={20} /> Track every order</li>
          </ul>
        </div>
      </div>
      <div className="auth-form">
        <form onSubmit={submit} noValidate>
          <h1>{register ? 'Create your account' : 'Sign in'}</h1>
          <p className="muted">{register ? 'It only takes a minute.' : 'Enter your details to continue.'}</p>
          {register && <label className="field"><span>Full name</span><input value={form.username} onChange={set('username')} autoComplete="name" required autoFocus /></label>}
          <label className="field"><span>Email</span><input type="email" value={form.email} onChange={set('email')} autoComplete="email" required autoFocus={!register} /></label>
          <label className="field"><span>Password</span>
            <span className="input-wrap">
              <input type={show ? 'text' : 'password'} value={form.password} onChange={set('password')} autoComplete={register ? 'new-password' : 'current-password'} required placeholder={register ? 'At least 8 characters, a letter and a number' : ''} />
              <button type="button" className="icon-btn" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}><Icon name={show ? 'eye-off' : 'eye'} size={20} /></button>
            </span>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
          <p className="auth-switch">
            {register ? <>Already have an account? <Link to={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Sign in</Link></> : <>New to Shopora? <Link to={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</Link></>}
          </p>
        </form>
      </div>
    </div>
  )
}

export function NotFound() {
  useTitle('Page not found')
  return (
    <div className="container page">
      <div className="empty">
        <p className="big-code">404</p>
        <h2>We can't find that page</h2>
        <p>The link may be broken, or the page may have moved.</p>
        <Link to="/" className="btn btn-primary btn-lg">Back to the shop</Link>
      </div>
    </div>
  )
}
