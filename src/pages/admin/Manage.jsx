import { Fragment, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import client, { errorMessage } from '../../api/client'
import { resetCategories } from '../../api/catalog'
import { dateText, dateTime, moneyExact, money, shortId } from '../../api/format'
import { useUi } from '../../context/Ui'
import Icon from '../../components/Icon'
import { Empty, ErrorBox, Pagination, Picture, Skeleton, StatusBadge } from '../../components/common'
import { useDebounce, useFetch, useTitle } from '../../hooks'

// ---------- categories ----------
export function Categories() {
  useTitle('Categories · Admin')
  const { confirm, toast } = useUi()
  const list = useFetch(() => client.get('/category').then((res) => res.data), [])
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)

  const done = (message) => { resetCategories(); toast(message); list.retry() }
  const add = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try { await client.post('/category', { name }); setName(''); done('Category added') } catch (e) { toast(errorMessage(e), 'error') } finally { setBusy(false) }
  }
  const save = async (event) => {
    event.preventDefault()
    try { await client.put(`/category/${editing._id}`, { name: editing.name }); setEditing(null); done('Category renamed') } catch (e) { toast(errorMessage(e), 'error') }
  }
  const remove = async (category) => {
    if (!(await confirm({ title: `Delete “${category.name}”?`, message: category.count ? `This category still has ${category.count} product(s), so it can't be deleted yet.` : 'This category is empty and will be removed.', confirmLabel: 'Delete', danger: true }))) return
    try { await client.delete(`/category/${category._id}`); done('Category deleted') } catch (e) { toast(errorMessage(e), 'error') }
  }

  return (
    <>
      <div className="admin-title"><div><h1>Categories</h1><p className="muted">Group your products so shoppers can find them</p></div></div>
      <form className="panel inline-form" onSubmit={add}>
        <label className="field grow"><span>New category</span><input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Headphones" /></label>
        <button type="submit" className="btn btn-primary" disabled={busy || !name.trim()}><Icon name="plus" size={18} /> Add</button>
      </form>
      {list.error && !list.data ? <ErrorBox message={errorMessage(list.error)} onRetry={list.retry} /> : !list.data ? <Skeleton style={{ height: 300 }} /> : (
        <div className="panel flush"><ul className="rows">
          {list.data.map((c) => (
            <li key={c._id}>
              {editing?._id === c._id ? (
                <form onSubmit={save} className="row-edit">
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} maxLength={40} aria-label="Category name" autoFocus />
                  <button type="submit" className="btn btn-primary btn-sm">Save</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <span className="thumb"><Picture src={c.image} /></span>
                  <div className="grow"><strong>{c.name}</strong><small className="muted">{c.count} product{c.count === 1 ? '' : 's'}</small></div>
                  <Link to={`/admin/products?category=${c._id}`} className="link-arrow">View</Link>
                  <button type="button" className="icon-btn" onClick={() => setEditing({ _id: c._id, name: c.name })} aria-label={`Rename ${c.name}`}><Icon name="edit" size={18} /></button>
                  <button type="button" className="icon-btn danger" onClick={() => remove(c)} aria-label={`Delete ${c.name}`}><Icon name="trash" size={18} /></button>
                </>
              )}
            </li>
          ))}
          {list.data.length === 0 && <li className="muted">No categories yet. Add the first one above.</li>}
        </ul></div>
      )}
    </>
  )
}

