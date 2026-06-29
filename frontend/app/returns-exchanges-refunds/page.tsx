import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns, Exchanges & Refunds Policy",
  description: "Learn about the returns, exchanges, and refund guidelines at Drapeva.",
};

export default function ReturnsExchangesRefunds() {
  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-8 md:py-12 text-center">
          <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-wide text-ink">
            Returns, Exchanges & Refunds
          </h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-12">
          {/* Introduction */}
          <div className="text-center space-y-4">
            <p className="text-base text-muted-foreground leading-relaxed font-medium">
              At Drapeva, we strive to provide you with the best shopping experience. Since each
              piece is carefully selected, we currently do not offer returns or refunds. However, we
              do offer exchanges under the conditions below.
            </p>
          </div>

          <hr className="border-border/60" />

          {/* Exchange Window */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">Exchange Window</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              You may request an exchange within{" "}
              <span className="text-foreground font-semibold">1 day</span> of receiving your order.
              Requests made after this period cannot be accepted.
            </p>
          </div>

          {/* Conditions for Exchange */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">
              Conditions for Exchange
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              To be eligible for an exchange:
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium pl-5 list-disc marker:text-gold">
              <li>The item must be unused, unwashed, and unworn.</li>
              <li>Original tags, packaging, and invoice must be intact.</li>
              <li>The product must not be damaged, altered, or stained by the customer.</li>
              <li>Exchange requests are subject to stock availability.</li>
              <li>
                Sale items, customized products, and products marked as non-exchangeable are not
                eligible for exchange.
              </li>
            </ul>
          </div>

          {/* How to Request an Exchange */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">
              How to Request an Exchange
            </h2>
            <ol className="space-y-3 text-sm text-muted-foreground font-medium pl-5 list-decimal marker:text-gold marker:font-semibold">
              <li>
                Contact us within 1 day of delivery through:
                <ul className="mt-2 space-y-1.5 pl-5 list-disc marker:text-muted-foreground">
                  <li>
                    Email:{" "}
                    <a
                      href="mailto:support@drapeva.com"
                      className="text-foreground hover:underline font-semibold"
                    >
                      support@drapeva.com
                    </a>
                  </li>
                  <li>
                    WhatsApp:{" "}
                    <a
                      href="https://wa.me/918123045318"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:underline font-semibold"
                    >
                      +91 81230 45318
                    </a>
                  </li>
                </ul>
              </li>
              <li>Share your order number and the reason for the exchange.</li>
              <li>
                Our team will verify your request and provide return shipping or pickup
                instructions.
              </li>
              <li>
                Once the product is received and passes inspection, the replacement item will be
                dispatched.
              </li>
            </ol>
          </div>

          {/* No Return & Refund Policy */}
          <div className="border border-border p-6 md:p-8 bg-champagne/10 space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink text-destructive">
              No Return & No Refund Policy
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium pl-5 list-disc marker:text-destructive">
              <li>We do not accept returns.</li>
              <li>We do not provide refunds under any circumstances.</li>
              <li>Orders cannot be cancelled after they have been shipped.</li>
            </ul>
          </div>

          {/* Non-Exchangeable Items */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">Non-Exchangeable Items</h2>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium pl-5 list-disc marker:text-gold">
              <li>Items marked as Final Sale.</li>
              <li>Products damaged due to customer misuse.</li>
              <li>Customized or altered products.</li>
              <li>Gift cards, coupons, or promotional items.</li>
            </ul>
          </div>

          <hr className="border-border/60" />

          {/* Conclusion */}
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground/80 font-semibold tracking-wider uppercase">
              By placing an order with Drapeva, you agree to this Exchange Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
