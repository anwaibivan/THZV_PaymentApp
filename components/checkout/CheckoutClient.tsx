"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CheckoutSession,
  PaymentMethodType,
  PaymentStatus,
  PaymentVerificationResult,
  BankTransferDetails,
  UssdBankOption,
  CardPaymentInput,
} from "@/types/checkout";
import { checkoutService } from "@/lib/api/checkout-service";
import { CheckoutShell } from "./CheckoutShell";
import { PaymentSummary } from "./PaymentSummary";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { CardPaymentForm } from "./CardPaymentForm";
import { BankTransferInstructions } from "./BankTransferInstructions";
import { UssdPaymentInstructions } from "./UssdPaymentInstructions";
import { PaymentProcessing } from "./PaymentProcessing";
import { PaymentSuccess } from "./PaymentSuccess";
import { PaymentFailed } from "./PaymentFailed";
import { PaymentPending } from "./PaymentPending";
import { PaymentExpired } from "./PaymentExpired";
import { AlertCircle, Loader2 } from "lucide-react";

interface CheckoutClientProps {
  paymentReference: string;
  initialOverrideStatus?: PaymentStatus;
}

export const CheckoutClient: React.FC<CheckoutClientProps> = ({
  paymentReference,
  initialOverrideStatus,
}) => {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State Machine State
  const [currentStatus, setCurrentStatus] = useState<PaymentStatus>("INITIATED");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("CARD");
  const [result, setResult] = useState<PaymentVerificationResult | null>(null);

  // Method specific state
  const [bankDetails, setBankDetails] = useState<BankTransferDetails | null>(null);
  const [ussdOptions, setUssdOptions] = useState<UssdBankOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load session
  const loadSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkoutService.getSession(paymentReference);
      setSession(data);

      if (initialOverrideStatus) {
        setCurrentStatus(initialOverrideStatus);
      } else {
        setCurrentStatus(data.status);
      }

      // Preload bank transfer and ussd options
      const [bank, ussd] = await Promise.all([
        checkoutService.getBankTransferDetails(paymentReference),
        checkoutService.getUssdOptions(paymentReference),
      ]);
      setBankDetails(bank);
      setUssdOptions(ussd);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load checkout session";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [paymentReference, initialOverrideStatus]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Handle Card Submission
  const handleCardSubmit = async (cardData: CardPaymentInput) => {
    if (!session) return;
    setIsSubmitting(true);
    setCurrentStatus("PROCESSING");

    try {
      const response = await checkoutService.submitPayment({
        paymentReference: session.paymentReference,
        method: "CARD",
        card: cardData,
      });
      setResult(response);
      setCurrentStatus(response.status);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment submission failed";
      setResult({
        paymentReference: session.paymentReference,
        status: "FAILED",
        amount: session.amount,
        currency: session.currency,
        method: "CARD",
        customerEmail: session.customerEmail,
        merchantName: session.merchantName,
        message,
      });
      setCurrentStatus("FAILED");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Bank Transfer Confirmation
  const handleBankTransferSent = async (accountNumber: string) => {
    if (!session) return;
    setIsSubmitting(true);
    setCurrentStatus("PROCESSING");

    try {
      const response = await checkoutService.submitPayment({
        paymentReference: session.paymentReference,
        method: "BANK_TRANSFER",
        bankTransfer: {
          accountNumber,
          confirmedSent: true,
        },
      });
      setResult(response);
      setCurrentStatus(response.status);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bank transfer confirmation failed";
      setResult({
        paymentReference: session.paymentReference,
        status: "FAILED",
        amount: session.amount,
        currency: session.currency,
        method: "BANK_TRANSFER",
        customerEmail: session.customerEmail,
        merchantName: session.merchantName,
        message,
      });
      setCurrentStatus("FAILED");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle USSD Confirmation
  const handleUssdConfirm = async (bankCode: string, dialString: string) => {
    if (!session) return;
    setIsSubmitting(true);
    setCurrentStatus("PROCESSING");

    try {
      const response = await checkoutService.submitPayment({
        paymentReference: session.paymentReference,
        method: "USSD",
        ussd: {
          bankCode,
          dialString,
          confirmedDialed: true,
        },
      });
      setResult(response);
      setCurrentStatus(response.status);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "USSD confirmation failed";
      setResult({
        paymentReference: session.paymentReference,
        status: "FAILED",
        amount: session.amount,
        currency: session.currency,
        method: "USSD",
        customerEmail: session.customerEmail,
        merchantName: session.merchantName,
        message,
      });
      setCurrentStatus("FAILED");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Check Status for Pending
  const handleCheckStatus = async () => {
    if (!session) return;
    try {
      const verified = await checkoutService.verifyPayment(session.paymentReference);
      setResult(verified);
      setCurrentStatus(verified.status);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // Retry from failed state
  const handleRetry = () => {
    setCurrentStatus("INITIATED");
    setResult(null);
  };

  // Change method from failed state
  const handleChangeMethod = () => {
    setCurrentStatus("INITIATED");
    setResult(null);
    if (selectedMethod === "CARD") {
      setSelectedMethod("BANK_TRANSFER");
    } else {
      setSelectedMethod("CARD");
    }
  };

  // Loading state
  if (loading) {
    return (
      <CheckoutShell>
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-7 h-7 text-accent animate-spin mx-auto" />
          <p className="text-xs text-text-muted">Loading secure checkout...</p>
        </div>
      </CheckoutShell>
    );
  }

  // Error state (session not found / invalid)
  if (error || !session) {
    return (
      <CheckoutShell>
        <div className="py-8 space-y-4">
          <div className="alert error">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Checkout Error</span>
              <p className="text-xs">{error || "Unable to find session."}</p>
            </div>
          </div>
        </div>
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell merchantName={session.merchantName}>
      {/* Session Expired Stage */}
      {currentStatus === "EXPIRED" && (
        <PaymentExpired session={session} />
      )}

      {/* Processing Verification Stage */}
      {currentStatus === "PROCESSING" && (
        <PaymentProcessing method={selectedMethod} amount={session.amount} />
      )}

      {/* Success Stage */}
      {currentStatus === "SUCCESSFUL" && result && (
        <PaymentSuccess result={result} />
      )}

      {/* Failed Stage */}
      {currentStatus === "FAILED" && result && (
        <PaymentFailed
          result={result}
          onRetry={handleRetry}
          onChangeMethod={handleChangeMethod}
        />
      )}

      {/* Pending Stage */}
      {currentStatus === "PENDING" && result && (
        <PaymentPending
          result={result}
          onCheckStatus={handleCheckStatus}
        />
      )}

      {/* Initiation & Fulfillment Stage */}
      {currentStatus === "INITIATED" && (
        <section aria-label="Payment Form">
          <PaymentSummary session={session} />

          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            disabled={isSubmitting}
          />

          {selectedMethod === "CARD" && (
            <CardPaymentForm
              amount={session.amount}
              isSubmitting={isSubmitting}
              onSubmit={handleCardSubmit}
            />
          )}

          {selectedMethod === "BANK_TRANSFER" && bankDetails && (
            <BankTransferInstructions
              amount={session.amount}
              details={bankDetails}
              isSubmitting={isSubmitting}
              onConfirmSent={handleBankTransferSent}
            />
          )}

          {selectedMethod === "USSD" && ussdOptions.length > 0 && (
            <UssdPaymentInstructions
              amount={session.amount}
              options={ussdOptions}
              isSubmitting={isSubmitting}
              onConfirmUssd={handleUssdConfirm}
            />
          )}
        </section>
      )}
    </CheckoutShell>
  );
};
