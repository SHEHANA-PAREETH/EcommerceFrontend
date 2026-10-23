import { API } from './client'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const inrExact = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const money = (n) => inr.format(Number(n) || 0)
export const moneyExact = (n) => inrExact.format(Number(n) || 0)
export const compact = (n) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(n) || 0)

// a product picture is a full URL, or a path the API serves from /uploads
export const imageUrl = (path) => (!path ? '' : /^https?:\/\//.test(path) ? path : `${API}${path}`)

export const dateText = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) => (value ? new Date(value).toLocaleDateString('en-IN', options) : '')
export const dateTime = (value) => (value ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '')
export const shortId = (id) => String(id || '').slice(-8).toUpperCase()

export const discountOf = (product) => (product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0)

export const FREE_SHIPPING_FROM = 999
export const SHIPPING_FEE = 49
export const TAX_RATE = 0.18

// the same rule the server applies; the server's number is the one that is charged
export function summarize(items) {
  const itemsPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shippingPrice = itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100
  return { itemsPrice, shippingPrice, taxPrice, totalPrice: Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100 }
}
