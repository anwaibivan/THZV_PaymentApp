/**
 * MerchantPay Lite Customer Payment Journey Domain Types
 * Based on MerchantPay-Lite-BRD and Technical Specifications
 */

export type PaymentStatus = 
  | 'INITIATED'
  | 'PROCESSING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'PENDING'
  | 'EXPIRED';

export type PaymentMethodType = 'CARD' | 'BANK_TRANSFER' | 'USSD';

export interface CheckoutSession {
  paymentReference: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: 'NGN';
  customerName: string;
  customerEmail: string;
  description?: string;
  status: PaymentStatus;
  createdAt: string;
  expiresAt: string;
  supportedMethods: PaymentMethodType[];
  allowRetry?: boolean;
}

export interface CardPaymentInput {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  saveCard?: boolean; // UI only - zero credential persistence
}

export interface BankTransferDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  paymentReference: string;
  expiresAt: string;
  instructions: string[];
}

export interface UssdBankOption {
  bankCode: string;
  bankName: string;
  shortCode: string; // e.g., '*737*'
  dialString: string; // e.g., '*737*50*10000*483921#'
}

export interface PaymentSubmission {
  paymentReference: string;
  method: PaymentMethodType;
  card?: CardPaymentInput;
  bankTransfer?: {
    accountNumber: string;
    confirmedSent: boolean;
  };
  ussd?: {
    bankCode: string;
    dialString: string;
    confirmedDialed: boolean;
  };
}

export interface PaymentAttempt {
  attemptId: string;
  method: PaymentMethodType;
  status: PaymentStatus;
  startedAt: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface PaymentVerificationResult {
  paymentReference: string;
  transactionId?: string;
  status: PaymentStatus;
  amount: number;
  currency: 'NGN';
  paidAt?: string;
  method: PaymentMethodType;
  customerEmail: string;
  merchantName: string;
  message?: string;
  errorCode?: string;
  receiptNumber?: string;
}

export interface ApiStatusResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    isBackendRequired?: boolean;
  };
}
