import { Link } from 'react-router-dom'
import { getCategories } from '../api/catalog'
import { useFetch } from '../hooks'
import { Logo } from './Header'
import Icon from './Icon'

export default function Footer() {
  const categories = useFetch(getCategories, [])
  return (
    <footer className="footer">
      <div className="container perks">
        {[['truck', 'Free shipping', 'On orders over ₹999'], ['return', 'Easy returns', '7-day hassle-free returns'], ['shield', 'Secure payments', 'Cards via Stripe, or pay on delivery'], ['clock', 'Quick dispatch', 'Orders ship within 24 hours']].map(([icon, title, text]) => (
          <div key={title} className="perk"><span className="perk-icon"><Icon name={icon} size={22} /></span><div><strong>{title}</strong><small>{text}</small></div></div>
        ))}
      </div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Everything you need, delivered to your door. Electronics, fashion, home and more.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <ul>
            <li><Link to="/shop?deals=1">Today's deals</Link></li>
            <li><Link to="/shop">All products</Link></li>
            {(categories.data || []).slice(0, 5).map((category) => <li key={category._id}><Link to={`/shop?category=${category._id}`}>{category.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3>Account</h3>
          <ul>
            <li><Link to="/orders">My orders</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/account">Account settings</Link></li>
          </ul>
        </div>
        <div>
          <h3>Help</h3>
          <ul className="footer-info">
            <li><Icon name="truck" size={16} /> Delivery in 3 to 7 days</li>
            <li><Icon name="return" size={16} /> Returns within 7 days</li>
            <li><Icon name="lock" size={16} /> Your details stay private</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Shopora. A demo store: no real orders are shipped.</span>
        <span>Prices include applicable taxes at checkout (GST 18%).</span>
      </div>
    </footer>
  )
}
