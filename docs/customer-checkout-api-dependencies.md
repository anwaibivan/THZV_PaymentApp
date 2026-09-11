# MerchantPay Lite — Customer Checkout API Dependencies & Contract Specification

## 1. Executive Summary

This document details the backend integration requirements and API contracts for the **MerchantPay Lite Customer Payment Journey** frontend.

During codebase inspection of the ASP.NET backend configuration (`assets/js/config.js`), it was verified that the existing backend only implements merchant authentication and merchant dashboard endpoints:
- `POST /Home/Login`
- `POST /Merchants/Register`
- `GET /Payments/Dashboard`
- `POST /Payments/Create`

**There are currently no customer-facing checkout endpoints** implemented on the ASP.NET backend. To maintain strict integrity and adhere to the architectural rules:
1. The frontend does **not** invent or fake production endpoints.
2. Missing endpoints are designated with explicit `BACKEND API REQUIRED` error handling in the typed service layer (`lib/api/checkout-service.ts`).
3. Isolated, non-persisted development fixtures (`lib/api/dev-fixtures.ts`) are used solely for local testing and interface validation.

---

## 2. API Dependency Matrix

| Method | Endpoint | Purpose | Status in Codebase | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/Home/Login` | Merchant sign-in | `AVAILABLE` | None (Merchant Portal) |
| `POST` | `/Merchants/Register` | Merchant onboarding | `AVAILABLE` | None (Merchant Portal) |
| `GET` | `/Payments/Dashboard` | Merchant KPIs & transactions | `AVAILABLE` | None (Merchant Portal) |
| `POST` | `/Payments/Create` | Merchant initiates payment record | `AVAILABLE` | Returns `paymentReference` |
| `GET` | `/Payments/Checkout/{reference}` | Load customer checkout session | `BACKEND API REQUIRED` | ASP.NET Controller needed |
| `POST` | `/Payments/Submit` | Submit payment authorization | `BACKEND API REQUIRED` | ASP.NET Gateway processor needed |
| `GET` | `/Payments/Verify/{reference}` | Poll / verify settlement status | `BACKEND API REQUIRED` | ASP.NET Interbank query needed |
| `GET` | `/Payments/TransferDetails/{ref}` | Virtual account issuance | `BACKEND API REQUIRED` | Dynamic Wema/NIBSS integration |
| `GET` | `/Payments/UssdOptions/{ref}` | USSD bank string generator | `BACKEND API REQUIRED` | USSD aggregator integration |

---

## 3. Detailed Endpoint Contracts (Required for Backend Team)

### 3.1. `GET /Payments/Checkout/{reference}`
Loads the checkout session details when the customer navigates to `/checkout/[paymentReference]`.

#### Headers
```http
Accept: application/json
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "paymentReference": "PAY-2026-984210",
    "merchantId": "MCH-0042",
    "merchantName": "Apex Retailers Ltd",
    "amount": 10000.00,
    "currency": "NGN",
    "customerName": "Amina Bello",
    "customerEmail": "amina.bello@example.com",
    "description": "Order #8942 - Electronics & Office Supplies",
    "status": "INITIATED",
    "createdAt": "2026-09-11T13:00:00Z",
    "expiresAt": "2026-09-11T13:30:00Z",
    "supportedMethods": ["CARD", "BANK_TRANSFER", "USSD"],
    "allowRetry": true
  }
}
```

#### Error Responses
- **`404 Not Found`**: Payment reference does not exist.
  ```json
  {
    "success": false,
    "error": {
      "code": "PAYMENT_NOT_FOUND",
      "message": "The requested payment reference was not found."
    }
  }
  ```
- **`410 Gone / Expired`**: Session has elapsed the 30-minute security window.
  ```json
  {
    "success": false,
    "error": {
      "code": "SESSION_EXPIRED",
      "message": "This checkout session has expired."
    }
  }
  ```

---

### 3.2. `POST /Payments/Submit`
Submits payment authorization details for processing.

#### Request Headers
```http
Content-Type: application/json
Accept: application/json
```

#### Request Payload Examples

##### A. Card Payment
```json
{
  "paymentReference": "PAY-2026-984210",
  "method": "CARD",
  "card": {
    "cardholderName": "Amina Bello",
    "cardNumber": "5399831234567890",
    "expiryMonth": "12",
    "expiryYear": "28",
    "cvv": "482"
  }
}
```

##### B. Bank Transfer Confirmation
```json
{
  "paymentReference": "PAY-2026-984210",
  "method": "BANK_TRANSFER",
  "bankTransfer": {
    "accountNumber": "0123984521",
    "confirmedSent": true
  }
}
```

##### C. USSD Payment Confirmation
```json
{
  "paymentReference": "PAY-2026-984210",
  "method": "USSD",
  "ussd": {
    "bankCode": "GTB",
    "dialString": "*737*50*10000*9842#",
    "confirmedDialed": true
  }
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "paymentReference": "PAY-2026-984210",
    "transactionId": "TXN-84920194",
    "status": "SUCCESSFUL",
    "amount": 10000.00,
    "currency": "NGN",
    "paidAt": "2026-09-11T13:05:22Z",
    "method": "CARD",
    "customerEmail": "amina.bello@example.com",
    "merchantName": "Apex Retailers Ltd",
    "receiptNumber": "REC-98421084",
    "message": "Payment successfully verified and approved."
  }
}
```

#### Declined Response (`422 Unprocessable Entity` or `200 OK with FAILED`)
```json
{
  "success": false,
  "data": {
    "paymentReference": "PAY-2026-984210",
    "status": "FAILED",
    "amount": 10000.00,
    "currency": "NGN",
    "method": "CARD",
    "customerEmail": "amina.bello@example.com",
    "merchantName": "Apex Retailers Ltd",
    "errorCode": "INSUFFICIENT_FUNDS",
    "message": "Your bank declined the transaction due to insufficient funds."
  }
}
```

---

### 3.3. `GET /Payments/Verify/{reference}`
Polls or checks the settlement status of an asynchronous payment (e.g. Bank Transfer or USSD).

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "paymentReference": "PAY-2026-984210",
    "transactionId": "TXN-84920194",
    "status": "PENDING",
    "amount": 10000.00,
    "currency": "NGN",
    "method": "BANK_TRANSFER",
    "customerEmail": "amina.bello@example.com",
    "merchantName": "Apex Retailers Ltd",
    "message": "Awaiting interbank settlement confirmation from NIBSS."
  }
}
```

