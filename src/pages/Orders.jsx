import { useState } from 'react'
import { Link } from 'react-router-dom'
import client, { errorMessage } from '../api/client'
import { dateText, money, shortId } from '../api/format'
import { useFetch, useTitle } from '../hooks'
import { Breadcrumbs, Empty, ErrorBox, Picture, Skeleton, StatusBadge } from '../components/common'

const TABS = [['all', 'All'], ['active', 'In progress'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']]

export default function Orders() {
  useTitle('My orders')
  const orders = useFetch(() => client.get('/orders/mine').then((res) => res.data), [])
  const [tab, setTab] = useState('all')

  const all = orders.data || []
  const shown = all.filter((o) => (tab === 'all' ? true : tab === 'active' ? ['processing', 'shipped'].includes(o.status) : o.status === tab))

  return (
    <div className="container page narrow">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My orders' }]} />
      <h1 className="page-title">My orders</h1>
      <div className="chips">
        {TABS.map(([id, label]) => <button key={id} type="button" className={`chip ${tab === id ? 'on' : ''}`} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </div>

      {orders.loading && !orders.data ? <div className="stack">{[0, 1, 2].map((n) => <Skeleton key={n} style={{ height: 150 }} />)}</div>
        : orders.error ? <ErrorBox message={errorMessage(orders.error)} onRetry={orders.retry} />
        : shown.length === 0 ? (
          <Empty icon="package" title={all.length ? 'No orders here' : 'No orders yet'} action={<Link to="/shop" className="btn btn-primary btn-lg">Start shopping</Link>}>
            {all.length ? 'Try another filter.' : 'When you place an order, it will show up here.'}
          </Empty>
        ) : (
          <ul className="stack">
            {shown.map((o) => (
              <li key={o._id} className="order-card">
                <header>
                  <div><strong>Order #{shortId(o._id)}</strong><small>Placed {dateText(o.createdAt)} · {o.orderItems.reduce((n, i) => n + i.qty, 0)} item(s)</small></div>
                  <StatusBadge status={o.status} />
                </header>
                <div className="order-thumbs">
                  {o.orderItems.slice(0, 5).map((item) => <Link key={item._id} to={`/product/${item.product}`} className="thumb" title={item.name}><Picture src={item.image} /></Link>)}
                  {o.orderItems.length > 5 && <span className="thumb more">+{o.orderItems.length - 5}</span>}
                </div>
                <footer>
                  <div><span className="muted">Total</span> <strong>{money(o.totalPrice)}</strong> <span className={o.isPaid ? 'ok-text' : 'muted'}>· {o.isPaid ? 'Paid' : o.paymentMethod === 'cod' ? 'Pay on delivery' : 'Payment pending'}</span></div>
                  <Link to={`/order/${o._id}`} className="btn btn-soft btn-sm">View details</Link>
                </footer>
              </li>
            ))}
          </ul>
        )}
    </div>
  )
}
