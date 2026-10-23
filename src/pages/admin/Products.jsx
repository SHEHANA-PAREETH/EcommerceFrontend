import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import client, { errorMessage } from '../../api/client'
import { getCategories } from '../../api/catalog'
import { imageUrl, money } from '../../api/format'
import { useUi } from '../../context/Ui'
import Icon from '../../components/Icon'
import { Empty, ErrorBox, Pagination, Picture, Skeleton } from '../../components/common'
import { useDebounce, useFetch, useTitle } from '../../hooks'

// ---------- list ----------
export function ProductList() {
  useTitle('Products · Admin')
  const [params, setParams] = useSearchParams()
  const { confirm, toast } = useUi()
  const [search, setSearch] = useState(params.get('q') || '')
  const debounced = useDebounce(search.trim(), 350)
  const categories = useFetch(getCategories, [])
  const page = Number(params.get('page')) || 1
  const category = params.get('category') || ''

  useEffect(() => {
    const next = new URLSearchParams(params)
    if (debounced) next.set('q', debounced); else next.delete('q')
    if (debounced !== (params.get('q') || '')) { next.delete('page'); setParams(next, { replace: true }) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const query = { q: params.get('q') || undefined, category: category || undefined, page, limit: 10, sort: 'new' }
  const list = useFetch(() => client.get('/product', { params: query }).then((res) => res.data), [params.toString()])
  const d = list.data

  const remove = async (product) => {
    if (!(await confirm({ title: `Delete “${product.name}”?`, message: 'The product will be removed from the store. Past orders keep their own copy of the details.', confirmLabel: 'Delete product', danger: true }))) return
    try { await client.delete(`/product/${product._id}`); toast('Product deleted'); list.retry() }
    catch (error) { toast(errorMessage(error), 'error') }
  }
  const setFilter = (name, value) => { const next = new URLSearchParams(params); if (value) next.set(name, value); else next.delete(name); next.delete('page'); setParams(next) }

  return (
    <>
      <div className="admin-title"><div><h1>Products</h1><p className="muted">{d ? `${d.total} in your catalogue` : 'Loading…'}</p></div><Link to="/admin/products/new" className="btn btn-primary"><Icon name="plus" size={18} /> Add product</Link></div>

      <div className="toolbar">
        <label className="field-inline"><Icon name="search" size={18} /><input type="search" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" /></label>
        <label className="select"><span className="sr-only">Category</span>
          <select value={category} onChange={(e) => setFilter('category', e.target.value)}>
            <option value="">All categories</option>
            {(categories.data || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </label>
      </div>

      {list.error && !d ? <ErrorBox message={errorMessage(list.error)} onRetry={list.retry} />
        : !d ? <Skeleton style={{ height: 420 }} />
        : d.products.length === 0 ? <Empty icon="package" title="No products found" action={<Link to="/admin/products/new" className="btn btn-primary">Add a product</Link>}>Try another search, or add your first product.</Empty>
        : (
          <div className="panel flush"><div className="table-wrap"><table className="table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {d.products.map((p) => (
                <tr key={p._id}>
                  <td data-label="Product"><div className="cell-product"><span className="thumb"><Picture src={p.image} /></span><div><Link to={`/admin/products/${p._id}`}>{p.name}</Link><small>{p.brand}</small></div></div></td>
                  <td data-label="Category">{p.category?.name || '–'}</td>
                  <td data-label="Price">{money(p.price)}{p.mrp > p.price && <small className="strike">{money(p.mrp)}</small>}</td>
                  <td data-label="Stock"><span className={`badge ${p.countInStock === 0 ? 'badge-cancelled' : p.countInStock <= 5 ? 'badge-processing' : 'badge-delivered'}`}>{p.countInStock === 0 ? 'Out of stock' : `${p.countInStock} in stock`}</span></td>
                  <td data-label="Rating">{p.numReviews ? `${p.rating.toFixed(1)} (${p.numReviews})` : '–'}</td>
                  <td className="actions">
                    <Link to={`/admin/products/${p._id}`} className="icon-btn" aria-label={`Edit ${p.name}`}><Icon name="edit" size={18} /></Link>
                    <button type="button" className="icon-btn danger" onClick={() => remove(p)} aria-label={`Delete ${p.name}`}><Icon name="trash" size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div></div>
        )}
      {d && <Pagination page={d.page} pages={d.pages} onChange={(n) => setFilter('page', n > 1 ? String(n) : '')} />}
    </>
  )
}

// ---------- create / edit ----------
const BLANK = { name: '', brand: '', category: '', price: '', mrp: '', countInStock: '', description: '' }

export function ProductForm() {
  const { id } = useParams()
  const editing = Boolean(id && id !== 'new')
  useTitle(editing ? 'Edit product · Admin' : 'New product · Admin')
  const navigate = useNavigate()
  const { toast } = useUi()
  const fileInput = useRef(null)
  const categories = useFetch(getCategories, [])
  const existing = useFetch(() => (editing ? client.get(`/product/${id}`).then((res) => res.data) : Promise.resolve(null)), [id])
  const [form, setForm] = useState(BLANK)
  const [kept, setKept] = useState([])
  const [added, setAdded] = useState([])
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const p = existing.data
    if (!p) return
    setForm({ name: p.name, brand: p.brand, category: p.category?._id || '', price: String(p.price), mrp: p.mrp ? String(p.mrp) : '', countInStock: String(p.countInStock), description: p.description })
    setKept(p.images?.length ? p.images : [p.image])
  }, [existing.data])

  const previews = useMemo(() => added.map((file) => ({ file, url: URL.createObjectURL(file) })), [added])
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews])

  const set = (name) => (event) => { setForm((f) => ({ ...f, [name]: event.target.value })); setErrors((e) => ({ ...e, [name]: undefined })) }
  const total = kept.length + added.length

  const pick = (event) => {
    const files = [...event.target.files]
    event.target.value = ''
    const bad = files.find((f) => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 4 * 1024 * 1024)
    if (bad) return toast(`“${bad.name}” isn't allowed. Use a JPG, PNG or WebP under 4 MB.`, 'error')
    if (total + files.length > 5) return toast('A product can have up to 5 pictures', 'error')
    setAdded((list) => [...list, ...files])
  }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 3) e.name = 'Enter the product name'
    if (!form.brand.trim()) e.brand = 'Enter the brand'
    if (!form.category) e.category = 'Choose a category'
    if (form.price === '' || Number(form.price) < 0) e.price = 'Enter a price'
    if (form.mrp !== '' && Number(form.mrp) <= Number(form.price)) e.mrp = 'The original price should be higher than the selling price'
    if (form.countInStock === '' || Number(form.countInStock) < 0 || !Number.isInteger(Number(form.countInStock))) e.countInStock = 'Enter the stock as a whole number'
    if (form.description.trim().length < 10) e.description = 'Write a short description (at least 10 characters)'
    if (total === 0) e.images = 'Add at least one picture'
    return e
  }

  const submit = async (event) => {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) { setError('Please fix the highlighted fields.'); return }
    setError(''); setBusy(true)
    try {
      const body = new FormData()
      Object.entries(form).forEach(([key, value]) => body.append(key, String(value).trim()))
      if (editing) body.append('keep', JSON.stringify(kept))
      added.forEach((file) => body.append('images', file))
      await (editing ? client.put(`/product/${id}`, body) : client.post('/product', body))
      toast(editing ? 'Product updated' : 'Product created')
      navigate('/admin/products')
    } catch (e) { setError(errorMessage(e)); setBusy(false) }
  }

  if (editing && existing.error) return <ErrorBox message={errorMessage(existing.error)} onRetry={existing.retry} />
  if (editing && !existing.data) return <Skeleton style={{ height: 480 }} />

  const err = (name) => errors[name] && <small className="field-error">{errors[name]}</small>
  return (
    <>
      <div className="admin-title"><div><h1>{editing ? 'Edit product' : 'New product'}</h1><p className="muted">{editing ? form.name : 'Add something new to your catalogue'}</p></div><Link to="/admin/products" className="btn btn-ghost">Cancel</Link></div>
      <form className="admin-grid" onSubmit={submit} noValidate>
        <div className="panel span-2">
          <h2>Details</h2>
          <div className="form-grid">
            <label className={`field span-2 ${errors.name ? 'invalid' : ''}`}><span>Product name</span><input value={form.name} onChange={set('name')} maxLength={160} />{err('name')}</label>
            <label className={`field ${errors.brand ? 'invalid' : ''}`}><span>Brand</span><input value={form.brand} onChange={set('brand')} maxLength={60} />{err('brand')}</label>
            <label className={`field ${errors.category ? 'invalid' : ''}`}><span>Category</span>
              <select value={form.category} onChange={set('category')}><option value="">Choose…</option>{(categories.data || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>{err('category')}
            </label>
            <label className={`field ${errors.price ? 'invalid' : ''}`}><span>Selling price (₹)</span><input type="number" min="0" step="1" inputMode="decimal" value={form.price} onChange={set('price')} />{err('price')}</label>
            <label className={`field ${errors.mrp ? 'invalid' : ''}`}><span>Original price (₹) <small>optional, shown struck through</small></span><input type="number" min="0" step="1" inputMode="decimal" value={form.mrp} onChange={set('mrp')} />{err('mrp')}</label>
            <label className={`field ${errors.countInStock ? 'invalid' : ''}`}><span>Stock</span><input type="number" min="0" step="1" inputMode="numeric" value={form.countInStock} onChange={set('countInStock')} />{err('countInStock')}</label>
            <label className={`field span-2 ${errors.description ? 'invalid' : ''}`}><span>Description</span><textarea rows={6} maxLength={4000} value={form.description} onChange={set('description')} />{err('description')}</label>
          </div>
        </div>

        <div className="panel">
          <h2>Pictures <small className="muted">({total}/5)</small></h2>
          <p className="muted small">The first picture is the main one. JPG, PNG or WebP, up to 4 MB each.</p>
          <ul className="uploads">
            {kept.map((src, i) => (
              <li key={src}><img src={imageUrl(src)} alt="" />{i === 0 && <span className="main-flag">Main</span>}<button type="button" className="icon-btn" onClick={() => setKept((k) => k.filter((s) => s !== src))} aria-label="Remove picture"><Icon name="x" size={16} /></button></li>
            ))}
            {previews.map((p, i) => (
              <li key={p.url}><img src={p.url} alt="" />{!kept.length && i === 0 && <span className="main-flag">Main</span>}<button type="button" className="icon-btn" onClick={() => setAdded((list) => list.filter((f) => f !== p.file))} aria-label="Remove picture"><Icon name="x" size={16} /></button></li>
            ))}
            {total < 5 && <li><button type="button" className="upload-add" onClick={() => fileInput.current?.click()}><Icon name="upload" size={22} /><span>Add</span></button></li>}
          </ul>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={pick} />
          {errors.images && <small className="field-error">{errors.images}</small>}
        </div>

        <div className="panel span-3 form-actions">
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create product'}</button>
        </div>
      </form>
    </>
  )
}

