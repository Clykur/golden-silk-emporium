import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShippingAddress } from "./types";

type CheckoutState = {
  address: ShippingAddress;
  selectedAddressId: string | null;
  paymentMethod: "cod" | "razorpay";
  couponCode: string;
  appliedCoupon: { coupon: any; discount: number } | null;
  showNewAddressForm: boolean;
  step: "address" | "payment" | "confirmed";
  orderId: string | null;

  setAddress: (address: ShippingAddress) => void;
  setSelectedAddressId: (id: string | null) => void;
  setPaymentMethod: (method: "cod" | "razorpay") => void;
  setCouponCode: (code: string) => void;
  setAppliedCoupon: (coupon: { coupon: any; discount: number } | null) => void;
  setShowNewAddressForm: (show: boolean) => void;
  setStep: (step: "address" | "payment" | "confirmed") => void;
  setOrderId: (id: string | null) => void;
  resetCheckout: () => void;
};

const initialAddress = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "Maharashtra",
  postal_code: "",
  country: "India",
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      address: initialAddress,
      selectedAddressId: null,
      paymentMethod: "razorpay",
      couponCode: "",
      appliedCoupon: null,
      showNewAddressForm: false,
      step: "address",
      orderId: null,

      setAddress: (address) => set({ address }),
      setSelectedAddressId: (selectedAddressId) => set({ selectedAddressId }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setCouponCode: (couponCode) => set({ couponCode }),
      setAppliedCoupon: (appliedCoupon) => set({ appliedCoupon }),
      setShowNewAddressForm: (showNewAddressForm) => set({ showNewAddressForm }),
      setStep: (step) => set({ step }),
      setOrderId: (orderId) => set({ orderId }),
      resetCheckout: () =>
        set({
          address: initialAddress,
          selectedAddressId: null,
          paymentMethod: "razorpay",
          couponCode: "",
          appliedCoupon: null,
          showNewAddressForm: false,
          step: "address",
          orderId: null,
        }),
    }),
    { name: "drapeva-checkout" },
  ),
);
