import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import client, { errorMessage } from '../api/client'
import { dateTime, moneyExact, money, shortId } from '../api/format'
import { useUi } from '../context/Ui'
import { useFetch, useTitle } from '../hooks'
import Icon from '../components/Icon'
import { Breadcrumbs, ErrorBox, Picture, Skeleton, StatusBadge } from '../components/common'

export function Timeline({ order }) {
  const cancelled = order.status === 'cancelled'
  const steps = [
    { label: 'Order placed', at: order.createdAt, done: true },
    { label: order.paymentMethod === 'cod' ? 'Payment: on delivery' : 'Payment received', at: order.paidAt, done: order.isPaid || order.paymentMethod === 'cod' && !cancelled },
    { label: 'Shipped', at: order.shippedAt, done: ['shipped', 'delivered'].includes(order.status) },
    { label: 'Delivered', at: order.deliveredAt, done: order.status === 'delivered' },
  ]
  if (cancelled) return <ol className="timeline"><li className="done"><span className="dot" /><div><strong>Order placed</strong><small>{dateTime(order.createdAt)}</small></div></li><li className="done bad"><span className="dot" /><div><strong>Cancelled</strong><small>{dateTime(order.cancelledAt)}</small></div></li></ol>
  return (
    <ol className="timeline">
      {steps.map((step) => (
        <li key={step.label} className={step.done ? 'done' : ''}><span className="dot">{step.done && <Icon name="check" size={12} strokeWidth={3} />}</span><div><strong>{step.label}</strong><small>{step.at ? dateTime(step.at) : step.done ? '' : 'Pending'}</small></div></li>
      ))}
    </ol>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const { toast, confirm } = useUi()
  const me = useSelector((state) => state.auth.user)
  const order = useFetch(() => client.get(`/orders/${id}`).then((res) => res.data), [id])
  const [busy, setBusy] = useState('')
  const [verifying, setVerifying] = useState(false)
  const checked = useRef(false)
  const o = order.data
  useTitle(o ? `Order ${shortId(o._id)}` : 'Order')

  // back from Stripe: ask the server to confirm the payment with Stripe
  const sessionId = params.get('session_id')
  useEffect(() => {
    if (!sessionId || checked.current) return
    checked.current = true
    setVerifying(true)
    client.post(`/orders/${id}/verify-payment`, { sessionId })
      .then((res) => { order.setData(res.data); toast('Payment received. Thank you!') })
      .catch((error) => toast(errorMessage(error, 'We could not confirm the payment yet'), 'error'))
      .finally(() => { setVerifying(false); setParams({}, { replace: true }) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, id])

  const pay = async () => {
    setBusy('pay')
    try { const { data } = await client.post(`/orders/${id}/checkout`); window.location.assign(data.url) }
    catch (error) { toast(errorMessage(error), 'error'); setBusy('') }
  }
  const cancel = async () => {
    if (!(await confirm({ title: 'Cancel this order?', message: 'The items go back into stock. This can’t be undone.', confirmLabel: 'Cancel order', cancelLabel: 'Keep order', danger: true }))) return
    setBusy('cancel')
    try { const { data } = await client.put(`/orders/${id}/cancel`); order.setData(data); toast('Order cancelled') }
    catch (error) { toast(errorMessage(error), 'error') } finally { setBusy('') }
  }

  if (order.loading && !o) return <div className="container page"><Skeleton style={{ height: 40, width: '40%' }} /><Skeleton style={{ height: 320, marginTop: 24 }} /></div>
  if (order.error) return <div className="container page"><ErrorBox message={order.error?.response?.status === 404 ? "We couldn't find that order." : errorMessage(order.error)} onRetry={order.retry} /></div>

  // an admin can open any order, but only the buyer pays for or cancels it
  const mine = String(o.user?._id || o.user) === String(me?._id)
  const placed = mine && params.get('placed') === '1'
  const unpaidCard = mine && o.paymentMethod === 'stripe' && !o.isPaid && o.status === 'processing'
  const a = o.shippingAddress

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My orders', to: '/orders' }, { label: `Order ${shortId(o._id)}` }]} />

      {!mine && (
        <div className="banner" role="status">
          <Icon name="user" size={26} />
          <div><strong>Viewing {o.user?.username || 'a customer'}'s order</strong><p>{o.user?.email} · You are signed in as an admin. Change the status from <Link to={`/admin/orders?open=${o._id}`}>Admin → Orders</Link>.</p></div>
        </div>
      )}

      {(placed || (mine && params.get('cancelled'))) && (
        <div className={`banner ${params.get('cancelled') ? 'warn' : 'ok'}`} role="status">
          <Icon name={params.get('cancelled') ? 'alert' : 'check-circle'} size={26} />
          <div>
            <strong>{params.get('cancelled') ? 'Payment was cancelled' : 'Thank you! Your order is placed'}</strong>
            <p>{params.get('cancelled') ? 'Your order is saved. You can pay now or cancel it below.' : o.paymentMethod === 'cod' ? 'Pay in cash when it arrives. We will send it out shortly.' : 'We are getting it ready.'}</p>
          </div>
        </div>
      )}
      {verifying && <div className="banner" role="status"><Icon name="clock" size={26} /><div><strong>Confirming your payment…</strong><p>Please wait a moment.</p></div></div>}

      <div className="order-head">
        <div><h1 className="page-title">Order #{shortId(o._id)}</h1><p className="muted">Placed {dateTime(o.createdAt)}</p></div>
        <StatusBadge status={o.status} />
      </div>

      <div className="cart-layout">
        <div className="checkout-steps">
          <section className="panel"><h2>Order status</h2><Timeline order={o} /></section>

          <section className="panel">
            <h2>Items</h2>
            <ul className="review-items">
              {o.orderItems.map((item) => (
                <li key={item._id}>
                  <Link to={`/product/${item.product}`} className="ri-img"><Picture src={item.image} /></Link>
                  <span className="ri-name"><Link to={`/product/${item.product}`}>{item.name}</Link><small>{money(item.price)} × {item.qty}</small></span>
                  <strong>{money(item.price * item.qty)}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel two-col">
            <div><h2>Delivery address</h2><address><strong>{a.fullName}</strong><br />{a.address}<br />{a.city}{a.state ? `, ${a.state}` : ''} {a.postalCode}<br />{a.country}<br /><Icon name="phone" size={14} /> {a.phone}</address></div>
            <div>
              <h2>Payment</h2>
              <p>{o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card (Stripe)'}</p>
              <p className={o.isPaid ? 'ok-text' : 'muted'}>{o.isPaid ? `Paid ${dateTime(o.paidAt)}` : o.status === 'cancelled' ? 'Not charged' : 'Not paid yet'}</p>
            </div>
          </section>
        </div>

        <aside className="summary" aria-label="Order totals">
          <h2>Summary</h2>
          <dl>
            <div><dt>Items</dt><dd>{moneyExact(o.itemsPrice)}</dd></div>
            <div><dt>Shipping</dt><dd>{o.shippingPrice ? moneyExact(o.shippingPrice) : <span className="free">Free</span>}</dd></div>
            <div><dt>GST (18%)</dt><dd>{moneyExact(o.taxPrice)}</dd></div>
            <div className="total"><dt>Total</dt><dd>{moneyExact(o.totalPrice)}</dd></div>
          </dl>
          {unpaidCard && <button type="button" className="btn btn-primary btn-block btn-lg" onClick={pay} disabled={busy === 'pay'}><Icon name="card" size={18} /> {busy === 'pay' ? 'Opening payment…' : 'Pay now'}</button>}
          {mine && o.status === 'processing' && !o.isPaid && <button type="button" className="btn btn-ghost btn-block" onClick={cancel} disabled={busy === 'cancel'}>Cancel order</button>}
          <Link to="/shop" className="btn btn-soft btn-block">Continue shopping</Link>
        </aside>
      </div>
    </div>
  )
}
