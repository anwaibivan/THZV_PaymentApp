"use client";

import React, { useState } from "react";
import { CheckoutSession } from "@/types/checkout";
import { Copy, Check } from "lucide-react";

interface PaymentSummaryProps {
  session: CheckoutSession;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ session }) => {
  const [copied, setCopied] = useState(false);

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(session.amount);

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(session.paymentReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="py-5 border-b border-line">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          Amount to Pay
        </span>
        <span className="text-xs text-text-muted">
          Ref:{" "}
          <button
            onClick={handleCopyRef}
            type="button"
            className="num inline-flex items-center gap-1 font-medium text-text hover:text-accent transition-colors cursor-pointer"
            title="Click to copy reference"
          >
            {session.paymentReference}
            {copied ? (
              <Check className="w-3 h-3 text-accent" />
            ) : (
              <Copy className="w-3 h-3 text-text-faint" />
            )}
          </button>
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="num text-3xl font-semibold tracking-tight text-ink">
          {formattedAmount}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
        <div>
          {session.description || "Checkout Order"}
        </div>
        <div className="truncate max-w-[200px]" title={session.customerEmail}>
          {session.customerEmail}
        </div>
      </div>
    </div>
  );
};
