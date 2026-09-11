"use client";

import React from "react";
import { CheckoutHeader } from "./CheckoutHeader";
import { Lock } from "lucide-react";

interface CheckoutShellProps {
  merchantName?: string;
  children: React.ReactNode;
}

export const CheckoutShell: React.FC<CheckoutShellProps> = ({
  merchantName,
  children,
}) => {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-[480px]">
        <div className="bg-card border border-line rounded-[6px] p-6 sm:p-8 shadow-[0_2px_8px_rgba(20,24,31,0.04)]">
          <CheckoutHeader merchantName={merchantName} />
          {children}
        </div>

        {/* Security Footer */}
        <footer className="mt-6 text-center text-xs text-text-muted space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-text-muted">
            <Lock className="w-3.5 h-3.5 text-accent" />
            <span className="font-medium text-text">Secured by Payment App</span>
          </div>
          <p className="text-[11px] text-text-faint">
            PCI-DSS Level 1 Compliant • 256-Bit SSL Encryption
          </p>
        </footer>
      </main>
    </div>
  );
};
