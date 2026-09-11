import Link from "next/link";
import { ArrowRight, CreditCard, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="brand-mark mx-auto" aria-hidden="true">
            P
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            MerchantPay Lite — Customer Payment Journey
          </h1>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            High-fidelity customer checkout experience implementing the BRD user journey with the existing design system.
          </p>
        </div>

        {/* Primary Checkout Initiation Demo Card */}
        <div className="bg-card border border-line rounded-[6px] p-6 shadow-[0_2px_8px_rgba(20,24,31,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Interactive Checkout Session
              </span>
              <h2 className="text-lg font-semibold text-ink mt-0.5">
                Standard Order Checkout (₦10,000.00)
              </h2>
            </div>
            <span className="status success">
              <span className="status-dot" />
              Active Session
            </span>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Experience the complete 3-stage user journey: <strong>Checkout Initiation</strong> (order summary &amp; method selection), <strong>Payment Fulfillment</strong> (Card, Bank Transfer, USSD), and <strong>Verification &amp; Confirmation</strong>.
          </p>

          <div className="pt-2">
            <Link
              href="/checkout/PAY-2026-984210"
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 font-semibold rounded-[6px]"
            >
              <CreditCard className="w-4 h-4" />
              <span>Launch Customer Checkout</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* State Machine Verification Scenarios */}
        <div className="bg-card border border-line rounded-[6px] p-6 shadow-[0_2px_8px_rgba(20,24,31,0.04)] space-y-4">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
            Journey &amp; State Machine Scenarios
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/checkout/ref-success"
              className="p-3.5 border border-line rounded-[6px] hover:border-accent hover:bg-paper transition-all flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-ink block">
                  Success Scenario
                </span>
                <span className="text-[11px] text-text-muted block mt-0.5">
                  Instant confirmation &amp; receipt
                </span>
              </div>
            </Link>

            <Link
              href="/checkout/ref-fail"
              className="p-3.5 border border-line rounded-[6px] hover:border-danger hover:bg-paper transition-all flex items-start gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-danger mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-ink block">
                  Failure &amp; Retry Loop
                </span>
                <span className="text-[11px] text-text-muted block mt-0.5">
                  Safe decline message &amp; retry
                </span>
              </div>
            </Link>

            <Link
              href="/checkout/ref-pending"
              className="p-3.5 border border-line rounded-[6px] hover:border-amber hover:bg-paper transition-all flex items-start gap-3"
            >
              <Clock className="w-4 h-4 text-amber mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-ink block">
                  Pending Settlement
                </span>
                <span className="text-[11px] text-text-muted block mt-0.5">
                  Asynchronous bank confirmation
                </span>
              </div>
            </Link>

            <Link
              href="/checkout/ref-expired"
              className="p-3.5 border border-line rounded-[6px] hover:border-text-muted hover:bg-paper transition-all flex items-start gap-3"
            >
              <ShieldCheck className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-ink block">
                  Expired Session
                </span>
                <span className="text-[11px] text-text-muted block mt-0.5">
                  Timeout &amp; return to merchant
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Existing Merchant Portal Navigation */}
        <div className="bg-card border border-line rounded-[6px] p-6 shadow-[0_2px_8px_rgba(20,24,31,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider">
              Merchant Portal Sections (All 6 Tabs Functional)
            </h3>
            <span className="text-[11px] text-text-muted">Live Mode</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <Link
              href="/merchant/overview"
              className="btn-secondary py-2 px-3 flex items-center justify-between"
            >
              <span>1. Overview</span>
              <ArrowRight className="w-3 h-3 text-text-muted" />
            </Link>
            <Link
              href="/merchant/transactions"
              className="btn-secondary py-2 px-3 flex items-center justify-between"
            >
              <span>2. Transactions</span>
              <ArrowRight className="w-3 h-3 text-text-muted" />
            </Link>
            <Link
              href="/merchant/payouts"
              className="btn-secondary py-2 px-3 flex items-center justify-between"
            >
              <span>3. Payouts</span>
              <ArrowRight className="w-3 h-3 text-text-muted" />
            </Link>
            <Link
              href="/merchant/customers"
              className="btn-secondary py-2 px-3 flex items-center justify-between"
            >
              <span>4. Customers</span>
              <ArrowRight className="w-3 h-3 text-text-muted" />
            </Link>
            <Link
              href="/merchant/developers"
              className="btn-secondary py-2 px-3 flex items-center justify-between"
            >
              <span>5. Developers</span>
              <ArrowRight className="w-3 h-3 text-text-muted" />
            </Link>
            <Link
              href="/merchant/settings"
              className="btn-secondary py-2 px-3 flex items-center justify-between"
            >
              <span>6. Settings</span>
              <ArrowRight className="w-3 h-3 text-text-muted" />
            </Link>
          </div>

          <div className="pt-2 border-t border-line flex flex-wrap gap-2 text-xs">
            <a
              href="/index.html"
              className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-text-muted hover:text-text"
            >
              <span>Login Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/register.html"
              className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-text-muted hover:text-text"
            >
              <span>Register Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/merchant-dashboard.html"
              className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-text-muted hover:text-text"
            >
              <span>Direct Dashboard HTML</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

