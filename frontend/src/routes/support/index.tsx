import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ChevronDown, Send } from "lucide-react";

export const Route = createFileRoute("/support/")({
  head: () => ({
    meta: [
      { title: "Support Center & FAQ — Drapeva" },
      {
        name: "description",
        content: "Contact the Drapeva concierge or browse policies on shipping, returns, and fits.",
      },
    ],
  }),
  component: SupportCenter,
});

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Most orders are processed within a week and delivered across India within 7-10 days, depending on your location.",
  },
  {
    q: "Do you ship across India?",
    a: "Yes, Drapeva currently delivers to customers across India. Shipping timelines may vary based on the delivery location.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order is shipped, you will receive a tracking link via email or SMS. You can also view your order status from your account dashboard.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns and exchanges on eligible products within 7 days of delivery. Items must be unused, unwashed, and returned in their original packaging.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Currently, we offer Cash on Delivery (COD). Online payments will be introduced soon for a faster checkout experience.",
  },
  {
    q: "Do I need an account to place an order?",
    a: "Yes. Customers must create an account or sign in before adding products to their cart, placing orders, or managing their purchases.",
  },
];

function SupportCenter() {
  const [activeTab, setActiveTab] = useState<"faq" | "contact" | "policy">("faq");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.support.createTicket({ name, email, subject, message });
      toast.success("Support ticket created. Our concierge will email you shortly.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center">
          <p className="eyebrow">Customer Care</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Support Hub</h1>
          <span className="gold-divider mt-4 block mx-auto" />

          <nav className="mt-8 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-[0.2em] font-semibold">
            <button
              onClick={() => setActiveTab("faq")}
              className={`pb-1 border-b transition-colors cursor-pointer ${activeTab === "faq" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              FAQs
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`pb-1 border-b transition-colors cursor-pointer ${activeTab === "contact" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab("policy")}
              className={`pb-1 border-b transition-colors cursor-pointer ${activeTab === "policy" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Atelier Policies
            </button>
          </nav>
        </div>
      </div>

      <div className="container-luxe py-16 max-w-3xl">
        {/* FAQs */}
        {activeTab === "faq" && (
          <div className="space-y-4 divide-y divide-border">
            {FAQS.map((faq, index) => (
              <div key={index} className="py-4 first:pt-0">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full justify-between items-center text-left font-display text-lg py-2 cursor-pointer group hover:text-gold transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${openFaq === index ? "rotate-180 text-gold" : ""}`}
                  />
                </button>
                {openFaq === index && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground animate-rise">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contact Form */}
        {activeTab === "contact" && (
          <form
            onSubmit={handleContactSubmit}
            className="space-y-5 border border-border p-6 bg-champagne/10 md:p-8"
          >
            <h2 className="font-display text-2xl mb-4">Submit Query</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="eyebrow mb-2 block">Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="eyebrow mb-2 block">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none"
                />
              </label>
            </div>
            <label className="block">
              <span className="eyebrow mb-2 block">Subject</span>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none"
                placeholder="e.g. Blouse fitting request"
              />
            </label>
            <label className="block">
              <span className="eyebrow mb-2 block">Message Details</span>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none"
                placeholder="Write details here..."
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-4 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {loading ? "Submitting..." : "Submit Inquiry"}
            </button>
          </form>
        )}

        {/* Policies */}
        {activeTab === "policy" && (
          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h2 className="font-display text-xl text-foreground mb-3">Shipping Policy</h2>
              <p>
                We provide worldwide shipping. Custom handloom or bridal drapes require 4 to 6
                weeks. In-stock sarees ship in 3 to 5 business days. Once your item is dispatched,
                you will receive tracking numbers via SMS and email.
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl text-foreground mb-3">Returns & Refunds</h2>
              <p>
                Because custom items are crafted to your exact specifications, we do not issue
                refunds or accept returns on made-to-order couture. If you receive a fitting size
                that deviates from your order details, we offer complimentary adjustments within our
                studio.
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl text-foreground mb-3">Privacy & Terms</h2>
              <p>
                All client profiles, measurement files, and card details are encrypted. We will
                never share your sizing or contact details with third-party logistics. By placing an
                order, you agree to our standard terms of artisan craftsmanship and fitting
                timelines.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
