/**
 * Isolated Development Fixtures for MerchantPay Lite Customer Payment Journey
 * Used for development preview and testing without faking production calls.
 */

import { CheckoutSession, BankTransferDetails, UssdBankOption, PaymentVerificationResult } from "@/types/checkout";

export const DEV_DEFAULT_SESSION: CheckoutSession = {
  paymentReference: "PAY-2026-984210",
  merchantId: "MCH-0042",
  merchantName: "Apex Retailers Ltd",
  amount: 10000.00,
  currency: "NGN",
  customerName: "Amina Bello",
  customerEmail: "amina.bello@example.com",
  description: "Order #8942 - Electronics & Office Supplies",
  status: "INITIATED",
  createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  expiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
  supportedMethods: ["CARD", "BANK_TRANSFER", "USSD"],
  allowRetry: true,
};

export const DEV_SESSIONS: Record<string, CheckoutSession> = {
  "PAY-2026-984210": DEV_DEFAULT_SESSION,
  "ref-success": {
    ...DEV_DEFAULT_SESSION,
    paymentReference: "ref-success",
    description: "Successful Test Order — Instant Confirmation",
  },
  "ref-fail": {
    ...DEV_DEFAULT_SESSION,
    paymentReference: "ref-fail",
    description: "Failure Scenario Test — Card Declined / Retry",
  },
  "ref-pending": {
    ...DEV_DEFAULT_SESSION,
    paymentReference: "ref-pending",
    description: "Pending Verification Scenario — Asynchronous Bank Awaiting",
  },
  "ref-expired": {
    ...DEV_DEFAULT_SESSION,
    paymentReference: "ref-expired",
    description: "Expired Session Scenario — Checkout Window Elapsed",
    status: "EXPIRED",
    expiresAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
};

export const DEV_BANK_DETAILS: BankTransferDetails = {
  bankName: "Wema Bank (MerchantPay Virtual)",
  accountNumber: "0123984521",
  accountName: "MerchantPay / Apex Retailers Ltd",
  paymentReference: "PAY-2026-984210",
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  instructions: [
    "Open your banking app or internet banking",
    "Initiate an instant transfer of exactly ₦10,000.00 to the account details above",
    "Ensure the recipient name displays 'MerchantPay / Apex Retailers Ltd'",
    "Return to this screen and tap 'I have sent the money'",
  ],
};

export const DEV_USSD_OPTIONS: UssdBankOption[] = [
  {
    bankCode: "GTB",
    bankName: "Guaranty Trust Bank (GTBank)",
    shortCode: "*737*",
    dialString: "*737*50*10000*9842#",
  },
  {
    bankCode: "ZENITH",
    bankName: "Zenith Bank",
    shortCode: "*966*",
    dialString: "*966*00*10000*9842#",
  },
  {
    bankCode: "ACCESS",
    bankName: "Access Bank",
    shortCode: "*901*",
    dialString: "*901*00*10000*9842#",
  },
  {
    bankCode: "UBA",
    bankName: "United Bank for Africa (UBA)",
    shortCode: "*919*",
    dialString: "*919*00*10000*9842#",
  },
  {
    bankCode: "FIRST",
    bankName: "First Bank of Nigeria",
    shortCode: "*894*",
    dialString: "*894*00*10000*9842#",
  },
  {
    bankCode: "STANBIC",
    bankName: "Stanbic IBTC Bank",
    shortCode: "*909*",
    dialString: "*909*00*10000*9842#",
  },
];

export const getDevResultForSimulation = (
  paymentReference: string,
  method: "CARD" | "BANK_TRANSFER" | "USSD",
  cardLast4?: string
): PaymentVerificationResult => {
  // If explicitly tested with ref-fail or card ending in 0002 -> Fail
  if (paymentReference === "ref-fail" || cardLast4 === "0002") {
    return {
      paymentReference,
      status: "FAILED",
      amount: 10000.00,
      currency: "NGN",
      method,
      customerEmail: "amina.bello@example.com",
      merchantName: "Apex Retailers Ltd",
      errorCode: "INSUFFICIENT_FUNDS",
      message: "Your bank declined the transaction due to insufficient funds. Please try another card or payment method.",
    };
  }

  // If explicitly tested with ref-pending -> Pending
  if (paymentReference === "ref-pending" || method === "BANK_TRANSFER") {
    return {
      paymentReference,
      transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: "PENDING",
      amount: 10000.00,
      currency: "NGN",
      method,
      customerEmail: "amina.bello@example.com",
      merchantName: "Apex Retailers Ltd",
      message: "Your payment was submitted to the interbank network. Settlement confirmation is being processed.",
    };
  }

  // Default is SUCCESSFUL
  return {
    paymentReference,
    transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
    status: "SUCCESSFUL",
    amount: 10000.00,
    currency: "NGN",
    paidAt: new Date().toISOString(),
    method,
    customerEmail: "amina.bello@example.com",
    merchantName: "Apex Retailers Ltd",
    receiptNumber: `REC-${Date.now().toString().slice(-8)}`,
    message: "Payment successfully verified and approved.",
  };
};
