import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Drapeva collects, uses, and protects your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-8 md:py-12 text-center">
          <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-wide text-ink">
            Privacy Policy
          </h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-12">
          {/* Introduction */}
          <div className="text-center space-y-4">
            <p className="text-base text-muted-foreground leading-relaxed font-medium">
              Drapeva values your privacy. This Privacy Policy explains how we collect, use, and
              protect your personal information when you visit and buy from our store.
            </p>
          </div>

          <hr className="border-border/60" />

          {/* Information We Collect */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">Information We Collect</h2>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium pl-5 list-disc marker:text-gold">
              <li>Name, email address, phone number, and shipping address</li>
              <li>Payment details (processed securely through our payment partners)</li>
              <li>Order history and browsing behavior on our website</li>
            </ul>
          </div>

          {/* How We Use Your Information */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">
              How We Use Your Information
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium pl-5 list-disc marker:text-gold">
              <li>To process and deliver your orders</li>
              <li>To communicate updates about your order or account</li>
              <li>To improve our products, services, and website experience</li>
              <li>To send promotional offers, only if you have opted in</li>
            </ul>
          </div>

          {/* Data Protection */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">Data Protection</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              We use industry-standard security measures to protect your personal data. We do not
              sell your personal information to third parties.
            </p>
          </div>

          {/* Cookies */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Our website uses cookies to enhance your browsing experience and analyze site traffic.
              You can disable cookies through your browser settings.
            </p>
          </div>

          {/* Your Rights */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">Your Rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              You may request access to, correction of, or deletion of your personal data at any
              time by contacting us at{" "}
              <a
                href="mailto:support@drapeva.com"
                className="text-foreground hover:underline font-semibold"
              >
                support@drapeva.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
