import { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { PaymentStatus } from "@/types/checkout";

interface PageProps {
  params: {
    paymentReference: string;
  };
  searchParams?: {
    status?: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: `Payment Checkout (${params.paymentReference}) — Payment App`,
    description: "Complete your transaction securely with Payment App.",
  };
}

export default function CheckoutPage({ params, searchParams }: PageProps) {
  const statusParam = searchParams?.status?.toUpperCase() as PaymentStatus | undefined;
  const validStatuses: PaymentStatus[] = [
    "INITIATED",
    "PROCESSING",
    "SUCCESSFUL",
    "FAILED",
    "PENDING",
    "EXPIRED",
  ];

  const initialOverrideStatus = validStatuses.includes(statusParam as PaymentStatus)
    ? statusParam
    : undefined;

  return (
    <CheckoutClient
      paymentReference={params.paymentReference}
      initialOverrideStatus={initialOverrideStatus}
    />
  );
}
