"use client";

import React from "react";
import { AlertTriangle, RefreshCw, ArrowLeft, ArrowRight } from "lucide-react";
import { PaymentVerificationResult } from "@/types/checkout";

interface PaymentFailedProps {
  result: PaymentVerificationResult;
  onRetry: () => void;
  onChangeMethod: () => void;
  onReturnToMerchant?: () => void;
}

export const PaymentFailed: React.FC<PaymentFailedProps> = ({
  result,
  onRetry,
  onChangeMethod,
  onReturnToMerchant,
}) => {
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(result.amount);

  const safeErrorMessage =
    result.message ||
    "The transaction could not be authorized by your financial institution. Please verify your details or use another payment method.";

  return (
    <div className="py-6 space-y-6 text-center">
      {/* Failure Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <div className="status failed mx-auto mb-1">
          <span className="status-dot" />
          <span>Payment Failed</span>
        </div>
        <h2 className="text-xl font-semibold text-ink tracking-tight">
          Payment Unsuccessful
        </h2>
        <p className="text-xs text-text-muted">
          Your card or account was not charged.
        </p>
      </div>

      {/* Error Details Box */}
      <div className="bg-danger-soft/60 border border-danger/20 rounded-[6px] p-4 text-left space-y-2">
        <div className="text-xs font-semibold text-danger flex items-center gap-1.5">
          <span>Declined Reason</span>
          {result.errorCode && (
            <span className="num text-[11px] font-normal opacity-85">
              ({result.errorCode})
            </span>
          )}
        </div>
        <p className="text-xs text-text leading-relaxed">
          {safeErrorMessage}
        </p>
      </div>

      {/* Transaction Details */}
      <div className="bg-card border border-line rounded-[6px] p-4 text-xs space-y-2 text-left">
        <div className="flex justify-between items-center pb-2 border-b border-line">
          <span className="text-text-muted">Amount</span>
          <span className="num font-semibold text-ink">{formattedAmount}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-line">
          <span className="text-text-muted">Payment Reference</span>
          <span className="num font-medium text-text">{result.paymentReference}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted">Status</span>
          <span className="text-danger font-medium">Declined / Unsuccessful</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 font-semibold rounded-[6px] cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        <button
          type="button"
          onClick={onChangeMethod}
          className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-text-muted" />
          <span>Choose Another Payment Method</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onReturnToMerchant) {
              onReturnToMerchant();
            } else {
              window.location.href = "/merchant-dashboard.html";
            }
          }}
          className="w-full py-2 text-xs text-text-muted hover:text-text transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Cancel and Return to Merchant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
