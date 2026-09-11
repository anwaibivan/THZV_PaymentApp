"use client";

import React from "react";
import { PaymentMethodType } from "@/types/checkout";
import { CreditCard, Building2, Smartphone } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  disabled?: boolean;
}

interface MethodOption {
  id: PaymentMethodType;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const METHODS: MethodOption[] = [
  {
    id: "CARD",
    label: "Card",
    sublabel: "Mastercard, Visa, Verve",
    icon: CreditCard,
  },
  {
    id: "BANK_TRANSFER",
    label: "Transfer",
    sublabel: "Instant bank transfer",
    icon: Building2,
  },
  {
    id: "USSD",
    label: "USSD",
    sublabel: "Dial bank code",
    icon: Smartphone,
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  disabled = false,
}) => {
  return (
    <div className="pt-5 pb-4">
      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-3">
        Choose Payment Method
      </label>
      <div className="grid grid-cols-3 gap-2.5">
        {METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMethod(method.id)}
              className={`p-3 rounded-[6px] text-left transition-all border flex flex-col justify-between min-h-[82px] cursor-pointer ${
                isSelected
                  ? "border-ink bg-ink text-[#F5F4EF] shadow-sm"
                  : "border-line bg-card text-text hover:border-line-strong hover:bg-paper"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Icon
                  className={`w-5 h-5 ${
                    isSelected ? "text-[#F5F4EF]" : "text-text-muted"
                  }`}
                />
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                )}
              </div>
              <div>
                <span className="text-xs font-semibold block leading-tight">
                  {method.label}
                </span>
                <span
                  className={`text-[10.5px] block truncate mt-0.5 ${
                    isSelected ? "text-[#C7C5BB]" : "text-text-muted"
                  }`}
                >
                  {method.sublabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
