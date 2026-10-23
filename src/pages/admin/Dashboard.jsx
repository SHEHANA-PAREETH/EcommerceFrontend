import { Link } from 'react-router-dom'
import client, { errorMessage } from '../../api/client'
import { compact, dateText, money, shortId } from '../../api/format'
import Icon from '../../components/Icon'
import { ErrorBox, Picture, Skeleton, StatusBadge } from '../../components/common'
import { useFetch, useTitle } from '../../hooks'

function SalesChart({ series }) {
  const max = Math.max(1, ...series.map((d) => d.sales))
  const W = 700, H = 220, pad = { l: 8, r: 8, t: 14, b: 28 }
  const bw = (W - pad.l - pad.r) / series.length
  const ticks = [0, 0.5, 1]
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Sales over the last ${series.length} days. Highest day ${money(max)}.`} preserveAspectRatio="none">
        {ticks.map((t) => <line key={t} x1={pad.l} x2={W - pad.r} y1={pad.t + (H - pad.t - pad.b) * (1 - t)} y2={pad.t + (H - pad.t - pad.b) * (1 - t)} className="grid-line" />)}
        {series.map((d, i) => {
          const h = ((H - pad.t - pad.b) * d.sales) / max
          return (
            <g key={d.date}>
              <rect x={pad.l + i * bw + bw * 0.18} y={H - pad.b - h} width={bw * 0.64} height={Math.max(h, d.sales ? 2 : 0)} rx="4" className="bar-rect"><title>{`${dateText(d.date, { day: 'numeric', month: 'short' })}: ${money(d.sales)} from ${d.orders} order(s)`}</title></rect>
              {(i % 2 === 0 || series.length < 8) && <text x={pad.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="axis">{dateText(d.date, { day: 'numeric', month: 'short' })}</text>}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

export default function Dashboard() {
  useTitle('Admin dashboard')
  const stats = useFetch(() => client.get('/admin/stats').then((res) => res.data), [])
  const d = stats.data

  if (stats.error && !d) return <ErrorBox message={errorMessage(stats.error)} onRetry={stats.retry} />

  const cards = d && [
    ['Revenue', money(d.totals.revenue), 'cash', 'Paid orders'],
    ['Orders', d.totals.orders, 'cart', `${d.byStatus.processing || 0} to process`],
    ['Customers', d.totals.users, 'users', 'Registered accounts'],
    ['Products', d.totals.products, 'package', `${d.lowStock.length} low on stock`],
  ]
  const week = d ? d.series.slice(-7).reduce((s, x) => s + x.sales, 0) : 0

  return (
    <>
      <div className="admin-title"><div><h1>Dashboard</h1><p className="muted">How the store is doing</p></div><Link to="/admin/products/new" className="btn btn-primary"><Icon name="plus" size={18} /> Add product</Link></div>

      <div className="kpis">
        {cards
          ? cards.map((card) => <div key={card[0]} className="kpi"><span className="kpi-icon"><Icon name={card[2]} size={22} /></span><div><small>{card[0]}</small><strong>{card[1]}</strong><span className="muted">{card[3]}</span></div></div>)
          : [0, 1, 2, 3].map((n) => <Skeleton key={n} style={{ height: 104 }} />)}
      </div>

      <div className="admin-grid">
        <section className="panel span-2">
          <div className="panel-head"><h2>Sales, last 14 days</h2>{d && <span className="muted">Last 7 days: <strong>{money(week)}</strong></span>}</div>
          {d ? <SalesChart series={d.series} /> : <Skeleton style={{ height: 220 }} />}
        </section>

        <section className="panel">
          <h2>Orders by status</h2>
          {d ? (
            <ul className="status-list">
              {['processing', 'shipped', 'delivered', 'cancelled'].map((s) => {
                const n = d.byStatus[s] || 0
                return <li key={s}><span><StatusBadge status={s} /></span><span className="bar"><span className={`fill fill-${s}`} style={{ width: `${d.totals.orders ? (n / d.totals.orders) * 100 : 0}%` }} /></span><strong>{n}</strong></li>
              })}
            </ul>
          ) : <Skeleton style={{ height: 160 }} />}
        </section>

        <section className="panel span-2">
          <div className="panel-head"><h2>Recent orders</h2><Link to="/admin/orders" className="link-arrow">View all <Icon name="arrow-right" size={16} /></Link></div>
          {d ? (
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {d.recentOrders.map((o) => <tr key={o._id}><td data-label="Order"><Link to={`/admin/orders?open=${o._id}`}>#{shortId(o._id)}</Link></td><td data-label="Customer">{o.user?.username || 'Deleted user'}</td><td data-label="Date">{dateText(o.createdAt)}</td><td data-label="Total">{money(o.totalPrice)}</td><td data-label="Status"><StatusBadge status={o.status} /></td></tr>)}
                {d.recentOrders.length === 0 && <tr><td colSpan="5" className="muted center">No orders yet</td></tr>}
              </tbody>
            </table></div>
          ) : <Skeleton style={{ height: 200 }} />}
        </section>

        <section className="panel">
          <h2>Top selling</h2>
          {d ? (
            <ol className="mini-list">
              {d.topProducts.map((p) => <li key={p._id}><span className="thumb"><Picture src={p.image} /></span><Link to={`/admin/products/${p._id}`}>{p.name}</Link><strong>{compact(p.qty)} sold</strong></li>)}
              {d.topProducts.length === 0 && <li className="muted">Nothing sold yet</li>}
            </ol>
          ) : <Skeleton style={{ height: 160 }} />}
        </section>

        <section className="panel span-3">
          <h2>Low stock</h2>
          {d ? (
            d.lowStock.length ? (
              <ul className="stock-list">
                {d.lowStock.map((p) => <li key={p._id}><span className="thumb"><Picture src={p.image} /></span><Link to={`/admin/products/${p._id}`}>{p.name}</Link><span className={`badge ${p.countInStock === 0 ? 'badge-cancelled' : 'badge-processing'}`}>{p.countInStock === 0 ? 'Out of stock' : `${p.countInStock} left`}</span></li>)}
              </ul>
            ) : <p className="muted">Everything is well stocked.</p>
          ) : <Skeleton style={{ height: 80 }} />}
        </section>
      </div>
    </>
  )
}

