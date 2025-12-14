# 📦 BookCourier – Server Side

## 🔗 Project Name

**BookCourier – Library-to-Home Delivery System (Server)**

## 🎯 Purpose

This is the backend/server-side of the **BookCourier** application. It provides RESTful APIs to manage users, books, orders, payments, and role-based dashboards (User, Librarian, Admin). The server ensures secure data handling, authentication, authorization, and smooth communication between the client and database. That should be interesting

## 🌐 Live Server URL
https://assignemnt-11-server.vercel.app

## 🚀 Key Features

* 🔐 **JWT-based Authentication** (Firebase token verification)
* 👤 **Role-based Authorization** (User, Librarian, Admin)
* 📚 **Book Management APIs** (Add, Edit, Publish/Unpublish, Delete)
* 🛒 **Order Management**

  * Order placement
  * Order status update (pending → shipped → delivered)
  * Cancel order
* 💳 **Payment & Invoice Management**

  * Track payment status (paid / unpaid)
  * Store payment history
* ❤️ **Wishlist Support**
* ⭐ **Review & Rating System** (Only ordered users)
* 🔍 **Search & Sort APIs** (by book name & price)
* 🛡 **Secure Environment Variables**

  * MongoDB credentials
  * Firebase config
* ⚙️ **CORS & Error Handling** configured for production

---

## 🧩 API Modules

* **Auth APIs**
* **User APIs**
* **Book APIs**
* **Order APIs**
* **Payment APIs**
* **Review & Wishlist APIs**

---

## 🛠 Technologies Used

* **Node.js**
* **Express.js**
* **MongoDB**
* **Firebase Admin SDK** (JWT verification)
* **JSON Web Token (JWT)**
* **dotenv**
* **cors**

---

## 📦 NPM Packages Used

```json
{
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.2.1",
  "firebase-admin": "^13.6.0",
  "mongodb": "^7.0.0",
  "stripe": "^20.0.0"
}
```

---

---

## 🔐 Environment Variables

Create a `.env` file in the root directory and add:

```env
PORT=3000
MDB_USER=your_mongodb_username
MDB_PASS=your_mongodb_password
STRIPE_KEY=your_stripe_secret_key
SITE_DOMAIN=your_client_site_url
FB_SERVICE_KEY=your_firebase_service_account_key
```

> ⚠️ Never push `.env` file to GitHub

---


## ▶️ How to Run Locally

```bash
npm install
npm run dev
```

Server will run on:

```
http://localhost:3000
```

---

## ✅ Deployment Checklist

* ✔ MongoDB credentials secured using environment variables
* ✔ Firebase Admin SDK secured
* ✔ CORS configured for production domain
* ✔ No 404 / 504 / CORS errors
* ✔ JWT-protected routes working correctly

---

## 🔗 GitHub Repository (Server)

[https://github.com/mohammad-aftab-hossain-mozumder/ASSIGNMENT-11-BOOK-COURIER-SERVER.git](https://github.com/mohammad-aftab-hossain-mozumder/ASSIGNMENT-11-BOOK-COURIER-SERVER.git)

---

⭐ If you like this project, don’t forget to give it a star!
