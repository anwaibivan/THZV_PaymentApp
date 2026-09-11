"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

interface CheckoutHeaderProps {
  merchantName?: string;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ merchantName }) => {
  return (
    <header className="flex items-center justify-between pb-6 border-b border-line">
      <div className="flex items-center gap-3">
        <div className="brand-mark" aria-hidden="true">
          P
        </div>
        <div>
          <span className="text-[17px] font-semibold tracking-tight text-ink block leading-snug">
            Payment App
          </span>
          {merchantName && (
            <span className="text-xs text-text-muted">
              Paying <span className="font-medium text-text">{merchantName}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-accent font-medium bg-accent-soft px-2.5 py-1 rounded">
        <ShieldCheck className="w-4 h-4 text-accent" />
        <span>Secured Checkout</span>
      </div>
    </header>
  );
};
