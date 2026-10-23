import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addItem, toggleWish } from '../store'
import { discountOf } from '../api/format'
import { useUi } from '../context/Ui'
import Icon from './Icon'
import { Picture, Price, Stars } from './common'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { toast, openCart } = useUi()
  const wished = useSelector((state) => state.wishlist.ids.includes(product._id))
  const soldOut = product.countInStock <= 0
  const off = discountOf(product)
  const second = product.images?.[1]

  const add = () => {
    dispatch(addItem({ product, qty: 1 }))
    openCart()
  }
  const wish = () => {
    dispatch(toggleWish(product._id))
    toast(wished ? 'Removed from your wishlist' : 'Saved to your wishlist')
  }

  return (
    <article className="pcard">
      <div className="pcard-media">
        <Link to={`/product/${product._id}`} className="pcard-link" aria-label={product.name} tabIndex={-1}>
          <Picture src={product.image} />
          {second && <span className="pcard-alt"><Picture src={second} /></span>}
        </Link>
        {off > 0 && !soldOut && <span className="tag tag-deal">{off}% off</span>}
        {soldOut && <span className="tag tag-out">Sold out</span>}
        <button type="button" className={`wish ${wished ? 'on' : ''}`} onClick={wish} aria-pressed={wished} aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}>
          <Icon name="heart" size={18} fill={wished} />
        </button>
      </div>
      <div className="pcard-body">
        <span className="pcard-brand">{product.brand}</span>
        <h3 className="pcard-name"><Link to={`/product/${product._id}`}>{product.name}</Link></h3>
        <div className="pcard-rating">
          <Stars value={product.rating} size={14} label={false} />
          <span>{product.numReviews > 0 ? `(${product.numReviews})` : 'No reviews yet'}</span>
        </div>
        <Price product={product} />
        {!soldOut && product.countInStock <= 5 && <span className="low">Only {product.countInStock} left</span>}
        <button type="button" className="btn btn-soft btn-block" onClick={add} disabled={soldOut}>
          <Icon name="cart" size={18} /> {soldOut ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  )
}
