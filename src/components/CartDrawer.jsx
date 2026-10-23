import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FREE_SHIPPING_FROM, money, summarize } from '../api/format'
import { removeItem, setQty } from '../store'
import { useUi } from '../context/Ui'
import Icon from './Icon'
import { Picture, QtyStepper } from './common'

export function ShippingProgress({ subtotal }) {
  const left = FREE_SHIPPING_FROM - subtotal
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_FROM) * 100))
  return (
    <div className="ship">
      <p>{left > 0 ? <>Add <strong>{money(left)}</strong> more for <strong>free shipping</strong></> : <><Icon name="check-circle" size={16} /> You've unlocked <strong>free shipping</strong></>}</p>
      <div className="ship-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progress to free shipping"><span style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUi()
  const items = useSelector((state) => state.cart.items)
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { itemsPrice } = summarize(items)

  useEffect(() => {
    if (!cartOpen) return undefined
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => { if (event.key === 'Escape') closeCart() }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey) }
  }, [cartOpen, closeCart])

  if (!cartOpen) return null
  const go = (path) => { closeCart(); navigate(path) }

  return (
    <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCart() }}>
      <aside className="drawer right" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="drawer-head">
          <h2>Your cart <span className="muted">({items.reduce((n, i) => n + i.qty, 0)})</span></h2>
          <button type="button" className="icon-btn" onClick={closeCart} aria-label="Close cart" autoFocus><Icon name="x" size={22} /></button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <span className="empty-icon"><Icon name="cart" size={34} /></span>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <button type="button" className="btn btn-primary" onClick={() => go('/shop')}>Start shopping</button>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              <ShippingProgress subtotal={itemsPrice} />
              <ul className="lines">
                {items.map((item) => (
                  <li key={item._id} className="line">
                    <Link to={`/product/${item._id}`} onClick={closeCart} className="line-img"><Picture src={item.image} /></Link>
                    <div className="line-info">
                      <Link to={`/product/${item._id}`} onClick={closeCart} className="line-name">{item.name}</Link>
                      <span className="line-brand">{item.brand}</span>
                      <div className="line-row">
                        <QtyStepper value={item.qty} max={item.countInStock} onChange={(qty) => dispatch(setQty({ id: item._id, qty }))} label={`Quantity of ${item.name}`} />
                        <strong>{money(item.price * item.qty)}</strong>
                      </div>
                    </div>
                    <button type="button" className="icon-btn line-remove" onClick={() => dispatch(removeItem(item._id))} aria-label={`Remove ${item.name}`}><Icon name="trash" size={18} /></button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="drawer-foot">
              <div className="row-between"><span>Subtotal</span><strong>{money(itemsPrice)}</strong></div>
              <p className="muted small">Shipping and GST are calculated at checkout.</p>
              <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => go(user ? '/checkout' : '/login?next=/checkout')}>Checkout <Icon name="arrow-right" size={18} /></button>
              <button type="button" className="btn btn-ghost btn-block" onClick={() => go('/cart')}>View full cart</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
