"use client";

import React, { useState } from "react";
import { UssdBankOption } from "@/types/checkout";
import { Copy, Check, Phone, CheckCircle2, ChevronDown } from "lucide-react";

interface UssdPaymentInstructionsProps {
  amount: number;
  options: UssdBankOption[];
  isSubmitting: boolean;
  onConfirmUssd: (bankCode: string, dialString: string) => void;
}

export const UssdPaymentInstructions: React.FC<UssdPaymentInstructionsProps> = ({
  amount,
  options,
  isSubmitting,
  onConfirmUssd,
}) => {
  const [selectedBankCode, setSelectedBankCode] = useState<string>(
    options[0]?.bankCode || ""
  );
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedBank = options.find((o) => o.bankCode === selectedBankCode) || options[0];

  const handleCopy = async () => {
    if (!selectedBank) return;
    try {
      await navigator.clipboard.writeText(selectedBank.dialString);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

  return (
    <div className="space-y-4 pt-2">
      {/* Bank Selector */}
      <div>
        <label
          htmlFor="bankSelect"
          className="block text-xs font-medium text-text mb-1.5"
        >
          Choose Your Bank
        </label>
        <div className="relative">
          <select
            id="bankSelect"
            value={selectedBankCode}
            onChange={(e) => setSelectedBankCode(e.target.value)}
            disabled={isSubmitting}
            className="w-full appearance-none border border-line-strong rounded-[6px] px-3.5 py-2.5 text-sm text-text bg-card focus:outline-none focus:border-accent transition-colors pr-10 cursor-pointer"
          >
            {options.map((bank) => (
              <option key={bank.bankCode} value={bank.bankCode}>
                {bank.bankName}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* USSD Code Box */}
      {selectedBank && (
        <div className="bg-card border border-line-strong rounded-[6px] p-4 text-center space-y-3">
          <span className="text-xs text-text-muted block">
            Dial this USSD code on your mobile device
          </span>
          <div className="num text-2xl font-bold tracking-wider text-ink bg-paper py-2.5 px-3 rounded-[6px] border border-line select-all inline-block w-full">
            {selectedBank.dialString}
          </div>

          <div className="flex gap-2 justify-center pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-accent" />
                  <span className="text-accent font-medium">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-text-muted" />
                  <span>Copy USSD Code</span>
                </>
              )}
            </button>

            <a
              href={`tel:${selectedBank.dialString.replace(/#/g, "%23")}`}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-accent" />
              <span>Dial on Phone</span>
            </a>
          </div>
        </div>
      )}

      {/* Step guidance */}
      <div className="space-y-1.5 text-xs text-text-muted pl-1">
        <div className="flex items-start gap-2">
          <span className="w-4 h-4 rounded-full bg-paper border border-line-strong text-ink flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
            1
          </span>
          <span>Dial from the SIM card registered with your {selectedBank?.bankName}.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-4 h-4 rounded-full bg-paper border border-line-strong text-ink flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
            2
          </span>
          <span>Confirm the transaction amount of {formattedAmount}.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-4 h-4 rounded-full bg-paper border border-line-strong text-ink flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
            3
          </span>
          <span>Enter your USSD banking 4-digit PIN to authorize payment.</span>
        </div>
      </div>

      {/* Confirm Action */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSubmitting || !selectedBank}
          onClick={() => {
            if (selectedBank) {
              onConfirmUssd(selectedBank.bankCode, selectedBank.dialString);
            }
          }}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-[6px] cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I have completed USSD payment</span>
        </button>
      </div>
    </div>
  );
};
