# 🌱 GreenCart: The Intelligent E-Commerce Marketplace

GreenCart is a modern, high-performance, full-stack grocery and daily essentials e-commerce application. It features a complete customer storefront, a multi-vendor seller dashboard, secure Stripe payments, and is supercharged with **Google Gemini AI** to provide a next-generation shopping experience.

## ✨ Key Features

### 🧠 Next-Gen AI Integrations (Powered by Gemini 1.5 Flash)
- **Voice-Activated AI Assistant:** Customers can click the microphone icon and speak directly to the AI to search for products, add items to their cart, apply coupons, and navigate the store. 
- **AI "Magic Fill" Product Generator:** Sellers can upload an image of a product, and the AI will automatically generate an optimized title, description, category, and pricing information.
- **AI Review Sentiment Analysis:** The seller dashboard includes an intelligent review analysis tool that reads customer feedback and instantly generates structured reports highlighting "What Customers Love" and "Areas for Improvement."

### 🛍️ Customer Experience
- **Modern UI/UX:** Stunning glassmorphism design, smooth Tailwind animations, dark mode support, and fully responsive mobile layouts.
- **Dynamic Cart & Wishlist:** Persisted local storage cart with instant updates, coupon code validation, and a persistent wishlist.
- **Product Reviews:** Customers can leave star ratings and comments on products once their orders are marked as delivered.
- **Seamless Checkout:** Support for both Cash on Delivery (COD) and secure Stripe Card payments.

### 🏪 Multi-Vendor Seller Dashboard
- **Kanban Order Fulfillment:** A highly interactive, drag-and-drop Kanban board to manage order statuses (Pending ➔ Processing ➔ Shipped ➔ Delivered) with strict forward-only progression logic.
- **Product Management:** Complete CRUD operations for products with Cloudinary image hosting and AI autofill.
- **Sales Analytics & Reviews:** Detailed seller views for revenue tracking and customer feedback analysis.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (with custom gradients & glassmorphism)
- **Icons & Animation:** Lucide React, Framer Motion (for dynamic transitions)
- **State Management:** React Context API & `sessionStorage`
- **Voice Support:** Web Speech API (`SpeechRecognition`)

### Backend
- **Framework:** Node.js + Express
- **Database:** MongoDB with Mongoose
- **AI Engine:** Google Generative AI (`@google/generative-ai`)
- **Authentication:** JWT (JSON Web Tokens) & `bcryptjs` via HTTP-only Cookies
- **File Uploads:** Multer + Cloudinary API
- **Payments:** Stripe API + Webhooks

## 📂 Project Structure

```text
Greencart/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/         # Static assets and icons
│   │   ├── components/     # Reusable UI components (Navbar, Bot, ProductCards)
│   │   ├── context/        # Global AppContext
│   │   ├── pages/          # Customer and Seller Pages
│   │   ├── App.jsx         # Route Configuration
│   │   └── main.jsx        # App Entry Point
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js Backend
│   ├── controllers/        # Business Logic (User, Seller, Product, Order, AI)
│   ├── middlewares/        # Auth and Validation
│   ├── models/             # Mongoose Schemas (User, Product, Order, Coupon)
│   ├── routes/             # API Endpoints
│   ├── package.json
│   └── server.js           # Express Server Setup
└── README.md
```

## 🚀 Environment Variables Setup

You will need two `.env` files. 

### Client (`client/.env`)
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_CURRENCY=$
```

### Server (`server/.env`)
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Admin / Default Seller
SELLER_EMAIL=admin@example.com
SELLER_PASSWORD=your_seller_password

# Image Hosting
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Payments
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# AI Engine
GEMINI_API_KEY_1=your_primary_gemini_api_key
# You can add multiple keys (GEMINI_API_KEY_2, etc.) for load balancing
```

## ⚙️ Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Greencart
   ```

2. **Install & Run Backend:**
   ```bash
   cd server
   npm install
   npm run server
   ```
   *The backend will run on `http://localhost:4000`*

3. **Install & Run Frontend:**
   Open a new terminal window:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`*

## 📝 Future Roadmap / Known Notes
- **Gemini Rate Limits:** The Free Tier of the Gemini API limits the number of requests per minute. If you experience `429 Too Many Requests` errors during testing, wait a few seconds and try again, or upgrade to a paid tier in Google AI Studio.
- **Speech API Support:** The Voice Chatbot uses the native browser `SpeechRecognition` API. For the best experience, use Google Chrome, as some browsers (like Brave) natively block microphone speech recognition for privacy reasons.
- **Stripe Webhooks:** Ensure your local environment is exposed via tools like Ngrok if you want to test Stripe Webhooks locally.
