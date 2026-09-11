"use client";

import React from "react";
import { Clock, ArrowRight } from "lucide-react";
import { CheckoutSession } from "@/types/checkout";

interface PaymentExpiredProps {
  session: CheckoutSession;
  onReturnToMerchant?: () => void;
}

export const PaymentExpired: React.FC<PaymentExpiredProps> = ({
  session,
  onReturnToMerchant,
}) => {
  return (
    <div className="py-8 space-y-6 text-center">
      {/* Expired Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-paper border border-line-strong text-text-muted">
        <Clock className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-paper border border-line rounded text-text-muted">
          Session Expired
        </span>
        <h2 className="text-xl font-semibold text-ink tracking-tight pt-1">
          Payment Window Elapsed
        </h2>
        <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
          For your financial security, this checkout session expired after 30 minutes of inactivity.
        </p>
      </div>

      <div className="bg-paper border border-line rounded-[6px] p-4 text-xs space-y-2 text-left">
        <div className="flex justify-between items-center pb-2 border-b border-line">
          <span className="text-text-muted">Payment Reference</span>
          <span className="num font-medium text-text">{session.paymentReference}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted">Merchant</span>
          <span className="text-text">{session.merchantName}</span>
        </div>
      </div>

      <div className="pt-2">
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
          <span>Return to Merchant to Restart</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
