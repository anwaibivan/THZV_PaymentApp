# MerchantPay Lite — Merchant Frontend API Dependencies & Integration Matrix

## 1. Executive Summary

This document specifies the backend integration contracts and dependencies for the **MerchantPay Lite Merchant Section**.

Following an audit of the ASP.NET backend configuration (`assets/js/config.js`) and database models:
- **Available Endpoints**:
  - `POST /Home/Login` (Merchant authentication)
  - `POST /Merchants/Register` (Merchant onboarding)
  - `GET /Payments/Dashboard` (Merchant summary KPIs, recent transactions)
  - `POST /Payments/Create` (Initiate payment request)
- **Missing Endpoints**:
  - Paginated transactions search/filter endpoint (`/Payments/Transactions`)
  - Payouts & Settlement ledger endpoint (`/Payments/Payouts`)
  - Customer directory & profile endpoint (`/Payments/Customers`)
  - Developer API key generation/revocation (`/Developers/Keys`)
  - Webhook registration & ping testing (`/Developers/Webhooks`)
  - Merchant settings & profile management (`/Merchants/Profile`, `/Merchants/Settings`)
  - Dedicated logout endpoint (`/Home/Logout`)

All unexposed backend endpoints are designated as `BACKEND API REQUIRED`. The frontend implements realistic UI interactions, robust client validation, and clear empty states without faking production operations.

---

## 2. Comprehensive API Dependency Matrix

| Merchant Feature | Frontend Route | Backend Endpoint | HTTP Method | Authentication | Status | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Merchant Login** | `/index.html` | `/Home/Login` | `POST` | Public Form | `AVAILABLE` | Existing ASP.NET Controller |
| **Merchant Registration** | `/register.html` | `/Merchants/Register` | `POST` | Public JSON | `AVAILABLE` | Existing ASP.NET Controller |
| **Overview Dashboard** | `/merchant/overview` | `/Payments/Dashboard` | `GET` | Bearer / Cookie | `AVAILABLE` | Returns summary KPIs & recent list |
| **Create Payment** | `/merchant/overview` | `/Payments/Create` | `POST` | Bearer / Session | `AVAILABLE` | Returns `paymentReference` |
| **Sign Out** | Sidebar Footer | `/Home/Logout` | `POST` | Bearer / Session | `BACKEND API REQUIRED` | Frontend clears client auth tokens |
| **Transactions List** | `/merchant/transactions` | `/Payments/Transactions` | `GET` | Bearer / Session | `BACKEND API REQUIRED` | Need server-side pagination & filter |
| **Transaction Details** | Modal in `/transactions` | `/Payments/Transactions/{ref}` | `GET` | Bearer / Session | `BACKEND API REQUIRED` | Full audit timeline & event log |
| **Payouts & Settlements** | `/merchant/payouts` | `/Payments/Payouts` | `GET` | Bearer / Session | `BACKEND API REQUIRED` | Bank settlement schedule & batch logs |
| **Bank Account Update** | Modal in `/payouts` | `/Payments/Payouts/BankAccount`| `POST` | Bearer / Session | `BACKEND API REQUIRED` | Bank verification & account update |
| **Customers Directory** | `/merchant/customers` | `/Payments/Customers` | `GET` | Bearer / Session | `BACKEND API REQUIRED` | Unique customer list with aggregations |
| **Customer Profile** | Modal in `/customers` | `/Payments/Customers/{id}` | `GET` | Bearer / Session | `BACKEND API REQUIRED` | Customer order history & lifetime spend |
| **API Keys Management** | `/merchant/developers` | `/Developers/Keys` | `GET` / `POST` | Bearer / 2FA | `BACKEND API REQUIRED` | Key rotation & secure display |
| **Webhooks Config** | `/merchant/developers` | `/Developers/Webhooks` | `POST` | Bearer / Session | `BACKEND API REQUIRED` | Webhook URL & signature storage |
| **Webhook Test Ping** | Button in `/developers` | `/Developers/Webhooks/Test` | `POST` | Bearer / Session | `BACKEND API REQUIRED` | Dispatch test payload to webhook URL |
| **Business Profile** | `/merchant/settings` | `/Merchants/Profile` | `PUT` | Bearer / Session | `BACKEND API REQUIRED` | Update name, address, support email |
| **Payment Preferences** | `/merchant/settings` | `/Merchants/Preferences` | `PUT` | Bearer / Session | `BACKEND API REQUIRED` | Configure active checkout channels |
| **Security / Password** | `/merchant/settings` | `/Merchants/Password` | `POST` | Bearer / Session | `BACKEND API REQUIRED` | Secure password update endpoint |

---

## 3. Detailed Endpoint Contracts for Backend Engineers

### 3.1. Paginated Transactions (`GET /Payments/Transactions`)
```http
GET /Payments/Transactions?merchantId=1&query=amina&status=SUCCESS&page=1&pageSize=20 HTTP/1.1
Authorization: Bearer <access_token>
Accept: application/json
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "totalCount": 142,
    "page": 1,
    "pageSize": 20,
    "items": [
      {
        "reference": "PAY-2026-984210",
        "customer": "Amina Bello",
        "email": "amina.bello@example.com",
        "amount": 10000.00,
        "currency": "NGN",
        "method": "Mastercard",
        "last4": "4421",
        "status": "SUCCESS",
        "createdAt": "2026-09-11T13:45:00Z",
        "fees": 150.00,
        "netAmount": 9850.00
      }
    ]
  }
}
```

---

### 3.2. Payouts & Settlement History (`GET /Payments/Payouts`)
```http
GET /Payments/Payouts?merchantId=1 HTTP/1.1
Authorization: Bearer <access_token>
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "nextPayout": {
      "amount": 6114050.00,
      "scheduledDate": "2026-09-12T00:00:00Z",
      "bank": "Guaranty Trust Bank (GTBank)",
      "accountNumber": "0148294471",
      "status": "SCHEDULED"
    },
    "settlementBalance": 840200.00,
    "totalSettledMonth": 15870700.00,
    "history": [
      {
        "payoutReference": "PO-2026-9842",
        "settledAt": "2026-09-03T00:00:00Z",
        "destinationBank": "GTBank",
        "accountMasked": "0148294471",
        "amount": 5220000.00,
        "status": "PAID"
      }
    ]
  }
}
```

---

### 3.3. Webhook Configuration (`POST /Developers/Webhooks`)
```http
POST /Developers/Webhooks HTTP/1.1
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "webhookUrl": "https://api.nomadretail.com/webhooks/payment",
  "subscribedEvents": [
    "payment.successful",
    "payment.failed",
    "payout.completed"
  ]
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "webhookId": "whk_894210948",
    "webhookUrl": "https://api.nomadretail.com/webhooks/payment",
    "secret": "whsec_79a29d48201948",
    "status": "ACTIVE"
  }
}
```

---

## 4. Authentication, Session & Sign Out Behavior

1. **Authentication Storage**:
   - Access tokens and expiry timestamps are stored in browser `localStorage` or `sessionStorage` (`access_token`, `expires_at`, `token_type`).
2. **Sign Out Execution**:
   - Clears all tokens: `access_token`, `expires_at`, `token_type`, and session caches.
   - Redirects to `/index.html` (the Merchant Login page).
   - Once signed out, navigating back to `/merchant` or `merchant-dashboard.html` triggers authentication verification and prevents unauthorized access to protected dashboard data.
