import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import client, { errorMessage } from '../api/client'
import { getConfig } from '../api/catalog'
import { money, moneyExact, summarize } from '../api/format'
import { clearCart, saveAddress } from '../store'
import { useUi } from '../context/Ui'
import { useFetch, useTitle } from '../hooks'
import Icon from '../components/Icon'
import { Breadcrumbs, Picture } from '../components/common'
import { OrderSummary } from './Cart'

const EMPTY = { fullName: '', phone: '', address: '', city: '', state: '', postalCode: '', country: 'India' }

function validate(form) {
  const errors = {}
  if (form.fullName.trim().length < 2) errors.fullName = 'Enter the name of the person receiving the order'
  if (!/^[0-9+()\-\s]{7,20}$/.test(form.phone.trim())) errors.phone = 'Enter a valid phone number'
  if (form.address.trim().length < 5) errors.address = 'Enter the street address'
  if (!form.city.trim()) errors.city = 'Enter your city'
  if (!form.state.trim()) errors.state = 'Enter your state'
  if (!/^[A-Za-z0-9\- ]{4,10}$/.test(form.postalCode.trim())) errors.postalCode = 'Enter a valid PIN or postal code'
  return errors
}

function Field({ label, name, form, errors, set, ...rest }) {
  return (
    <label className={`field ${errors[name] ? 'invalid' : ''}`}>
      <span>{label}</span>
      <input name={name} value={form[name]} onChange={(event) => set(name, event.target.value)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-err` : undefined} {...rest} />
      {errors[name] && <small id={`${name}-err`} className="field-error">{errors[name]}</small>}
    </label>
  )
}

export default function Checkout() {
  useTitle('Checkout')
  const items = useSelector((state) => state.cart.items)
  const user = useSelector((state) => state.auth.user)
  const saved = useSelector((state) => state.cart.address)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useUi()
  const config = useFetch(getConfig, [])
  const [form, setForm] = useState({ ...EMPTY, fullName: user?.username || '', ...(saved || {}) })
  const [method, setMethod] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  if (!items.length && !busy) return <Navigate to="/cart" replace />

  const cardReady = config.data?.card
  const payment = method || (cardReady ? 'stripe' : 'cod')
  const set = (name, value) => { setForm((f) => ({ ...f, [name]: value })); if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined })); setFormError('') }

  const place = async (event) => {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) {
      setFormError('Please fix the highlighted fields.')
      document.querySelector('.field.invalid input')?.focus()
      return
    }
    setFormError('')
    setBusy(true)
    try {
      dispatch(saveAddress(form))
      const { data: order } = await client.post('/orders', {
        orderItems: items.map((item) => ({ product: item._id, qty: item.qty })),
        shippingAddress: form,
        paymentMethod: payment,
      })
      dispatch(clearCart())
      if (payment === 'stripe') {
        try {
          const { data } = await client.post(`/orders/${order._id}/checkout`)
          window.location.assign(data.url)
          return
        } catch (error) {
          // the order exists; the person can pay from the order page
          toast(errorMessage(error, 'We could not open the payment page'), 'error')
        }
      }
      navigate(`/order/${order._id}?placed=1`, { replace: true })
    } catch (error) {
      setFormError(errorMessage(error))
      setBusy(false)
    }
  }

  const totals = summarize(items)

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="page-title">Checkout</h1>
      <form className="cart-layout" onSubmit={place} noValidate>
        <div className="checkout-steps">
          <section className="panel">
            <h2><span className="step">1</span> Delivery address</h2>
            <div className="form-grid">
              <Field label="Full name" name="fullName" form={form} errors={errors} set={set} autoComplete="name" />
              <Field label="Phone number" name="phone" form={form} errors={errors} set={set} type="tel" autoComplete="tel" inputMode="tel" />
              <div className="span-2"><Field label="Address" name="address" form={form} errors={errors} set={set} autoComplete="street-address" placeholder="House no., street, area" /></div>
              <Field label="City" name="city" form={form} errors={errors} set={set} autoComplete="address-level2" />
              <Field label="State" name="state" form={form} errors={errors} set={set} autoComplete="address-level1" />
              <Field label="PIN / postal code" name="postalCode" form={form} errors={errors} set={set} autoComplete="postal-code" inputMode="numeric" />
              <Field label="Country" name="country" form={form} errors={errors} set={set} autoComplete="country-name" />
            </div>
          </section>

          <section className="panel">
            <h2><span className="step">2</span> Payment method</h2>
            <div className="pay-options" role="radiogroup" aria-label="Payment method">
              <label className={`pay ${payment === 'stripe' ? 'on' : ''} ${!cardReady ? 'disabled' : ''}`}>
                <input type="radio" name="pay" value="stripe" checked={payment === 'stripe'} disabled={!cardReady} onChange={() => setMethod('stripe')} />
                <Icon name="card" size={24} />
                <span><strong>Credit or debit card</strong><small>{cardReady ? 'Pay securely with Stripe' : 'Not available right now'}</small></span>
              </label>
              <label className={`pay ${payment === 'cod' ? 'on' : ''}`}>
                <input type="radio" name="pay" value="cod" checked={payment === 'cod'} onChange={() => setMethod('cod')} />
                <Icon name="cash" size={24} />
                <span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span>
              </label>
            </div>
            {payment === 'stripe' && <p className="hint"><Icon name="lock" size={14} /> You'll be taken to Stripe's secure page to enter your card. For testing use card 4242 4242 4242 4242, any future date and any CVC.</p>}
          </section>

          <section className="panel">
            <h2><span className="step">3</span> Review items</h2>
            <ul className="review-items">
              {items.map((item) => (
                <li key={item._id}><span className="ri-img"><Picture src={item.image} /></span><span className="ri-name">{item.name}<small>Qty {item.qty}</small></span><strong>{money(item.price * item.qty)}</strong></li>
              ))}
            </ul>
            <Link to="/cart" className="link-arrow"><Icon name="chevron-left" size={16} /> Edit cart</Link>
          </section>
        </div>

        <OrderSummary items={items}>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? 'Placing your order…' : payment === 'stripe' ? `Pay ${moneyExact(totals.totalPrice)}` : 'Place order'}
          </button>
          <p className="secure"><Icon name="lock" size={14} /> Your payment details are never stored on our servers.</p>
        </OrderSummary>
      </form>
    </div>
  )
}
