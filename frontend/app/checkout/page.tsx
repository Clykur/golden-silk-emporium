"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShop, cartTotal, cartCount } from "@/lib/store";
import { ordersApi, couponsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { formatINR } from "@/lib/types";
import type { ShippingAddress, OrderItem } from "@/lib/types";
import { ShoppingBag, ArrowLeft, Tag, CheckCircle, Navigation, Loader2 } from "lucide-react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SHIPPING_COST = 299;
const TAX_RATE = 0.18;

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
];

export const dynamic = "force-dynamic";

function CheckoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cart, clearCart } = useShop();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(
        "/login?redirect=" +
          encodeURIComponent("/checkout") +
          "&message=" +
          encodeURIComponent("Please sign in to continue shopping."),
      );
    }
  }, [isAuthenticated, router]);

  const [step, setStep] = useState<"address" | "payment" | "confirmed">("address");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("razorpay");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [simulatedPaymentOpen, setSimulatedPaymentOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [rzpOID, setRzpOID] = useState<string>("");

  // Address
  const [address, setAddress] = useState<ShippingAddress>({
    name: user?.name || "",
    phone: user?.phone || "",
    line1: "",
    line2: "",
    city: "",
    state: "Maharashtra",
    postal_code: "",
    country: "India",
  });

  // GPS location detect
  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
          );
          const data = await res.json();
          const addr = data.address;
          setAddress((a) => ({
            ...a,
            city: addr.city || addr.town || addr.village || a.city,
            state: addr.state || a.state,
            postal_code: addr.postcode || a.postal_code,
          }));
          toast.success("Location detected! Please verify the address fields.");
        } catch {
          toast.info("GPS detected — please fill address manually.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        toast.error("Location access denied: " + err.message);
      },
    );
  };

  // PIN code auto-fill
  const lookupPin = async (pin: string) => {
    if (pin.length !== 6) return;
    setPinLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setAddress((a) => ({
          ...a,
          city: po.Division || po.Name || a.city,
          state: po.State || a.state,
        }));
        toast.success(`Auto-filled: ${po.Division || po.Name}, ${po.State}`);
      }
    } catch {
      /* silent */
    } finally {
      setPinLoading(false);
    }
  };

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ coupon: any; discount: number } | null>(
    null,
  );
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = cartTotal(cart);
  const discount = appliedCoupon?.discount || 0;
  const shipping = subtotal >= 5000 ? 0 : SHIPPING_COST;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * TAX_RATE;
  const total = taxable + tax + shipping;

  const cartItems: OrderItem[] = cart.map((c) => ({
    product_id: c.product.id,
    product_name: c.product.name,
    product_image: c.product.image,
    product_slug: c.product.slug,
    size: c.size,
    quantity: c.qty,
    price: c.product.sale_price || c.product.price,
    total: (c.product.sale_price || c.product.price) * c.qty,
  }));

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await couponsApi.validate(couponCode.trim(), subtotal);
      setAppliedCoupon(result);
      toast.success(`Coupon applied! You save ${formatINR(result.discount)}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const createOrderMut = useMutation({
    mutationFn: async () => {
      // 1. Create order record in Supabase
      const order = await ordersApi.create({
        items: cartItems,
        subtotal,
        discount,
        shipping_cost: shipping,
        tax,
        total,
        coupon_id: appliedCoupon?.coupon?.id,
        coupon_code: appliedCoupon?.coupon?.code,
        shipping_address: address,
        customer_name: address.name,
        customer_email: user?.email || "",
        customer_phone: address.phone,
        user_id: user?.id,
        payment_status: paymentMethod === "cod" ? "cod" : "pending",
      });
      return order;
    },
    onSuccess: async (order) => {
      if (paymentMethod === "cod") {
        clearCart();
        setOrderId(order.id);
        setStep("confirmed");
        toast.success("Order placed successfully via Cash on Delivery!");
      } else {
        // Razorpay Payment Flow
        try {
          setPaymentLoading(true);
          const rzpOrder = await ordersApi.createRazorpayOrder(order.id, total);
          setRzpOID(rzpOrder.id);
          setPendingOrder(order);

          const rzpKeyId =
            process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock_razorpay_key_id";
          const isMocked = rzpKeyId.includes("mock") || rzpOrder.id.startsWith("rzp_mock_");

          if (isMocked) {
            setSimulatedPaymentOpen(true);
          } else {
            if (!window.Razorpay) {
              throw new Error("Razorpay payment SDK not loaded. Please try again in a moment.");
            }
            const options = {
              key: rzpKeyId,
              amount: rzpOrder.amount,
              currency: rzpOrder.currency || "INR",
              name: "Drapeva",
              description: `Payment for Order ${order.order_number || "#" + order.id.slice(0, 8).toUpperCase()}`,
              order_id: rzpOrder.id,
              handler: async function (response: any) {
                try {
                  setPaymentLoading(true);
                  const payload = {
                    orderId: order.id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    signature: response.razorpay_signature,
                  };
                  const verifyResult = await ordersApi.verifyRazorpayPayment(payload);
                  if (verifyResult.success) {
                    clearCart();
                    setOrderId(order.id);
                    setStep("confirmed");
                    toast.success("Payment verified and order confirmed!");
                  }
                } catch (verifyErr: any) {
                  toast.error(verifyErr.message || "Payment signature verification failed.");
                } finally {
                  setPaymentLoading(false);
                }
              },
              prefill: {
                name: address.name,
                email: user?.email || "",
                contact: address.phone,
              },
              theme: {
                color: "#BC9E5F", // Gold
              },
              modal: {
                ondismiss: function () {
                  toast.error("Payment dismissed.");
                  setPaymentLoading(false);
                },
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
          }
        } catch (err: any) {
          toast.error(err.message || "Failed to initialize Razorpay checkout.");
          setPaymentLoading(false);
        }
      }
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to create order");
      setPaymentLoading(false);
    },
  });

  const handleSimulatedSuccess = async () => {
    if (!pendingOrder) return;
    setSimulatedPaymentOpen(false);
    setPaymentLoading(true);
    try {
      const payload = {
        orderId: pendingOrder.id,
        razorpayPaymentId: "pay_mock_" + Math.random().toString(36).substring(4),
        razorpayOrderId: rzpOID,
        signature: "sig_mock_" + Math.random().toString(36).substring(4),
      };
      const verifyResult = await ordersApi.verifyRazorpayPayment(payload);
      if (verifyResult.success) {
        clearCart();
        setOrderId(pendingOrder.id);
        setStep("confirmed");
        toast.success("Simulated payment verified! Order placed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setPaymentLoading(false);
      setPendingOrder(null);
    }
  };

  const handleSimulatedFailure = () => {
    setSimulatedPaymentOpen(false);
    setPaymentLoading(false);
    toast.error("Payment simulation cancelled.");
  };

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !address.name ||
      !address.phone ||
      !address.line1 ||
      !address.city ||
      !address.postal_code
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep("payment");
  };

  if (cart.length === 0 && step !== "confirmed") {
    return (
      <div className="container-luxe py-24 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link
          href="/collections"
          className="mt-6 inline-block border-b border-foreground pb-1 eyebrow text-xs"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (step === "confirmed" && orderId) {
    return (
      <div className="container-luxe py-16 max-w-2xl mx-auto">
        <div className="border border-border bg-background p-8 md:p-12 shadow-soft space-y-8 animate-rise">
          <div className="text-center">
            <div className="h-14 w-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl">Order Confirmed</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your order{" "}
              <span className="font-mono text-foreground font-semibold">
                {pendingOrder?.order_number || orderId.slice(0, 8).toUpperCase()}
              </span>{" "}
              has been placed successfully. Thank you for shopping with us!
            </p>
            <div className="gold-divider mt-6 mx-auto" />
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 border-b border-border pb-8 md:grid-cols-2 text-sm">
            <div>
              <p className="eyebrow text-[10px] text-muted-foreground mb-2">Customer Details</p>
              <p className="font-medium text-foreground">{address.name}</p>
              <p className="text-muted-foreground mt-0.5">{user?.email || address.name}</p>
              <p className="text-muted-foreground mt-0.5">{address.phone}</p>
            </div>
            <div>
              <p className="eyebrow text-[10px] text-muted-foreground mb-2">Delivery Address</p>
              <p className="text-muted-foreground leading-relaxed font-sans">
                {address.line1}
                <br />
                {address.line2 && (
                  <>
                    {address.line2}
                    <br />
                  </>
                )}
                {address.city}, {address.state} - {address.postal_code}
                <br />
                {address.country}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <p className="eyebrow text-[10px] text-muted-foreground">Order Summary</p>
            <div className="divide-y divide-border/60">
              {cartItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3 first:pt-0">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-14 w-10 object-cover border border-border shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.product_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Size: {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">{formatINR(item.total)}</p>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gold text-base border-t border-border pt-3 mt-2">
                <span>Total Amount {paymentMethod === "cod" ? "(COD)" : "(Paid Online)"}</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline Info Banner */}
          <div className="border border-border/80 bg-champagne/10 p-5 text-center text-xs space-y-1">
            <p className="font-semibold text-foreground uppercase tracking-widest">
              Estimated Delivery Timeline
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Your heirloom saree is custom finished and will be dispatched in 2–4 weeks. Track
              details will be emailed shortly.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row pt-4">
            <Link
              href="/"
              className="flex-1 bg-foreground text-background py-4 text-center text-xs uppercase tracking-[0.25em] font-medium hover:bg-gold hover:text-gold-foreground transition-all"
            >
              Return to Atelier
            </Link>
            <Link
              href="/collections"
              className="flex-1 border border-border py-4 text-center text-xs uppercase tracking-[0.25em] font-medium hover:bg-muted transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-luxe py-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="mb-10">
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 eyebrow text-muted-foreground hover:text-foreground transition-colors text-[10px]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to shop
        </Link>
        <h1 className="mt-4 font-display text-4xl">Checkout</h1>
        <div className="mt-4 flex items-center gap-3 text-xs">
          {["address", "payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              {i > 0 && <div className="h-px w-8 bg-border" />}
              <span
                className={`uppercase tracking-widest ${step === s ? "text-foreground font-semibold" : "text-muted-foreground"}`}
              >
                {i + 1}. {s === "address" ? "Shipping Address" : "Payment & Confirmation"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Left: Form */}
        <div>
          {step === "address" && (
            <form onSubmit={handleAddressSubmit} className="space-y-5">
              <div className="border border-border bg-background p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h2 className="font-display text-xl">Shipping Information</h2>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-1.5 border border-gold/40 text-gold px-3 py-1.5 text-[10px] uppercase tracking-widest hover:bg-gold/5 transition-colors disabled:opacity-50"
                  >
                    {locating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Navigation className="h-3 w-3" />
                    )}
                    {locating ? "Detecting..." : "Use My Location"}
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow text-[10px] mb-1.5 block">Full Name *</span>
                    <input
                      value={address.name}
                      onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))}
                      required
                      className={inp}
                      placeholder="Priya Sharma"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow text-[10px] mb-1.5 block">Phone Number *</span>
                    <input
                      value={address.phone}
                      onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                      required
                      className={inp}
                      placeholder="+91 98000 00000"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="eyebrow text-[10px] mb-1.5 block">Address Line 1 *</span>
                  <input
                    value={address.line1}
                    onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                    required
                    className={inp}
                    placeholder="Flat / House No., Street"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow text-[10px] mb-1.5 block">Address Line 2</span>
                  <input
                    value={address.line2 || ""}
                    onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                    className={inp}
                    placeholder="Area, Landmark (optional)"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="eyebrow text-[10px] mb-1.5 block">
                      PIN Code *
                      {pinLoading && <Loader2 className="h-3 w-3 animate-spin inline ml-1" />}
                    </span>
                    <input
                      value={address.postal_code}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setAddress((a) => ({ ...a, postal_code: val }));
                        if (val.length === 6) lookupPin(val);
                      }}
                      required
                      className={inp}
                      placeholder="400001"
                      maxLength={6}
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow text-[10px] mb-1.5 block">City *</span>
                    <input
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      required
                      className={inp}
                      placeholder="Mumbai"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow text-[10px] mb-1.5 block">State *</span>
                    <select
                      value={address.state}
                      onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                      className={inp}
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-[0.25em] font-medium hover:bg-gold hover:text-gold-foreground transition-colors"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {step === "payment" && (
            <div className="space-y-5">
              <div className="border border-border bg-background p-6 space-y-6">
                <h2 className="font-display text-xl border-b border-border pb-4">
                  Select Payment Method
                </h2>

                <div className="space-y-4">
                  {/* Razorpay selector */}
                  <div
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`cursor-pointer border p-4 transition-all duration-300 ${
                      paymentMethod === "razorpay"
                        ? "border-gold bg-gold/5 shadow-sm"
                        : "border-border hover:border-foreground/45 bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                        <span
                          className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "razorpay" ? "border-gold" : "border-muted-foreground"}`}
                        >
                          {paymentMethod === "razorpay" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                          )}
                        </span>
                        Pay Securely Online (Razorpay)
                      </span>
                      {paymentMethod === "razorpay" && (
                        <span className="text-[10px] text-gold border border-gold/45 px-2 py-0.5 uppercase tracking-wider bg-gold/10">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2 pl-5">
                      Pay securely using Cards, UPI, Netbanking, or Wallets via Razorpay payment
                      gateway.
                    </p>
                  </div>

                  {/* COD selector */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className={`cursor-pointer border p-4 transition-all duration-300 ${
                      paymentMethod === "cod"
                        ? "border-gold bg-gold/5 shadow-sm"
                        : "border-border hover:border-foreground/45 bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                        <span
                          className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "cod" ? "border-gold" : "border-muted-foreground"}`}
                        >
                          {paymentMethod === "cod" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                          )}
                        </span>
                        Cash on Delivery (COD)
                      </span>
                      {paymentMethod === "cod" && (
                        <span className="text-[10px] text-gold border border-gold/45 px-2 py-0.5 uppercase tracking-wider bg-gold/10">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2 pl-5">
                      Pay in cash at the time of delivery. Please ensure you have the exact change
                      ready when the courier arrives.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 text-xs space-y-2">
                  <p className="eyebrow text-muted-foreground">Delivery Address Summary</p>
                  <p className="text-foreground leading-relaxed font-sans">
                    <strong>{address.name}</strong> ({address.phone})<br />
                    {address.line1}, {address.line2 && `${address.line2}, `}
                    {address.city}, {address.state} - {address.postal_code}
                  </p>
                </div>

                <button
                  onClick={() => createOrderMut.mutate()}
                  disabled={createOrderMut.isPending || paymentLoading}
                  className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-gold-foreground transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createOrderMut.isPending || paymentLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing order...
                    </>
                  ) : paymentMethod === "cod" ? (
                    "Confirm Order (Cash on Delivery)"
                  ) : (
                    `Proceed to Online Payment`
                  )}
                </button>
              </div>
              <button
                onClick={() => setStep("address")}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Edit shipping address
              </button>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-5">
          <div className="border border-border bg-background p-6 space-y-4">
            <h2 className="font-display text-xl border-b border-border pb-4">
              Order Summary ({cartCount(cart)} items)
            </h2>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-14 w-10 object-cover border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Size: {item.size} · Qty: {item.qty}
                    </p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">
                    {formatINR((item.product.sale_price || item.product.price) * item.qty)}
                  </p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="border-t border-border pt-4">
              <p className="eyebrow text-[10px] mb-2">Promo Code</p>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className={inp + " flex-1 text-xs uppercase tracking-widest"}
                  disabled={!!appliedCoupon}
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading || !!appliedCoupon}
                  className="border border-border px-4 text-xs uppercase tracking-widest hover:bg-muted disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <Tag className="h-3.5 w-3.5" />
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between text-emerald-600 text-xs">
                  <span>✓ Code "{appliedCoupon.coupon.code}" applied</span>
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode("");
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gold text-base border-t border-border pt-3 mt-2">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </div>

          {shipping === 0 && (
            <p className="text-xs text-emerald-600 text-center">
              🎉 Free shipping applied on orders above ₹5,000
            </p>
          )}
        </div>
      </div>

      {/* Razorpay Mock simulated sandbox modal */}
      {simulatedPaymentOpen && pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-background border border-gold/40 shadow-soft max-w-md w-full p-8 space-y-6 text-center animate-rise">
            <div>
              <span className="bg-gold/10 text-gold px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold border border-gold/30">
                Razorpay Sandbox (Simulated)
              </span>
              <h3 className="font-display text-2xl mt-4">Complete Payment</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                You are in development mode. The payment key is mocked. Please simulate the
                transaction below.
              </p>
              <div className="gold-divider mt-4 mx-auto" />
            </div>

            <div className="bg-champagne/10 border border-border/80 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Ref:</span>
                <span className="font-mono font-medium">
                  {pendingOrder.order_number || "#" + pendingOrder.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Razorpay Order ID:</span>
                <span className="font-mono text-muted-foreground truncate max-w-[200px]">
                  {rzpOID}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2 font-semibold">
                <span>Amount Due:</span>
                <span className="text-gold text-sm">{formatINR(total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSimulatedSuccess}
                disabled={paymentLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
              >
                Simulate Success
              </button>
              <button
                onClick={handleSimulatedFailure}
                className="w-full border border-border hover:bg-muted py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
              >
                Simulate Failure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Checkout() {
  return (
    <Suspense
      fallback={<div className="container-luxe py-24 text-center">Loading checkout...</div>}
    >
      <CheckoutContent />
    </Suspense>
  );
}

const inp =
  "w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors";