---

## 4. Security & Zero-Credential Persistence Policy

1. **Card Credentials**:
   - Card numbers, CVV, and PIN values are **never** stored in local storage, session storage, indexedDB, or browser cookies.
   - Credentials exist solely in ephemeral React state during component lifecycle and are scrubbed upon component unmount or state transition.
   - Form inputs use standard attributes (`autoComplete="cc-number"`, `autoComplete="cc-csc"`) and `inputMode="numeric"` to support secure platform keyboards.
2. **Session Lifetimes**:
   - Customer checkout sessions expire strictly after 30 minutes from creation.
   - Expired sessions transition the UI state to `EXPIRED`, rendering a read-only notification and preventing double payment.
3. **Retry Loop**:
   - Failed transactions preserve the parent `paymentReference` without generating phantom orders, permitting customers to switch methods (e.g., from Card to Bank Transfer) or retry with another card.

---

## 5. Development Isolation Protocol

- In `lib/api/checkout-service.ts`, when running in development mode or querying test references (`ref-success`, `ref-fail`, `ref-pending`, `ref-expired`, `PAY-2026-984210`), calls route through `lib/api/dev-fixtures.ts`.
- When production calls are attempted against nonexistent endpoints, the client rejects with `BACKEND API REQUIRED` error objects rather than generating false positive transactions.
