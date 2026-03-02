# 🛍️ Jhuggee — India ka Bazaar

An e-commerce web application built using Next.js, and MongoDB, integrating features like OTP login, Google OAuth, product listings, category pages, seller dashboards, and more.

## Tech Stack
- **Frontend/Backend:** Next.js (App Router)
- **Database:** MongoDB
- **Styling:** Tailwind CSS
- **Authentication:** JWT, Google OAuth
- **Payments:** Cashfree Integration

## Features
- ✅ OTP Login (Phone)
- ✅ Google OAuth Login
- ✅ Real MongoDB Database
- ✅ Product Listing & Detail Pages
- ✅ Category Pages with Filter/Sort
- ✅ Seller Dashboard (Add/Edit/Delete Products)
- ✅ Cart & Orders
- ✅ AI Customer Support Chatbot (Gemini API)
- ✅ Fully Responsive (Mobile/Tablet/Desktop)

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and add your environment variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Optional: Cashfree Payments
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=SANDBOX

# Required: AI Chatbot (Gemini + n8n webhook)
CHATBOT_GEMINI_KEY=your_gemini_api_key
N8N_WEBHOOK_URL=your_n8n_webhook_url
```

### 3. Seed Database with Initial Data
To add a test seller and sample products to your MongoDB database:
```bash
npm run seed
```
This command automatically:
- Creates a Seller account (Phone: 9999999999)
- Approves the Seller's shop
- Adds 8 real products

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open the Application
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing the Platform

### Seller Login
1. Go to `http://localhost:3000/login`
2. Enter Phone Number: **9999999999**
3. Click "OTP Bhejo"
4. **Check Terminal** — The OTP will be printed there (in dev mode)
5. Enter OTP to Login
6. Access Seller Dashboard at: `http://localhost:3000/seller/dashboard`

## Google Login Setup (Optional)
1. Go to: [Google Cloud Console](https://console.cloud.google.com)
2. Create New Project → "Jhuggee"
3. APIs & Services → Credentials → OAuth 2.0 Client ID
4. Application type: Web application
5. Add Authorized redirect URI:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
6. Copy Client ID and Secret and update `.env.local`.