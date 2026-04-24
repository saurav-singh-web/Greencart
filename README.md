# GreenCart

GreenCart is a full-stack grocery e-commerce application with a customer storefront, seller dashboard, cart and checkout flow, address management, and Stripe payment support.

The project is split into:

- `client` - React + Vite frontend
- `server` - Express + MongoDB backend

## Features

- Customer registration and login
- Seller registration and login
- Cookie-based JWT authentication
- Product listing and product detail pages
- Category-based product browsing
- Cart management
- Address creation and retrieval
- Cash on Delivery and Stripe checkout
- Order history for users
- Seller order view
- Seller product upload with Cloudinary image hosting
- Stock availability toggling
- Dark mode support in the frontend

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- React Hot Toast

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary
- Stripe
- cookie-parser
- cors

## Project Structure

```text
Greencart/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
└── README.md
```

## Main User Flows

### Customer

- Browse products
- View product details
- Add items to cart
- Save delivery address
- Place COD or Stripe order
- View order history

### Seller

- Register or log in
- Add new products with images
- View product list
- Update stock status
- View placed orders

## Frontend Routes

- `/` - Home page
- `/products` - All products
- `/products/:category` - Category page
- `/products/:category/:id` - Product details
- `/cart` - Cart page
- `/add-address` - Add shipping address
- `/my-orders` - User order history
- `/loader` - Stripe return/loading page
- `/seller/register` - Seller registration
- `/seller` - Seller login or dashboard
- `/seller/product-list` - Seller product list
- `/seller/orders` - Seller orders

## Backend API Routes

### User

- `POST /api/user/register`
- `POST /api/user/login`
- `GET /api/user/is-auth`
- `GET /api/user/logout`

### Seller

- `POST /api/seller/register`
- `POST /api/seller/login`
- `GET /api/seller/is-auth`
- `GET /api/seller/logout`

### Product

- `POST /api/product/add`
- `GET /api/product/list`
- `GET /api/product/id`
- `POST /api/product/stock`

### Cart

- `POST /api/cart/update`

### Address

- `POST /api/address/add`
- `GET /api/address/get`

### Order

- `POST /api/order/cod`
- `POST /api/order/stripe`
- `GET /api/order/user`
- `GET /api/order/seller`

### Stripe Webhooks

- `POST /stripe`
- `POST /stripe-webhook`

## Environment Variables

### Client `.env`

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_CURRENCY=$
```

### Server `.env`

```env
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=4000

SELLER_EMAIL=admin@example.com
SELLER_PASSWORD=your_seller_password

MONGODB_URI=your_mongodb_connection_string

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Greencart
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

## Running the Project

### Start the backend

From the `server` folder:

```bash
npm start
```

For development with nodemon:

```bash
npm run server
```

Backend runs on:

```text
http://localhost:4000
```

### Start the frontend

From the `client` folder:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Deployment Notes

- Make sure frontend and backend environment variables are configured separately.
- Update CORS origins in `server/server.js` before production deployment.
- Configure Stripe webhook secret in production.
- Do not commit real secrets to Git.

## Known Notes

- Product image upload depends on valid Cloudinary credentials.
- Stripe checkout and webhook verification depend on valid Stripe keys and webhook configuration.
- MongoDB Atlas must allow your IP address or network range.

## Author

Built as a full-stack GreenCart grocery shopping project using React, Express, MongoDB, Cloudinary, and Stripe.
