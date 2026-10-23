import { Link } from 'react-router-dom'
import { discountOf, imageUrl, money } from '../api/format'
import Icon from './Icon'

export function Stars({ value = 0, size = 16, label = true }) {
  const rounded = Math.round(value)
  return (
    <span className="stars" role="img" aria-label={`Rated ${value || 0} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`star ${rounded >= n ? 'full' : ''}`}>
          <Icon name="star" size={size} fill strokeWidth={1.2} />
        </span>
      ))}
      {label && <span className="stars-num">{value ? Number(value).toFixed(1) : 'New'}</span>}
    </span>
  )
}

export function Price({ product, large = false }) {
  const off = discountOf(product)
  return (
    <span className={`price ${large ? 'large' : ''}`}>
      <strong>{money(product.price)}</strong>
      {off > 0 && (<><s>{money(product.mrp)}</s><em>{off}% off</em></>)}
    </span>
  )
}

// a product picture that never leaves a broken-image icon
export function Picture({ src, alt = '', ratio = '1 / 1', ...rest }) {
  return (
    <span className="picture" style={{ aspectRatio: ratio }}>
      {src ? <img src={imageUrl(src)} alt={alt} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.visibility = 'hidden' }} {...rest} /> : <Icon name="image" size={32} />}
    </span>
  )
}

export function Skeleton({ className = '', style }) {
  return <span className={`skeleton ${className}`} style={style} aria-hidden="true" />
}

export function ProductSkeletons({ count = 8 }) {
  return Array.from({ length: count }, (_, n) => (
    <div key={n} className="pcard" aria-hidden="true">
      <Skeleton style={{ aspectRatio: '1 / 1', borderRadius: 14 }} />
      <Skeleton style={{ height: 14, width: '40%', marginTop: 14 }} />
      <Skeleton style={{ height: 16, width: '90%', marginTop: 8 }} />
      <Skeleton style={{ height: 18, width: '55%', marginTop: 12 }} />
    </div>
  ))
}

export function Empty({ icon = 'package', title, children, action }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon name={icon} size={34} /></span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="empty">
      <span className="empty-icon bad"><Icon name="alert" size={34} /></span>
      <h2>We couldn't load this</h2>
      <p>{message}</p>
      {onRetry && <button type="button" className="btn btn-primary" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.label} className="crumb">
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          {index < items.length - 1 && <Icon name="chevron-right" size={14} />}
        </span>
      ))}
    </nav>
  )
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  const shown = [...new Set([1, 2, page - 1, page, page + 1, pages - 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
  const items = []
  shown.forEach((n, i) => { if (i && n - shown[i - 1] > 1) items.push('gap-' + n); items.push(n) })
  return (
    <nav className="pager" aria-label="Pages">
      <button type="button" className="pager-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><Icon name="chevron-left" size={18} /></button>
      {items.map((item) => (typeof item === 'string'
        ? <span key={item} className="pager-gap">…</span>
        : <button key={item} type="button" className={`pager-btn ${item === page ? 'on' : ''}`} aria-current={item === page ? 'page' : undefined} onClick={() => onChange(item)}>{item}</button>))}
      <button type="button" className="pager-btn" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><Icon name="chevron-right" size={18} /></button>
    </nav>
  )
}

export function QtyStepper({ value, max = 10, onChange, label = 'Quantity' }) {
  const limit = Math.min(10, max)
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity"><Icon name="minus" size={16} /></button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= limit} aria-label="Increase quantity"><Icon name="plus" size={16} /></button>
    </div>
  )
}

export const STATUS_LABEL = { processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }
export const StatusBadge = ({ status }) => <span className={`badge badge-${status}`}>{STATUS_LABEL[status] || status}</span>

export function Spinner({ label = 'Loading' }) {
  return <span className="spinner" role="status" aria-label={label} />
}
