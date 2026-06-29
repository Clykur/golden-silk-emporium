"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  const whatsappMessage = encodeURIComponent(
    "Hello Drapeva! I'm interested in your saree collection and would like to know more. Could you please assist me?",
  );

  useEffect(() => {
    const toggleVisibility = () => {
      // Hide in the hero section on the homepage
      const isAtHero = pathname === "/" && window.scrollY < window.innerHeight - 150;

      // Hide near the footer
      const isAtFooter =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300;

      // Hide in the admin portal
      const isAdmin = pathname?.startsWith("/admin");

      setIsVisible(!(isAtHero || isAtFooter || isAdmin));
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    window.addEventListener("resize", toggleVisibility, { passive: true });

    toggleVisibility();

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("resize", toggleVisibility);
    };
  }, [pathname]);

  return (
    <a
      href={`https://wa.me/918123045318?text=${whatsappMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-[0_18px_40px_-12px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_22px_48px_-12px_rgba(37,211,102,0.7)] ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-16 opacity-0"
      }`}
      aria-label="Chat with Drapeva on WhatsApp"
    >
      <FaWhatsapp className="h-5 w-5" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
