import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import client from '../api/client'
import { moneyExact, money, summarize } from '../api/format'
import { clearCart, refreshItems, removeItem, setQty } from '../store'
import { useUi } from '../context/Ui'
import { useTitle } from '../hooks'
import Icon from '../components/Icon'
import { Breadcrumbs, Empty, Picture, QtyStepper } from '../components/common'
import { ShippingProgress } from '../components/CartDrawer'

export function OrderSummary({ items, children }) {
  const totals = summarize(items)
  return (
    <aside className="summary" aria-label="Order summary">
      <h2>Order summary</h2>
      <dl>
        <div><dt>Items ({items.reduce((n, i) => n + i.qty, 0)})</dt><dd>{moneyExact(totals.itemsPrice)}</dd></div>
        <div><dt>Shipping</dt><dd>{totals.shippingPrice ? moneyExact(totals.shippingPrice) : <span className="free">Free</span>}</dd></div>
        <div><dt>GST (18%)</dt><dd>{moneyExact(totals.taxPrice)}</dd></div>
        <div className="total"><dt>Total</dt><dd>{moneyExact(totals.totalPrice)}</dd></div>
      </dl>
      {children}
    </aside>
  )
}

export default function Cart() {
  useTitle('Your cart')
  const items = useSelector((state) => state.cart.items)
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { confirm, toast } = useUi()
  const { itemsPrice } = summarize(items)

  // prices and stock may have changed since the items were added
  useEffect(() => {
    if (!items.length) return
    client.post('/product/byids', { ids: items.map((i) => i._id) }).then((res) => dispatch(refreshItems(res.data))).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const empty = async () => {
    if (await confirm({ title: 'Empty your cart?', message: 'All items will be removed from your cart.', confirmLabel: 'Empty cart', danger: true })) { dispatch(clearCart()); toast('Cart emptied') }
  }

  if (!items.length) {
    return (
      <div className="container page">
        <Empty icon="cart" title="Your cart is empty" action={<Link to="/shop" className="btn btn-primary btn-lg">Continue shopping</Link>}>
          Browse our latest products and add your favourites here.
        </Empty>
      </div>
    )
  }

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <h1 className="page-title">Shopping cart</h1>
      <div className="cart-layout">
        <section aria-label="Items in your cart">
          <ShippingProgress subtotal={itemsPrice} />
          <ul className="cart-lines">
            {items.map((item) => (
              <li key={item._id} className="cart-line">
                <Link to={`/product/${item._id}`} className="cart-img"><Picture src={item.image} /></Link>
                <div className="cart-info">
                  <Link to={`/product/${item._id}`} className="cart-name">{item.name}</Link>
                  <span className="muted">{item.brand}</span>
                  <span className="cart-unit">{money(item.price)} each</span>
                  {item.countInStock <= 5 && <span className="low">Only {item.countInStock} left</span>}
                  <button type="button" className="link-btn danger" onClick={() => dispatch(removeItem(item._id))}><Icon name="trash" size={16} /> Remove</button>
                </div>
                <div className="cart-qty"><QtyStepper value={item.qty} max={item.countInStock} onChange={(qty) => dispatch(setQty({ id: item._id, qty }))} label={`Quantity of ${item.name}`} /></div>
                <strong className="cart-total">{money(item.price * item.qty)}</strong>
              </li>
            ))}
          </ul>
          <div className="cart-bottom">
            <Link to="/shop" className="link-arrow"><Icon name="chevron-left" size={16} /> Continue shopping</Link>
            <button type="button" className="link-btn danger" onClick={empty}>Empty cart</button>
          </div>
        </section>

        <OrderSummary items={items}>
          <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => navigate(user ? '/checkout' : '/login?next=/checkout')}>
            {user ? 'Proceed to checkout' : 'Sign in to checkout'} <Icon name="arrow-right" size={18} />
          </button>
          <p className="secure"><Icon name="lock" size={14} /> Secure checkout</p>
        </OrderSummary>
      </div>
    </div>
  )
}
