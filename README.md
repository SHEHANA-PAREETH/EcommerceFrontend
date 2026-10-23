# Shopora storefront

React 18 + Vite + Redux Toolkit front end for the Shopora online store (shop, cart, checkout with Stripe or cash on delivery, accounts, wishlist, reviews) with a full admin area (dashboard, products, categories, orders, customers). Works from 320px phones to wide desktops, with a light and a dark theme.

## Run locally

```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm run dev              # http://localhost:3010
npm run build            # output in build/
```

Start the API first (see the backend repo). The API's `CLIENT_SITE_URL` must be this site's address (`http://localhost:3010`).

## Pages

`/` home, `/shop` (search, category, brand, price, rating, stock, sale filters; all in the URL), `/product/:id`, `/cart`, `/checkout`, `/orders`, `/order/:id`, `/wishlist`, `/account`, `/login`, `/register`, and `/admin/*` for admins.

## Deploy

Any static host: build command `npm run build`, publish directory `build`, rewrite `/*` to `/index.html` (included in `public/_redirects`). Set `VITE_API_URL` to your deployed API address before building.
