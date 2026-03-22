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

## Related Repositories
- Frontend (this repo): https://github.com/R-Tharanka/online-shop-frontend.git
- Auth service: https://github.com/R-Tharanka/online-clothing-auth-service.git
- Product service: https://github.com/navogamage/Veloura-Product-Service-CTSE-Assignment01.git
- Order service: https://github.com/GunathungaPCI/Veloura-Order-Service-Y4S1-SE-CTSE-Assignment.git
- Payment + contact service: https://github.com/SHAKIR2001/veloura_payment_contactUs-backend.git

## Deployed URLs
- Frontend: https://online-shop-frontend-alpha.vercel.app/
- Auth service: https://online-clothing-auth-service-production.up.railway.app/
- Product service: https://veloura-product-service-ctse-assignment01-production.up.railway.app/
- Order service: https://veloura-order-service-y4s1-se-ctse-assignment-production.up.railway.app/
- Payment service: https://veloura-payment-services.onrender.com/

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
The API base URLs are configurable via Vite envs:

```
VITE_AUTH_API_BASE=http://localhost:5000/api/auth
VITE_PRODUCT_API_BASE=http://localhost:5002/api/products
VITE_ORDER_API_BASE=http://localhost:5001/api
VITE_PAYMENT_API_BASE=http://localhost:5003/api
VITE_CONTACT_API_BASE=http://localhost:3002/api/contact
```

If not set, the app uses the defaults above. For deployed environments, point these to your hosted services (for example, the Auth base would be https://online-clothing-auth-service-production.up.railway.app/api/auth).

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