// ---------- orders ----------
const STATUSES = [['', 'All'], ['processing', 'Processing'], ['shipped', 'Shipped'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']]
const NEXT = { processing: [['shipped', 'Mark as shipped'], ['cancelled', 'Cancel order']], shipped: [['delivered', 'Mark as delivered']] }

export function AdminOrders() {
  useTitle('Orders · Admin')
  const [params, setParams] = useSearchParams()
  const { toast, confirm } = useUi()
  const status = params.get('status') || ''
  const page = Number(params.get('page')) || 1
  const [openId, setOpenId] = useState(params.get('open') || '')
  const [busy, setBusy] = useState('')
  const list = useFetch(() => client.get('/orders', { params: { status: status || undefined, page, limit: 12 } }).then((res) => res.data), [status, page])
  const d = list.data

  const change = async (order, next, label) => {
    if (next === 'cancelled' && !(await confirm({ title: 'Cancel this order?', message: 'The items go back into stock. This can’t be undone.', confirmLabel: 'Cancel order', cancelLabel: 'Keep order', danger: true }))) return
    setBusy(order._id)
    try { await client.put(`/orders/${order._id}/status`, { status: next }); toast(`${label}: done`); list.retry() }
    catch (e) { toast(errorMessage(e), 'error') } finally { setBusy('') }
  }
  const setFilter = (name, value) => { const n = new URLSearchParams(params); if (value) n.set(name, value); else n.delete(name); if (name !== 'page') n.delete('page'); n.delete('open'); setParams(n) }

  return (
    <>
      <div className="admin-title"><div><h1>Orders</h1><p className="muted">{d ? `${d.total} order${d.total === 1 ? '' : 's'}` : 'Loading…'}</p></div></div>
      <div className="chips">{STATUSES.map(([id, label]) => <button key={id} type="button" className={`chip ${status === id ? 'on' : ''}`} aria-pressed={status === id} onClick={() => setFilter('status', id)}>{label}</button>)}</div>

      {list.error && !d ? <ErrorBox message={errorMessage(list.error)} onRetry={list.retry} /> : !d ? <Skeleton style={{ height: 420 }} />
        : d.orders.length === 0 ? <Empty icon="cart" title="No orders here">Orders matching this filter will show up here.</Empty> : (
          <div className="panel flush"><div className="table-wrap"><table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {d.orders.map((o) => {
                const open = openId === o._id
                return (
                  <Fragment key={o._id}>
                    <tr className={open ? 'is-open' : ''}>
                      <td data-label="Order"><button type="button" className="link-btn" onClick={() => setOpenId(open ? '' : o._id)} aria-expanded={open}>#{shortId(o._id)} <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} /></button></td>
                      <td data-label="Customer">{o.user?.username || 'Deleted user'}<small>{o.user?.email}</small></td>
                      <td data-label="Date">{dateText(o.createdAt)}</td>
                      <td data-label="Total">{money(o.totalPrice)}</td>
                      <td data-label="Payment"><span className={`badge ${o.isPaid ? 'badge-delivered' : 'badge-processing'}`}>{o.isPaid ? 'Paid' : o.paymentMethod === 'cod' ? 'COD' : 'Unpaid'}</span></td>
                      <td data-label="Status"><StatusBadge status={o.status} /></td>
                      <td className="actions wide">
                        {(NEXT[o.status] || []).map(([next, label]) => <button key={next} type="button" className={`btn btn-sm ${next === 'cancelled' ? 'btn-ghost' : 'btn-soft'}`} disabled={busy === o._id} onClick={() => change(o, next, label)}>{label}</button>)}
                      </td>
                    </tr>
                    {open && (
                      <tr className="detail-row"><td colSpan="7">
                        <div className="order-detail-grid">
                          <ul className="review-items">{o.orderItems.map((item) => <li key={item._id}><span className="ri-img"><Picture src={item.image} /></span><span className="ri-name">{item.name}<small>{money(item.price)} × {item.qty}</small></span><strong>{money(item.price * item.qty)}</strong></li>)}</ul>
                          <div>
                            <h3>Ship to</h3>
                            <address><strong>{o.shippingAddress.fullName}</strong><br />{o.shippingAddress.address}<br />{o.shippingAddress.city}{o.shippingAddress.state ? `, ${o.shippingAddress.state}` : ''} {o.shippingAddress.postalCode}<br />{o.shippingAddress.country}<br />{o.shippingAddress.phone}</address>
                            <p className="muted small">Placed {dateTime(o.createdAt)}{o.paidAt ? ` · Paid ${dateTime(o.paidAt)}` : ''}</p>
                            <p><span className="muted">Items</span> {moneyExact(o.itemsPrice)} · <span className="muted">Shipping</span> {moneyExact(o.shippingPrice)} · <span className="muted">GST</span> {moneyExact(o.taxPrice)}</p>
                            <p><strong>Total {moneyExact(o.totalPrice)}</strong></p>
                          </div>
                        </div>
                      </td></tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table></div></div>
        )}
      {d && <Pagination page={d.page} pages={d.pages} onChange={(n) => setFilter('page', n > 1 ? String(n) : '')} />}
    </>
  )
}

// ---------- customers ----------
export function Users() {
  useTitle('Customers · Admin')
  const me = useSelector((state) => state.auth.user)
  const { toast, confirm } = useUi()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const q = useDebounce(search.trim(), 350)
  useEffect(() => setPage(1), [q])
  const list = useFetch(() => client.get('/admin/users', { params: { q: q || undefined, page, limit: 12 } }).then((res) => res.data), [q, page])
  const d = list.data

  const toggleAdmin = async (user) => {
    const make = !user.isAdmin
    if (!(await confirm({ title: make ? `Make ${user.username} an admin?` : `Remove admin access from ${user.username}?`, message: make ? 'They will be able to manage products, orders and customers.' : 'They will become a regular customer.', confirmLabel: make ? 'Make admin' : 'Remove admin' }))) return
    try { await client.put(`/admin/users/${user._id}`, { isAdmin: make }); toast('Role updated'); list.retry() } catch (e) { toast(errorMessage(e), 'error') }
  }
  const remove = async (user) => {
    if (!(await confirm({ title: `Delete ${user.username}?`, message: 'Their account will be removed. Their past orders stay in your records.', confirmLabel: 'Delete account', danger: true }))) return
    try { await client.delete(`/admin/users/${user._id}`); toast('Account deleted'); list.retry() } catch (e) { toast(errorMessage(e), 'error') }
  }

  return (
    <>
      <div className="admin-title"><div><h1>Customers</h1><p className="muted">{d ? `${d.total} account${d.total === 1 ? '' : 's'}` : 'Loading…'}</p></div></div>
      <div className="toolbar"><label className="field-inline"><Icon name="search" size={18} /><input type="search" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search customers" /></label></div>
      {list.error && !d ? <ErrorBox message={errorMessage(list.error)} onRetry={list.retry} /> : !d ? <Skeleton style={{ height: 420 }} />
        : d.users.length === 0 ? <Empty icon="users" title="No customers found">Try a different search.</Empty> : (
          <div className="panel flush"><div className="table-wrap"><table className="table">
            <thead><tr><th>Customer</th><th>Joined</th><th>Orders</th><th>Spent</th><th>Role</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {d.users.map((u) => (
                <tr key={u._id}>
                  <td data-label="Customer"><div className="cell-product"><span className="avatar">{u.username.slice(0, 1).toUpperCase()}</span><div><strong>{u.username}</strong><small>{u.email}</small></div></div></td>
                  <td data-label="Joined">{dateText(u.createdAt)}</td>
                  <td data-label="Orders">{u.orders}</td>
                  <td data-label="Spent">{money(u.spent)}</td>
                  <td data-label="Role"><span className={`badge ${u.isAdmin ? 'badge-shipped' : 'badge-neutral'}`}>{u.isAdmin ? 'Admin' : 'Customer'}</span></td>
                  <td className="actions wide">
                    {u._id !== me._id && <button type="button" className="btn btn-soft btn-sm" onClick={() => toggleAdmin(u)}>{u.isAdmin ? 'Remove admin' : 'Make admin'}</button>}
                    {u._id !== me._id && !u.isAdmin && <button type="button" className="icon-btn danger" onClick={() => remove(u)} aria-label={`Delete ${u.username}`}><Icon name="trash" size={18} /></button>}
                    {u._id === me._id && <span className="muted small">You</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div></div>
        )}
      {d && <Pagination page={d.page} pages={d.pages} onChange={setPage} />}
    </>
  )
}
