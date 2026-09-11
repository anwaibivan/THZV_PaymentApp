"use client";

import React, { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { CardPaymentInput } from "@/types/checkout";

interface CardPaymentFormProps {
  amount: number;
  isSubmitting: boolean;
  onSubmit: (cardData: CardPaymentInput) => void;
}

export const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  amount,
  isSubmitting,
  onSubmit,
}) => {
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 19);
    const parts = raw.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(" "));
  };

  // Format expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(raw);
  };

  // Format CVV 3-4 digits
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(raw);
  };

  // Detect card brand
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (/^4/.test(clean)) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "Mastercard";
    if (/^(506|507|650)/.test(clean)) return "Verve";
    return null;
  };

  const cardBrand = getCardBrand(cardNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNumber = cardNumber.replace(/\s+/g, "");
    if (cleanNumber.length < 16) {
      setError("Please enter a valid 16-19 digit card number.");
      return;
    }

    if (!cardholderName.trim()) {
      setError("Please enter the name on the card.");
      return;
    }

    const [monthStr, yearStr] = expiry.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr ? `20${yearStr}` : "0", 10);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (!month || month < 1 || month > 12) {
      setError("Please enter a valid expiry month (01-12).");
      return;
    }

    if (!year || year < currentYear || (year === currentYear && month < currentMonth)) {
      setError("This card has expired.");
      return;
    }

    if (cvv.length < 3) {
      setError("Please enter a valid 3 or 4 digit CVV.");
      return;
    }

    onSubmit({
      cardholderName: cardholderName.trim(),
      cardNumber: cleanNumber,
      expiryMonth: monthStr,
      expiryYear: yearStr,
      cvv,
    });
  };

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {error && (
        <div className="alert error flex items-center gap-2 text-xs py-2 px-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Card Number */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label
            htmlFor="cardNumber"
            className="block text-xs font-medium text-text"
          >
            Card Number
          </label>
          {cardBrand && (
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider bg-accent-soft px-1.5 py-0.5 rounded">
              {cardBrand}
            </span>
          )}
        </div>
        <div className="relative">
          <input
            id="cardNumber"
            type="text"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={handleCardNumberChange}
            disabled={isSubmitting}
            autoComplete="cc-number"
            className="num w-full border border-line-strong rounded-[6px] px-3.5 py-2.5 text-sm text-text bg-card focus:outline-none focus:border-accent transition-colors tracking-wide"
            required
          />
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label
          htmlFor="cardholderName"
          className="block text-xs font-medium text-text mb-1.5"
        >
          Cardholder Name
        </label>
        <input
          id="cardholderName"
          type="text"
          placeholder="Name on card"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          disabled={isSubmitting}
          autoComplete="cc-name"
          className="w-full border border-line-strong rounded-[6px] px-3.5 py-2.5 text-sm text-text bg-card focus:outline-none focus:border-accent transition-colors"
          required
        />
      </div>

      {/* Expiry & CVV Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="cardExpiry"
            className="block text-xs font-medium text-text mb-1.5"
          >
            Expiry Date
          </label>
          <input
            id="cardExpiry"
            type="text"
            inputMode="numeric"
            placeholder="MM / YY"
            value={expiry}
            onChange={handleExpiryChange}
            disabled={isSubmitting}
            autoComplete="cc-exp"
            className="num w-full border border-line-strong rounded-[6px] px-3.5 py-2.5 text-sm text-text bg-card focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="cardCvv"
              className="block text-xs font-medium text-text"
            >
              CVV
            </label>
            <span className="text-[10.5px] text-text-muted">3 or 4 digits</span>
          </div>
          <input
            id="cardCvv"
            type="password"
            inputMode="numeric"
            placeholder="•••"
            value={cvv}
            onChange={handleCvvChange}
            disabled={isSubmitting}
            autoComplete="cc-csc"
            maxLength={4}
            className="num w-full border border-line-strong rounded-[6px] px-3.5 py-2.5 text-sm text-text bg-card focus:outline-none focus:border-accent transition-colors text-center tracking-widest"
            required
          />
        </div>
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-2 pt-1 text-[11px] text-text-muted">
        <Lock className="w-3.5 h-3.5 text-text-faint flex-shrink-0" />
        <span>Card credentials are encrypted and never stored on our servers.</span>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-[6px] cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          <span>Pay {formattedAmount}</span>
        </button>
      </div>
    </form>
  );
};
