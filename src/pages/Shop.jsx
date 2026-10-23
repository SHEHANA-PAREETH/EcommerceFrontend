import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import client, { errorMessage } from '../api/client'
import { getCategories } from '../api/catalog'
import { money } from '../api/format'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import { Breadcrumbs, Empty, ErrorBox, Pagination, ProductSkeletons, Stars } from '../components/common'
import { useFetch, useTitle } from '../hooks'

const SORTS = [['new', 'Newest'], ['popular', 'Best selling'], ['rating', 'Top rated'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low']]
const PAGE = 12

function Filters({ params, set, facets, categories, onClear, hasFilters, title = true }) {
  const selectedBrands = (params.get('brand') || '').split(',').filter(Boolean)
  const [min, setMin] = useState(params.get('minPrice') || '')
  const [max, setMax] = useState(params.get('maxPrice') || '')
  useEffect(() => { setMin(params.get('minPrice') || ''); setMax(params.get('maxPrice') || '') }, [params])

  const toggleBrand = (name) => {
    const next = selectedBrands.includes(name) ? selectedBrands.filter((b) => b !== name) : [...selectedBrands, name]
    set({ brand: next.join(',') })
  }
  const applyPrice = (event) => { event.preventDefault(); set({ minPrice: min, maxPrice: max }) }

  return (
    <div className="filters">
      <div className="filter-head">{title ? <h2>Filters</h2> : <span />}{hasFilters && <button type="button" className="link-btn" onClick={onClear}>Clear all</button>}</div>

      <fieldset className="filter">
        <legend>Category</legend>
        <ul className="radio-list">
          <li><label><input type="radio" name="cat" checked={!params.get('category')} onChange={() => set({ category: '' })} /> <span>All categories</span></label></li>
          {(categories || []).map((category) => (
            <li key={category._id}><label><input type="radio" name="cat" checked={params.get('category') === category._id} onChange={() => set({ category: category._id })} /> <span>{category.name}</span><small>{category.count}</small></label></li>
          ))}
        </ul>
      </fieldset>

      {facets?.brands?.length > 0 && (
        <fieldset className="filter">
          <legend>Brand</legend>
          <ul className="check-list">
            {facets.brands.slice(0, 12).map((brand) => (
              <li key={brand.name}><label><input type="checkbox" checked={selectedBrands.includes(brand.name)} onChange={() => toggleBrand(brand.name)} /> <span>{brand.name}</span><small>{brand.count}</small></label></li>
            ))}
          </ul>
        </fieldset>
      )}

      <fieldset className="filter">
        <legend>Price</legend>
        <form className="price-range" onSubmit={applyPrice}>
          <label><span className="sr-only">Minimum price</span><input type="number" min="0" inputMode="numeric" placeholder={facets ? `₹${facets.minPrice}` : 'Min'} value={min} onChange={(e) => setMin(e.target.value)} /></label>
          <span aria-hidden="true">to</span>
          <label><span className="sr-only">Maximum price</span><input type="number" min="0" inputMode="numeric" placeholder={facets ? `₹${facets.maxPrice}` : 'Max'} value={max} onChange={(e) => setMax(e.target.value)} /></label>
          <button type="submit" className="btn btn-soft btn-sm">Go</button>
        </form>
      </fieldset>

      <fieldset className="filter">
        <legend>Customer rating</legend>
        <ul className="radio-list">
          {[4, 3, 2].map((n) => (
            <li key={n}><label><input type="radio" name="rating" checked={params.get('rating') === String(n)} onChange={() => set({ rating: String(n) })} /> <Stars value={n} size={15} label={false} /> <span>&amp; up</span></label></li>
          ))}
          {params.get('rating') && <li><button type="button" className="link-btn" onClick={() => set({ rating: '' })}>Any rating</button></li>}
        </ul>
      </fieldset>

      <fieldset className="filter">
        <legend>Availability</legend>
        <ul className="check-list">
          <li><label><input type="checkbox" checked={params.get('inStock') === '1'} onChange={(e) => set({ inStock: e.target.checked ? '1' : '' })} /> <span>In stock only</span></label></li>
          <li><label><input type="checkbox" checked={params.get('deals') === '1'} onChange={(e) => set({ deals: e.target.checked ? '1' : '' })} /> <span>On sale</span></label></li>
        </ul>
      </fieldset>
    </div>
  )
}

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [panel, setPanel] = useState(false)
  const categories = useFetch(getCategories, [])

  const page = Math.max(1, Number(params.get('page')) || 1)
  const sort = params.get('sort') || 'new'
  const q = params.get('q') || ''
  const categoryId = params.get('category') || ''
  const category = (categories.data || []).find((c) => c._id === categoryId)
  const key = params.toString()

  const query = useMemo(() => {
    const out = Object.fromEntries(params.entries())
    out.limit = PAGE
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const list = useFetch(() => client.get('/product', { params: query }).then((res) => res.data), [key])
  const facets = useFetch(() => client.get('/product/facets', { params: { category: categoryId || undefined, q: q || undefined } }).then((res) => res.data), [categoryId, q])

  const title = q ? `Results for “${q}”` : category ? category.name : params.get('deals') === '1' ? 'Deals' : 'All products'
  useTitle(title)

  // changing a filter goes back to page 1
  const set = (updates) => {
    const next = new URLSearchParams(params)
    Object.entries(updates).forEach(([k, v]) => { if (v) next.set(k, v); else next.delete(k) })
    if (!('page' in updates)) next.delete('page')
    setParams(next)
  }
  const clear = () => setParams(q ? { q } : {})
  const hasFilters = ['category', 'brand', 'minPrice', 'maxPrice', 'rating', 'inStock', 'deals'].some((k) => params.get(k))

  useEffect(() => {
    if (!panel) return undefined
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => { if (event.key === 'Escape') setPanel(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey) }
  }, [panel])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])

  const chips = []
  if (category) chips.push(['category', category.name])
  ;(params.get('brand') || '').split(',').filter(Boolean).forEach((b) => chips.push([`brand:${b}`, b]))
  if (params.get('minPrice') || params.get('maxPrice')) chips.push(['price', `${params.get('minPrice') ? money(params.get('minPrice')) : '₹0'} – ${params.get('maxPrice') ? money(params.get('maxPrice')) : 'any'}`])
  if (params.get('rating')) chips.push(['rating', `${params.get('rating')}★ & up`])
  if (params.get('inStock')) chips.push(['inStock', 'In stock'])
  if (params.get('deals')) chips.push(['deals', 'On sale'])
  const dropChip = (id) => {
    if (id.startsWith('brand:')) return set({ brand: (params.get('brand') || '').split(',').filter((b) => b && b !== id.slice(6)).join(',') })
    if (id === 'price') return set({ minPrice: '', maxPrice: '' })
    set({ [id]: '' })
  }

  const data = list.data
  const drawerFilters = <Filters params={params} set={set} facets={facets.data} categories={categories.data} onClear={clear} hasFilters={hasFilters} title={false} />
  const filters = <Filters params={params} set={set} facets={facets.data} categories={categories.data} onClear={clear} hasFilters={hasFilters} />

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: category ? 'Shop' : title, to: category ? '/shop' : undefined }, ...(category ? [{ label: category.name }] : [])]} />
      <div className="shop">
        <aside className="shop-side desktop-only" aria-label="Filters">{filters}</aside>

        <section className="shop-main" aria-live="polite">
          <div className="shop-top">
            <div>
              <h1>{title}</h1>
              <p className="muted">{data ? `${data.total} product${data.total === 1 ? '' : 's'}` : 'Loading…'}</p>
            </div>
            <div className="shop-tools">
              <button type="button" className="btn btn-ghost mobile-only" onClick={() => setPanel(true)}><Icon name="filter" size={18} /> Filters{hasFilters ? ' •' : ''}</button>
              <label className="select"><span className="sr-only">Sort by</span>
                <select value={sort} onChange={(e) => set({ sort: e.target.value === 'new' ? '' : e.target.value, page: '' })}>
                  {SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="chips">
              {chips.map(([id, label]) => <button key={id} type="button" className="chip on" onClick={() => dropChip(id)} aria-label={`Remove filter ${label}`}>{label} <Icon name="x" size={14} /></button>)}
              <button type="button" className="link-btn" onClick={clear}>Clear all</button>
            </div>
          )}

          {list.error && !data ? <ErrorBox message={errorMessage(list.error)} onRetry={list.retry} />
            : data && data.products.length === 0 ? (
              <Empty icon="search" title="No products found" action={hasFilters || q ? <button type="button" className="btn btn-primary" onClick={() => setParams({})}>Reset search and filters</button> : null}>
                Try a different keyword, or remove some filters.
              </Empty>
            ) : (
              <div className={`pgrid ${list.loading && data ? 'dim' : ''}`}>
                {!data ? <ProductSkeletons count={PAGE} /> : data.products.map((product) => <ProductCard key={product._id} product={product} />)}
              </div>
            )}

          {data && <Pagination page={data.page} pages={data.pages} onChange={(n) => set({ page: n > 1 ? String(n) : '' })} />}
        </section>
      </div>

      {panel && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setPanel(false) }}>
          <aside className="drawer left wide" role="dialog" aria-modal="true" aria-label="Filters">
            <div className="drawer-head"><h2>Filters</h2><button type="button" className="icon-btn" onClick={() => setPanel(false)} aria-label="Close filters"><Icon name="x" size={22} /></button></div>
            <div className="drawer-body">{drawerFilters}</div>
            <div className="drawer-foot"><button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => setPanel(false)}>Show {data ? data.total : ''} results</button></div>
          </aside>
        </div>
      )}
    </div>
  )
}
