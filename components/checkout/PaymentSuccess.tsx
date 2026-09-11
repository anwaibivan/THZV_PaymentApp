"use client";

import React from "react";
import { PaymentVerificationResult } from "@/types/checkout";
import { CheckCircle2, Printer, ArrowRight } from "lucide-react";

interface PaymentSuccessProps {
  result: PaymentVerificationResult;
  onReturnToMerchant?: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  result,
  onReturnToMerchant,
}) => {
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(result.amount);

  const formattedDate = result.paidAt
    ? new Date(result.paidAt).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-6 space-y-6 text-center">
      {/* Success Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-soft text-accent">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <div className="status success mx-auto mb-1">
          <span className="status-dot" />
          <span>Payment Completed</span>
        </div>
        <h2 className="text-xl font-semibold text-ink tracking-tight">
          Payment Successful
        </h2>
        <p className="text-xs text-text-muted">
          Your transaction has been processed and confirmed.
        </p>
      </div>

      {/* Amount Display */}
      <div className="bg-paper border border-line rounded-[6px] py-4 px-3">
        <span className="text-xs text-text-muted block mb-1">Amount Paid</span>
        <span className="num text-3xl font-bold text-ink tracking-tight">
          {formattedAmount}
        </span>
      </div>

      {/* Transaction Details */}
      <div className="bg-card border border-line rounded-[6px] p-4 text-xs space-y-2.5 text-left">
        <div className="flex justify-between items-center pb-2 border-b border-line">
          <span className="text-text-muted">Merchant</span>
          <span className="font-semibold text-text">{result.merchantName}</span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-line">
          <span className="text-text-muted">Payment Reference</span>
          <span className="num font-medium text-text">{result.paymentReference}</span>
        </div>

        {result.transactionId && (
          <div className="flex justify-between items-center pb-2 border-b border-line">
            <span className="text-text-muted">Transaction ID</span>
            <span className="num font-medium text-text">{result.transactionId}</span>
          </div>
        )}

        {result.receiptNumber && (
          <div className="flex justify-between items-center pb-2 border-b border-line">
            <span className="text-text-muted">Receipt Number</span>
            <span className="num font-medium text-text">{result.receiptNumber}</span>
          </div>
        )}

        <div className="flex justify-between items-center pb-2 border-b border-line">
          <span className="text-text-muted">Payment Method</span>
          <span className="font-medium text-text">
            {result.method === "CARD"
              ? "Debit / Credit Card"
              : result.method === "BANK_TRANSFER"
              ? "Bank Transfer"
              : "USSD Banking"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-text-muted">Date & Time</span>
          <span className="text-text">{formattedDate}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={handlePrint}
          className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-text-muted" />
          <span>Print / Save Receipt</span>
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
          className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 font-semibold rounded-[6px] cursor-pointer"
        >
          <span>Return to Merchant</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
