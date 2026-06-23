"use client";

import Link from "next/link";
import {
  Package,
  Heart,
  MapPin,
  Bell,
  HelpCircle,
  RotateCcw,
  Shield,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

const ACCOUNT_CARDS = [
  {
    to: "/account/profile",
    label: "My Account",
    desc: "View and update your profile information",
    icon: User,
  },
  {
    to: "/account/orders",
    label: "Your Orders",
    desc: "Track, return, or buy things again",
    icon: Package,
  },
  {
    to: "/account/security",
    label: "Login & Security",
    desc: "Edit login, name, and mobile number",
    icon: Shield,
  },

  {
    to: "/account/addresses",
    label: "Your Addresses",
    desc: "Edit addresses for orders and gifts",
    icon: MapPin,
  },
  {
    to: "/account/wishlist",
    label: "Your Wishlist",
    desc: "View and manage saved items",
    icon: Heart,
  },
  {
    to: "/account/returns",
    label: "Returns & Exchange",
    desc: "Track the status of returned items",
    icon: RotateCcw,
  },
  {
    to: "/account/support",
    label: "Contact Support",
    desc: "Reach out for help or view support tickets",
    icon: HelpCircle,
  },
  {
    to: "/account/notifications",
    label: "Alerts & Messages",
    desc: "View your order updates and messages",
    icon: Bell,
  },
];

export default function AccountOverview() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    router.push("/");
  };

  return (
    <DashboardLayout title="Your Account">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-ink font-semibold">Your Account</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-destructive border border-destructive/20 hover:bg-destructive/5 px-4 py-2 rounded transition-colors shrink-0"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {ACCOUNT_CARDS.map((card) => (
          <Link
            key={card.to}
            href={card.to}
            className="flex items-start gap-4 border border-border bg-background p-5 hover:bg-champagne/10 hover:border-gold/30 transition-all rounded"
          >
            <div className="mt-1 flex items-center justify-center h-12 w-12 rounded-full bg-gold/10 text-gold shrink-0">
              <card.icon className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-medium text-foreground">{card.label}</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
