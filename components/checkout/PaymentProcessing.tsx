"use client";

import React from "react";
import { PaymentMethodType } from "@/types/checkout";
import { Loader2, ShieldCheck } from "lucide-react";

interface PaymentProcessingProps {
  method: PaymentMethodType;
  amount: number;
}

export const PaymentProcessing: React.FC<PaymentProcessingProps> = ({
  method,
  amount,
}) => {
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

  const getMethodTitle = () => {
    switch (method) {
      case "CARD":
        return "Authorizing Card Payment";
      case "BANK_TRANSFER":
        return "Verifying Bank Transfer Settlement";
      case "USSD":
        return "Confirming USSD Session";
      default:
        return "Processing Transaction";
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="py-12 px-4 text-center space-y-5"
    >
      <div className="relative inline-flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-line flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-ink tracking-tight">
          {getMethodTitle()}
        </h2>
        <p className="num text-xl font-bold text-ink">
          {formattedAmount}
        </p>
        <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed pt-1">
          Communicating securely with your financial institution. Please do not close or refresh this page.
        </p>
      </div>

      <div className="inline-flex items-center gap-1.5 text-[11.5px] text-text-muted bg-paper px-3 py-1 rounded-[4px] border border-line">
        <ShieldCheck className="w-3.5 h-3.5 text-accent" />
        <span>Bank-grade encryption in progress</span>
      </div>
    </div>
  );
};
