/**
 * MerchantPay Lite Customer Checkout Service
 * 
 * NOTE: The existing ASP.NET backend currently only implements merchant endpoints:
 * - /Home/Login
 * - /Merchants/Register
 * - /Payments/Dashboard
 * - /Payments/Create
 * 
 * Customer checkout endpoints (e.g. /Payments/Checkout/{ref}, /Payments/Submit, /Payments/Verify)
 * do not yet exist on the backend and are marked as BACKEND API REQUIRED.
 * 
 * In development or when using test fixtures, this service safely uses isolated fixtures
 * without faking production calls or storing any cardholder credentials.
 */

import {
  CheckoutSession,
  PaymentSubmission,
  PaymentVerificationResult,
  BankTransferDetails,
  UssdBankOption,
} from "@/types/checkout";
import {
  DEV_SESSIONS,
  DEV_DEFAULT_SESSION,
  DEV_BANK_DETAILS,
  DEV_USSD_OPTIONS,
  getDevResultForSimulation,
} from "./dev-fixtures";

export interface ICheckoutService {
  getSession(reference: string): Promise<CheckoutSession>;
  submitPayment(submission: PaymentSubmission): Promise<PaymentVerificationResult>;
  verifyPayment(reference: string): Promise<PaymentVerificationResult>;
  getBankTransferDetails(reference: string): Promise<BankTransferDetails>;
  getUssdOptions(reference: string): Promise<UssdBankOption[]>;
}

export class CheckoutService implements ICheckoutService {
  private isFixtureMode(reference: string): boolean {
    // In dev environment or for test fixtures, use isolated fixture mode
    if (process.env.NODE_ENV === "development") return true;
    if (reference in DEV_SESSIONS || reference.startsWith("ref-") || reference.startsWith("PAY-")) {
      return true;
    }
    return false;
  }

  async getSession(reference: string): Promise<CheckoutSession> {
    if (this.isFixtureMode(reference)) {
      // Simulate network latency (200ms)
      await new Promise((r) => setTimeout(r, 200));

      const found = DEV_SESSIONS[reference];
      if (found) {
        return { ...found };
      }

      // Generate a dynamic fixture session for arbitrary test references
      return {
        ...DEV_DEFAULT_SESSION,
        paymentReference: reference,
        description: `Checkout for Order ${reference}`,
      };
    }

    // Backend endpoint does not exist yet:
    // Required endpoint: GET /Payments/Checkout/{reference}
    throw new Error(
      "BACKEND API REQUIRED: GET /Payments/Checkout/{reference} is not implemented in ASP.NET backend. See docs/customer-checkout-api-dependencies.md"
    );
  }

  async submitPayment(submission: PaymentSubmission): Promise<PaymentVerificationResult> {
    if (this.isFixtureMode(submission.paymentReference)) {
      // Simulate gateway processing time (1200ms)
      await new Promise((r) => setTimeout(r, 1200));

      const cardLast4 = submission.card?.cardNumber.replace(/\s+/g, "").slice(-4);
      return getDevResultForSimulation(
        submission.paymentReference,
        submission.method,
        cardLast4
      );
    }

    // Backend endpoint does not exist yet:
    // Required endpoint: POST /Payments/Submit
    throw new Error(
      "BACKEND API REQUIRED: POST /Payments/Submit is not implemented in ASP.NET backend. See docs/customer-checkout-api-dependencies.md"
    );
  }

  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    if (this.isFixtureMode(reference)) {
      await new Promise((r) => setTimeout(r, 800));
      return getDevResultForSimulation(reference, "CARD");
    }

    // Backend endpoint does not exist yet:
    // Required endpoint: GET /Payments/Verify/{reference}
    throw new Error(
      "BACKEND API REQUIRED: GET /Payments/Verify/{reference} is not implemented in ASP.NET backend. See docs/customer-checkout-api-dependencies.md"
    );
  }

  async getBankTransferDetails(reference: string): Promise<BankTransferDetails> {
    if (this.isFixtureMode(reference)) {
      return {
        ...DEV_BANK_DETAILS,
        paymentReference: reference,
      };
    }

    throw new Error(
      "BACKEND API REQUIRED: GET /Payments/TransferDetails/{reference} is not implemented in ASP.NET backend."
    );
  }

  async getUssdOptions(reference: string): Promise<UssdBankOption[]> {
    if (this.isFixtureMode(reference)) {
      return [...DEV_USSD_OPTIONS];
    }

    throw new Error(
      "BACKEND API REQUIRED: GET /Payments/UssdOptions/{reference} is not implemented in ASP.NET backend."
    );
  }
}

export const checkoutService = new CheckoutService();
