import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { useShop, cartTotal } from "@/lib/store";
import { formatINR } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Maaya Couture" },
      { name: "description", content: "Secure checkout for your Maaya order." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const cart = useShop((s) => s.cart);
  const clearCart = useShop((s) => s.clearCart);
  const subtotal = cartTotal(cart);
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;
  const [placed, setPlaced] = useState(false);

  if (placed) {
    return (
      <div className="container-luxe py-24 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/20 text-gold">
          <Check className="h-7 w-7" />
        </div>
        <p className="eyebrow mt-6">Confirmed</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Thank you, beautifully done.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          A confirmation is on its way. Our atelier will be in touch within 24 hours to schedule fittings.
        </p>
        <Link to="/" className="mt-10 inline-block border-b border-foreground pb-1 eyebrow">
          Back to the atelier
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-luxe py-24 text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
        <Link
          to="/shop"
          search={{ category: "all" }}
          className="mt-8 inline-block border-b border-foreground pb-1 eyebrow"
        >
          Discover couture
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-12 md:py-16">
      <div className="text-center">
        <p className="eyebrow">Secure checkout</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Almost yours</h1>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); clearCart(); setPlaced(true); }}
        className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]"
      >
        {/* Form */}
        <div className="space-y-10">
          <Section title="Contact">
            <Input label="Email" type="email" required />
            <Input label="Phone" type="tel" required />
          </Section>

          <Section title="Shipping address">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First name" required />
              <Input label="Last name" required />
            </div>
            <Input label="Address" required />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="City" required />
              <Input label="State" required />
              <Input label="PIN code" required />
            </div>
          </Section>

          <Section title="Payment">
            <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" /> All transactions are encrypted.
            </p>
            <Input label="Card number" placeholder="1234 5678 9012 3456" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Expiry" placeholder="MM / YY" required />
              <Input label="CVV" placeholder="123" required />
            </div>
          </Section>

          <button
            type="submit"
            className="w-full bg-foreground py-5 text-xs font-medium tracking-[0.3em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            Place order · {formatINR(total)}
          </button>
        </div>

        {/* Summary */}
        <aside className="h-fit border border-border bg-champagne/30 p-7 lg:sticky lg:top-32">
          <p className="eyebrow">Order summary</p>
          <ul className="mt-6 divide-y divide-border">
            {cart.map((item) => (
              <li key={item.product.id + item.size} className="flex gap-4 py-4">
                <img src={item.product.image} alt={item.product.name} className="h-24 w-18 object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base leading-tight">{item.product.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Size {item.size} · Qty {item.qty}</p>
                </div>
                <p className="text-sm">{formatINR(item.product.price * item.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 text-sm">
            <Row label="Subtotal" value={formatINR(subtotal)} />
            <Row label="Shipping" value="Free" />
            <div className="border-t border-border pt-3" />
            <Row label={<span className="eyebrow">Total</span>} value={<span className="font-display text-xl">{formatINR(total)}</span>} />
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      <input
        {...props}
        className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
      />
    </label>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
