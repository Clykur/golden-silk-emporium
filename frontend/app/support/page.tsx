"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { ChevronDown, Send } from "lucide-react";

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

export default function SupportCenter() {
  const user = useAuth((s) => s.user);
  const [activeTab, setActiveTab] = useState<"faq" | "contact" | "policy">("contact");
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
      await api.support.createTicket({
        customer_name: name,
        customer_email: email,
        subject,
        message,
        category: "other",
        user_id: user?.id || null,
      });
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
        <div className="container-luxe py-4 md:py-6 text-center">
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Contact & Support</h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-16">
        {/* Contact Form & Info */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-2xl mb-4">Get in Touch</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Need assistance with a product, order, or delivery? We're here to help. Reach out to
                our team for prompt and personalized support.
              </p>
            </div>

            <div className="space-y-10 text-sm">
              <div>
                <p className="eyebrow mb-1">Email</p>
                <p className="text-foreground">hello@drapeva.com</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Customer Support</p>
                <p className="text-foreground">+91 99497 40776</p>
                <p className="text-muted-foreground mt-1">Mon - Sat, 10am to 7pm IST</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Online Store</p>
                <p className="text-foreground leading-relaxed">
                  Shop from anywhere in India through Drapeva's curated saree collection. Fast,
                  secure, and reliable delivery nationwide.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="space-y-5 border border-border p-6 bg-champagne/10 md:p-8"
          >
            <h2 className="font-display text-2xl mb-4">Submit Query</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block group">
                <span className="eyebrow mb-2 block transition-colors group-focus-within:text-foreground">
                  Name
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </label>
              <label className="block group">
                <span className="eyebrow mb-2 block transition-colors group-focus-within:text-foreground">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </label>
            </div>
            <label className="block group">
              <span className="eyebrow mb-2 block transition-colors group-focus-within:text-foreground">
                Subject
              </span>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                placeholder="e.g. Blouse fitting request"
              />
            </label>
            <label className="block group">
              <span className="eyebrow mb-2 block transition-colors group-focus-within:text-foreground">
                Message Details
              </span>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors resize-y"
                placeholder="Write details here..."
              />
            </label>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] transition-all hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> {loading ? "Submitting..." : "Submit Inquiry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
