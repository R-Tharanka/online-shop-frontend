# Veloura Frontend

Customer-facing frontend for the Veloura online clothing store. Built with React, Vite, and Tailwind CSS.

## Tech Stack

- React 19 + React Router
- Vite 7 + SWC
- Tailwind CSS 4

## Features

- Product catalog and details
- Cart and checkout flow
- Order details view
- Contact us page
- Authentication (login, register, password reset)
- Admin dashboard for shop owners

## Routes

- `/products` - product list
- `/products/:id` - product details
- `/cart` - cart view
- `/checkout` - checkout (protected)
- `/order-details` - order history (protected)
- `/contact` - contact page
- `/auth/login` - login
- `/auth/register` - register
- `/auth/forgot` - request password reset
- `/auth/reset` - reset password
- `/account` - profile (protected)
- `/admin` - admin dashboard (role: `shop_owner`)

## Environment

API base URLs are configurable via Vite envs:

```
VITE_AUTH_API_BASE=http://localhost:5000/api/auth
VITE_ORDER_API_BASE=http://localhost:5001/api
VITE_PAYMENT_API_BASE=http://localhost:5003/api
```

If not set, the app defaults to localhost values shown above.

For hosted deployments (e.g. Vercel), set these in the Vercel project Environment Variables to point to your hosted services (Render URLs), typically ending with `/api`.

## Scripts

```
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview build output
npm run lint     # eslint
```

## Local Development

1. Install dependencies: `npm install`
2. Create `.env` with `VITE_AUTH_API_BASE` if needed
3. Start dev server: `npm run dev`

## Project Structure

- `src/Components/Auth` - auth provider, API helpers, storage
- `src/Components/Navigation` - top navigation
- `src/pages` - feature pages (auth, products, orders, admin, marketing)

