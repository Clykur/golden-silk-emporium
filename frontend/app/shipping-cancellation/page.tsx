import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Cancellation Policy",
  description:
    "Read about Drapeva's shipping timelines, tracking details, and order cancellation guidelines.",
};

export default function ShippingCancellationPolicy() {
  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-8 md:py-12 text-center">
          <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-wide text-ink">
            Shipping & Cancellation Policy
          </h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-12">
          {/* SECTION 1: SHIPPING POLICY */}
          <div className="space-y-8">
            <div className="border-b border-border pb-4">
              <h2 className="font-display text-2xl tracking-wider text-ink">Shipping Policy</h2>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              At Drapeva, we are committed to delivering your order safely and on time.
            </p>

            <div className="space-y-4">
              <h3 className="font-display text-base tracking-wider text-ink">Order Processing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                All orders are processed within{" "}
                <span className="text-foreground font-semibold">3 to 4 business days</span> after
                order confirmation. Once your order has been processed, it will be handed over to
                our trusted courier partners for delivery.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-base tracking-wider text-ink">Delivery Timeline</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Orders are typically delivered within{" "}
                <span className="text-foreground font-semibold">10 to 15 business days</span> from
                the date of order confirmation. Delivery timelines may vary depending on your
                location, public holidays, weather conditions, or unforeseen courier delays.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-base tracking-wider text-ink">Shipping Charges</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Shipping charges, if applicable, will be displayed at checkout before you complete
                your payment.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-base tracking-wider text-ink">Order Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Once your order has been shipped, you will receive a tracking link via Email or
                WhatsApp to monitor the status of your shipment.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-base tracking-wider text-ink">
                Delayed or Lost Shipments
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                If your order has not arrived within the expected delivery timeframe, please contact
                our Customer Care team at{" "}
                <a
                  href="mailto:drapeva2026@gmail.com"
                  className="text-foreground hover:underline font-semibold"
                >
                  drapeva2026@gmail.com
                </a>
                . We will coordinate with our courier partners and assist you in resolving the issue
                as quickly as possible.
              </p>
            </div>
          </div>

          <hr className="border-border/60 my-12" />

          {/* SECTION 2: CANCELLATION POLICY */}
          <div className="space-y-8">
            <div className="border-b border-border pb-4">
              <h2 className="font-display text-2xl tracking-wider text-ink">Cancellation Policy</h2>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              At Drapeva, we understand that plans can change.
            </p>

            <ul className="space-y-3 text-sm text-muted-foreground font-medium pl-5 list-disc marker:text-gold">
              <li>
                Orders can be cancelled only before the shipping confirmation or tracking update is
                shared with you.
              </li>
              <li>Once an order has been shipped, it cannot be cancelled.</li>
              <li>
                To request a cancellation, please contact us immediately through:
                <ul className="mt-2 space-y-1.5 pl-5 list-disc marker:text-muted-foreground">
                  <li>
                    Email:{" "}
                    <a
                      href="mailto:drapeva2026@gmail.com"
                      className="text-foreground hover:underline font-semibold"
                    >
                      drapeva2026@gmail.com
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
            </ul>

            <div className="space-y-4">
              <h3 className="font-display text-base tracking-wider text-ink">
                Refunds on Cancellations
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                If your cancellation request is approved before shipment, the order amount (if
                prepaid) will be refunded to the original payment method within{" "}
                <span className="text-foreground font-semibold">5 to 7 business days</span>.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-base tracking-wider text-ink">
                Right of Cancellation
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Drapeva reserves the right to cancel any order due to product unavailability,
                pricing errors, or unforeseen circumstances. In such cases, a full refund will be
                issued to the customer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
