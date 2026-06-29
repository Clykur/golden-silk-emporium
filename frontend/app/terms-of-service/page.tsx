import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read Drapeva's Terms of Service governing website use and product purchases.",
};

export default function TermsOfService() {
  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-8 md:py-12 text-center">
          <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-wide text-ink">
            Terms of Service
          </h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-12">
          {/* Introduction */}
          <div className="text-center space-y-4">
            <p className="text-base text-muted-foreground leading-relaxed font-medium">
              These Terms of Service (&quot;Terms&quot;) govern your use of the Drapeva website and
              your purchase of products from us. By accessing our website or placing an order, you
              agree to these Terms.
            </p>
          </div>

          <hr className="border-border/60" />

          {/* 1. Use of Our Website */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">1. Use of Our Website</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              You agree to use{" "}
              <a
                href="https://www.drapeva.com"
                className="text-foreground hover:underline font-semibold"
              >
                www.drapeva.com
              </a>{" "}
              only for lawful purposes and in a way that does not infringe the rights of others or
              restrict their use of the site.
            </p>
          </div>

          {/* 2. Products and Pricing */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">
              2. Products and Pricing
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              All products are subject to availability. We reserve the right to change prices,
              descriptions, and availability of products at any time without prior notice.
            </p>
          </div>

          {/* 3. Orders and Payment */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">3. Orders and Payment</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              By placing an order, you confirm that the information you provide is accurate and
              complete. We accept various payment methods as displayed at checkout. Orders are
              confirmed only after successful payment.
            </p>
          </div>

          {/* 4. Intellectual Property */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">
              4. Intellectual Property
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              All content on this website, including logos, images, and text, is the property of
              Drapeva and may not be used without prior written permission.
            </p>
          </div>

          {/* 5. Limitation of Liability */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">
              5. Limitation of Liability
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Drapeva is not liable for any indirect, incidental, or consequential damages arising
              from the use of our website or products.
            </p>
          </div>

          {/* 6. Changes to Terms */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-ink">6. Changes to Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              We may update these Terms from time to time. Continued use of the website after
              changes are posted constitutes acceptance of the revised Terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
