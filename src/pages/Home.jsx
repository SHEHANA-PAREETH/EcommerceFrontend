import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client, { errorMessage } from '../api/client'
import { getCategories } from '../api/catalog'
import { discountOf, imageUrl } from '../api/format'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import { ErrorBox, ProductSkeletons } from '../components/common'
import { useFetch, useTitle } from '../hooks'

const SLIDE_MS = 6500

function Hero({ feed }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const maxOff = Math.max(0, ...(feed?.deals || []).map(discountOf))
  const slides = [
    feed?.deals?.[0] && { tone: 'violet', eyebrow: 'Limited-time offers', title: maxOff ? `Save up to ${maxOff}% today` : 'Today’s best deals', text: 'Hand-picked markdowns on electronics, fashion and home.', cta: 'Shop deals', to: '/shop?deals=1', product: feed.deals[0] },
    feed?.new?.[0] && { tone: 'ocean', eyebrow: 'Just landed', title: 'New arrivals are here', text: 'Be the first to explore what’s fresh this week.', cta: 'See what’s new', to: '/shop?sort=new', product: feed.new[0] },
    feed?.top?.[0] && { tone: 'sunset', eyebrow: 'Loved by shoppers', title: 'Top-rated picks', text: 'Highest reviewed products, chosen by real customers.', cta: 'Explore top rated', to: '/shop?sort=rating', product: feed.top[0] },
  ].filter(Boolean)

  useEffect(() => {
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (paused || calm || slides.length < 2) return undefined
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS)
    return () => clearTimeout(timer)
  }, [paused, index, slides.length])

  if (!slides.length) return <div className="hero-slide tone-violet skeleton-hero" aria-busy="true" />
  const slide = slides[index % slides.length]

  return (
    <section className={`hero-slide tone-${slide.tone}`} aria-roledescription="carousel" aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="hero-copy" key={index}>
        <span className="eyebrow">{slide.eyebrow}</span>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>
        <div className="hero-cta">
          <Link to={slide.to} className="btn btn-light btn-lg">{slide.cta} <Icon name="arrow-right" size={18} /></Link>
          <Link to={`/product/${slide.product._id}`} className="btn btn-outline-light btn-lg">View {slide.product.brand}</Link>
        </div>
      </div>
      <Link to={`/product/${slide.product._id}`} className="hero-art" key={`art-${index}`} aria-label={slide.product.name} tabIndex={-1}>
        <img src={imageUrl(slide.product.image)} alt="" fetchpriority="high" />
      </Link>
      <div className="hero-dots" role="group" aria-label="Choose a slide">
        {slides.map((s, n) => <button key={s.title} type="button" className={`dot ${n === index ? 'on' : ''}`} onClick={() => setIndex(n)} aria-label={`Slide ${n + 1}: ${s.title}`} aria-current={n === index} />)}
      </div>
    </section>
  )
}

function Shelf({ title, subtitle, to, products, loading }) {
  return (
    <section className="section container">
      <div className="section-head">
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        {to && <Link to={to} className="link-arrow">View all <Icon name="arrow-right" size={16} /></Link>}
      </div>
      <div className="shelf">
        {loading ? <ProductSkeletons count={5} /> : products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </section>
  )
}

export default function Home() {
  useTitle('')
  const feed = useFetch(() => client.get('/product/home').then((res) => res.data), [])
  const categories = useFetch(getCategories, [])

  useEffect(() => { document.title = 'Shopora: Shop electronics, fashion, home & more' }, [])

  if (feed.error && !feed.data) {
    return <div className="container"><ErrorBox message={errorMessage(feed.error)} onRetry={feed.retry} /></div>
  }
  const data = feed.data

  return (
    <>
      <div className="container hero-wrap"><Hero feed={data} /></div>

      <section className="section container">
        <div className="section-head"><div><h2>Shop by category</h2><p>Find what you're looking for faster</p></div></div>
        <div className="cat-grid">
          {(categories.data || Array.from({ length: 8 })).slice(0, 12).map((category, i) => (
            category
              ? <Link key={category._id} to={`/shop?category=${category._id}`} className="cat-tile">
                  <span className="cat-tile-img">{category.image && <img src={imageUrl(category.image)} alt="" loading="lazy" />}</span>
                  <strong>{category.name}</strong><small>{category.count} products</small>
                </Link>
              : <span key={i} className="cat-tile skeleton" style={{ height: 150 }} aria-hidden="true" />
          ))}
        </div>
      </section>

      <Shelf title="Deals of the day" subtitle="The biggest price drops right now" to="/shop?deals=1" products={data?.deals || []} loading={!data} />

      <section className="container">
        <div className="promo">
          <div><span className="eyebrow">Free delivery</span><h2>Spend ₹999, ship for ₹0</h2><p>Add a little more to your cart and we cover the delivery. Pay by card or cash on delivery.</p></div>
          <Link to="/shop" className="btn btn-light btn-lg">Start shopping <Icon name="arrow-right" size={18} /></Link>
        </div>
      </section>

      <Shelf title="New arrivals" subtitle="Fresh in our store" to="/shop?sort=new" products={data?.new || []} loading={!data} />
      <Shelf title="Best sellers" subtitle="What everyone is buying" to="/shop?sort=popular" products={data?.popular || []} loading={!data} />
      <Shelf title="Top rated" subtitle="Loved by our customers" to="/shop?sort=rating" products={data?.top || []} loading={!data} />
    </>
  )
}
