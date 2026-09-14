"use client";

import React, { useState } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { PaymentVerificationResult } from "@/types/checkout";

interface PaymentPendingProps {
  result: PaymentVerificationResult;
  onCheckStatus: () => Promise<void>;
}

export const PaymentPending: React.FC<PaymentPendingProps> = ({
  result,
  onCheckStatus,
}) => {
  const [checking, setChecking] = useState(false);

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(result.amount);

  const handleCheck = async () => {
    setChecking(true);
    try {
      await onCheckStatus();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="py-6 space-y-6 text-center">
      {/* Pending Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-soft text-amber">
        <Clock className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <div className="status pending mx-auto mb-1">
          <span className="status-dot" />
          <span>Awaiting Settlement</span>
        </div>
        <h2 className="text-xl font-semibold text-ink tracking-tight">
          Payment Pending
        </h2>
        <p className="text-xs text-text-muted">
          Your payment was submitted and is awaiting confirmation from the bank network.
        </p>
      </div>

      {/* Amount Display */}
      <div className="bg-paper border border-line rounded-[6px] py-4 px-3">
        <span className="text-xs text-text-muted block mb-1">Transaction Amount</span>
        <span className="num text-3xl font-bold text-ink tracking-tight">
          {formattedAmount}
        </span>
      </div>

      {/* Details Box */}
      <div className="bg-card border border-line rounded-[6px] p-4 text-xs space-y-2 text-left">
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
        <div className="flex justify-between items-center">
          <span className="text-text-muted">Notification</span>
          <span className="text-text">Receipt will be emailed to {result.customerEmail}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2">
        <button
          type="button"
          disabled={checking}
          onClick={handleCheck}
          className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 font-semibold rounded-[6px] cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
          <span>{checking ? "Checking Bank Status..." : "Check Status Now"}</span>
        </button>
      </div>
    </div>
  );
};
