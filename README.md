# 💰 Amar Taka – Mobile Financial Service (MFS) Backend

Amar Taka (আমার টাকা) is a **Node.js + TypeScript + Express + MongoDB** backend for a mobile financial service (MFS) system.
It provides APIs for **user management**, **authentication**, **wallet-based transactions**, and **audit logging**.

---
## 🌐 Production Link

[https://backend-amar-taka.vercel.app](https://backend-amar-taka.vercel.app)

---

## 🧑‍💻 Seed Admin Credentials

Use these credentials to log in as an admin:

```json
{
  "phone": "01234567891",
  "password": "123456"
}
```

> ⚠️ **Note:** Passwords are for development/demo purposes. Change in production.

---

## 🚀 Features

* **Authentication & Authorization** (JWT + Refresh Token in HttpOnly cookie)
* **User Management** (register, verify with OTP, profile, update, admin user listing)
* **Transactions** (cash-in, cash-out, transfer, history, admin transaction search)
* **Role-based Access Control** (User, Agent, Admin)
* **Agent Registration & Verification**
* **Audit Logging** (track all major actions)
* **Zod Validation & Error Handling**
* **Password-protected transactions** (deposit, withdraw, P2P transfer)

---

## 🏗 Tech Stack

* **Backend:** Node.js, Express.js, TypeScript
* **Database:** MongoDB (with Mongoose)
* **Validation:** Zod
* **Authentication:** JWT (Access + Refresh) + Redis for account verification
* **Deployment:** Vercel
* **Store OTP** Redis

---

## ⚙️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/Sushanto171/backend-amar-taka.git
cd backend-amar-taka

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Then edit .env with your config

# Run in development mode
npm run dev

# Build for production
npm run build
npm start
```

---

## 🔑 Authentication Flow

1. **Register user:** `POST /api/v1/user`
2. **Send OTP:** `GET /api/v1/user/send-verify-otp`
3. **Verify OTP:** `POST /api/v1/user/verify-otp`
4. **Login:** `POST /api/v1/auth/login` → returns **access token** + sets **refreshToken** in HttpOnly cookie
5. **Refresh Token:** `POST /api/v1/auth/refresh-token` (using cookie)
6. **Logout:** `GET /api/v1/auth/logout`

---

## 📌 API Endpoints

### 👤 User Routes

| Method | Endpoint                       | Description             | Auth    |
| ------ | ------------------------------ | ----------------------- | ------- |
| POST   | `/api/v1/user`                 | Create new user         | ❌       |
| GET    | `/api/v1/user/send-verify-otp` | Send OTP to phone       | ✅       |
| POST   | `/api/v1/user/verify-otp`      | Verify phone with OTP   | ✅       |
| GET    | `/api/v1/user/me`              | Get my profile          | ✅       |
| GET    | `/api/v1/user`                 | Get all users (Admin)   | ✅ Admin |
| GET    | `/api/v1/user/:id`             | Get single user (Admin) | ✅ Admin |
| PATCH  | `/api/v1/user/action`          | delete/suspend user     | ✅ Admin |
| PATCH  | `/api/v1/user/:id`             | Update user             | ✅       |
---

### 🔐 Auth Routes

| Method | Endpoint                                  | Description                       | Auth |
| ------ | ----------------------------------------- | --------------------------------- | ---- |
| POST   | `/api/v1/auth/login`                      | Login & set refresh token cookie  | ❌    |
| POST   | `/api/v1/auth/change-password`            | Change password                   | ✅    |
| POST   | `/api/v1/auth/change-password-otp-verify` | Verify OTP for password change    | ✅    |
| POST   | `/api/v1/auth/forget-password`            | Forget password (send OTP)        | ❌    |
| POST   | `/api/v1/auth/reset-password`             | Reset password with OTP           | ❌    |
| POST   | `/api/v1/auth/refresh-token`              | Refresh access token using cookie | ✅    |
| GET    | `/api/v1/auth/logout`                     | Logout (clear cookie)             | ✅    |

---

### 💳 Transaction Routes

| Method | Endpoint                               | Description                                      | Auth    |
| ------ | -------------------------------------- | ------------------------------------------------ | ------- |
| GET    | `/api/v1/transaction`                  | Get my transactions                              | ✅       |
| GET    | `/api/v1/transaction/:id`              | Get single transaction                           | ✅       |
| GET    | `/api/v1/transaction/all-transactions` | Get all transactions (Admin)                     | ✅ Admin |
| POST   | `/api/v1/transaction`                  | Create transaction (cash-in, cash-out, transfer) | ✅       |

---

### 🏦 Wallet Routes

| Method | Endpoint                     | Description                          | Auth    |
| ------ | ---------------------------- | ------------------------------------ | ------- |
| GET    | `/api/v1/wallet`             | Get my wallet                        | ✅       |
| PATCH  | `/api/v1/wallet/action`      | Block/unblock wallet                 | ✅ Admin |
| GET    | `/api/v1/wallet/all-wallets` | Get all wallets (Admin)              | ✅ Admin |
| POST   | `/api/v1/wallet/deposit`     | Deposit to wallet                    | ✅       |
| POST   | `/api/v1/wallet/withdraw`    | Withdraw from wallet                 | ✅       |
| POST   | `/api/v1/wallet/send-money`  | Transfer money to another user (P2P) | ✅       |

---

### 👮 Agent Routes

| Method | Endpoint                          | Description                   | Auth    |
| ------ | --------------------------------- | ----------------------------- | ------- |
| POST   | `/api/v1/agent/registration`      | Agent registration            | ✅       |
| GET    | `/api/v1/agent/:id`               | Get single agent              | ✅       |
| GET    | `/api/v1/agent`                   | Get all agents (Admin)        | ✅ Admin |
| PATCH  | `/api/v1/agent/verify-status/:id` | Verify / Reject agent (Admin) | ✅ Admin |
| PATCH  | `/api/v1/agent/verify-status/:id` | Update agent                  | ✅ Admin |

---

### 📊 Commission & Stats

| Method | Endpoint             | Description         | Auth |
| ------ | -------------------- | ------------------- | ---- |
| GET    | `/api/v1/commission` | Get commission info | ✅    |
| GET    | `/api/v1/stats/user` | Get user stats      | ✅    |

---

## ⚡ Project Overview & Flow

1. **User Registration:** System auto-creates a wallet with a welcome bonus transaction & log.
2. **Agent Application:** Users can apply to become agents. Upon admin approval, role and wallet type updated, and new agent balance credited.
3. **Agent Transactions:** Agents can deposit/cash-out for users.
4. **User Transactions:** Users can deposit/cash-out via agents and transfer money to other users.
5. **Transaction Security:** All deposits, withdrawals, and P2P transfers require **password authentication** and **MongoDB session** for atomic operations.
6. **Event-driven Logging:** All actions trigger events that are logged for auditing.

---

### 🛡 Authentication & Security

* **JWT:** Access + Refresh tokens
* **Password-protected transactions**
* **Redis:** Account verification tracking
* **Role-based access:** User, Agent, Admin

---

