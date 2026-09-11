"use client";

import React, { useState } from "react";
import { BankTransferDetails } from "@/types/checkout";
import { Copy, Check, Clock, CheckCircle2 } from "lucide-react";

interface BankTransferInstructionsProps {
  amount: number;
  details: BankTransferDetails;
  isSubmitting: boolean;
  onConfirmSent: (accountNumber: string) => void;
}

export const BankTransferInstructions: React.FC<BankTransferInstructionsProps> = ({
  amount,
  details,
  isSubmitting,
  onConfirmSent,
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(details.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyAmount = async () => {
    try {
      await navigator.clipboard.writeText(amount.toString());
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="bg-paper border border-line rounded-[6px] p-3.5 text-xs text-text">
        <div className="flex items-center gap-2 text-amber font-medium mb-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Single-use virtual account expires in 30 minutes</span>
        </div>
        <p className="text-[11.5px] text-text-muted">
          Transfer the exact amount to the account below from any bank mobile app or internet banking platform.
        </p>
      </div>

      {/* Account Details Card */}
      <div className="bg-card border border-line-strong rounded-[6px] p-4 space-y-3">
        {/* Bank Name */}
        <div className="flex justify-between items-center text-xs pb-2 border-b border-line">
          <span className="text-text-muted">Bank Name</span>
          <span className="font-semibold text-text">{details.bankName}</span>
        </div>

        {/* Account Number */}
        <div className="flex justify-between items-center pb-2 border-b border-line">
          <div>
            <span className="text-xs text-text-muted block">Account Number</span>
            <span className="num text-xl font-bold text-ink tracking-wider">
              {details.accountNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyAccount}
            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copiedAccount ? (
              <>
                <Check className="w-3 h-3 text-accent" />
                <span className="text-accent font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-text-muted" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Beneficiary Name */}
        <div className="flex justify-between items-center text-xs pb-2 border-b border-line">
          <span className="text-text-muted">Beneficiary</span>
          <span className="font-medium text-text text-right truncate max-w-[220px]">
            {details.accountName}
          </span>
        </div>

        {/* Exact Amount */}
        <div className="flex justify-between items-center pt-0.5">
          <div>
            <span className="text-xs text-text-muted block">Amount to Send</span>
            <span className="num text-base font-bold text-ink">
              {formattedAmount}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyAmount}
            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copiedAmount ? (
              <>
                <Check className="w-3 h-3 text-accent" />
                <span className="text-accent font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-text-muted" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-1.5 text-xs text-text-muted pl-1">
        <div className="flex items-start gap-2">
          <span className="w-4 h-4 rounded-full bg-paper border border-line-strong text-ink flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
            1
          </span>
          <span>Copy the account number and transfer exactly {formattedAmount}.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-4 h-4 rounded-full bg-paper border border-line-strong text-ink flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
            2
          </span>
          <span>Confirm the beneficiary name matches <strong>{details.accountName}</strong>.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-4 h-4 rounded-full bg-paper border border-line-strong text-ink flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
            3
          </span>
          <span>Click the confirmation button below after completing your transfer.</span>
        </div>
      </div>

      {/* Confirm Sent Action */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onConfirmSent(details.accountNumber)}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-[6px] cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I have sent the money</span>
        </button>
      </div>
    </div>
  );
};
