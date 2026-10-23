import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import client, { errorMessage } from '../api/client'
import { dateText, discountOf, imageUrl, money } from '../api/format'
import { addItem, toggleWish } from '../store'
import { useUi } from '../context/Ui'
import { useFetch, useTitle } from '../hooks'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import { Breadcrumbs, ErrorBox, Price, QtyStepper, Skeleton, Stars } from '../components/common'

const deliveryRange = () => {
  const day = (n) => dateText(new Date(Date.now() + n * 86400000), { weekday: 'short', day: 'numeric', month: 'short' })
  return `${day(3)} – ${day(7)}`
}

function Gallery({ product }) {
  const [broken, setBroken] = useState([])
  const all = [...new Set(product.images?.length ? product.images : [product.image])]
  // a picture that fails to load is dropped, so there are no empty thumbnails
  const pictures = all.filter((src) => !broken.includes(src))
  const [index, setIndex] = useState(0)
  useEffect(() => { setIndex(0); setBroken([]) }, [product._id])
  const drop = (src) => setBroken((list) => (list.includes(src) ? list : [...list, src]))
  useEffect(() => { if (index >= pictures.length) setIndex(0) }, [index, pictures.length])
  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={imageUrl(pictures[index])} alt={product.name} onError={() => drop(pictures[index])} />
        {discountOf(product) > 0 && <span className="tag tag-deal">{discountOf(product)}% off</span>}
      </div>
      {pictures.length > 1 && (
        <div className="gallery-thumbs" role="group" aria-label="Product pictures">
          {pictures.map((src, n) => (
            <button key={src} type="button" className={n === index ? 'on' : ''} onClick={() => setIndex(n)} aria-label={`Show picture ${n + 1}`} aria-current={n === index}>
              <img src={imageUrl(src)} alt="" loading="lazy" onError={() => drop(src)} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewForm({ product, onDone }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useUi()

  const submit = async (event) => {
    event.preventDefault()
    if (!rating) return setError('Please choose a star rating')
    setBusy(true); setError('')
    try {
      await client.post(`/product/${product._id}/reviews`, { rating, comment })
      toast('Thanks for your review!')
      onDone()
    } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  return (
    <form className="review-form" onSubmit={submit} noValidate>
      <h3>Write a review</h3>
      <div className="star-input" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} className={(hover || rating) >= n ? 'on' : ''}
            onClick={() => setRating(n)} onMouseEnter={() => setHover(n)}><Icon name="star" size={28} fill strokeWidth={1.2} /></button>
        ))}
      </div>
      <label className="field"><span>Your review</span>
        <textarea rows={4} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you like or dislike? How is the quality?" required />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Posting…' : 'Post review'}</button>
    </form>
  )
}

function Reviews({ product, reload }) {
  const user = useSelector((state) => state.auth.user)
  const counts = [5, 4, 3, 2, 1].map((n) => product.reviews.filter((r) => r.rating === n).length)
  const mine = user && product.reviews.some((r) => r.user === user._id)
  return (
    <div className="reviews" id="reviews">
      <div className="review-summary">
        <div className="review-score"><strong>{product.numReviews ? product.rating.toFixed(1) : '–'}</strong><Stars value={product.rating} label={false} size={20} /><small>{product.numReviews} review{product.numReviews === 1 ? '' : 's'}</small></div>
        <ul className="review-bars">
          {[5, 4, 3, 2, 1].map((n, i) => (
            <li key={n}><span>{n} star</span><span className="bar"><span style={{ width: `${product.numReviews ? (counts[i] / product.numReviews) * 100 : 0}%` }} /></span><span>{counts[i]}</span></li>
          ))}
        </ul>
      </div>
      <div className="review-list">
        {product.reviews.length === 0 && <p className="muted">No reviews yet. Be the first to share your thoughts.</p>}
        {[...product.reviews].reverse().map((review) => (
          <article key={review._id} className="review">
            <header><span className="avatar">{review.name.slice(0, 1).toUpperCase()}</span><div><strong>{review.name}</strong><small>{dateText(review.createdAt)}{review.verified && <span className="verified"><Icon name="check-circle" size={14} /> Verified purchase</span>}</small></div></header>
            <Stars value={review.rating} label={false} size={15} />
            <p>{review.comment}</p>
          </article>
        ))}
        <div className="review-compose">
          {!user ? <p><Link to={`/login?next=${encodeURIComponent(window.location.pathname)}`}>Sign in</Link> to write a review.</p>
            : mine ? <p className="muted">You've already reviewed this product. Thank you!</p>
            : <ReviewForm product={product} onDone={reload} />}
        </div>
      </div>
    </div>
  )
}

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { toast, openCart } = useUi()
  const user = useSelector((state) => state.auth.user)
  const wished = useSelector((state) => state.wishlist.ids.includes(id))
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('details')

  const product = useFetch(() => client.get(`/product/${id}`).then((res) => res.data), [id])
  const related = useFetch(() => client.get(`/product/${id}/related`).then((res) => res.data), [id])
  const p = product.data
  useTitle(p?.name)
  useEffect(() => { setQty(1); setTab('details') }, [id])

  if (product.loading && !p) {
    return (
      <div className="container page pdp">
        <Skeleton style={{ aspectRatio: '1 / 1', borderRadius: 20 }} />
        <div><Skeleton style={{ height: 18, width: '30%' }} /><Skeleton style={{ height: 34, width: '85%', marginTop: 14 }} /><Skeleton style={{ height: 24, width: '40%', marginTop: 18 }} /><Skeleton style={{ height: 120, marginTop: 22 }} /></div>
      </div>
    )
  }
  if (product.error) {
    const missing = product.error?.response?.status === 404 || product.error?.response?.status === 400
    return <div className="container page"><ErrorBox message={missing ? "This product doesn't exist or is no longer available." : errorMessage(product.error)} onRetry={missing ? undefined : product.retry} /></div>
  }

  const soldOut = p.countInStock <= 0
  const add = () => { dispatch(addItem({ product: p, qty })); openCart() }
  const buyNow = () => { dispatch(addItem({ product: p, qty })); navigate(user ? '/checkout' : '/login?next=/checkout') }
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: p.name, url: window.location.href })
      else { await navigator.clipboard.writeText(window.location.href); toast('Link copied') }
    } catch (e) { if (e?.name !== 'AbortError') toast("Couldn't copy the link", 'error') }
  }
  const wish = () => { dispatch(toggleWish(p._id)); toast(wished ? 'Removed from your wishlist' : 'Saved to your wishlist') }

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, ...(p.category ? [{ label: p.category.name, to: `/shop?category=${p.category._id}` }] : []), { label: p.name }]} />
      <div className="pdp">
        <Gallery product={p} />

        <div className="pdp-info">
          <Link to={`/shop?brand=${encodeURIComponent(p.brand)}`} className="pdp-brand">{p.brand}</Link>
          <h1>{p.name}</h1>
          <a href="#reviews" className="pdp-rating" onClick={() => setTab('reviews')}><Stars value={p.rating} /><span>{p.numReviews} review{p.numReviews === 1 ? '' : 's'}</span></a>
          <Price product={p} large />
          <p className="muted small">Inclusive of all taxes except GST (18%), added at checkout.</p>

          <p className={`stock ${soldOut ? 'out' : p.countInStock <= 5 ? 'low' : 'in'}`}>
            <Icon name={soldOut ? 'alert' : 'check-circle'} size={18} />
            {soldOut ? 'Currently out of stock' : p.countInStock <= 5 ? `Hurry, only ${p.countInStock} left in stock` : 'In stock'}
          </p>

          <p className="pdp-lead">{p.description.length > 220 ? `${p.description.slice(0, 220)}…` : p.description}</p>

          {!soldOut && (
            <div className="buy-box">
              <QtyStepper value={qty} max={p.countInStock} onChange={setQty} />
              <button type="button" className="btn btn-primary btn-lg" onClick={add}><Icon name="cart" size={20} /> Add to cart</button>
              <button type="button" className="btn btn-dark btn-lg" onClick={buyNow}>Buy now</button>
            </div>
          )}
          <div className="pdp-actions">
            <button type="button" className={`link-btn ${wished ? 'on' : ''}`} onClick={wish} aria-pressed={wished}><Icon name="heart" size={18} fill={wished} /> {wished ? 'Saved to wishlist' : 'Save to wishlist'}</button>
            <button type="button" className="link-btn" onClick={share}><Icon name="share" size={18} /> Share</button>
          </div>

          <ul className="assure">
            <li><Icon name="truck" size={20} /><div><strong>Delivery by {deliveryRange()}</strong><small>Free on orders over ₹999</small></div></li>
            <li><Icon name="return" size={20} /><div><strong>7-day easy returns</strong><small>If it isn't right, send it back</small></div></li>
            <li><Icon name="shield" size={20} /><div><strong>Secure checkout</strong><small>Pay by card or cash on delivery</small></div></li>
          </ul>
        </div>
      </div>

      <section className="tabs-block">
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'details'} className={tab === 'details' ? 'on' : ''} onClick={() => setTab('details')}>Details</button>
          <button type="button" role="tab" aria-selected={tab === 'reviews'} className={tab === 'reviews' ? 'on' : ''} onClick={() => setTab('reviews')}>Reviews ({p.numReviews})</button>
        </div>
        {tab === 'details' ? (
          <div className="tab-panel prose" role="tabpanel">
            <p>{p.description}</p>
            <dl className="specs">
              <dt>Brand</dt><dd>{p.brand}</dd>
              {p.category && <><dt>Category</dt><dd><Link to={`/shop?category=${p.category._id}`}>{p.category.name}</Link></dd></>}
              <dt>Availability</dt><dd>{soldOut ? 'Out of stock' : `${p.countInStock} in stock`}</dd>
              <dt>Listed</dt><dd>{dateText(p.createdAt)}</dd>
            </dl>
          </div>
        ) : (
          <div className="tab-panel" role="tabpanel"><Reviews product={p} reload={product.retry} /></div>
        )}
      </section>

      {related.data?.length > 0 && (
        <section className="section">
          <div className="section-head"><div><h2>You may also like</h2></div></div>
          <div className="shelf">{related.data.map((item) => <ProductCard key={item._id} product={item} />)}</div>
        </section>
      )}

      {!soldOut && (
        <div className="sticky-buy" aria-hidden={false}>
          <div><strong>{money(p.price)}</strong>{discountOf(p) > 0 && <s>{money(p.mrp)}</s>}</div>
          <button type="button" className="btn btn-primary" onClick={add}><Icon name="cart" size={18} /> Add to cart</button>
        </div>
      )}
    </div>
  )
}
