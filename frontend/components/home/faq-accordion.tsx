"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How long does delivery take?",
    answer:
      "Every Drapeva saree undergoes careful quality inspection before dispatch. Orders are typically delivered within 10–15 business days. Tracking details will be shared via email once your order ships.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is dispatched, you'll receive a tracking link via email. You can use this link to monitor your shipment in real time.",
  },
  {
    question: "What if I receive a damaged or incorrect product?",
    answer:
      "Customer satisfaction is our priority. If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery, and our team will assist you with a replacement or resolution.",
  },
  {
    question: "Do the saree colors match the photos?",
    answer:
      "We strive to display product colors as accurately as possible. However, slight variations may occur due to different screen settings, lighting conditions, and photography.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, credit cards, debit cards, net banking, and other secure payment methods to ensure a smooth shopping experience.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="gsap-section py-24 md:py-32 bg-muted/5">
      <div className="container-luxe max-w-4xl">
        <div className="text-center mb-16">
          <p className="eyebrow mb-4">Support</p>
          <h2 className="font-display text-3xl md:text-5xl">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`border-b border-border overflow-hidden transition-all duration-500 ${isOpen ? "bg-background" : ""}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between py-6 px-4 md:px-8 text-left hover:text-foreground/70 transition-colors"
                >
                  <span className="font-display text-xl md:text-2xl">{faq.question}</span>
                  <div
                    className={`shrink-0 ml-4 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}
                  >
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-8 px-4 md:px-8 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
